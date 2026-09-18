import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Baby,
  CalendarClock,
  Heart,
  HeartCrack,
  History,
  Pencil,
  Repeat,
  Stethoscope,
  Syringe,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { api, esApiError } from "@/lib/api";
import { formatearFecha } from "@/lib/fechas";
import { CLASE_NIVEL, ETIQUETA_NIVEL } from "@/lib/reproduccion-estilos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogEditarVaca } from "@/components/reproduccion/DialogEditarVaca";
import {
  DialogPonerConToro,
  DialogProgramarPalpacion,
  DialogRegistrarParto,
  DialogRegistrarPalpacion,
  DialogRetirarToro,
} from "@/components/reproduccion/AccionDialogs";

export const Route = createFileRoute("/ingresar/reproduccion/$id")({
  component: FichaReproduccion,
});

type DialogoActivo =
  | null
  | "editar"
  | "parto"
  | "servicio"
  | "retiro"
  | "programar-palpacion"
  | "registrar-palpacion"
  | "confirmar-prenez"
  | "marcar-vacia";

function FichaReproduccion() {
  const { id } = Route.useParams();
  const reproduccionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timelineRef = useRef<HTMLDivElement>(null);

  const [dialogo, setDialogo] = useState<DialogoActivo>(null);
  const [repitiendo, setRepitiendo] = useState(false);

  const { data: reg, isLoading, isError } = useQuery({
    queryKey: ["reproduccion", reproduccionId],
    queryFn: () => api.reproduccion.obtener(reproduccionId),
  });

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ["reproduccion"] });
  }

  async function eliminar() {
    if (!reg) return;
    if (!confirm(`¿Eliminar el registro de ${reg.codigo}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.reproduccion.eliminar(reg.id);
      toast.success(`Registro ${reg.codigo} eliminado`);
      refrescar();
      await navigate({ to: "/ingresar/reproduccion" });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo eliminar el registro");
    }
  }

  async function repetirPalpacion() {
    if (!reg) return;
    setRepitiendo(true);
    try {
      await api.reproduccion.repetirPalpacion(reg.id);
      toast.success("Palpación reprogramada");
      refrescar();
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo reprogramar la palpación");
    } finally {
      setRepitiendo(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }
  if (isError || !reg) {
    return (
      <p className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical">
        No se pudo cargar el registro.
      </p>
    );
  }

  const tieneServicio = !!reg.fecha_servicio;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/ingresar/reproduccion" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          Volver al control reproductivo
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {reg.codigo} {reg.nombre ? `· ${reg.nombre}` : ""}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {reg.raza && <span>{reg.raza}</span>}
              {reg.hierro && <span>· Hierro {reg.hierro}</span>}
              <span>· {reg.num_partos} parto(s)</span>
            </div>
          </div>
          <Badge className={`${CLASE_NIVEL[reg.nivel_alerta]} px-3 py-1 text-sm`}>
            {reg.estado_reproductivo}
          </Badge>
        </div>
      </div>

      {/* Botones de accion */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setDialogo("editar")}>
          <Pencil className="size-4" />
          Editar registro
        </Button>
        <Button onClick={() => setDialogo("parto")}>
          <Baby className="size-4" />
          Registrar parto
        </Button>
        <Button onClick={() => setDialogo("servicio")} disabled={tieneServicio}>
          <UserPlus className="size-4" />
          Poner con el toro
        </Button>
        <Button variant="outline" onClick={() => setDialogo("retiro")} disabled={!tieneServicio || !!reg.fecha_retiro_toro}>
          <UserMinus className="size-4" />
          Retirar del toro
        </Button>
        <Button variant="outline" onClick={() => setDialogo("programar-palpacion")} disabled={!tieneServicio}>
          <CalendarClock className="size-4" />
          Programar palpación
        </Button>
        <Button onClick={() => setDialogo("registrar-palpacion")} disabled={!tieneServicio}>
          <Stethoscope className="size-4" />
          Registrar palpación
        </Button>
        <Button
          variant="outline"
          className="border-success text-success"
          onClick={() => setDialogo("confirmar-prenez")}
          disabled={!tieneServicio}
        >
          <Heart className="size-4" />
          Confirmar preñez
        </Button>
        <Button
          variant="outline"
          className="border-orange-500 text-orange-600"
          onClick={() => setDialogo("marcar-vacia")}
          disabled={!tieneServicio}
        >
          <HeartCrack className="size-4" />
          Marcar como vacía
        </Button>
        <Button variant="outline" onClick={repetirPalpacion} disabled={repitiendo || !tieneServicio}>
          <Repeat className="size-4" />
          Repetir palpación
        </Button>
        <Button variant="outline" onClick={() => timelineRef.current?.scrollIntoView({ behavior: "smooth" })}>
          <History className="size-4" />
          Ver historial reproductivo
        </Button>
        <Button variant="destructive" onClick={eliminar}>
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </div>

      {reg.estado_reproductivo === "Palpación atrasada" || reg.estado_reproductivo === "Programar palpación" ? (
        <p className="rounded-lg border border-warning/50 bg-warning/15 p-3 text-sm text-warning-foreground">
          <Syringe aria-hidden="true" className="mb-0.5 mr-1 inline size-4" />
          Recuerde: la palpación debe ser realizada por un médico veterinario o una persona capacitada.
        </p>
      ) : null}

      {/* Datos generales y ciclo actual */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos generales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Dato etiqueta="Fecha de nacimiento" valor={formatearFecha(reg.fecha_nacimiento)} />
            <Dato etiqueta="Número de partos" valor={String(reg.num_partos)} />
            <Dato etiqueta="Estado corporal" valor={reg.estado_corporal?.toString() ?? "—"} />
            <Dato etiqueta="Observaciones" valor={reg.observaciones ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ciclo reproductivo actual</CardTitle>
            <CardDescription>Se recalcula automáticamente cada día.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Dato etiqueta="Último parto" valor={formatearFecha(reg.fecha_ultimo_parto)} />
            <Dato etiqueta="Días posparto" valor={reg.dias_posparto?.toString() ?? "—"} />
            <Dato etiqueta="Puesta con el toro" valor={formatearFecha(reg.fecha_servicio)} />
            <Dato etiqueta="Toro" valor={reg.toro ?? "—"} />
            <Dato etiqueta="Retirada del toro" valor={formatearFecha(reg.fecha_retiro_toro)} />
            <Dato etiqueta="Días desde servicio" valor={reg.dias_desde_servicio?.toString() ?? "—"} />
            <Dato etiqueta="Palpación programada" valor={formatearFecha(reg.fecha_palpacion_programada)} />
            <Dato etiqueta="Palpación realizada" valor={formatearFecha(reg.fecha_palpacion_real)} />
            <Dato etiqueta="Resultado palpación" valor={reg.resultado_palpacion ?? "—"} />
            <Dato etiqueta="Días de gestación" valor={reg.dias_gestacion?.toString() ?? "—"} />
            <Dato etiqueta="Fecha probable de parto" valor={formatearFecha(reg.fecha_probable_parto)} />
          </CardContent>
        </Card>
      </div>

      {/* Historial / linea de tiempo */}
      <Card ref={timelineRef}>
        <CardHeader>
          <CardTitle>Historial reproductivo</CardTitle>
          <CardDescription>
            Línea de tiempo completa: no se pierde al registrar nuevos partos o palpaciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reg.eventos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos registrados todavía.</p>
          ) : (
            <ol className="flex flex-col gap-4 border-l-2 border-border pl-4">
              {reg.eventos.map((evento) => (
                <li key={evento.id} className="relative">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatearFecha(evento.fecha)} · {evento.tipo.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm">{evento.detalle}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Dialogos */}
      <DialogEditarVaca
        reproduccion={reg}
        abierto={dialogo === "editar"}
        onOpenChange={(v) => setDialogo(v ? "editar" : null)}
        onExito={refrescar}
      />
      <DialogRegistrarParto
        reproduccionId={reg.id}
        abierto={dialogo === "parto"}
        onOpenChange={(v) => setDialogo(v ? "parto" : null)}
        onExito={refrescar}
      />
      <DialogPonerConToro
        reproduccionId={reg.id}
        abierto={dialogo === "servicio"}
        onOpenChange={(v) => setDialogo(v ? "servicio" : null)}
        onExito={refrescar}
      />
      <DialogRetirarToro
        reproduccionId={reg.id}
        abierto={dialogo === "retiro"}
        onOpenChange={(v) => setDialogo(v ? "retiro" : null)}
        onExito={refrescar}
      />
      <DialogProgramarPalpacion
        reproduccionId={reg.id}
        abierto={dialogo === "programar-palpacion"}
        onOpenChange={(v) => setDialogo(v ? "programar-palpacion" : null)}
        onExito={refrescar}
      />
      <DialogRegistrarPalpacion
        reproduccionId={reg.id}
        abierto={dialogo === "registrar-palpacion"}
        onOpenChange={(v) => setDialogo(v ? "registrar-palpacion" : null)}
        onExito={refrescar}
      />
      <DialogRegistrarPalpacion
        reproduccionId={reg.id}
        abierto={dialogo === "confirmar-prenez"}
        onOpenChange={(v) => setDialogo(v ? "confirmar-prenez" : null)}
        onExito={refrescar}
        resultadoInicial="preñada"
        titulo="Confirmar preñez"
      />
      <DialogRegistrarPalpacion
        reproduccionId={reg.id}
        abierto={dialogo === "marcar-vacia"}
        onOpenChange={(v) => setDialogo(v ? "marcar-vacia" : null)}
        onExito={refrescar}
        resultadoInicial="vacia"
        titulo="Marcar como vacía"
      />
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="mt-0.5 font-medium">{valor}</p>
    </div>
  );
}
