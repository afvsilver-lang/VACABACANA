from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import obtener_usuario_actual, requerir_escritura
from ..database import get_db

router = APIRouter(
    prefix="/api/vacas", tags=["vacas"], dependencies=[Depends(obtener_usuario_actual)]
)


@router.get("", response_model=list[schemas.VacaRespuesta])
def listar_vacas(
    q: Optional[str] = Query(None, description="Busca por vaca_id"),
    color: Optional[str] = None,
    estado_salud: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
):
    consulta = db.query(models.Vaca)
    if q:
        consulta = consulta.filter(models.Vaca.vaca_id.ilike(f"%{q}%"))
    if color:
        consulta = consulta.filter(models.Vaca.color == color)
    if estado_salud:
        consulta = consulta.filter(models.Vaca.estado_salud == estado_salud)
    return consulta.order_by(models.Vaca.vaca_id).offset(skip).limit(limit).all()


@router.post("", response_model=schemas.VacaRespuesta, status_code=201)
def crear_vaca(
    datos: schemas.VacaCrear, db: Session = Depends(get_db), _u: models.Usuario = Depends(requerir_escritura)
):
    if crud.obtener_vaca(db, datos.vaca_id):
        raise HTTPException(409, f"Ya existe una vaca con vaca_id '{datos.vaca_id}'")
    vaca = models.Vaca(**datos.model_dump())
    db.add(vaca)
    db.commit()
    db.refresh(vaca)
    return vaca


@router.get("/{vaca_id}", response_model=schemas.VacaRespuesta)
def obtener_vaca(vaca_id: str, db: Session = Depends(get_db)):
    vaca = crud.obtener_vaca(db, vaca_id)
    if not vaca:
        raise HTTPException(404, "Vaca no encontrada")
    return vaca


@router.put("/{vaca_id}", response_model=schemas.VacaRespuesta)
def actualizar_vaca(
    vaca_id: str,
    datos: schemas.VacaActualizar,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    vaca = crud.obtener_vaca(db, vaca_id)
    if not vaca:
        raise HTTPException(404, "Vaca no encontrada")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(vaca, campo, valor)
    db.commit()
    db.refresh(vaca)
    return vaca


@router.delete("/{vaca_id}", status_code=204)
def eliminar_vaca(
    vaca_id: str, db: Session = Depends(get_db), _u: models.Usuario = Depends(requerir_escritura)
):
    vaca = crud.obtener_vaca(db, vaca_id)
    if not vaca:
        raise HTTPException(404, "Vaca no encontrada")
    db.delete(vaca)
    db.commit()
