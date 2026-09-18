"""Asistente conversacional (OpenAI) con acceso de solo lectura a los datos
del hato mediante function-calling, y capacidad de proponer graficas
dinamicas para el dashboard.
"""

import json
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI, OpenAIError
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import crud, models
from ..auth import obtener_usuario_actual
from ..database import get_db
from ..riesgo import calcular_riesgo
from .analitica import resumen as calcular_resumen

router = APIRouter(prefix="/api/asistente", tags=["asistente"])

MODELO = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MAX_TURNOS_HERRAMIENTA = 4


class MensajeChat(BaseModel):
    rol: str
    contenido: str


class ChatEntrada(BaseModel):
    mensaje: str
    historial: list[MensajeChat] = []


class GraficaSpec(BaseModel):
    tipo: str
    titulo: str
    etiquetas: list[str]
    series: list[dict]


class ChatRespuesta(BaseModel):
    respuesta: str
    grafica: Optional[GraficaSpec] = None


HERRAMIENTAS = [
    {
        "type": "function",
        "function": {
            "name": "consultar_resumen",
            "description": (
                "Obtiene el resumen agregado y actual del hato: total de vacas, conteo por "
                "nivel de riesgo reproductivo, por color, por estado de salud, promedios "
                "(meses desde ultimo parto, intervalo entre partos, condicion corporal, "
                "produccion de leche) y el top 10 de vacas con mayor riesgo."
            ),
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_vacas",
            "description": (
                "Consulta vacas del inventario con filtros opcionales. Devuelve hasta "
                "'limit' registros (por defecto 50) con sus datos y su puntaje/nivel de "
                "riesgo reproductivo ya calculado."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "color": {"type": "string", "description": "Color exacto del pelaje"},
                    "estado_salud": {"type": "string", "description": "Estado de salud exacto"},
                    "nivel_riesgo": {
                        "type": "string",
                        "enum": ["bajo", "medio", "alto", "critico"],
                        "description": "Nivel de riesgo reproductivo",
                    },
                    "limit": {"type": "integer", "description": "Maximo de registros a devolver"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generar_grafica",
            "description": (
                "Genera una grafica dinamica para mostrarle al usuario en el panel de chat, "
                "a partir de datos ya obtenidos con las otras herramientas. Usela cuando el "
                "usuario pida ver una grafica, comparacion o distribucion visual."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo": {"type": "string", "enum": ["barra", "linea", "torta"]},
                    "titulo": {"type": "string"},
                    "etiquetas": {"type": "array", "items": {"type": "string"}},
                    "series": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "nombre": {"type": "string"},
                                "datos": {"type": "array", "items": {"type": "number"}},
                            },
                            "required": ["nombre", "datos"],
                        },
                    },
                },
                "required": ["tipo", "titulo", "etiquetas", "series"],
            },
        },
    },
]

SYSTEM_PROMPT = (
    "Eres el asistente virtual de la Ganaderia Olinda, especializado en el sistema de "
    "alerta reproductiva del hato bovino. Respondes en espanol, de forma breve y concreta. "
    "Usa 'consultar_resumen' o 'consultar_vacas' antes de responder preguntas sobre datos "
    "reales del hato; nunca inventes cifras. Usa 'generar_grafica' cuando el usuario pida "
    "ver una grafica, comparacion o distribucion, construyendola con datos que hayas "
    "consultado primero. Los niveles de riesgo son: bajo, medio, alto, critico (entre mas "
    "alto, mayor riesgo reproductivo). El intervalo reproductivo esperado es de 12 a 14 "
    "meses entre partos."
)


def _consultar_vacas(db: Session, args: dict) -> list[dict]:
    config = crud.obtener_configuracion(db)
    consulta = db.query(models.Vaca)
    if args.get("color"):
        consulta = consulta.filter(models.Vaca.color == args["color"])
    if args.get("estado_salud"):
        consulta = consulta.filter(models.Vaca.estado_salud == args["estado_salud"])

    limite = int(args.get("limit") or 50)
    resultados = []
    for vaca in consulta.all():
        riesgo = calcular_riesgo(vaca, config)
        if args.get("nivel_riesgo") and riesgo.nivel != args["nivel_riesgo"]:
            continue
        resultados.append(
            {
                "vaca_id": vaca.vaca_id,
                "color": vaca.color,
                "estado_salud": vaca.estado_salud,
                "meses_desde_ultimo_parto": vaca.meses_desde_ultimo_parto,
                "condicion_corporal": vaca.condicion_corporal,
                "produccion_leche_lt_dia": vaca.produccion_leche_lt_dia,
                "puntaje_riesgo": riesgo.puntaje,
                "nivel_riesgo": riesgo.nivel,
            }
        )
        if len(resultados) >= limite:
            break
    return resultados


@router.post("", response_model=ChatRespuesta)
def chat(
    datos: ChatEntrada,
    db: Session = Depends(get_db),
    _u: models.Usuario = Depends(obtener_usuario_actual),
):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(503, "El asistente no esta configurado (falta OPENAI_API_KEY).")

    cliente = OpenAI(api_key=api_key)

    mensajes: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in datos.historial:
        mensajes.append({"role": "user" if m.rol == "usuario" else "assistant", "content": m.contenido})
    mensajes.append({"role": "user", "content": datos.mensaje})

    grafica_capturada: dict | None = None
    texto_final = ""

    for _ in range(MAX_TURNOS_HERRAMIENTA):
        try:
            respuesta = cliente.chat.completions.create(
                model=MODELO,
                messages=mensajes,
                tools=HERRAMIENTAS,
            )
        except OpenAIError as exc:
            raise HTTPException(502, f"Error del servicio de IA: {exc}") from exc

        mensaje_resp = respuesta.choices[0].message

        if not mensaje_resp.tool_calls:
            texto_final = mensaje_resp.content or ""
            break

        mensajes.append(
            {
                "role": "assistant",
                "content": mensaje_resp.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                    }
                    for tc in mensaje_resp.tool_calls
                ],
            }
        )

        for tool_call in mensaje_resp.tool_calls:
            nombre = tool_call.function.name
            try:
                args = json.loads(tool_call.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}

            if nombre == "consultar_resumen":
                contenido = json.dumps(calcular_resumen(db))
            elif nombre == "consultar_vacas":
                contenido = json.dumps(_consultar_vacas(db, args))
            elif nombre == "generar_grafica":
                grafica_capturada = args
                contenido = "Grafica generada y mostrada al usuario."
            else:
                contenido = "Herramienta desconocida."

            mensajes.append({"role": "tool", "tool_call_id": tool_call.id, "content": contenido})
    else:
        texto_final = "No pude completar la respuesta, intenta reformular la pregunta."

    return ChatRespuesta(
        respuesta=texto_final or "Listo.",
        grafica=GraficaSpec(**grafica_capturada) if grafica_capturada else None,
    )
