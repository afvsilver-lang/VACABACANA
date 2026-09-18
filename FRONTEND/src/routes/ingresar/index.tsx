import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Beef, Droplets, TrendingDown } from "lucide-react";

import { api } from "@/lib/api";
import { NIVEL_INFO, ORDEN_NIVELES } from "@/lib/riesgo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/ingresar/")({
  component: Resumen,
});

function Resumen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analitica", "resumen"],
    queryFn: api.analitica.resumen,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resumen general</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indicadores del hato de la Ganadería Olinda.
        </p>
      </div>

      {isError && (
        <p className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical">
          No se pudo cargar el resumen. Verifique que el backend esté disponible.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaKpi
          icono={Beef}
          titulo="Total de vacas"
          valor={isLoading ? undefined : String(data?.total_vacas ?? 0)}
        />
        <TarjetaKpi
          icono={TrendingDown}
          titulo="Meses desde último parto (prom.)"
          valor={isLoading ? undefined : formatearNumero(data?.promedios.meses_desde_ultimo_parto)}
        />
        <TarjetaKpi
          icono={Droplets}
          titulo="Producción de leche (prom. lt/día)"
          valor={isLoading ? undefined : formatearNumero(data?.promedios.produccion_leche_lt_dia)}
        />
        <TarjetaKpi
          icono={AlertTriangle}
          titulo="Candidatas a descarte"
          valor={isLoading ? undefined : String(data?.candidatas_descarte ?? 0)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por nivel de riesgo</CardTitle>
          <CardDescription>Cantidad de animales en cada nivel de alerta reproductiva.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ORDEN_NIVELES.map((nivel) => (
                <div key={nivel} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className={`size-2.5 rounded-full ${NIVEL_INFO[nivel].clase}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {NIVEL_INFO[nivel].etiqueta}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">
                    {data?.por_nivel_riesgo[nivel] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 en riesgo</CardTitle>
          <CardDescription>Animales que requieren seguimiento prioritario.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaca</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.top_riesgo.map((fila) => (
                  <TableRow key={fila.vaca_id}>
                    <TableCell className="font-medium">{fila.vaca_id}</TableCell>
                    <TableCell>{fila.puntaje}</TableCell>
                    <TableCell>
                      <Badge className={NIVEL_INFO[fila.nivel].clase}>
                        {NIVEL_INFO[fila.nivel].etiqueta}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to="/ingresar/vacas/$vacaId"
                        params={{ vacaId: fila.vaca_id }}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Ver ficha
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.top_riesgo.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Sin datos de riesgo todavía.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TarjetaKpi({
  icono: Icono,
  titulo,
  valor,
}: {
  icono: typeof Beef;
  titulo: string;
  valor: string | undefined;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent">
          <Icono aria-hidden="true" className="size-5 text-accent-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {titulo}
          </p>
          {valor === undefined ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="font-display text-2xl font-bold">{valor}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatearNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}
