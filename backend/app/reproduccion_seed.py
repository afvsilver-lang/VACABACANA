"""Datos de ejemplo del modulo de reproduccion, para demostrar el dashboard.

Las fechas se calculan en relacion a hoy (no son fijas) para que la demo
siempre muestre cada estado posible sin importar cuando se ejecute la app.
Estan pensados para ser reemplazados por datos reales del hato.
"""

from datetime import date, timedelta

from . import models

TOROS = ["Toro 1 - Napoleon", "Toro 2 - Zeus", "Toro 3 - Titan"]


def generar_demo() -> list[models.Reproduccion]:
    hoy = date.today()

    def hace(n: int) -> date:
        """Fecha hace n dias (n negativo = en el futuro)."""
        return hoy - timedelta(days=n)

    registros: list[models.Reproduccion] = []

    def agregar(codigo, nombre, hierro, raza, dias_vida, num_partos, **kwargs):
        registros.append(
            models.Reproduccion(
                codigo=codigo,
                nombre=nombre,
                hierro=hierro,
                raza=raza,
                fecha_nacimiento=hace(dias_vida),
                num_partos=num_partos,
                estado_corporal=kwargs.pop("estado_corporal", 3.0),
                **kwargs,
            )
        )

    # Recuperacion posparto (0-44 dias desde el parto)
    agregar("R-001", "Canela", "H-101", "Brahman", 1500, 3, fecha_ultimo_parto=hace(5))
    agregar("R-002", "Estrella", "H-102", "Gyr", 1600, 2, fecha_ultimo_parto=hace(20))
    agregar("R-003", "Luna", "H-103", "Holstein", 1400, 4, fecha_ultimo_parto=hace(40))

    # Apta para dejar con el toro (45-60 dias)
    agregar("R-004", "Paloma", "H-104", "Normando", 1700, 2, fecha_ultimo_parto=hace(50))
    agregar("R-005", "Aurora", "H-105", "Cebu", 1550, 3, fecha_ultimo_parto=hace(58))

    # Atencion: poner con el toro (61-82 dias)
    agregar("R-006", "Flor", "H-106", "Brahman", 1650, 3, fecha_ultimo_parto=hace(65))
    agregar("R-007", "Perla", "H-107", "Gyr", 1500, 2, fecha_ultimo_parto=hace(78))

    # Alerta reproductiva (83-120 dias, sin servicio ni prenez)
    agregar("R-008", "Morena", "H-108", "Holstein", 1800, 4, fecha_ultimo_parto=hace(95))
    agregar("R-009", "Rosa", "H-109", "Normando", 1750, 3, fecha_ultimo_parto=hace(110))

    # Alerta critica (mas de 120 dias)
    agregar("R-010", "Trigueña", "H-110", "Cebu", 1900, 5, fecha_ultimo_parto=hace(150))
    agregar("R-011", "Bonita", "H-111", "Brahman", 2000, 4, fecha_ultimo_parto=hace(210))

    # Recien servida, aun no toca programar palpacion
    agregar(
        "R-012", "Dulce", "H-112", "Gyr", 1600, 3,
        fecha_ultimo_parto=hace(70), fecha_servicio=hace(20), toro=TOROS[0],
    )

    # Ya se cumplieron los dias configurados sin programar palpacion
    agregar(
        "R-013", "Nube", "H-113", "Holstein", 1650, 2,
        fecha_ultimo_parto=hace(100), fecha_servicio=hace(50), toro=TOROS[1],
    )

    # Palpacion proxima (programada dentro de los proximos dias)
    agregar(
        "R-014", "Reina", "H-114", "Normando", 1700, 3,
        fecha_ultimo_parto=hace(95), fecha_servicio=hace(48), toro=TOROS[2],
        fecha_palpacion_programada=hace(-3),
    )

    # Palpacion atrasada (la fecha programada ya paso sin resultado)
    agregar(
        "R-015", "Coqueta", "H-115", "Cebu", 1750, 4,
        fecha_ultimo_parto=hace(110), fecha_servicio=hace(60), toro=TOROS[0],
        fecha_palpacion_programada=hace(5),
    )

    # Preñez confirmada
    concepcion_16 = hace(90)
    agregar(
        "R-016", "Girasol", "H-116", "Brahman", 1600, 3,
        fecha_ultimo_parto=hace(140), fecha_servicio=concepcion_16, toro=TOROS[1],
        fecha_palpacion_programada=hace(45), fecha_palpacion_real=hace(43),
        resultado_palpacion="preñada", fecha_estimada_concepcion=concepcion_16,
        fecha_probable_parto=concepcion_16 + timedelta(days=283),
    )

    # Vacia
    agregar(
        "R-017", "Amapola", "H-117", "Gyr", 1650, 2,
        fecha_ultimo_parto=hace(130), fecha_servicio=hace(80), toro=TOROS[2],
        fecha_palpacion_programada=hace(35), fecha_palpacion_real=hace(33),
        resultado_palpacion="vacia",
    )

    # Dudosa
    agregar(
        "R-018", "Violeta", "H-118", "Holstein", 1700, 3,
        fecha_ultimo_parto=hace(100), fecha_servicio=hace(55), toro=TOROS[0],
        fecha_palpacion_programada=hace(10), fecha_palpacion_real=hace(8),
        resultado_palpacion="dudosa",
    )

    # Datos incompletos
    registros.append(models.Reproduccion(codigo="R-019", nombre="Sin datos aun", raza="Brahman"))

    return registros
