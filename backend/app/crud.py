from sqlalchemy.orm import Session

from . import models


def obtener_configuracion(db: Session) -> models.Configuracion:
    config = db.query(models.Configuracion).filter(models.Configuracion.id == 1).first()
    if config is None:
        config = models.Configuracion(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def obtener_vaca(db: Session, vaca_id: str) -> models.Vaca | None:
    return db.query(models.Vaca).filter(models.Vaca.vaca_id == vaca_id).first()


def obtener_configuracion_reproductiva(db: Session) -> models.ConfiguracionReproductiva:
    config = (
        db.query(models.ConfiguracionReproductiva)
        .filter(models.ConfiguracionReproductiva.id == 1)
        .first()
    )
    if config is None:
        config = models.ConfiguracionReproductiva(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config
