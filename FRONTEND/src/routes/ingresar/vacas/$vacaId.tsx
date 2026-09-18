import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import {
  api,
  esApiError,
  type Seguimiento,
  type Vaca,
  type VacaActualizar,
} from "@/lib/api";
import { NIVEL_INFO } from "@/lib/riesgo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/ingresar/vacas/$vacaId")({
  component: FichaVacaPagina,
});

function FichaVacaPagina() {
  const { vacaId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const vacaQuery = useQuery({
    queryKey: ["vacas", vacaId],
    queryFn: () => api.vacas.obtener(vacaId),
  });
  const alertaQuery = useQuery({
    queryKey: ["alertas", vacaId],
    queryFn: () => api.alertas.obtener(vacaId),
  });

  async function eliminarVaca() {
    if (!confirm(`¿Eliminar la vaca ${vacaId}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.vacas.eliminar(vacaId);
      toast.success(`Vaca ${vacaId} eliminada`);
      queryClient.invalidateQueries({ queryKey: ["vacas"] });
      navigate({ to: "/ingresar/vacas" });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo eliminar la vaca");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/ingresar/vacas"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Volver al inventario
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Ficha de {vacaId}</h1>
        </div>
        <Button variant="destructive" onClick={eliminarVaca}>
          <Trash2 className="size-4" />
          Eliminar vaca
        </Button>
      </div>

      {vacaQuery.isError && (
        <p className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical">
          No se encontró la vaca {vacaId}.
        </p>
      )}

      {alertaQuery.data && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Alerta reproductiva</CardTitle>
                <CardDescription>Puntaje calculado con las reglas vigentes.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-3xl font-bold">{alertaQuery.data.puntaje}</span>
                <Badge className={NIVEL_INFO[alertaQuery.data.nivel].clase}>
                  {NIVEL_INFO[alertaQuery.data.nivel].etiqueta}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {alertaQuery.data.factores.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin factores de riesgo detectados.</p>
            ) : (
              <ul className="grid gap-2">
                {alertaQuery.data.factores.map((f) => (
                  <li
                    key={f.factor}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span>{f.detalle}</span>
                    <span className="shrink-0 font-semibold">+{f.puntos} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {vacaQuery.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : vacaQuery.data ? (
        <FormularioVaca vaca={vacaQuery.data} />
      ) : null}

      <SeguimientosVaca vacaId={vacaId} />
    </div>
  );
}

function FormularioVaca({ vaca }: { vaca: Vaca }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    edad_meses: vaca.edad_meses?.toString() ?? "",
    color: vaca.color ?? "",
    cachona: vaca.cachona,
    peso_kg: vaca.peso_kg?.toString() ?? "",
    condicion_corporal: vaca.condicion_corporal?.toString() ?? "",
    estado_salud: vaca.estado_salud ?? "",
    edad_primer_parto_meses: vaca.edad_primer_parto_meses?.toString() ?? "",
    num_partos: vaca.num_partos?.toString() ?? "",
    intervalo_partos_meses: vaca.intervalo_partos_meses?.toString() ?? "",
    meses_desde_ultimo_parto: vaca.meses_desde_ultimo_parto?.toString() ?? "",
    perdida_cria: vaca.perdida_cria,
    produccion_leche_lt_dia: vaca.produccion_leche_lt_dia?.toString() ?? "",
    candidata_descarte: vaca.candidata_descarte,
    clasificacion_reproductiva: vaca.clasificacion_reproductiva ?? "",
  });
  const [guardando, setGuardando] = useState(false);

  function actualizar<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function numeroONulo(valor: string): number | null {
    if (valor.trim() === "") return null;
    const n = Number(valor);
    return Number.isNaN(n) ? null : n;
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setGuardando(true);
    const datos: VacaActualizar = {
      edad_meses: numeroONulo(form.edad_meses),
      color: form.color.trim() || null,
      cachona: form.cachona,
      peso_kg: numeroONulo(form.peso_kg),
      condicion_corporal: numeroONulo(form.condicion_corporal),
      estado_salud: form.estado_salud.trim() || null,
      edad_primer_parto_meses: numeroONulo(form.edad_primer_parto_meses),
      num_partos: numeroONulo(form.num_partos),
      intervalo_partos_meses: numeroONulo(form.intervalo_partos_meses),
      meses_desde_ultimo_parto: numeroONulo(form.meses_desde_ultimo_parto),
      perdida_cria: form.perdida_cria,
      produccion_leche_lt_dia: numeroONulo(form.produccion_leche_lt_dia),
      candidata_descarte: form.candidata_descarte,
      clasificacion_reproductiva: form.clasificacion_reproductiva.trim() || null,
    };
    try {
      await api.vacas.actualizar(vaca.vaca_id, datos);
      toast.success("Cambios guardados");
      queryClient.invalidateQueries({ queryKey: ["vacas"] });
      queryClient.invalidateQueries({ queryKey: ["alertas", vaca.vaca_id] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudieron guardar los cambios");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar}>
      <Card>
        <CardHeader>
          <CardTitle>Datos del animal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo label="Color">
            <Input value={form.color} onChange={(e) => actualizar("color", e.target.value)} />
          </Campo>
          <Campo label="Edad (meses)">
            <Input
              type="number"
              step="0.1"
              value={form.edad_meses}
              onChange={(e) => actualizar("edad_meses", e.target.value)}
            />
          </Campo>
          <Campo label="Peso (kg)">
            <Input
              type="number"
              step="0.1"
              value={form.peso_kg}
              onChange={(e) => actualizar("peso_kg", e.target.value)}
            />
          </Campo>
          <Campo label="Condición corporal">
            <Input
              type="number"
              step="0.1"
              value={form.condicion_corporal}
              onChange={(e) => actualizar("condicion_corporal", e.target.value)}
            />
          </Campo>
          <Campo label="Estado de salud">
            <Input
              value={form.estado_salud}
              onChange={(e) => actualizar("estado_salud", e.target.value)}
            />
          </Campo>
          <Campo label="Edad al primer parto (meses)">
            <Input
              type="number"
              step="0.1"
              value={form.edad_primer_parto_meses}
              onChange={(e) => actualizar("edad_primer_parto_meses", e.target.value)}
            />
          </Campo>
          <Campo label="Número de partos">
            <Input
              type="number"
              value={form.num_partos}
              onChange={(e) => actualizar("num_partos", e.target.value)}
            />
          </Campo>
          <Campo label="Intervalo entre partos (meses)">
            <Input
              type="number"
              step="0.1"
              value={form.intervalo_partos_meses}
              onChange={(e) => actualizar("intervalo_partos_meses", e.target.value)}
            />
          </Campo>
          <Campo label="Meses desde el último parto">
            <Input
              type="number"
              step="0.1"
              value={form.meses_desde_ultimo_parto}
              onChange={(e) => actualizar("meses_desde_ultimo_parto", e.target.value)}
            />
          </Campo>
          <Campo label="Producción de leche (lt/día)">
            <Input
              type="number"
              step="0.1"
              value={form.produccion_leche_lt_dia}
              onChange={(e) => actualizar("produccion_leche_lt_dia", e.target.value)}
            />
          </Campo>
          <Campo label="Clasificación reproductiva">
            <Input
              value={form.clasificacion_reproductiva}
              onChange={(e) => actualizar("clasificacion_reproductiva", e.target.value)}
            />
          </Campo>

          <div className="col-span-full grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
            <Conmutador label="Cachona" checked={form.cachona} onCheckedChange={(v) => actualizar("cachona", v)} />
            <Conmutador
              label="Pérdida de cría"
              checked={form.perdida_cria}
              onCheckedChange={(v) => actualizar("perdida_cria", v)}
            />
            <Conmutador
              label="Candidata a descarte"
              checked={form.candidata_descarte}
              onCheckedChange={(v) => actualizar("candidata_descarte", v)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function SeguimientosVaca({ vacaId }: { vacaId: string }) {
  const queryClient = useQueryClient();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    accion: "",
    responsable: "",
    resultado: "",
    proxima_revision: "",
  });
  const [enviando, setEnviando] = useState(false);

  const seguimientosQuery = useQuery({
    queryKey: ["seguimientos", vacaId],
    queryFn: () => api.seguimientos.listar({ vaca_id: vacaId }),
  });

  async function crear(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nuevo.accion.trim()) {
      toast.error("Describa la acción realizada");
      return;
    }
    setEnviando(true);
    try {
      await api.seguimientos.crear({
        vaca_id: vacaId,
        fecha: nuevo.fecha,
        accion: nuevo.accion.trim(),
        responsable: nuevo.responsable.trim() || null,
        resultado: nuevo.resultado.trim() || null,
        proxima_revision: nuevo.proxima_revision || null,
      });
      toast.success("Seguimiento registrado");
      setNuevo({ fecha: new Date().toISOString().slice(0, 10), accion: "", responsable: "", resultado: "", proxima_revision: "" });
      setMostrarForm(false);
      queryClient.invalidateQueries({ queryKey: ["seguimientos", vacaId] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo registrar el seguimiento");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(seguimiento: Seguimiento) {
    if (!confirm("¿Eliminar este seguimiento?")) return;
    try {
      await api.seguimientos.eliminar(seguimiento.id);
      toast.success("Seguimiento eliminado");
      queryClient.invalidateQueries({ queryKey: ["seguimientos", vacaId] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo eliminar el seguimiento");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Seguimientos</CardTitle>
            <CardDescription>Acciones, responsables y resultados registrados para este animal.</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setMostrarForm((v) => !v)}>
            <Plus className="size-4" />
            Agregar seguimiento
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {mostrarForm && (
          <form onSubmit={crear} className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
            <Campo label="Fecha">
              <Input type="date" value={nuevo.fecha} onChange={(e) => setNuevo((p) => ({ ...p, fecha: e.target.value }))} required />
            </Campo>
            <Campo label="Responsable">
              <Input
                value={nuevo.responsable}
                onChange={(e) => setNuevo((p) => ({ ...p, responsable: e.target.value }))}
                placeholder="Dr. Pérez"
              />
            </Campo>
            <div className="col-span-full">
              <Campo label="Acción realizada *">
                <Textarea
                  value={nuevo.accion}
                  onChange={(e) => setNuevo((p) => ({ ...p, accion: e.target.value }))}
                  placeholder="Revisión veterinaria, tacto rectal, etc."
                  required
                />
              </Campo>
            </div>
            <div className="col-span-full">
              <Campo label="Resultado">
                <Textarea
                  value={nuevo.resultado}
                  onChange={(e) => setNuevo((p) => ({ ...p, resultado: e.target.value }))}
                />
              </Campo>
            </div>
            <Campo label="Próxima revisión">
              <Input
                type="date"
                value={nuevo.proxima_revision}
                onChange={(e) => setNuevo((p) => ({ ...p, proxima_revision: e.target.value }))}
              />
            </Campo>
            <div className="col-span-full flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar seguimiento"}
              </Button>
            </div>
          </form>
        )}

        {seguimientosQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Próxima revisión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seguimientosQuery.data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.fecha}</TableCell>
                  <TableCell className="max-w-[220px]">{s.accion}</TableCell>
                  <TableCell>{s.responsable ?? "—"}</TableCell>
                  <TableCell className="max-w-[220px]">{s.resultado ?? "—"}</TableCell>
                  <TableCell>{s.proxima_revision ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => eliminar(s)} aria-label="Eliminar seguimiento">
                      <Trash2 className="size-4 text-critical" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {seguimientosQuery.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Sin seguimientos registrados todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Conmutador({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch checked={checked} onCheckedChange={onCheckedChange} id={`edit-${label}`} />
      <Label htmlFor={`edit-${label}`} className="cursor-pointer">
        {label}
      </Label>
    </div>
  );
}
