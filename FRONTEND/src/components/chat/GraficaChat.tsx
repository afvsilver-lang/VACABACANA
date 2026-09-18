import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import type { GraficaSpec } from "@/lib/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const COLORES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function colorEn(indice: number): string {
  return COLORES[indice % COLORES.length] ?? COLORES[0]!;
}

export function GraficaChat({ grafica }: { grafica: GraficaSpec }) {
  const datos = grafica.etiquetas.map((etiqueta, indice) => {
    const fila: Record<string, string | number> = { etiqueta };
    for (const serie of grafica.series) {
      fila[serie.nombre] = serie.datos[indice] ?? 0;
    }
    return fila;
  });

  const config: ChartConfig = Object.fromEntries(
    grafica.series.map((serie, indice) => [
      serie.nombre,
      { label: serie.nombre, color: colorEn(indice) },
    ]),
  );

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-sm font-semibold">{grafica.titulo}</p>
      <ChartContainer config={config} className="h-56 w-full">
        {grafica.tipo === "torta" ? (
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={datos} dataKey={grafica.series[0]?.nombre ?? "valor"} nameKey="etiqueta" outerRadius={80}>
              {datos.map((_, indice) => (
                <Cell key={indice} fill={colorEn(indice)} />
              ))}
            </Pie>
          </PieChart>
        ) : grafica.tipo === "linea" ? (
          <LineChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            {grafica.series.map((serie, indice) => (
              <Line
                key={serie.nombre}
                type="monotone"
                dataKey={serie.nombre}
                stroke={colorEn(indice)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)" }} />
            {grafica.series.map((serie, indice) => (
              <Bar key={serie.nombre} dataKey={serie.nombre} fill={colorEn(indice)} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
}
