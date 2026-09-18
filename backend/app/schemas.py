from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class VacaBase(BaseModel):
    vaca_id: str = Field(min_length=1, max_length=20)
    edad_meses: Optional[float] = None
    color: Optional[str] = None
    cachona: bool = False
    peso_kg: Optional[float] = None
    condicion_corporal: Optional[float] = None
    estado_salud: Optional[str] = None
    edad_primer_parto_meses: Optional[float] = None
    num_partos: Optional[int] = None
    intervalo_partos_meses: Optional[float] = None
    meses_desde_ultimo_parto: Optional[float] = None
    perdida_cria: bool = False
    produccion_leche_lt_dia: Optional[float] = None
    candidata_descarte: bool = False
    clasificacion_reproductiva: Optional[str] = None


class VacaCrear(VacaBase):
    pass


class VacaActualizar(BaseModel):
    edad_meses: Optional[float] = None
    color: Optional[str] = None
    cachona: Optional[bool] = None
    peso_kg: Optional[float] = None
    condicion_corporal: Optional[float] = None
    estado_salud: Optional[str] = None
    edad_primer_parto_meses: Optional[float] = None
    num_partos: Optional[int] = None
    intervalo_partos_meses: Optional[float] = None
    meses_desde_ultimo_parto: Optional[float] = None
    perdida_cria: Optional[bool] = None
    produccion_leche_lt_dia: Optional[float] = None
    candidata_descarte: Optional[bool] = None
    clasificacion_reproductiva: Optional[str] = None


class VacaRespuesta(VacaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creado_en: datetime
    actualizado_en: datetime


class FactorRiesgo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    factor: str
    valor: Optional[float] = None
    puntos: float
    detalle: str


class AlertaRespuesta(BaseModel):
    vaca_id: str
    puntaje: float
    nivel: str
    factores: list[FactorRiesgo]


class VacaConAlerta(VacaRespuesta):
    puntaje_riesgo: float
    nivel_riesgo: str


class SeguimientoBase(BaseModel):
    vaca_id: str
    fecha: date
    accion: str
    responsable: Optional[str] = None
    resultado: Optional[str] = None
    proxima_revision: Optional[date] = None


class SeguimientoCrear(SeguimientoBase):
    pass


class SeguimientoActualizar(BaseModel):
    fecha: Optional[date] = None
    accion: Optional[str] = None
    responsable: Optional[str] = None
    resultado: Optional[str] = None
    proxima_revision: Optional[date] = None


class SeguimientoRespuesta(SeguimientoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creado_en: datetime


class ConfiguracionRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    umbral_advertencia_meses: float
    umbral_critico_meses: float
    peso_intervalo: float
    peso_condicion_corporal: float
    peso_estado_salud: float
    peso_perdida_cria: float
    version_reglas: str


class ConfiguracionActualizar(BaseModel):
    umbral_advertencia_meses: Optional[float] = None
    umbral_critico_meses: Optional[float] = None
    peso_intervalo: Optional[float] = None
    peso_condicion_corporal: Optional[float] = None
    peso_estado_salud: Optional[float] = None
    peso_perdida_cria: Optional[float] = None
    version_reglas: Optional[str] = None


class ImportarResumen(BaseModel):
    creadas: int
    actualizadas: int
    errores: list[str]


ROLES_VALIDOS = ("admin", "operador", "lectura")


class LoginEntrada(BaseModel):
    username: str
    password: str


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    nombre_completo: Optional[str] = None
    rol: str
    activo: bool
    creado_en: datetime


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuesta


class UsuarioCrear(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    nombre_completo: Optional[str] = None
    rol: str = Field(default="operador")


class UsuarioActualizar(BaseModel):
    nombre_completo: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=8)


# --- Modulo de reproduccion -------------------------------------------------

RESULTADOS_PALPACION_VALIDOS = ("preñada", "vacia", "dudosa")


class ReproduccionBase(BaseModel):
    codigo: str = Field(min_length=1, max_length=20)
    nombre: Optional[str] = None
    hierro: Optional[str] = None
    raza: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    num_partos: int = 0
    fecha_ultimo_parto: Optional[date] = None
    estado_corporal: Optional[float] = None
    fecha_servicio: Optional[date] = None
    toro: Optional[str] = None
    fecha_retiro_toro: Optional[date] = None
    fecha_palpacion_programada: Optional[date] = None
    fecha_palpacion_real: Optional[date] = None
    resultado_palpacion: Optional[str] = None
    fecha_estimada_concepcion: Optional[date] = None
    fecha_probable_parto: Optional[date] = None
    observaciones: Optional[str] = None


class ReproduccionCrear(ReproduccionBase):
    pass


class ReproduccionActualizar(BaseModel):
    nombre: Optional[str] = None
    hierro: Optional[str] = None
    raza: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    estado_corporal: Optional[float] = None
    observaciones: Optional[str] = None


class ReproduccionRespuesta(ReproduccionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creado_en: datetime
    actualizado_en: datetime


class ReproduccionConEstado(ReproduccionRespuesta):
    estado_reproductivo: str
    nivel_alerta: str
    dias_posparto: Optional[int] = None
    dias_desde_servicio: Optional[int] = None
    dias_gestacion: Optional[int] = None


class EventoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fecha: date
    tipo: str
    detalle: str
    creado_en: datetime


class ReproduccionDetalle(ReproduccionConEstado):
    eventos: list[EventoRespuesta] = []


class PartoEntrada(BaseModel):
    fecha_parto: date


class ServicioEntrada(BaseModel):
    fecha_servicio: date
    toro: str = Field(min_length=1, max_length=60)


class RetiroToroEntrada(BaseModel):
    fecha_retiro: date


class ProgramarPalpacionEntrada(BaseModel):
    fecha_programada: Optional[date] = None


class RegistrarPalpacionEntrada(BaseModel):
    fecha_real: date
    resultado: str


class ConfiguracionReproductivaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dias_fin_recuperacion: float
    dias_fin_apta: float
    dias_fin_atencion: float
    dias_alerta_critica: float
    dias_para_palpacion: float
    dias_aviso_palpacion_proxima: float
    dias_gestacion: float


class ConfiguracionReproductivaActualizar(BaseModel):
    dias_fin_recuperacion: Optional[float] = None
    dias_fin_apta: Optional[float] = None
    dias_fin_atencion: Optional[float] = None
    dias_alerta_critica: Optional[float] = None
    dias_para_palpacion: Optional[float] = None
    dias_aviso_palpacion_proxima: Optional[float] = None
    dias_gestacion: Optional[float] = None


class ImportarReproduccionResumen(BaseModel):
    creadas: int
    actualizadas: int
    errores: list[str]
