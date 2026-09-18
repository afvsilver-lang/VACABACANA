"""Motor de clasificacion del estado reproductivo.

El estado y el nivel de alerta de cada vaca NUNCA se guardan en la base de
datos: se recalculan aqui a partir de las fechas registradas y de la fecha
de hoy, para que las alertas avancen solas dia a dia sin necesidad de un
proceso en segundo plano.

Precedencia de las reglas (de mas especifica a mas general):
1. Ya hay un resultado de palpacion (preñada / vacia / dudosa).
2. Hay una palpacion programada sin resultado todavia (atrasada / proxima / programada).
3. Esta con el toro (o recien retirada) y aun no se programa palpacion.
4. Aun no ha sido servida: se usa la escala de dias desde el ultimo parto.
5. No hay suficiente informacion para clasificar.
"""

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Optional

from .models import ConfiguracionReproductiva, Reproduccion

RESULTADOS_VALIDOS = ("preñada", "vacia", "dudosa")


@dataclass
class Clasificacion:
    estado: str
    nivel: str
    dias_posparto: Optional[int]
    dias_desde_servicio: Optional[int]
    dias_gestacion: Optional[int]
    fecha_probable_parto: Optional[date]


def _dias(hoy: date, referencia: Optional[date]) -> Optional[int]:
    if referencia is None:
        return None
    return (hoy - referencia).days


def clasificar(
    reg: Reproduccion, config: ConfiguracionReproductiva, hoy: Optional[date] = None
) -> Clasificacion:
    hoy = hoy or date.today()
    dias_posparto = _dias(hoy, reg.fecha_ultimo_parto)
    dias_desde_servicio = _dias(hoy, reg.fecha_servicio)

    # 1) Resultado de palpacion ya registrado.
    if reg.resultado_palpacion == "preñada":
        concepcion = reg.fecha_estimada_concepcion or reg.fecha_servicio
        dias_gestacion = _dias(hoy, concepcion)
        fecha_probable_parto = reg.fecha_probable_parto
        if fecha_probable_parto is None and concepcion is not None:
            fecha_probable_parto = concepcion + timedelta(days=config.dias_gestacion)
        return Clasificacion(
            "Preñez confirmada", "exito", dias_posparto, dias_desde_servicio, dias_gestacion, fecha_probable_parto
        )

    if reg.resultado_palpacion == "vacia":
        return Clasificacion(
            "No preñada - revisar y volver con el toro", "alerta", dias_posparto, dias_desde_servicio, None, None
        )

    if reg.resultado_palpacion == "dudosa":
        return Clasificacion("Repetir palpación", "advertencia", dias_posparto, dias_desde_servicio, None, None)

    # 2) Palpacion programada pero sin resultado todavia.
    if reg.fecha_palpacion_programada is not None and reg.fecha_palpacion_real is None:
        if reg.fecha_palpacion_programada < hoy:
            return Clasificacion("Palpación atrasada", "critico", dias_posparto, dias_desde_servicio, None, None)
        dias_para_programada = (reg.fecha_palpacion_programada - hoy).days
        if dias_para_programada <= config.dias_aviso_palpacion_proxima:
            return Clasificacion("Palpación próxima", "advertencia", dias_posparto, dias_desde_servicio, None, None)
        return Clasificacion("Palpación programada", "info", dias_posparto, dias_desde_servicio, None, None)

    # 3) Con el toro (o recien retirada), aun sin programar palpacion.
    if reg.fecha_servicio is not None:
        referencia = reg.fecha_retiro_toro or reg.fecha_servicio
        dias_desde_referencia = _dias(hoy, referencia)
        if dias_desde_referencia is not None and dias_desde_referencia >= config.dias_para_palpacion:
            return Clasificacion("Programar palpación", "advertencia", dias_posparto, dias_desde_servicio, None, None)
        return Clasificacion(
            "Con el toro - en espera de diagnóstico", "info", dias_posparto, dias_desde_servicio, None, None
        )

    # 4) Aun no ha sido servida: escala segun dias desde el ultimo parto.
    if dias_posparto is not None:
        if dias_posparto <= config.dias_fin_recuperacion:
            return Clasificacion("Recuperación posparto", "posparto", dias_posparto, None, None, None)
        if dias_posparto <= config.dias_fin_apta:
            return Clasificacion("Apta para dejar con el toro", "exito", dias_posparto, None, None, None)
        if dias_posparto <= config.dias_fin_atencion:
            return Clasificacion("Atención: poner con el toro", "advertencia", dias_posparto, None, None, None)
        if dias_posparto <= config.dias_alerta_critica:
            return Clasificacion("Alerta reproductiva", "alerta", dias_posparto, None, None, None)
        return Clasificacion("Alerta crítica", "critico", dias_posparto, None, None, None)

    # 5) Sin datos suficientes para clasificar.
    return Clasificacion("Datos incompletos", "neutro", None, None, None, None)
