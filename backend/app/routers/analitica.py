import csv
import io
from collections import Counter

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import crud, models
from ..auth import obtener_usuario_actual
from ..database import get_db
from ..riesgo import calcular_riesgo

router = APIRouter(
    prefix="/api/analitica", tags=["analitica"], dependencies=[Depends(obtener_usuario_actual)]
)


def _promedio(valores: list[float]) -> float | None:
    valores = [v for v in valores if v is not None]
    return round(sum(valores) / len(valores), 2) if valores else None


@router.get("/resumen")
def resumen(db: Session = Depends(get_db)):
    config = crud.obtener_configuracion(db)
    vacas = db.query(models.Vaca).all()

    conteo_nivel = Counter()
    riesgos = []
    for vaca in vacas:
        riesgo = calcular_riesgo(vaca, config)
        conteo_nivel[riesgo.nivel] += 1
        riesgos.append((vaca, riesgo))

    top_riesgo = sorted(riesgos, key=lambda par: par[1].puntaje, reverse=True)[:10]

    return {
        "total_vacas": len(vacas),
        "por_nivel_riesgo": {
            "bajo": conteo_nivel.get("bajo", 0),
            "medio": conteo_nivel.get("medio", 0),
            "alto": conteo_nivel.get("alto", 0),
            "critico": conteo_nivel.get("critico", 0),
        },
        "por_color": dict(Counter(v.color for v in vacas if v.color)),
        "por_estado_salud": dict(Counter(v.estado_salud for v in vacas if v.estado_salud)),
        "promedios": {
            "meses_desde_ultimo_parto": _promedio([v.meses_desde_ultimo_parto for v in vacas]),
            "intervalo_partos_meses": _promedio([v.intervalo_partos_meses for v in vacas]),
            "condicion_corporal": _promedio([v.condicion_corporal for v in vacas]),
            "produccion_leche_lt_dia": _promedio([v.produccion_leche_lt_dia for v in vacas]),
        },
        "candidatas_descarte": sum(1 for v in vacas if v.candidata_descarte),
        "top_riesgo": [
            {"vaca_id": vaca.vaca_id, "puntaje": riesgo.puntaje, "nivel": riesgo.nivel}
            for vaca, riesgo in top_riesgo
        ],
    }


@router.get("/exportar")
def exportar_csv(db: Session = Depends(get_db)):
    config = crud.obtener_configuracion(db)
    vacas = db.query(models.Vaca).order_by(models.Vaca.vaca_id).all()

    buffer = io.StringIO()
    columnas = [
        "vaca_id",
        "edad_meses",
        "color",
        "cachona",
        "peso_kg",
        "condicion_corporal",
        "estado_salud",
        "edad_primer_parto_meses",
        "num_partos",
        "intervalo_partos_meses",
        "meses_desde_ultimo_parto",
        "perdida_cria",
        "produccion_leche_lt_dia",
        "candidata_descarte",
        "clasificacion_reproductiva",
        "puntaje_riesgo",
        "nivel_riesgo",
    ]
    escritor = csv.DictWriter(buffer, fieldnames=columnas, delimiter=";")
    escritor.writeheader()
    for vaca in vacas:
        riesgo = calcular_riesgo(vaca, config)
        fila = {columna: getattr(vaca, columna) for columna in columnas[:-2]}
        fila["puntaje_riesgo"] = riesgo.puntaje
        fila["nivel_riesgo"] = riesgo.nivel
        escritor.writerow(fila)

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=olinda_riesgo.csv"},
    )
