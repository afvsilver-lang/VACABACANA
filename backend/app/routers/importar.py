from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import requerir_escritura
from ..csv_import import importar_csv
from ..database import get_db

router = APIRouter(prefix="/api/importar", tags=["importar"])


@router.post("", response_model=schemas.ImportarResumen)
async def importar_inventario(
    archivo: UploadFile,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(requerir_escritura),
):
    if not archivo.filename or not archivo.filename.lower().endswith(".csv"):
        raise HTTPException(400, "El archivo debe ser un .csv")
    contenido = await archivo.read()
    resumen = importar_csv(db, contenido)
    return schemas.ImportarResumen(
        creadas=resumen.creadas, actualizadas=resumen.actualizadas, errores=resumen.errores
    )
