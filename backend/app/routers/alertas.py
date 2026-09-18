from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import obtener_usuario_actual
from ..database import get_db
from ..riesgo import calcular_riesgo

router = APIRouter(
    prefix="/api/alertas", tags=["alertas"], dependencies=[Depends(obtener_usuario_actual)]
)


@router.get("", response_model=list[schemas.VacaConAlerta])
def listar_alertas(
    nivel: Optional[str] = Query(None, description="bajo | medio | alto | critico"),
    limit: int = Query(500, le=5000),
    db: Session = Depends(get_db),
):
    config = crud.obtener_configuracion(db)
    resultados = []
    for vaca in db.query(models.Vaca).all():
        riesgo = calcular_riesgo(vaca, config)
        if nivel and riesgo.nivel != nivel:
            continue
        resultados.append(
            schemas.VacaConAlerta(
                **schemas.VacaRespuesta.model_validate(vaca).model_dump(),
                puntaje_riesgo=riesgo.puntaje,
                nivel_riesgo=riesgo.nivel,
            )
        )
    resultados.sort(key=lambda v: v.puntaje_riesgo, reverse=True)
    return resultados[:limit]


@router.get("/{vaca_id}", response_model=schemas.AlertaRespuesta)
def obtener_alerta(vaca_id: str, db: Session = Depends(get_db)):
    vaca = crud.obtener_vaca(db, vaca_id)
    if not vaca:
        raise HTTPException(404, "Vaca no encontrada")
    config = crud.obtener_configuracion(db)
    riesgo = calcular_riesgo(vaca, config)
    return schemas.AlertaRespuesta(vaca_id=vaca_id, puntaje=riesgo.puntaje, nivel=riesgo.nivel, factores=riesgo.factores)
