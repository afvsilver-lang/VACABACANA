import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  try {
    return format(parseISO(valor), "dd/MM/yyyy", { locale: es });
  } catch {
    return valor;
  }
}

export function hoyISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}
