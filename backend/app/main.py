import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models
from .auth import hash_password
from .csv_import import importar_csv
from .database import SessionLocal, engine
from .reproduccion_seed import generar_demo as generar_reproduccion_demo
from .routers import (
    alertas,
    analitica,
    asistente,
    auth,
    configuracion,
    importar,
    reproduccion,
    seguimientos,
    vacas,
)

SEED_CSV = Path(__file__).resolve().parent.parent / "seed" / "olinda_seed.csv"

app = FastAPI(title="Olinda Alerta Reproductiva API", version="1.0")

origenes = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origenes],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vacas.router)
app.include_router(alertas.router)
app.include_router(seguimientos.router)
app.include_router(configuracion.router)
app.include_router(analitica.router)
app.include_router(importar.router)
app.include_router(asistente.router)
app.include_router(reproduccion.router)


def _sembrar_datos_iniciales(db: Session) -> None:
    total = db.query(func.count(models.Vaca.id)).scalar()
    if total or not SEED_CSV.exists():
        return
    importar_csv(db, SEED_CSV.read_bytes())


def _sembrar_usuario_admin(db: Session) -> None:
    if db.query(func.count(models.Usuario.id)).scalar():
        return
    username = os.getenv("ADMIN_USERNAME", "admin")
    password = os.getenv("ADMIN_PASSWORD", "olinda2026")
    db.add(
        models.Usuario(
            username=username,
            nombre_completo="Administrador",
            rol="admin",
            password_hash=hash_password(password),
        )
    )
    db.commit()
    print(f"[olinda] Usuario administrador creado: {username}")


def _sembrar_reproduccion_demo(db: Session) -> None:
    if db.query(func.count(models.Reproduccion.id)).scalar():
        return
    for registro in generar_reproduccion_demo():
        db.add(registro)
    db.commit()


@app.on_event("startup")
def iniciar() -> None:
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _sembrar_datos_iniciales(db)
        _sembrar_usuario_admin(db)
        _sembrar_reproduccion_demo(db)
    finally:
        db.close()


@app.get("/api/health")
def salud():
    return {"estado": "ok"}
