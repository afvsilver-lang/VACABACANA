from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Vaca(Base):
    __tablename__ = "vacas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vaca_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    edad_meses: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    cachona: Mapped[bool] = mapped_column(default=False)
    peso_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    condicion_corporal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estado_salud: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    edad_primer_parto_meses: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    num_partos: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    intervalo_partos_meses: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    meses_desde_ultimo_parto: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    perdida_cria: Mapped[bool] = mapped_column(default=False)
    produccion_leche_lt_dia: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    candidata_descarte: Mapped[bool] = mapped_column(default=False)
    clasificacion_reproductiva: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    seguimientos: Mapped[list["Seguimiento"]] = relationship(
        back_populates="vaca", cascade="all, delete-orphan"
    )


class Seguimiento(Base):
    __tablename__ = "seguimientos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vaca_id: Mapped[str] = mapped_column(String(20), ForeignKey("vacas.vaca_id"), index=True)
    fecha: Mapped[date] = mapped_column(Date)
    accion: Mapped[str] = mapped_column(Text)
    responsable: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    resultado: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    proxima_revision: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vaca: Mapped["Vaca"] = relationship(back_populates="seguimientos")


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    nombre_completo: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(100))
    rol: Mapped[str] = mapped_column(String(20), default="operador")
    activo: Mapped[bool] = mapped_column(default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Configuracion(Base):
    __tablename__ = "configuracion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    umbral_advertencia_meses: Mapped[float] = mapped_column(Float, default=12.0)
    umbral_critico_meses: Mapped[float] = mapped_column(Float, default=14.0)
    peso_intervalo: Mapped[float] = mapped_column(Float, default=60.0)
    peso_condicion_corporal: Mapped[float] = mapped_column(Float, default=15.0)
    peso_estado_salud: Mapped[float] = mapped_column(Float, default=15.0)
    peso_perdida_cria: Mapped[float] = mapped_column(Float, default=10.0)
    version_reglas: Mapped[str] = mapped_column(String(20), default="1.0")


class Reproduccion(Base):
    """Ficha de control reproductivo individual (parto -> servicio -> palpacion -> gestacion)."""

    __tablename__ = "reproduccion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    nombre: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    hierro: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    raza: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    fecha_nacimiento: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    num_partos: Mapped[int] = mapped_column(Integer, default=0)
    fecha_ultimo_parto: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    estado_corporal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    fecha_servicio: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    toro: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    fecha_retiro_toro: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    fecha_palpacion_programada: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fecha_palpacion_real: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    resultado_palpacion: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    fecha_estimada_concepcion: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fecha_probable_parto: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    eventos: Mapped[list["EventoReproductivo"]] = relationship(
        back_populates="reproduccion",
        cascade="all, delete-orphan",
        order_by="EventoReproductivo.fecha.desc()",
    )


class EventoReproductivo(Base):
    """Historial cronologico de una ficha (nunca se borra al registrar nuevos eventos)."""

    __tablename__ = "eventos_reproductivos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reproduccion_id: Mapped[int] = mapped_column(ForeignKey("reproduccion.id"), index=True)
    fecha: Mapped[date] = mapped_column(Date)
    tipo: Mapped[str] = mapped_column(String(30))
    detalle: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reproduccion: Mapped["Reproduccion"] = relationship(back_populates="eventos")


class ConfiguracionReproductiva(Base):
    """Umbrales (en dias) configurables del motor de reglas reproductivas."""

    __tablename__ = "configuracion_reproductiva"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dias_fin_recuperacion: Mapped[float] = mapped_column(Float, default=44.0)
    dias_fin_apta: Mapped[float] = mapped_column(Float, default=60.0)
    dias_fin_atencion: Mapped[float] = mapped_column(Float, default=82.0)
    dias_alerta_critica: Mapped[float] = mapped_column(Float, default=120.0)
    dias_para_palpacion: Mapped[float] = mapped_column(Float, default=45.0)
    dias_aviso_palpacion_proxima: Mapped[float] = mapped_column(Float, default=7.0)
    dias_gestacion: Mapped[float] = mapped_column(Float, default=283.0)
