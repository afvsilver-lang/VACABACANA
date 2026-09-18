import type { NivelRiesgo } from "@/lib/api";

export const NIVEL_INFO: Record<NivelRiesgo, { etiqueta: string; clase: string }> = {
  bajo: { etiqueta: "Bajo", clase: "bg-success text-success-foreground" },
  medio: { etiqueta: "Medio", clase: "bg-secondary text-secondary-foreground" },
  alto: { etiqueta: "Alto", clase: "bg-warning text-warning-foreground" },
  critico: { etiqueta: "Crítico", clase: "bg-critical text-critical-foreground" },
};

export const ORDEN_NIVELES: NivelRiesgo[] = ["bajo", "medio", "alto", "critico"];
