"""Autenticacion por token (JWT) y control de acceso por rol.

Roles: admin (todo, incluida configuracion y gestion de usuarios),
operador (trabajo diario: vacas, seguimientos, importar), lectura
(solo consulta, sin crear/editar/eliminar).
"""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "cambia-esta-clave-en-produccion")
ALGORITMO = "HS256"
EXPIRA_MINUTOS = int(os.getenv("JWT_EXPIRA_MINUTOS", "480"))

_esquema_bearer = HTTPBearer(auto_error=False)

CREDENCIALES_INVALIDAS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenciales invalidas o sesion expirada",
    headers={"WWW-Authenticate": "Bearer"},
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def crear_token(usuario: models.Usuario) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=EXPIRA_MINUTOS)
    payload = {"sub": usuario.username, "exp": expira}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITMO)


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(_esquema_bearer),
    db: Session = Depends(get_db),
) -> models.Usuario:
    if credenciales is None:
        raise CREDENCIALES_INVALIDAS
    try:
        payload = jwt.decode(credenciales.credentials, SECRET_KEY, algorithms=[ALGORITMO])
    except jwt.PyJWTError:
        raise CREDENCIALES_INVALIDAS

    username = payload.get("sub")
    if not username:
        raise CREDENCIALES_INVALIDAS

    usuario = db.query(models.Usuario).filter(models.Usuario.username == username).first()
    if usuario is None or not usuario.activo:
        raise CREDENCIALES_INVALIDAS
    return usuario


def requerir_escritura(usuario: models.Usuario = Depends(obtener_usuario_actual)) -> models.Usuario:
    if usuario.rol == "lectura":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Su rol solo tiene permiso de lectura")
    return usuario


def requerir_admin(usuario: models.Usuario = Depends(obtener_usuario_actual)) -> models.Usuario:
    if usuario.rol != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Requiere rol de administrador")
    return usuario
