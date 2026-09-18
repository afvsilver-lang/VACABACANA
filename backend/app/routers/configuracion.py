from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import obtener_usuario_actual, requerir_admin
from ..database import get_db

router = APIRouter(
    prefix="/api/configuracion",
    tags=["configuracion"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("", response_model=schemas.ConfiguracionRespuesta)
def obtener_configuracion(db: Session = Depends(get_db)):
    return crud.obtener_configuracion(db)


@router.put("", response_model=schemas.ConfiguracionRespuesta)
def actualizar_configuracion(
    datos: schemas.ConfiguracionActualizar,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_admin),
):
    config = crud.obtener_configuracion(db)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(config, campo, valor)
    db.commit()
    db.refresh(config)
    return config
