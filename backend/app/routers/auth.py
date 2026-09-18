from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import crear_token, hash_password, obtener_usuario_actual, requerir_admin, verificar_password
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenRespuesta)
def iniciar_sesion(datos: schemas.LoginEntrada, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == datos.username).first()
    if not usuario or not usuario.activo or not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(401, "Usuario o contraseña incorrectos")
    token = crear_token(usuario)
    return schemas.TokenRespuesta(access_token=token, usuario=usuario)


@router.get("/me", response_model=schemas.UsuarioRespuesta)
def usuario_actual(usuario: models.Usuario = Depends(obtener_usuario_actual)):
    return usuario


@router.get("/usuarios", response_model=list[schemas.UsuarioRespuesta])
def listar_usuarios(
    limit: int = Query(200, le=1000),
    db: Session = Depends(get_db),
    _actual: models.Usuario = Depends(requerir_admin),
):
    return db.query(models.Usuario).order_by(models.Usuario.username).limit(limit).all()


@router.post("/usuarios", response_model=schemas.UsuarioRespuesta, status_code=201)
def crear_usuario(
    datos: schemas.UsuarioCrear,
    db: Session = Depends(get_db),
    _actual: models.Usuario = Depends(requerir_admin),
):
    if datos.rol not in schemas.ROLES_VALIDOS:
        raise HTTPException(422, f"Rol invalido. Use uno de: {', '.join(schemas.ROLES_VALIDOS)}")
    if db.query(models.Usuario).filter(models.Usuario.username == datos.username).first():
        raise HTTPException(409, f"Ya existe el usuario '{datos.username}'")
    usuario = models.Usuario(
        username=datos.username,
        nombre_completo=datos.nombre_completo,
        rol=datos.rol,
        password_hash=hash_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/usuarios/{usuario_id}", response_model=schemas.UsuarioRespuesta)
def actualizar_usuario(
    usuario_id: int,
    datos: schemas.UsuarioActualizar,
    db: Session = Depends(get_db),
    actual: models.Usuario = Depends(requerir_admin),
):
    usuario = db.get(models.Usuario, usuario_id)
    if not usuario:
        raise HTTPException(404, "Usuario no encontrado")
    if datos.rol is not None and datos.rol not in schemas.ROLES_VALIDOS:
        raise HTTPException(422, f"Rol invalido. Use uno de: {', '.join(schemas.ROLES_VALIDOS)}")
    if usuario.id == actual.id and datos.activo is False:
        raise HTTPException(400, "No puede desactivar su propia cuenta")
    if usuario.id == actual.id and datos.rol is not None and datos.rol != "admin":
        raise HTTPException(400, "No puede quitarse su propio rol de administrador")

    cambios = datos.model_dump(exclude_unset=True, exclude={"password"})
    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)
    if datos.password:
        usuario.password_hash = hash_password(datos.password)

    db.commit()
    db.refresh(usuario)
    return usuario
