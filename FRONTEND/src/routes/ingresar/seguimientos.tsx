import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { api, esApiError, type Seguimiento } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/ingresar/seguimientos")({
  component: SeguimientosGlobal,
});

function SeguimientosGlobal() {
  const queryClient = useQueryClient();
  const [filtroVaca, setFiltroVaca] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({
    vaca_id: "",
    fecha: new Date().toISOString().slice(0, 10),
    accion: "",
    responsable: "",
  });
  const [enviando, setEnviando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["seguimientos", "todos", filtroVaca],
    queryFn: () => api.seguimientos.listar({ vaca_id: filtroVaca || undefined, limit: 200 }),
  });

  async function crear(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nuevo.vaca_id.trim() || !nuevo.accion.trim()) {
      toast.error("El ID de la vaca y la acción son obligatorios");
      return;
    }
    setEnviando(true);
    try {
      await api.seguimientos.crear({
        vaca_id: nuevo.vaca_id.trim(),
        fecha: nuevo.fecha,
        accion: nuevo.accion.trim(),
        responsable: nuevo.responsable.trim() || null,
        resultado: null,
        proxima_revision: null,
      });
      toast.success("Seguimiento registrado");
      setNuevo({ vaca_id: "", fecha: new Date().toISOString().slice(0, 10), accion: "", responsable: "" });
      setMostrarForm(false);
      queryClient.invalidateQueries({ queryKey: ["seguimientos"] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo registrar (verifique que la vaca exista)");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(s: Seguimiento) {
    if (!confirm("¿Eliminar este seguimiento?")) return;
    try {
      await api.seguimientos.eliminar(s.id);
      toast.success("Seguimiento eliminado");
      queryClient.invalidateQueries({ queryKey: ["seguimientos"] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seguimientos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acciones, responsables y resultados registrados en todo el hato.
          </p>
        </div>
        <Button onClick={() => setMostrarForm((v) => !v)}>
          <Plus className="size-4" />
          Nuevo seguimiento
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={crear} className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>ID de la vaca *</Label>
                <Input
                  value={nuevo.vaca_id}
                  onChange={(e) => setNuevo((p) => ({ ...p, vaca_id: e.target.value }))}
                  placeholder="S00001"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={nuevo.fecha}
                  onChange={(e) => setNuevo((p) => ({ ...p, fecha: e.target.value }))}
                  required
                />
              </div>
              <div className="col-span-full flex flex-col gap-1.5">
                <Label>Acción realizada *</Label>
                <Textarea
                  value={nuevo.accion}
                  onChange={(e) => setNuevo((p) => ({ ...p, accion: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Responsable</Label>
                <Input
                  value={nuevo.responsable}
                  onChange={(e) => setNuevo((p) => ({ ...p, responsable: e.target.value }))}
                />
              </div>
              <div className="col-span-full flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setMostrarForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="max-w-xs">
        <Label className="mb-1.5 block">Filtrar por ID de vaca</Label>
        <Input value={filtroVaca} onChange={(e) => setFiltroVaca(e.target.value)} placeholder="S00001" />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaca</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Próxima revisión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link to="/ingresar/vacas/$vacaId" params={{ vacaId: s.vaca_id }} className="text-primary hover:underline">
                      {s.vaca_id}
                    </Link>
                  </TableCell>
                  <TableCell>{s.fecha}</TableCell>
                  <TableCell className="max-w-[240px]">{s.accion}</TableCell>
                  <TableCell>{s.responsable ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px]">{s.resultado ?? "—"}</TableCell>
                  <TableCell>{s.proxima_revision ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <DialogoResultado seguimiento={s} />
                      <Button variant="ghost" size="icon" onClick={() => eliminar(s)} aria-label="Eliminar">
                        <Trash2 className="size-4 text-critical" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay seguimientos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function DialogoResultado({ seguimiento }: { seguimiento: Seguimiento }) {
  const queryClient = useQueryClient();
  const [abierto, setAbierto] = useState(false);
  const [resultado, setResultado] = useState(seguimiento.resultado ?? "");
  const [proximaRevision, setProximaRevision] = useState(seguimiento.proxima_revision ?? "");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await api.seguimientos.actualizar(seguimiento.id, {
        resultado: resultado.trim() || null,
        proxima_revision: proximaRevision || null,
      });
      toast.success("Resultado actualizado");
      queryClient.invalidateQueries({ queryKey: ["seguimientos"] });
      setAbierto(false);
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo actualizar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar resultado">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar resultado — {seguimiento.vaca_id}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Resultado</Label>
            <Textarea value={resultado} onChange={(e) => setResultado(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Próxima revisión</Label>
            <Input type="date" value={proximaRevision} onChange={(e) => setProximaRevision(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
