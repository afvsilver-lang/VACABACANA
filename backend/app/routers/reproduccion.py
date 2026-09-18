"""Control reproductivo por fechas: parto -> servicio -> palpacion -> gestacion.

Nota de FastAPI: las rutas literales (resumen, acciones-requeridas,
configuracion/valores, importar, exportar) se declaran ANTES que las rutas
dinamicas "/{reproduccion_id}...", porque si se declararan despues, FastAPI
intentaria interpretar por ejemplo "resumen" como un reproduccion_id y
fallaria con 422 en vez de llegar a la ruta correcta.
"""

from collections import Counter
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import obtener_usuario_actual, requerir_admin, requerir_escritura
from ..database import get_db
from ..reproduccion_import import exportar_csv as exportar_reproduccion_csv
from ..reproduccion_import import importar_csv as importar_reproduccion_csv
from ..reproduccion_logica import clasificar

router = APIRouter(
    prefix="/api/reproduccion",
    tags=["reproduccion"],
    dependencies=[Depends(obtener_usuario_actual)],
)


def _con_estado(reg: models.Reproduccion, config, hoy: date) -> schemas.ReproduccionConEstado:
    c = clasificar(reg, config, hoy)
    return schemas.ReproduccionConEstado(
        **schemas.ReproduccionRespuesta.model_validate(reg).model_dump(),
        estado_reproductivo=c.estado,
        nivel_alerta=c.nivel,
        dias_posparto=c.dias_posparto,
        dias_desde_servicio=c.dias_desde_servicio,
        dias_gestacion=c.dias_gestacion,
    )


def _obtener_o_404(db: Session, reproduccion_id: int) -> models.Reproduccion:
    reg = db.get(models.Reproduccion, reproduccion_id)
    if not reg:
        raise HTTPException(404, "Registro no encontrado")
    return reg


def _agregar_evento(db: Session, reg: models.Reproduccion, fecha: date, tipo: str, detalle: str) -> None:
    db.add(models.EventoReproductivo(reproduccion_id=reg.id, fecha=fecha, tipo=tipo, detalle=detalle))


def _limpiar_ciclo_actual(reg: models.Reproduccion) -> None:
    """Al iniciar un nuevo ciclo (parto o nuevo servicio) se limpian los datos
    del ciclo anterior; el historial queda a salvo en EventoReproductivo."""
    reg.fecha_palpacion_programada = None
    reg.fecha_palpacion_real = None
    reg.resultado_palpacion = None
    reg.fecha_estimada_concepcion = None
    reg.fecha_probable_parto = None


# --- rutas de solo lectura agregada (deben ir antes de /{reproduccion_id}) --


@router.get("", response_model=list[schemas.ReproduccionConEstado])
def listar(
    q: Optional[str] = Query(None, description="Busca por codigo, nombre o hierro"),
    estado: Optional[str] = None,
    nivel: Optional[str] = None,
    resultado_palpacion: Optional[str] = None,
    raza: Optional[str] = None,
    toro: Optional[str] = None,
    dias_posparto_min: Optional[int] = None,
    dias_posparto_max: Optional[int] = None,
    skip: int = 0,
    limit: int = Query(500, le=5000),
    db: Session = Depends(get_db),
):
    config = crud.obtener_configuracion_reproductiva(db)
    hoy = date.today()
    consulta = db.query(models.Reproduccion)
    if q:
        patron = f"%{q}%"
        consulta = consulta.filter(
            (models.Reproduccion.codigo.ilike(patron))
            | (models.Reproduccion.nombre.ilike(patron))
            | (models.Reproduccion.hierro.ilike(patron))
        )
    if raza:
        consulta = consulta.filter(models.Reproduccion.raza == raza)
    if toro:
        consulta = consulta.filter(models.Reproduccion.toro == toro)
    if resultado_palpacion:
        consulta = consulta.filter(models.Reproduccion.resultado_palpacion == resultado_palpacion)

    resultados = []
    for reg in consulta.order_by(models.Reproduccion.codigo).all():
        item = _con_estado(reg, config, hoy)
        if estado and item.estado_reproductivo != estado:
            continue
        if nivel and item.nivel_alerta != nivel:
            continue
        if dias_posparto_min is not None and (item.dias_posparto is None or item.dias_posparto < dias_posparto_min):
            continue
        if dias_posparto_max is not None and (item.dias_posparto is None or item.dias_posparto > dias_posparto_max):
            continue
        resultados.append(item)

    return resultados[skip : skip + limit]


@router.get("/resumen")
def resumen(db: Session = Depends(get_db)):
    config = crud.obtener_configuracion_reproductiva(db)
    hoy = date.today()
    registros = db.query(models.Reproduccion).all()
    clasificados = [(r, clasificar(r, config, hoy)) for r in registros]

    def contar(pred) -> int:
        return sum(1 for _, c in clasificados if pred(c))

    total = len(clasificados)
    confirmadas = contar(lambda c: c.estado == "Preñez confirmada")

    buckets = [(0, 44), (45, 60), (61, 82), (83, 120), (121, 10_000)]
    etiquetas_buckets = ["0-44", "45-60", "61-82", "83-120", "121+"]
    distribucion = [0] * len(buckets)
    for _, c in clasificados:
        if c.dias_posparto is None:
            continue
        for indice, (inicio, fin) in enumerate(buckets):
            if inicio <= c.dias_posparto <= fin:
                distribucion[indice] += 1
                break

    acumulado_toro: dict[str, list[int]] = {}
    for r, c in clasificados:
        if not r.toro or not r.resultado_palpacion:
            continue
        preñadas, palpadas = acumulado_toro.setdefault(r.toro, [0, 0])
        palpadas += 1
        if c.estado == "Preñez confirmada":
            preñadas += 1
        acumulado_toro[r.toro] = [preñadas, palpadas]

    porcentaje_por_toro = {
        toro: round(100 * preñadas / palpadas, 1)
        for toro, (preñadas, palpadas) in acumulado_toro.items()
        if palpadas > 0
    }

    dias_concepcion = []
    for r in registros:
        concepcion = r.fecha_estimada_concepcion or (r.fecha_servicio if r.resultado_palpacion == "preñada" else None)
        if r.fecha_ultimo_parto and concepcion:
            dias_concepcion.append((concepcion - r.fecha_ultimo_parto).days)
    promedio_dias_concepcion = round(sum(dias_concepcion) / len(dias_concepcion), 1) if dias_concepcion else None

    proyeccion: dict[str, int] = {}
    for r, c in clasificados:
        fecha_probable = r.fecha_probable_parto
        if fecha_probable is None and c.estado == "Preñez confirmada":
            concepcion = r.fecha_estimada_concepcion or r.fecha_servicio
            if concepcion:
                fecha_probable = concepcion + timedelta(days=config.dias_gestacion)
        if fecha_probable and fecha_probable >= hoy:
            clave = fecha_probable.strftime("%Y-%m")
            proyeccion[clave] = proyeccion.get(clave, 0) + 1

    return {
        "total": total,
        "en_recuperacion": contar(lambda c: c.estado == "Recuperación posparto"),
        "aptas_para_toro": contar(lambda c: c.estado == "Apta para dejar con el toro"),
        "poner_con_toro_urgente": contar(lambda c: c.estado == "Atención: poner con el toro"),
        "pendientes_palpacion": contar(
            lambda c: c.estado in ("Programar palpación", "Palpación próxima", "Palpación programada")
        ),
        "palpaciones_atrasadas": contar(lambda c: c.estado == "Palpación atrasada"),
        "prenez_confirmada": confirmadas,
        "vacias": contar(lambda c: c.estado.startswith("No preñada")),
        "alerta_critica": contar(lambda c: c.nivel == "critico"),
        "porcentaje_prenez": round(100 * confirmadas / total, 1) if total else 0.0,
        "por_estado": dict(Counter(c.estado for _, c in clasificados)),
        "por_nivel": dict(Counter(c.nivel for _, c in clasificados)),
        "distribucion_dias_posparto": {"etiquetas": etiquetas_buckets, "valores": distribucion},
        "porcentaje_prenez_por_toro": porcentaje_por_toro,
        "promedio_dias_parto_concepcion": promedio_dias_concepcion,
        "proyeccion_partos_mensual": dict(sorted(proyeccion.items())),
    }


@router.get("/acciones-requeridas")
def acciones_requeridas(db: Session = Depends(get_db)):
    config = crud.obtener_configuracion_reproductiva(db)
    hoy = date.today()
    grupos: dict[str, list[dict]] = {
        "poner_con_toro": [],
        "listas_palpacion": [],
        "palpacion_atrasada": [],
        "vacias_volver_toro": [],
        "mas_82_dias": [],
        "mas_120_dias": [],
        "datos_incompletos": [],
    }
    for reg in db.query(models.Reproduccion).order_by(models.Reproduccion.codigo).all():
        c = clasificar(reg, config, hoy)
        item = {
            "id": reg.id,
            "codigo": reg.codigo,
            "nombre": reg.nombre,
            "dias": c.dias_posparto if c.dias_posparto is not None else c.dias_desde_servicio,
        }
        if c.estado == "Atención: poner con el toro":
            grupos["poner_con_toro"].append(item)
        elif c.estado in ("Palpación próxima", "Programar palpación"):
            grupos["listas_palpacion"].append(item)
        elif c.estado == "Palpación atrasada":
            grupos["palpacion_atrasada"].append(item)
        elif c.estado.startswith("No preñada"):
            grupos["vacias_volver_toro"].append(item)
        elif c.estado == "Alerta reproductiva":
            grupos["mas_82_dias"].append(item)
        elif c.estado == "Alerta crítica":
            grupos["mas_120_dias"].append(item)
        elif c.estado == "Datos incompletos":
            grupos["datos_incompletos"].append(item)
    return grupos


@router.get("/configuracion/valores", response_model=schemas.ConfiguracionReproductivaRespuesta)
def obtener_configuracion(db: Session = Depends(get_db)):
    return crud.obtener_configuracion_reproductiva(db)


@router.put("/configuracion/valores", response_model=schemas.ConfiguracionReproductivaRespuesta)
def actualizar_configuracion(
    datos: schemas.ConfiguracionReproductivaActualizar,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_admin),
):
    config = crud.obtener_configuracion_reproductiva(db)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(config, campo, valor)
    db.commit()
    db.refresh(config)
    return config


@router.post("/importar", response_model=schemas.ImportarReproduccionResumen)
async def importar(
    archivo: UploadFile,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    if not archivo.filename or not archivo.filename.lower().endswith(".csv"):
        raise HTTPException(400, "El archivo debe ser un .csv")
    contenido = await archivo.read()
    resumen_import = importar_reproduccion_csv(db, contenido)
    return schemas.ImportarReproduccionResumen(
        creadas=resumen_import.creadas,
        actualizadas=resumen_import.actualizadas,
        errores=resumen_import.errores,
    )


@router.get("/exportar")
def exportar(db: Session = Depends(get_db)):
    registros = db.query(models.Reproduccion).order_by(models.Reproduccion.codigo).all()
    contenido = exportar_reproduccion_csv(registros)
    return StreamingResponse(
        iter([contenido]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reproduccion.csv"},
    )


@router.post("", response_model=schemas.ReproduccionConEstado, status_code=201)
def crear(
    datos: schemas.ReproduccionCrear,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    if db.query(models.Reproduccion).filter(models.Reproduccion.codigo == datos.codigo).first():
        raise HTTPException(409, f"Ya existe un registro con codigo '{datos.codigo}'")

    hoy = date.today()
    if datos.fecha_nacimiento and datos.fecha_nacimiento > hoy:
        raise HTTPException(422, "La fecha de nacimiento no puede ser futura")
    if datos.fecha_ultimo_parto and datos.fecha_ultimo_parto > hoy:
        raise HTTPException(422, "La fecha de ultimo parto no puede ser futura")
    if datos.fecha_servicio and datos.fecha_ultimo_parto and datos.fecha_servicio < datos.fecha_ultimo_parto:
        raise HTTPException(422, "La fecha de servicio no puede ser anterior al ultimo parto")
    if datos.fecha_retiro_toro and datos.fecha_servicio and datos.fecha_retiro_toro < datos.fecha_servicio:
        raise HTTPException(422, "La fecha de retiro no puede ser anterior a la fecha de servicio")

    reg = models.Reproduccion(**datos.model_dump())
    db.add(reg)
    db.commit()
    db.refresh(reg)
    if reg.fecha_ultimo_parto:
        _agregar_evento(db, reg, reg.fecha_ultimo_parto, "parto", "Ficha creada con parto registrado")
        db.commit()

    config = crud.obtener_configuracion_reproductiva(db)
    return _con_estado(reg, config, hoy)


# --- rutas dinamicas por id --------------------------------------------------


@router.get("/{reproduccion_id}", response_model=schemas.ReproduccionDetalle)
def obtener(reproduccion_id: int, db: Session = Depends(get_db)):
    reg = _obtener_o_404(db, reproduccion_id)
    config = crud.obtener_configuracion_reproductiva(db)
    base = _con_estado(reg, config, date.today())
    return schemas.ReproduccionDetalle(**base.model_dump(), eventos=reg.eventos)


@router.put("/{reproduccion_id}", response_model=schemas.ReproduccionConEstado)
def actualizar(
    reproduccion_id: int,
    datos: schemas.ReproduccionActualizar,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    if datos.fecha_nacimiento and datos.fecha_nacimiento > date.today():
        raise HTTPException(422, "La fecha de nacimiento no puede ser futura")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(reg, campo, valor)
    db.commit()
    db.refresh(reg)
    config = crud.obtener_configuracion_reproductiva(db)
    return _con_estado(reg, config, date.today())


@router.delete("/{reproduccion_id}", status_code=204)
def eliminar(
    reproduccion_id: int,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    db.delete(reg)
    db.commit()


@router.post("/{reproduccion_id}/parto", response_model=schemas.ReproduccionConEstado)
def registrar_parto(
    reproduccion_id: int,
    datos: schemas.PartoEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    hoy = date.today()
    if datos.fecha_parto > hoy:
        raise HTTPException(422, "La fecha de parto no puede ser futura")
    if reg.fecha_ultimo_parto and datos.fecha_parto <= reg.fecha_ultimo_parto:
        raise HTTPException(422, "La fecha de parto debe ser posterior al parto anterior")
    if reg.fecha_servicio and datos.fecha_parto < reg.fecha_servicio:
        raise HTTPException(422, "La fecha de parto no puede ser anterior a la fecha de servicio")

    reg.fecha_ultimo_parto = datos.fecha_parto
    reg.num_partos = (reg.num_partos or 0) + 1
    reg.fecha_servicio = None
    reg.toro = None
    reg.fecha_retiro_toro = None
    _limpiar_ciclo_actual(reg)

    _agregar_evento(db, reg, datos.fecha_parto, "parto", f"Parto #{reg.num_partos} registrado")
    db.commit()
    db.refresh(reg)
    config = crud.obtener_configuracion_reproductiva(db)
    return _con_estado(reg, config, hoy)


@router.post("/{reproduccion_id}/servicio", response_model=schemas.ReproduccionConEstado)
def poner_con_toro(
    reproduccion_id: int,
    datos: schemas.ServicioEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    hoy = date.today()
    if datos.fecha_servicio > hoy:
        raise HTTPException(422, "La fecha de servicio no puede ser futura")
    if reg.fecha_ultimo_parto and datos.fecha_servicio < reg.fecha_ultimo_parto:
        raise HTTPException(422, "La fecha de servicio no puede ser anterior al ultimo parto")

    reg.fecha_servicio = datos.fecha_servicio
    reg.toro = datos.toro
    reg.fecha_retiro_toro = None
    _limpiar_ciclo_actual(reg)

    _agregar_evento(db, reg, datos.fecha_servicio, "servicio", f"Puesta con el toro '{datos.toro}'")
    db.commit()
    db.refresh(reg)
    config = crud.obtener_configuracion_reproductiva(db)
    return _con_estado(reg, config, hoy)


@router.post("/{reproduccion_id}/retiro-toro", response_model=schemas.ReproduccionConEstado)
def retirar_del_toro(
    reproduccion_id: int,
    datos: schemas.RetiroToroEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    hoy = date.today()
    if not reg.fecha_servicio:
        raise HTTPException(400, "La vaca no tiene registrada una fecha de servicio")
    if datos.fecha_retiro > hoy:
        raise HTTPException(422, "La fecha de retiro no puede ser futura")
    if datos.fecha_retiro < reg.fecha_servicio:
        raise HTTPException(422, "La fecha de retiro no puede ser anterior al servicio")

    reg.fecha_retiro_toro = datos.fecha_retiro
    _agregar_evento(db, reg, datos.fecha_retiro, "retiro_toro", "Retirada del toro")
    db.commit()
    db.refresh(reg)
    config = crud.obtener_configuracion_reproductiva(db)
    return _con_estado(reg, config, hoy)


@router.post("/{reproduccion_id}/programar-palpacion", response_model=schemas.ReproduccionConEstado)
def programar_palpacion(
    reproduccion_id: int,
    datos: schemas.ProgramarPalpacionEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    config = crud.obtener_configuracion_reproductiva(db)
    hoy = date.today()

    fecha = datos.fecha_programada
    if fecha is None:
        referencia = reg.fecha_retiro_toro or reg.fecha_servicio or hoy
        fecha = referencia + timedelta(days=config.dias_para_palpacion)
    if reg.fecha_servicio and fecha < reg.fecha_servicio:
        raise HTTPException(422, "La fecha de palpacion no puede ser anterior al servicio")

    reg.fecha_palpacion_programada = fecha
    reg.fecha_palpacion_real = None
    reg.resultado_palpacion = None
    _agregar_evento(
        db, reg, fecha, "palpacion_programada",
        "Palpación programada. Debe realizarla un médico veterinario o personal capacitado.",
    )
    db.commit()
    db.refresh(reg)
    return _con_estado(reg, config, hoy)


@router.post("/{reproduccion_id}/registrar-palpacion", response_model=schemas.ReproduccionConEstado)
def registrar_palpacion(
    reproduccion_id: int,
    datos: schemas.RegistrarPalpacionEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    if datos.resultado not in schemas.RESULTADOS_PALPACION_VALIDOS:
        raise HTTPException(422, "Resultado invalido. Use: preñada, vacia o dudosa")

    reg = _obtener_o_404(db, reproduccion_id)
    config = crud.obtener_configuracion_reproductiva(db)
    hoy = date.today()
    if datos.fecha_real > hoy:
        raise HTTPException(422, "La fecha de palpacion no puede ser futura")
    if reg.fecha_servicio and datos.fecha_real < reg.fecha_servicio:
        raise HTTPException(422, "La fecha de palpacion no puede ser anterior al servicio")

    reg.fecha_palpacion_real = datos.fecha_real
    reg.resultado_palpacion = datos.resultado

    if datos.resultado == "preñada":
        reg.fecha_estimada_concepcion = reg.fecha_servicio or datos.fecha_real
        reg.fecha_probable_parto = reg.fecha_estimada_concepcion + timedelta(days=config.dias_gestacion)
        detalle = "Palpación: preñez confirmada"
    elif datos.resultado == "vacia":
        reg.fecha_estimada_concepcion = None
        reg.fecha_probable_parto = None
        detalle = "Palpación: resultado vacia, se recomienda volver con el toro"
    else:
        detalle = "Palpación: resultado dudoso, se recomienda repetir"

    _agregar_evento(db, reg, datos.fecha_real, "palpacion_resultado", detalle)
    db.commit()
    db.refresh(reg)
    return _con_estado(reg, config, hoy)


@router.post("/{reproduccion_id}/repetir-palpacion", response_model=schemas.ReproduccionConEstado)
def repetir_palpacion(
    reproduccion_id: int,
    datos: schemas.ProgramarPalpacionEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    reg = _obtener_o_404(db, reproduccion_id)
    config = crud.obtener_configuracion_reproductiva(db)
    hoy = date.today()
    fecha = datos.fecha_programada or (hoy + timedelta(days=int(config.dias_aviso_palpacion_proxima)))

    reg.resultado_palpacion = None
    reg.fecha_palpacion_real = None
    reg.fecha_palpacion_programada = fecha
    _agregar_evento(db, reg, fecha, "palpacion_programada", "Se reprograma la palpación (resultado dudoso)")
    db.commit()
    db.refresh(reg)
    return _con_estado(reg, config, hoy)
