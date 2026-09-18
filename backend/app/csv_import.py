"""Importacion de inventario de vacas desde CSV.

Espera el formato de OLINDA_CLEAN.csv: separador ';', columnas en
espanol, booleanos como '0'/'1'. Filas con vaca_id repetido dentro del
mismo archivo actualizan el registro creado previamente en esa misma
importacion.
"""

import csv
import io
from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from . import models

COLUMNAS_FLOAT = (
    "edad_meses",
    "peso_kg",
    "condicion_corporal",
    "edad_primer_parto_meses",
    "intervalo_partos_meses",
    "meses_desde_ultimo_parto",
    "produccion_leche_lt_dia",
)
COLUMNAS_BOOL = ("cachona", "perdida_cria", "candidata_descarte")
COLUMNAS_TEXTO = ("color", "estado_salud", "clasificacion_reproductiva")


@dataclass
class ResumenImportacion:
    creadas: int = 0
    actualizadas: int = 0
    errores: list[str] = field(default_factory=list)


def _parsear_float(valor: str) -> float | None:
    valor = (valor or "").strip()
    if not valor:
        return None
    return float(valor.replace(",", "."))


def _parsear_bool(valor: str) -> bool:
    return (valor or "").strip() in ("1", "true", "True", "si", "Si", "SI")


def _parsear_int(valor: str) -> int | None:
    valor = (valor or "").strip()
    if not valor:
        return None
    return int(float(valor))


def importar_csv(db: Session, contenido: bytes) -> ResumenImportacion:
    resumen = ResumenImportacion()
    texto = contenido.decode("utf-8-sig")
    lector = csv.DictReader(io.StringIO(texto), delimiter=";")

    if not lector.fieldnames or "vaca_id" not in lector.fieldnames:
        resumen.errores.append(
            "El archivo debe tener encabezado con columnas separadas por ';' e incluir 'vaca_id'."
        )
        return resumen

    for numero_fila, fila in enumerate(lector, start=2):
        vaca_id = (fila.get("vaca_id") or "").strip()
        if not vaca_id:
            resumen.errores.append(f"Fila {numero_fila}: 'vaca_id' vacio, se omite.")
            continue

        try:
            datos = {"vaca_id": vaca_id}
            for columna in COLUMNAS_FLOAT:
                if columna in fila:
                    datos[columna] = _parsear_float(fila[columna])
            for columna in COLUMNAS_BOOL:
                if columna in fila:
                    datos[columna] = _parsear_bool(fila[columna])
            for columna in COLUMNAS_TEXTO:
                if columna in fila:
                    valor = (fila[columna] or "").strip()
                    datos[columna] = valor or None
            if "num_partos" in fila:
                datos["num_partos"] = _parsear_int(fila["num_partos"])
        except ValueError as exc:
            resumen.errores.append(f"Fila {numero_fila} ({vaca_id}): valor invalido ({exc}).")
            continue

        vaca = db.query(models.Vaca).filter(models.Vaca.vaca_id == vaca_id).first()
        if vaca is None:
            db.add(models.Vaca(**datos))
            resumen.creadas += 1
        else:
            for campo, valor in datos.items():
                setattr(vaca, campo, valor)
            resumen.actualizadas += 1

    db.commit()
    return resumen
