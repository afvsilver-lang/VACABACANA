"""Importacion y exportacion CSV del modulo de reproduccion.

Formato: separador ';', fechas en formato ISO (AAAA-MM-DD) para evitar
ambiguedad al intercambiar el archivo entre sistemas y hojas de calculo.
"""

import csv
import io
from dataclasses import dataclass, field
from datetime import date, datetime

from sqlalchemy.orm import Session

from . import models

COLUMNAS = [
    "codigo",
    "nombre",
    "hierro",
    "raza",
    "fecha_nacimiento",
    "num_partos",
    "fecha_ultimo_parto",
    "estado_corporal",
    "fecha_servicio",
    "toro",
    "fecha_retiro_toro",
    "fecha_palpacion_programada",
    "fecha_palpacion_real",
    "resultado_palpacion",
    "fecha_estimada_concepcion",
    "fecha_probable_parto",
    "observaciones",
]
COLUMNAS_FECHA = (
    "fecha_nacimiento",
    "fecha_ultimo_parto",
    "fecha_servicio",
    "fecha_retiro_toro",
    "fecha_palpacion_programada",
    "fecha_palpacion_real",
    "fecha_estimada_concepcion",
    "fecha_probable_parto",
)
COLUMNAS_TEXTO = ("nombre", "hierro", "raza", "toro", "resultado_palpacion", "observaciones")


@dataclass
class ResumenImportacion:
    creadas: int = 0
    actualizadas: int = 0
    errores: list[str] = field(default_factory=list)


def _parsear_fecha(valor: str) -> date | None:
    valor = (valor or "").strip()
    if not valor:
        return None
    return datetime.strptime(valor, "%Y-%m-%d").date()


def _parsear_float(valor: str) -> float | None:
    valor = (valor or "").strip()
    if not valor:
        return None
    return float(valor.replace(",", "."))


def _parsear_int(valor: str) -> int:
    valor = (valor or "").strip()
    return int(float(valor)) if valor else 0


def importar_csv(db: Session, contenido: bytes) -> ResumenImportacion:
    resumen = ResumenImportacion()
    texto = contenido.decode("utf-8-sig")
    lector = csv.DictReader(io.StringIO(texto), delimiter=";")

    if not lector.fieldnames or "codigo" not in lector.fieldnames:
        resumen.errores.append(
            "El archivo debe tener encabezado con columnas separadas por ';' e incluir 'codigo'."
        )
        return resumen

    for numero_fila, fila in enumerate(lector, start=2):
        codigo = (fila.get("codigo") or "").strip()
        if not codigo:
            resumen.errores.append(f"Fila {numero_fila}: 'codigo' vacio, se omite.")
            continue

        try:
            datos: dict = {"codigo": codigo}
            for columna in COLUMNAS_FECHA:
                if columna in fila:
                    datos[columna] = _parsear_fecha(fila[columna])
            if "estado_corporal" in fila:
                datos["estado_corporal"] = _parsear_float(fila["estado_corporal"])
            if "num_partos" in fila:
                datos["num_partos"] = _parsear_int(fila["num_partos"])
            for columna in COLUMNAS_TEXTO:
                if columna in fila:
                    valor = (fila[columna] or "").strip()
                    datos[columna] = valor or None
        except ValueError as exc:
            resumen.errores.append(f"Fila {numero_fila} ({codigo}): valor invalido ({exc}).")
            continue

        reg = db.query(models.Reproduccion).filter(models.Reproduccion.codigo == codigo).first()
        if reg is None:
            db.add(models.Reproduccion(**datos))
            resumen.creadas += 1
        else:
            for campo, valor in datos.items():
                setattr(reg, campo, valor)
            resumen.actualizadas += 1

    db.commit()
    return resumen


def exportar_csv(registros: list[models.Reproduccion]) -> str:
    buffer = io.StringIO()
    escritor = csv.DictWriter(buffer, fieldnames=COLUMNAS, delimiter=";")
    escritor.writeheader()
    for reg in registros:
        fila = {}
        for columna in COLUMNAS:
            valor = getattr(reg, columna)
            fila[columna] = valor.isoformat() if isinstance(valor, date) else valor
        escritor.writerow(fila)
    buffer.seek(0)
    return buffer.getvalue()
