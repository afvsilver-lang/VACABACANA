from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import obtener_usuario_actual, requerir_escritura
from ..database import get_db

router = APIRouter(
    prefix="/api/seguimientos",
    tags=["seguimientos"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("", response_model=list[schemas.SeguimientoRespuesta])
def listar_seguimientos(
    vaca_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
):
    consulta = db.query(models.Seguimiento)
    if vaca_id:
        consulta = consulta.filter(models.Seguimiento.vaca_id == vaca_id)
    return (
        consulta.order_by(models.Seguimiento.fecha.desc()).offset(skip).limit(limit).all()
    )


@router.post("", response_model=schemas.SeguimientoRespuesta, status_code=201)
def crear_seguimiento(
    datos: schemas.SeguimientoCrear,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    if not crud.obtener_vaca(db, datos.vaca_id):
        raise HTTPException(404, f"No existe la vaca '{datos.vaca_id}'")
    seguimiento = models.Seguimiento(**datos.model_dump())
    db.add(seguimiento)
    db.commit()
    db.refresh(seguimiento)
    return seguimiento


@router.put("/{seguimiento_id}", response_model=schemas.SeguimientoRespuesta)
def actualizar_seguimiento(
    seguimiento_id: int,
    datos: schemas.SeguimientoActualizar,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    seguimiento = db.get(models.Seguimiento, seguimiento_id)
    if not seguimiento:
        raise HTTPException(404, "Seguimiento no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(seguimiento, campo, valor)
    db.commit()
    db.refresh(seguimiento)
    return seguimiento


@router.delete("/{seguimiento_id}", status_code=204)
def eliminar_seguimiento(
    seguimiento_id: int,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    seguimiento = db.get(models.Seguimiento, seguimiento_id)
    if not seguimiento:
        raise HTTPException(404, "Seguimiento no encontrado")
    db.delete(seguimiento)
    db.commit()
