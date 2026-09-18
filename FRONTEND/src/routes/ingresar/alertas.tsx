import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { api, type NivelRiesgo } from "@/lib/api";
import { NIVEL_INFO, ORDEN_NIVELES } from "@/lib/riesgo";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ingresar/alertas")({
  component: Alertas,
});

function Alertas() {
  const [nivel, setNivel] = useState<NivelRiesgo | "">("");

  const { data, isLoading } = useQuery({
    queryKey: ["alertas", "lista", nivel],
    queryFn: () => api.alertas.listar({ nivel: nivel || undefined, limit: 500 }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas reproductivas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Animales priorizados por puntaje de riesgo (0 a 100), de mayor a menor.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={nivel === "" ? "default" : "outline"} size="sm" onClick={() => setNivel("")}>
          Todos
        </Button>
        {ORDEN_NIVELES.map((n) => (
          <Button
            key={n}
            variant={nivel === n ? "default" : "outline"}
            size="sm"
            onClick={() => setNivel(n)}
          >
            <span aria-hidden="true" className={`mr-1.5 size-2 rounded-full ${NIVEL_INFO[n].clase}`} />
            {NIVEL_INFO[n].etiqueta}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaca</TableHead>
                <TableHead>Puntaje</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Meses desde parto</TableHead>
                <TableHead>Cond. corporal</TableHead>
                <TableHead>Estado salud</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((vaca) => (
                <TableRow key={vaca.vaca_id}>
                  <TableCell className="font-medium">{vaca.vaca_id}</TableCell>
                  <TableCell>{vaca.puntaje_riesgo}</TableCell>
                  <TableCell>
                    <Badge className={NIVEL_INFO[vaca.nivel_riesgo].clase}>
                      {NIVEL_INFO[vaca.nivel_riesgo].etiqueta}
                    </Badge>
                  </TableCell>
                  <TableCell>{vaca.meses_desde_ultimo_parto ?? "—"}</TableCell>
                  <TableCell>{vaca.condicion_corporal ?? "—"}</TableCell>
                  <TableCell className="capitalize">{vaca.estado_salud ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/ingresar/vacas/$vacaId"
                      params={{ vacaId: vaca.vaca_id }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Ver ficha
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay animales en ese nivel de riesgo.
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
