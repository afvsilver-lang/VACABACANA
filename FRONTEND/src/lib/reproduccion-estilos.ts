import type { NivelAlertaReproduccion } from "@/lib/api";

export const CLASE_NIVEL: Record<NivelAlertaReproduccion, string> = {
  posparto: "bg-secondary text-secondary-foreground",
  exito: "bg-success text-success-foreground",
  advertencia: "bg-warning text-warning-foreground",
  alerta: "bg-orange-500 text-white dark:bg-orange-600",
  critico: "bg-critical text-critical-foreground",
  info: "bg-accent text-accent-foreground",
  neutro: "bg-muted text-muted-foreground",
};

export const CLASE_FILA_URGENTE: Record<string, string> = {
  critico: "bg-critical/5",
  alerta: "bg-orange-500/5",
};

export const ETIQUETA_NIVEL: Record<NivelAlertaReproduccion, string> = {
  posparto: "Posparto",
  exito: "Al día",
  advertencia: "Atención",
  alerta: "Alerta",
  critico: "Crítico",
  info: "En curso",
  neutro: "Sin datos",
};
