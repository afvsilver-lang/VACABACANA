import { type FormEvent, useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

import { api, esApiError, type GraficaSpec, type MensajeChat } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraficaChat } from "./GraficaChat";

interface Mensaje extends MensajeChat {
  grafica?: GraficaSpec | null;
}

const MENSAJE_BIENVENIDA: Mensaje = {
  rol: "asistente",
  contenido:
    "Hola, soy el asistente de la Ganadería Olinda. Pregúntame sobre el hato o pídeme una gráfica, por ejemplo: \"¿cuántas vacas están en riesgo crítico?\" o \"muéstrame una gráfica por color\".",
};

export function ChatBot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    const historial = mensajes.map(({ rol, contenido: c }) => ({ rol, contenido: c }));
    setMensajes((prev) => [...prev, { rol: "usuario", contenido }]);
    setTexto("");
    setEnviando(true);

    try {
      const respuesta = await api.asistente.chat(contenido, historial);
      setMensajes((prev) => [
        ...prev,
        { rol: "asistente", contenido: respuesta.respuesta, grafica: respuesta.grafica },
      ]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        {
          rol: "asistente",
          contenido: esApiError(error) ? error.message : "No pude responder, intenta de nuevo.",
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function enTecla(evento: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      void enviar(evento as unknown as FormEvent);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-(--shadow-raised)">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-xl leading-none">
                🐮
              </span>
              <p className="text-sm font-semibold">Asistente Olinda</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
              className="grid size-7 place-items-center rounded-md text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 px-3 py-3">
            <div className="flex flex-col gap-3">
              {mensajes.map((m, indice) => (
                <div
                  key={indice}
                  className={`flex flex-col gap-2 ${m.rol === "usuario" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      m.rol === "usuario"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.contenido}
                  </div>
                  {m.grafica && (
                    <div className="w-full max-w-[95%]">
                      <GraficaChat grafica={m.grafica} />
                    </div>
                  )}
                </div>
              ))}
              {enviando && (
                <div className="max-w-[90%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Pensando...
                </div>
              )}
              <div ref={finalRef} />
            </div>
          </ScrollArea>

          <form onSubmit={enviar} className="flex items-end gap-2 border-t border-border p-3">
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={enTecla}
              placeholder="Escribe tu pregunta..."
              rows={1}
              className="max-h-24 min-h-9 flex-1 resize-none py-2"
            />
            <Button type="submit" size="icon" disabled={enviando || !texto.trim()}>
              <Send aria-hidden="true" className="size-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
        aria-expanded={abierto}
        className="grid size-14 place-items-center rounded-full bg-primary text-2xl shadow-(--shadow-raised) transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span aria-hidden="true">🐮</span>
      </button>
    </div>
  );
}
