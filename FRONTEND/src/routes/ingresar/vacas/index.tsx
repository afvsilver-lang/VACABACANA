import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api, esApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/ingresar/vacas/")({
  component: Inventario,
});

const COLORES = [
  "amarillo",
  "negro",
  "pardo",
  "rojo",
  "blanco",
  "jaspeado",
  "atigrado",
  "careto",
  "crema",
  "cafe",
];
const ESTADOS_SALUD = ["sana", "nuche", "enferma"];
const LIMITE = 25;

function Inventario() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [color, setColor] = useState<string>("");
  const [estadoSalud, setEstadoSalud] = useState<string>("");
  const [pagina, setPagina] = useState(0);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const filtros = { q: busqueda || undefined, color: color || undefined, estado_salud: estadoSalud || undefined };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vacas", filtros, pagina],
    queryFn: () => api.vacas.listar({ ...filtros, skip: pagina * LIMITE, limit: LIMITE }),
  });

  async function eliminarVaca(vacaId: string) {
    if (!confirm(`¿Eliminar la vaca ${vacaId}? Esta acción no se puede deshacer.`)) return;
    setEliminando(vacaId);
    try {
      await api.vacas.eliminar(vacaId);
      toast.success(`Vaca ${vacaId} eliminada`);
      queryClient.invalidateQueries({ queryKey: ["vacas"] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo eliminar la vaca");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario de vacas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte, filtre y edite la ficha de cada animal.
          </p>
        </div>
        <Button asChild>
          <Link to="/ingresar/vacas/nueva">
            <Plus className="size-4" />
            Registrar vaca
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID de vaca..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
          />
        </div>
        <Select
          value={color || "__todos__"}
          onValueChange={(v) => {
            setColor(v === "__todos__" ? "" : v);
            setPagina(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos los colores</SelectItem>
            {COLORES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={estadoSalud || "__todos__"}
          onValueChange={(v) => {
            setEstadoSalud(v === "__todos__" ? "" : v);
            setPagina(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado de salud" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos los estados</SelectItem>
            {ESTADOS_SALUD.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Edad (meses)</TableHead>
                  <TableHead>Cond. corporal</TableHead>
                  <TableHead>Estado salud</TableHead>
                  <TableHead>Meses desde parto</TableHead>
                  <TableHead>Leche (lt/día)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((vaca) => (
                  <TableRow key={vaca.vaca_id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/ingresar/vacas/$vacaId"
                        params={{ vacaId: vaca.vaca_id }}
                        className="text-primary hover:underline"
                      >
                        {vaca.vaca_id}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">{vaca.color ?? "—"}</TableCell>
                    <TableCell>{vaca.edad_meses ?? "—"}</TableCell>
                    <TableCell>{vaca.condicion_corporal ?? "—"}</TableCell>
                    <TableCell className="capitalize">{vaca.estado_salud ?? "—"}</TableCell>
                    <TableCell>{vaca.meses_desde_ultimo_parto ?? "—"}</TableCell>
                    <TableCell>{vaca.produccion_leche_lt_dia ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={eliminando === vaca.vaca_id}
                        onClick={() => eliminarVaca(vaca.vaca_id)}
                        aria-label={`Eliminar ${vaca.vaca_id}`}
                      >
                        <Trash2 className="size-4 text-critical" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No se encontraron vacas con esos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Página {pagina + 1} · {data?.length ?? 0} resultados{isFetching ? " (actualizando...)" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagina === 0}
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(data?.length ?? 0) < LIMITE}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
