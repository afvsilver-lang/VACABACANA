"""Reglas de puntuacion de riesgo reproductivo.

El puntaje va de 0 a 100 y se compone de factores independientes y
transparentes, cada uno con su propio peso configurable (ver
Configuracion). El factor dominante es cuantos meses han pasado desde
el ultimo parto, comparado contra los umbrales de advertencia (12
meses) y critico (14 meses) del negocio.
"""

from dataclasses import dataclass, field

from .models import Configuracion, Vaca

NIVELES = (
    (0, "bajo"),
    (25, "medio"),
    (50, "alto"),
    (75, "critico"),
)


@dataclass
class Factor:
    factor: str
    valor: float | None
    puntos: float
    detalle: str


@dataclass
class ResultadoRiesgo:
    puntaje: float
    nivel: str
    factores: list[Factor] = field(default_factory=list)


def nivel_desde_puntaje(puntaje: float) -> str:
    nivel = NIVELES[0][1]
    for umbral, nombre in NIVELES:
        if puntaje >= umbral:
            nivel = nombre
    return nivel


def calcular_riesgo(vaca: Vaca, config: Configuracion) -> ResultadoRiesgo:
    factores: list[Factor] = []
    total = 0.0

    m = vaca.meses_desde_ultimo_parto
    if m is not None:
        adv = config.umbral_advertencia_meses
        crit = config.umbral_critico_meses

        if adv > 0 and m < adv:
            proporcion = max(0.0, m / adv) * 0.3
        elif m < crit:
            proporcion = 0.3 + (m - adv) / (crit - adv) * 0.4 if crit > adv else 0.7
        else:
            exceso = m - crit
            proporcion = 0.7 + min(exceso / crit, 1.0) * 0.3 if crit > 0 else 1.0

        puntos = round(proporcion * config.peso_intervalo, 1)
        total += puntos
        factores.append(
            Factor(
                factor="meses_desde_ultimo_parto",
                valor=m,
                puntos=puntos,
                detalle=(
                    f"{m} meses desde el ultimo parto "
                    f"(advertencia: {adv}, critico: {crit})"
                ),
            )
        )

    cc = vaca.condicion_corporal
    if cc is not None and cc < 2.5:
        proporcion = min((2.5 - cc) / 2.5, 1.0)
        puntos = round(proporcion * config.peso_condicion_corporal, 1)
        total += puntos
        factores.append(
            Factor(
                factor="condicion_corporal",
                valor=cc,
                puntos=puntos,
                detalle=f"Condicion corporal baja ({cc}, umbral: 2.5)",
            )
        )

    if vaca.estado_salud and vaca.estado_salud.strip().lower() != "sana":
        puntos = round(config.peso_estado_salud, 1)
        total += puntos
        factores.append(
            Factor(
                factor="estado_salud",
                valor=None,
                puntos=puntos,
                detalle=f"Estado de salud reportado: {vaca.estado_salud}",
            )
        )

    if vaca.perdida_cria:
        puntos = round(config.peso_perdida_cria, 1)
        total += puntos
        factores.append(
            Factor(
                factor="perdida_cria",
                valor=1.0,
                puntos=puntos,
                detalle="Registro de perdida de cria",
            )
        )

    puntaje = round(min(max(total, 0.0), 100.0), 1)
    return ResultadoRiesgo(puntaje=puntaje, nivel=nivel_desde_puntaje(puntaje), factores=factores)
