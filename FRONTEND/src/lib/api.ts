import { borrarToken, obtenerToken } from "./auth";

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:8000";

export { API_URL };

export type NivelRiesgo = "bajo" | "medio" | "alto" | "critico";
export type Rol = "admin" | "operador" | "lectura";

export interface Usuario {
  id: number;
  username: string;
  nombre_completo: string | null;
  rol: Rol;
  activo: boolean;
  creado_en: string;
}

export type UsuarioEntrada = {
  username: string;
  password: string;
  nombre_completo?: string | undefined;
  rol: Rol;
};

export type UsuarioActualizar = Partial<{
  nombre_completo: string;
  rol: Rol;
  activo: boolean;
  password: string;
}>;

export interface TokenRespuesta {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface MensajeChat {
  rol: "usuario" | "asistente";
  contenido: string;
}

export type TipoGrafica = "barra" | "linea" | "torta";

export interface SerieGrafica {
  nombre: string;
  datos: number[];
}

export interface GraficaSpec {
  tipo: TipoGrafica;
  titulo: string;
  etiquetas: string[];
  series: SerieGrafica[];
}

export interface ChatRespuesta {
  respuesta: string;
  grafica: GraficaSpec | null;
}

// --- Modulo de reproduccion --------------------------------------------

export type ResultadoPalpacion = "preñada" | "vacia" | "dudosa";
export type NivelAlertaReproduccion =
  | "posparto"
  | "exito"
  | "advertencia"
  | "alerta"
  | "critico"
  | "info"
  | "neutro";

export interface Reproduccion {
  id: number;
  codigo: string;
  nombre: string | null;
  hierro: string | null;
  raza: string | null;
  fecha_nacimiento: string | null;
  num_partos: number;
  fecha_ultimo_parto: string | null;
  estado_corporal: number | null;
  fecha_servicio: string | null;
  toro: string | null;
  fecha_retiro_toro: string | null;
  fecha_palpacion_programada: string | null;
  fecha_palpacion_real: string | null;
  resultado_palpacion: ResultadoPalpacion | null;
  fecha_estimada_concepcion: string | null;
  fecha_probable_parto: string | null;
  observaciones: string | null;
  creado_en: string;
  actualizado_en: string;
  estado_reproductivo: string;
  nivel_alerta: NivelAlertaReproduccion;
  dias_posparto: number | null;
  dias_desde_servicio: number | null;
  dias_gestacion: number | null;
}

export interface EventoReproductivo {
  id: number;
  fecha: string;
  tipo: string;
  detalle: string;
  creado_en: string;
}

export interface ReproduccionDetalle extends Reproduccion {
  eventos: EventoReproductivo[];
}

export type ReproduccionEntrada = {
  codigo: string;
  nombre?: string | undefined;
  hierro?: string | undefined;
  raza?: string | undefined;
  fecha_nacimiento?: string | undefined;
  fecha_ultimo_parto?: string | undefined;
  estado_corporal?: number | undefined;
  observaciones?: string | undefined;
};

export type ReproduccionActualizar = Partial<{
  nombre: string | undefined;
  hierro: string | undefined;
  raza: string | undefined;
  fecha_nacimiento: string | undefined;
  estado_corporal: number | undefined;
  observaciones: string | undefined;
}>;

export interface ResumenReproduccion {
  total: number;
  en_recuperacion: number;
  aptas_para_toro: number;
  poner_con_toro_urgente: number;
  pendientes_palpacion: number;
  palpaciones_atrasadas: number;
  prenez_confirmada: number;
  vacias: number;
  alerta_critica: number;
  porcentaje_prenez: number;
  por_estado: Record<string, number>;
  por_nivel: Record<string, number>;
  distribucion_dias_posparto: { etiquetas: string[]; valores: number[] };
  porcentaje_prenez_por_toro: Record<string, number>;
  promedio_dias_parto_concepcion: number | null;
  proyeccion_partos_mensual: Record<string, number>;
}

export interface AccionItem {
  id: number;
  codigo: string;
  nombre: string | null;
  dias: number | null;
}

export interface AccionesRequeridas {
  poner_con_toro: AccionItem[];
  listas_palpacion: AccionItem[];
  palpacion_atrasada: AccionItem[];
  vacias_volver_toro: AccionItem[];
  mas_82_dias: AccionItem[];
  mas_120_dias: AccionItem[];
  datos_incompletos: AccionItem[];
}

export interface ConfiguracionReproductiva {
  dias_fin_recuperacion: number;
  dias_fin_apta: number;
  dias_fin_atencion: number;
  dias_alerta_critica: number;
  dias_para_palpacion: number;
  dias_aviso_palpacion_proxima: number;
  dias_gestacion: number;
}

export interface FiltrosReproduccion {
  q?: string | undefined;
  estado?: string | undefined;
  nivel?: string | undefined;
  resultado_palpacion?: string | undefined;
  raza?: string | undefined;
  toro?: string | undefined;
  dias_posparto_min?: number | undefined;
  dias_posparto_max?: number | undefined;
}

export interface Vaca {
  id: number;
  vaca_id: string;
  edad_meses: number | null;
  color: string | null;
  cachona: boolean;
  peso_kg: number | null;
  condicion_corporal: number | null;
  estado_salud: string | null;
  edad_primer_parto_meses: number | null;
  num_partos: number | null;
  intervalo_partos_meses: number | null;
  meses_desde_ultimo_parto: number | null;
  perdida_cria: boolean;
  produccion_leche_lt_dia: number | null;
  candidata_descarte: boolean;
  clasificacion_reproductiva: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type VacaEntrada = Omit<Vaca, "id" | "creado_en" | "actualizado_en">;
export type VacaActualizar = Partial<VacaEntrada>;

export interface VacaConAlerta extends Vaca {
  puntaje_riesgo: number;
  nivel_riesgo: NivelRiesgo;
}

export interface FactorRiesgo {
  factor: string;
  valor: number | null;
  puntos: number;
  detalle: string;
}

export interface Alerta {
  vaca_id: string;
  puntaje: number;
  nivel: NivelRiesgo;
  factores: FactorRiesgo[];
}

export interface Seguimiento {
  id: number;
  vaca_id: string;
  fecha: string;
  accion: string;
  responsable: string | null;
  resultado: string | null;
  proxima_revision: string | null;
  creado_en: string;
}

export type SeguimientoEntrada = Omit<Seguimiento, "id" | "creado_en">;
export type SeguimientoActualizar = Partial<Omit<SeguimientoEntrada, "vaca_id">>;

export interface Configuracion {
  umbral_advertencia_meses: number;
  umbral_critico_meses: number;
  peso_intervalo: number;
  peso_condicion_corporal: number;
  peso_estado_salud: number;
  peso_perdida_cria: number;
  version_reglas: string;
}

export interface ResumenAnalitica {
  total_vacas: number;
  por_nivel_riesgo: Record<NivelRiesgo, number>;
  por_color: Record<string, number>;
  por_estado_salud: Record<string, number>;
  promedios: {
    meses_desde_ultimo_parto: number | null;
    intervalo_partos_meses: number | null;
    condicion_corporal: number | null;
    produccion_leche_lt_dia: number | null;
  };
  candidatas_descarte: number;
  top_riesgo: { vaca_id: string; puntaje: number; nivel: NivelRiesgo }[];
}

export interface ImportarResumen {
  creadas: number;
  actualizadas: number;
  errores: string[];
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function solicitar<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const esFormData = init.body instanceof FormData;
  const headers: Record<string, string> = esFormData
    ? {}
    : { "Content-Type": "application/json" };

  const token = obtenerToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const respuesta = await fetch(`${API_URL}${ruta}`, { ...init, headers });

  if (respuesta.status === 401) {
    borrarToken();
  }

  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      mensaje = typeof cuerpo.detail === "string" ? cuerpo.detail : JSON.stringify(cuerpo.detail);
    } catch {
      // sin cuerpo JSON, se usa el mensaje por defecto
    }
    throw new ApiError(respuesta.status, mensaje);
  }

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json() as Promise<T>;
}

export interface FiltrosVacas {
  q?: string | undefined;
  color?: string | undefined;
  estado_salud?: string | undefined;
  skip?: number | undefined;
  limit?: number | undefined;
}

function aParams(filtros: object): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== "") params.set(clave, String(valor));
  }
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

export const api = {
  vacas: {
    listar: (filtros: FiltrosVacas = {}) => solicitar<Vaca[]>(`/api/vacas${aParams(filtros)}`),
    obtener: (vacaId: string) => solicitar<Vaca>(`/api/vacas/${encodeURIComponent(vacaId)}`),
    crear: (datos: VacaEntrada) =>
      solicitar<Vaca>("/api/vacas", { method: "POST", body: JSON.stringify(datos) }),
    actualizar: (vacaId: string, datos: VacaActualizar) =>
      solicitar<Vaca>(`/api/vacas/${encodeURIComponent(vacaId)}`, {
        method: "PUT",
        body: JSON.stringify(datos),
      }),
    eliminar: (vacaId: string) =>
      solicitar<void>(`/api/vacas/${encodeURIComponent(vacaId)}`, { method: "DELETE" }),
  },
  alertas: {
    listar: (filtros: { nivel?: NivelRiesgo | undefined; limit?: number | undefined } = {}) =>
      solicitar<VacaConAlerta[]>(`/api/alertas${aParams(filtros)}`),
    obtener: (vacaId: string) => solicitar<Alerta>(`/api/alertas/${encodeURIComponent(vacaId)}`),
  },
  seguimientos: {
    listar: (filtros: { vaca_id?: string | undefined; limit?: number | undefined } = {}) =>
      solicitar<Seguimiento[]>(`/api/seguimientos${aParams(filtros)}`),
    crear: (datos: SeguimientoEntrada) =>
      solicitar<Seguimiento>("/api/seguimientos", { method: "POST", body: JSON.stringify(datos) }),
    actualizar: (id: number, datos: SeguimientoActualizar) =>
      solicitar<Seguimiento>(`/api/seguimientos/${id}`, {
        method: "PUT",
        body: JSON.stringify(datos),
      }),
    eliminar: (id: number) => solicitar<void>(`/api/seguimientos/${id}`, { method: "DELETE" }),
  },
  configuracion: {
    obtener: () => solicitar<Configuracion>("/api/configuracion"),
    actualizar: (datos: Partial<Configuracion>) =>
      solicitar<Configuracion>("/api/configuracion", { method: "PUT", body: JSON.stringify(datos) }),
  },
  analitica: {
    resumen: () => solicitar<ResumenAnalitica>("/api/analitica/resumen"),
    exportar: async (): Promise<Blob> => {
      const headers: Record<string, string> = {};
      const token = obtenerToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const respuesta = await fetch(`${API_URL}/api/analitica/exportar`, { headers });
      if (!respuesta.ok) throw new ApiError(respuesta.status, `Error ${respuesta.status}`);
      return respuesta.blob();
    },
  },
  auth: {
    login: (username: string, password: string) =>
      solicitar<TokenRespuesta>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    yo: () => solicitar<Usuario>("/api/auth/me"),
  },
  usuarios: {
    listar: () => solicitar<Usuario[]>("/api/auth/usuarios"),
    crear: (datos: UsuarioEntrada) =>
      solicitar<Usuario>("/api/auth/usuarios", { method: "POST", body: JSON.stringify(datos) }),
    actualizar: (id: number, datos: UsuarioActualizar) =>
      solicitar<Usuario>(`/api/auth/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(datos),
      }),
  },
  asistente: {
    chat: (mensaje: string, historial: MensajeChat[] = []) =>
      solicitar<ChatRespuesta>("/api/asistente", {
        method: "POST",
        body: JSON.stringify({ mensaje, historial }),
      }),
  },
  importar: {
    subir: (archivo: File) => {
      const formData = new FormData();
      formData.append("archivo", archivo);
      return solicitar<ImportarResumen>("/api/importar", { method: "POST", body: formData });
    },
  },
  reproduccion: {
    listar: (filtros: FiltrosReproduccion = {}) =>
      solicitar<Reproduccion[]>(`/api/reproduccion${aParams(filtros)}`),
    resumen: () => solicitar<ResumenReproduccion>("/api/reproduccion/resumen"),
    accionesRequeridas: () => solicitar<AccionesRequeridas>("/api/reproduccion/acciones-requeridas"),
    obtener: (id: number) => solicitar<ReproduccionDetalle>(`/api/reproduccion/${id}`),
    crear: (datos: ReproduccionEntrada) =>
      solicitar<Reproduccion>("/api/reproduccion", { method: "POST", body: JSON.stringify(datos) }),
    actualizar: (id: number, datos: ReproduccionActualizar) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
    eliminar: (id: number) => solicitar<void>(`/api/reproduccion/${id}`, { method: "DELETE" }),
    registrarParto: (id: number, fecha_parto: string) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}/parto`, {
        method: "POST",
        body: JSON.stringify({ fecha_parto }),
      }),
    ponerConToro: (id: number, fecha_servicio: string, toro: string) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}/servicio`, {
        method: "POST",
        body: JSON.stringify({ fecha_servicio, toro }),
      }),
    retirarDelToro: (id: number, fecha_retiro: string) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}/retiro-toro`, {
        method: "POST",
        body: JSON.stringify({ fecha_retiro }),
      }),
    programarPalpacion: (id: number, fecha_programada?: string | undefined) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}/programar-palpacion`, {
        method: "POST",
        body: JSON.stringify({ fecha_programada: fecha_programada ?? null }),
      }),
    registrarPalpacion: (id: number, fecha_real: string, resultado: ResultadoPalpacion) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}/registrar-palpacion`, {
        method: "POST",
        body: JSON.stringify({ fecha_real, resultado }),
      }),
    repetirPalpacion: (id: number, fecha_programada?: string | undefined) =>
      solicitar<Reproduccion>(`/api/reproduccion/${id}/repetir-palpacion`, {
        method: "POST",
        body: JSON.stringify({ fecha_programada: fecha_programada ?? null }),
      }),
    configuracion: {
      obtener: () => solicitar<ConfiguracionReproductiva>("/api/reproduccion/configuracion/valores"),
      actualizar: (datos: Partial<ConfiguracionReproductiva>) =>
        solicitar<ConfiguracionReproductiva>("/api/reproduccion/configuracion/valores", {
          method: "PUT",
          body: JSON.stringify(datos),
        }),
    },
    importar: (archivo: File) => {
      const formData = new FormData();
      formData.append("archivo", archivo);
      return solicitar<ImportarResumen>("/api/reproduccion/importar", { method: "POST", body: formData });
    },
    exportar: async (): Promise<Blob> => {
      const headers: Record<string, string> = {};
      const token = obtenerToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const respuesta = await fetch(`${API_URL}/api/reproduccion/exportar`, { headers });
      if (!respuesta.ok) throw new ApiError(respuesta.status, `Error ${respuesta.status}`);
      return respuesta.blob();
    },
  },
};

export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function esApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
