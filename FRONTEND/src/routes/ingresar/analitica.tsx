import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { api, esApiError } from "@/lib/api";
import { NIVEL_INFO, ORDEN_NIVELES } from "@/lib/riesgo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export const Route = createFileRoute("/ingresar/analitica")({
  component: Analitica,
});

const CONFIG_CANTIDAD: ChartConfig = { cantidad: { label: "Cantidad" } };

const COLOR_ESTADO_SALUD: Record<string, string> = {
  sana: "var(--success)",
  nuche: "var(--warning)",
  enferma: "var(--critical)",
};

const COLOR_NIVEL: Record<string, string> = {
  bajo: "var(--success)",
  medio: "var(--secondary)",
  alto: "var(--warning)",
  critico: "var(--critical)",
};

function Analitica() {
  const { data, isLoading } = useQuery({
    queryKey: ["analitica", "resumen"],
    queryFn: api.analitica.resumen,
  });

  const datosNivel = ORDEN_NIVELES.map((n) => ({
    nivel: NIVEL_INFO[n].etiqueta,
    cantidad: data?.por_nivel_riesgo[n] ?? 0,
    color: COLOR_NIVEL[n],
  }));

  const datosSalud = Object.entries(data?.por_estado_salud ?? {})
    .map(([estado, cantidad]) => ({
      estado,
      cantidad,
      color: COLOR_ESTADO_SALUD[estado] ?? "var(--muted-foreground)",
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const datosColor = Object.entries(data?.por_color ?? {})
    .map(([color, cantidad]) => ({ color, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  async function exportarCsv() {
    try {
      const blob = await api.analitica.exportar();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "olinda_riesgo.csv";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo exportar el CSV");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analítica</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cruces reproductivos y de salud del hato.
          </p>
        </div>
        <Button variant="outline" onClick={exportarCsv}>
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaPromedio titulo="Intervalo entre partos (meses)" valor={data?.promedios.intervalo_partos_meses} isLoading={isLoading} />
        <TarjetaPromedio titulo="Meses desde último parto" valor={data?.promedios.meses_desde_ultimo_parto} isLoading={isLoading} />
        <TarjetaPromedio titulo="Condición corporal" valor={data?.promedios.condicion_corporal} isLoading={isLoading} />
        <TarjetaPromedio titulo="Leche (lt/día)" valor={data?.promedios.produccion_leche_lt_dia} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nivel de riesgo</CardTitle>
            <CardDescription>Cantidad de vacas por nivel de alerta.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosNivel} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="nivel" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="cantidad" position="top" className="fill-foreground text-xs font-medium" />
                    {datosNivel.map((d) => (
                      <Cell key={d.nivel} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de salud</CardTitle>
            <CardDescription>Distribución de animales por estado de salud reportado.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosSalud} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="estado" tickLine={false} axisLine={false} className="capitalize" />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="cantidad" position="top" className="fill-foreground text-xs font-medium" />
                    {datosSalud.map((d) => (
                      <Cell key={d.estado} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Color de pelaje</CardTitle>
          <CardDescription>Cantidad de animales por color, de mayor a menor.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ChartContainer config={CONFIG_CANTIDAD} className="h-80 w-full">
              <BarChart
                data={datosColor}
                layout="vertical"
                margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="color"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  className="capitalize"
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="cantidad" fill="var(--chart-1)" radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="cantidad"
                    position="right"
                    className="fill-foreground text-xs font-medium"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TarjetaPromedio({
  titulo,
  valor,
  isLoading,
}: {
  titulo: string;
  valor: number | null | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 font-display text-2xl font-bold">
            {valor === null || valor === undefined ? "—" : valor.toLocaleString("es-CO", { maximumFractionDigits: 1 })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
