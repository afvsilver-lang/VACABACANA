import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDownUp,
  Beef,
  Download,
  FileUp,
  Filter,
  Heart,
  HeartCrack,
  HeartPulse,
  PlusCircle,
  Stethoscope,
  Syringe,
  TimerReset,
  Upload,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { api, descargarBlob, esApiError, type FiltrosReproduccion, type Reproduccion } from "@/lib/api";
import { formatearFecha } from "@/lib/fechas";
import { CLASE_FILA_URGENTE, CLASE_NIVEL, ETIQUETA_NIVEL } from "@/lib/reproduccion-estilos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DialogAgregarVaca } from "@/components/reproduccion/DialogAgregarVaca";

export const Route = createFileRoute("/ingresar/reproduccion/")({
  head: () => ({
    meta: [{ title: "Reproducción | Olinda Alerta Reproductiva" }],
  }),
  component: ReproduccionDashboard,
});

const CONFIG_CANTIDAD: ChartConfig = { cantidad: { label: "Cantidad" } };
const CLASE_NIVEL_COLOR: Record<string, string> = {
  posparto: "var(--chart-5)",
  exito: "var(--success)",
  advertencia: "var(--warning)",
  alerta: "var(--chart-4)",
  critico: "var(--critical)",
  info: "var(--chart-2)",
  neutro: "var(--muted-foreground)",
};

type Vista =
  | null
  | "recuperacion"
  | "aptas"
  | "urgente"
  | "pendientes_palpacion"
  | "atrasadas"
  | "prenez"
  | "vacias"
  | "critico";

function coincideVista(v: Reproduccion, vista: Vista): boolean {
  switch (vista) {
    case "recuperacion":
      return v.estado_reproductivo === "Recuperación posparto";
    case "aptas":
      return v.estado_reproductivo === "Apta para dejar con el toro";
    case "urgente":
      return v.estado_reproductivo === "Atención: poner con el toro";
    case "pendientes_palpacion":
      return ["Programar palpación", "Palpación próxima", "Palpación programada"].includes(
        v.estado_reproductivo,
      );
    case "atrasadas":
      return v.estado_reproductivo === "Palpación atrasada";
    case "prenez":
      return v.estado_reproductivo === "Preñez confirmada";
    case "vacias":
      return v.estado_reproductivo.startsWith("No preñada");
    case "critico":
      return v.nivel_alerta === "critico";
    default:
      return true;
  }
}

type CampoOrden = "codigo" | "dias_posparto" | "fecha_ultimo_parto" | "estado_reproductivo";

function ReproduccionDashboard() {
  const queryClient = useQueryClient();
  const inputImportarRef = useRef<HTMLInputElement>(null);

  const [filtrosServidor, setFiltrosServidor] = useState<FiltrosReproduccion>({});
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState<Vista>(null);
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [resultadoFiltro, setResultadoFiltro] = useState<string>("__todos__");
  const [ordenCampo, setOrdenCampo] = useState<CampoOrden>("dias_posparto");
  const [ordenDesc, setOrdenDesc] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [importando, setImportando] = useState(false);

  const tablaRef = useRef<HTMLDivElement>(null);

  const { data: resumen, isLoading: cargandoResumen } = useQuery({
    queryKey: ["reproduccion", "resumen"],
    queryFn: api.reproduccion.resumen,
  });

  const { data: acciones, isLoading: cargandoAcciones } = useQuery({
    queryKey: ["reproduccion", "acciones-requeridas"],
    queryFn: api.reproduccion.accionesRequeridas,
  });

  const { data: registros, isLoading: cargandoLista, isError } = useQuery({
    queryKey: ["reproduccion", "lista", filtrosServidor],
    queryFn: () => api.reproduccion.listar(filtrosServidor),
  });

  function refrescarTodo() {
    void queryClient.invalidateQueries({ queryKey: ["reproduccion"] });
  }

  const razas = useMemo(
    () => Array.from(new Set((registros ?? []).map((r) => r.raza).filter((v): v is string => !!v))).sort(),
    [registros],
  );
  const toros = useMemo(
    () => Array.from(new Set((registros ?? []).map((r) => r.toro).filter((v): v is string => !!v))).sort(),
    [registros],
  );

  const filtrados = useMemo(() => {
    let lista = registros ?? [];
    if (vista) lista = lista.filter((v) => coincideVista(v, vista));
    if (soloAlertas) lista = lista.filter((v) => v.nivel_alerta === "alerta" || v.nivel_alerta === "critico");
    if (resultadoFiltro !== "__todos__") {
      lista = lista.filter((v) => v.resultado_palpacion === resultadoFiltro);
    }
    const conOrden = [...lista].sort((a, b) => {
      let resultado = 0;
      if (ordenCampo === "dias_posparto") {
        resultado = (a.dias_posparto ?? -1) - (b.dias_posparto ?? -1);
      } else if (ordenCampo === "codigo") {
        resultado = a.codigo.localeCompare(b.codigo);
      } else if (ordenCampo === "fecha_ultimo_parto") {
        resultado = (a.fecha_ultimo_parto ?? "").localeCompare(b.fecha_ultimo_parto ?? "");
      } else {
        resultado = a.estado_reproductivo.localeCompare(b.estado_reproductivo);
      }
      return ordenDesc ? -resultado : resultado;
    });
    return conOrden;
  }, [registros, vista, soloAlertas, resultadoFiltro, ordenCampo, ordenDesc]);

  function seleccionarVista(v: Vista) {
    setVista((actual) => (actual === v ? null : v));
    tablaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function limpiarFiltros() {
    setFiltrosServidor({});
    setBusqueda("");
    setVista(null);
    setSoloAlertas(false);
    setResultadoFiltro("__todos__");
  }

  function buscar(valor: string) {
    setBusqueda(valor);
    setFiltrosServidor((f) => ({ ...f, q: valor || undefined }));
  }

  async function exportar() {
    try {
      const blob = await api.reproduccion.exportar();
      descargarBlob(blob, "reproduccion.csv");
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo exportar el archivo");
    }
  }

  async function importar(archivo: File) {
    setImportando(true);
    try {
      const resultado = await api.reproduccion.importar(archivo);
      toast.success(`Importación completa: ${resultado.creadas} creadas, ${resultado.actualizadas} actualizadas`);
      if (resultado.errores.length) {
        toast.error(`${resultado.errores.length} fila(s) con errores. Revise el formato del archivo.`);
      }
      refrescarTodo();
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo importar el archivo");
    } finally {
      setImportando(false);
      if (inputImportarRef.current) inputImportarRef.current.value = "";
    }
  }

  const datosEstado = Object.entries(resumen?.por_estado ?? {}).map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }));
  const datosNivel = Object.entries(resumen?.por_nivel ?? {}).map(([nivel, cantidad]) => ({
    nivel: ETIQUETA_NIVEL[nivel as keyof typeof ETIQUETA_NIVEL] ?? nivel,
    cantidad,
    color: CLASE_NIVEL_COLOR[nivel] ?? "var(--chart-1)",
  }));
  const datosPrenezVsVacias = [
    { nombre: "Preñadas", cantidad: resumen?.prenez_confirmada ?? 0, color: "var(--success)" },
    { nombre: "Vacías", cantidad: resumen?.vacias ?? 0, color: "var(--chart-4)" },
  ];
  const datosDistribucion = (resumen?.distribucion_dias_posparto.etiquetas ?? []).map((etiqueta, i) => ({
    rango: etiqueta,
    cantidad: resumen?.distribucion_dias_posparto.valores[i] ?? 0,
  }));
  const datosToro = Object.entries(resumen?.porcentaje_prenez_por_toro ?? {}).map(([toro, porcentaje]) => ({
    toro,
    porcentaje,
  }));
  const datosProyeccion = Object.entries(resumen?.proyeccion_partos_mensual ?? {}).map(([mes, cantidad]) => ({
    mes,
    cantidad,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <HeartPulse aria-hidden="true" className="size-6 text-primary" />
            Control reproductivo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Meta: preñez confirmada antes de los 82 días posparto, para mantener un parto por año.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => inputImportarRef.current?.click()} disabled={importando}>
            <Upload className="size-4" />
            {importando ? "Importando..." : "Importar archivo"}
          </Button>
          <input
            ref={inputImportarRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) void importar(archivo);
            }}
          />
          <Button variant="outline" onClick={exportar}>
            <Download className="size-4" />
            Exportar reporte
          </Button>
          <Button onClick={() => setDialogoAbierto(true)}>
            <PlusCircle className="size-4" />
            Agregar vaca
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <TarjetaKpi
          titulo="Total de vacas"
          valor={resumen?.total}
          icono={Beef}
          cargando={cargandoResumen}
          activa={vista === null}
          onClick={() => seleccionarVista(null)}
        />
        <TarjetaKpi
          titulo="Recuperación posparto"
          valor={resumen?.en_recuperacion}
          icono={TimerReset}
          cargando={cargandoResumen}
          activa={vista === "recuperacion"}
          onClick={() => seleccionarVista("recuperacion")}
        />
        <TarjetaKpi
          titulo="Aptas para el toro"
          valor={resumen?.aptas_para_toro}
          icono={Heart}
          cargando={cargandoResumen}
          activa={vista === "aptas"}
          onClick={() => seleccionarVista("aptas")}
          clase="text-success"
        />
        <TarjetaKpi
          titulo="Poner con el toro (urgente)"
          valor={resumen?.poner_con_toro_urgente}
          icono={AlertTriangle}
          cargando={cargandoResumen}
          activa={vista === "urgente"}
          onClick={() => seleccionarVista("urgente")}
          clase="text-warning-foreground"
        />
        <TarjetaKpi
          titulo="Pendientes de palpación"
          valor={resumen?.pendientes_palpacion}
          icono={Stethoscope}
          cargando={cargandoResumen}
          activa={vista === "pendientes_palpacion"}
          onClick={() => seleccionarVista("pendientes_palpacion")}
        />
        <TarjetaKpi
          titulo="Palpaciones atrasadas"
          valor={resumen?.palpaciones_atrasadas}
          icono={Syringe}
          cargando={cargandoResumen}
          activa={vista === "atrasadas"}
          onClick={() => seleccionarVista("atrasadas")}
          clase="text-critical"
        />
        <TarjetaKpi
          titulo="Preñez confirmada"
          valor={resumen?.prenez_confirmada}
          icono={Heart}
          cargando={cargandoResumen}
          activa={vista === "prenez"}
          onClick={() => seleccionarVista("prenez")}
          clase="text-success"
        />
        <TarjetaKpi
          titulo="Vacías"
          valor={resumen?.vacias}
          icono={HeartCrack}
          cargando={cargandoResumen}
          activa={vista === "vacias"}
          onClick={() => seleccionarVista("vacias")}
        />
        <TarjetaKpi
          titulo="Alerta crítica"
          valor={resumen?.alerta_critica}
          icono={AlertTriangle}
          cargando={cargandoResumen}
          activa={vista === "critico"}
          onClick={() => seleccionarVista("critico")}
          clase="text-critical"
        />
        <TarjetaKpi
          titulo="% Preñez del hato"
          valor={resumen ? `${resumen.porcentaje_prenez}%` : undefined}
          icono={HeartPulse}
          cargando={cargandoResumen}
        />
      </div>

      {/* Acciones requeridas hoy */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones requeridas hoy</CardTitle>
          <CardDescription>Fecha de referencia: {formatearFecha(new Date().toISOString())}</CardDescription>
        </CardHeader>
        <CardContent>
          {cargandoAcciones ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ListaAcciones titulo="Poner con el toro" items={acciones?.poner_con_toro} sufijo="días posparto" />
              <ListaAcciones titulo="Listas para palpación" items={acciones?.listas_palpacion} sufijo="días" />
              <ListaAcciones
                titulo="Palpación atrasada"
                items={acciones?.palpacion_atrasada}
                sufijo="días"
                urgente
              />
              <ListaAcciones
                titulo="Vacías: volver con el toro"
                items={acciones?.vacias_volver_toro}
                sufijo="días posparto"
              />
              <ListaAcciones
                titulo="Más de 82 días sin preñez"
                items={acciones?.mas_82_dias}
                sufijo="días posparto"
              />
              <ListaAcciones
                titulo="Más de 120 días sin preñez"
                items={acciones?.mas_120_dias}
                sufijo="días posparto"
                urgente
              />
              <ListaAcciones titulo="Datos incompletos" items={acciones?.datos_incompletos} sufijo="" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vacas por estado reproductivo</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoResumen ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosEstado} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="estado" type="category" width={160} tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preñadas frente a vacías</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoResumen ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={datosPrenezVsVacias} dataKey="cantidad" nameKey="nombre" outerRadius={90} label>
                    {datosPrenezVsVacias.map((d) => (
                      <Cell key={d.nombre} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por días posparto</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoResumen ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosDistribucion} margin={{ top: 16 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="rango" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>% de preñez por toro</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoResumen ? (
              <Skeleton className="h-64 w-full" />
            ) : datosToro.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aún no hay palpaciones registradas por toro.
              </p>
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosToro} margin={{ top: 16 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="toro" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="porcentaje" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vacas en alerta por nivel</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoResumen ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosNivel} margin={{ top: 16 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="nivel" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
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
            <CardTitle>Proyección mensual de próximos partos</CardTitle>
            <CardDescription>
              Promedio días parto → concepción: {resumen?.promedio_dias_parto_concepcion ?? "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoResumen ? (
              <Skeleton className="h-64 w-full" />
            ) : datosProyeccion.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aún no hay preñeces confirmadas para proyectar partos.
              </p>
            ) : (
              <ChartContainer config={CONFIG_CANTIDAD} className="h-64 w-full">
                <BarChart data={datosProyeccion} margin={{ top: 16 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla principal */}
      <div ref={tablaRef} className="flex flex-col gap-4 scroll-mt-20">
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Inventario reproductivo</CardTitle>
              <Badge variant="outline">{filtrados.length} de {registros?.length ?? 0}</Badge>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="buscar" className="text-xs font-medium text-muted-foreground">
                  Buscar
                </label>
                <Input
                  id="buscar"
                  placeholder="Código, nombre o hierro..."
                  value={busqueda}
                  onChange={(e) => buscar(e.target.value)}
                  className="w-48"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Raza</span>
                <Select
                  value={filtrosServidor.raza ?? "__todas__"}
                  onValueChange={(v) => setFiltrosServidor((f) => ({ ...f, raza: v === "__todas__" ? undefined : v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__todas__">Todas</SelectItem>
                    {razas.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Toro</span>
                <Select
                  value={filtrosServidor.toro ?? "__todos__"}
                  onValueChange={(v) => setFiltrosServidor((f) => ({ ...f, toro: v === "__todos__" ? undefined : v }))}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__todos__">Todos</SelectItem>
                    {toros.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Resultado palpación</span>
                <Select value={resultadoFiltro} onValueChange={setResultadoFiltro}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__todos__">Todos</SelectItem>
                    <SelectItem value="preñada">Preñada</SelectItem>
                    <SelectItem value="vacia">Vacía</SelectItem>
                    <SelectItem value="dudosa">Dudosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
                <div className="flex gap-1">
                  <Select value={ordenCampo} onValueChange={(v) => setOrdenCampo(v as CampoOrden)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dias_posparto">Días posparto</SelectItem>
                      <SelectItem value="codigo">Código</SelectItem>
                      <SelectItem value="fecha_ultimo_parto">Último parto</SelectItem>
                      <SelectItem value="estado_reproductivo">Estado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setOrdenDesc((v) => !v)}>
                    <ArrowDownUp className="size-4" />
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant={soloAlertas ? "default" : "outline"}
                onClick={() => setSoloAlertas((v) => !v)}
              >
                <Filter className="size-4" />
                Ver solamente alertas
              </Button>

              <Button type="button" variant="ghost" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isError ? (
              <p className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical">
                No se pudo cargar el inventario reproductivo.
              </p>
            ) : cargandoLista ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Último parto</TableHead>
                      <TableHead>Días posparto</TableHead>
                      <TableHead>Estado reproductivo</TableHead>
                      <TableHead>Con el toro</TableHead>
                      <TableHead>Próxima palpación</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Probable parto</TableHead>
                      <TableHead>Alerta</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrados.map((v) => (
                      <TableRow key={v.id} className={CLASE_FILA_URGENTE[v.nivel_alerta] ?? ""}>
                        <TableCell className="font-medium">{v.codigo}</TableCell>
                        <TableCell>{v.nombre ?? "—"}</TableCell>
                        <TableCell>{formatearFecha(v.fecha_ultimo_parto)}</TableCell>
                        <TableCell>{v.dias_posparto ?? "—"}</TableCell>
                        <TableCell className="max-w-52">{v.estado_reproductivo}</TableCell>
                        <TableCell>{v.toro ?? "—"}</TableCell>
                        <TableCell>{formatearFecha(v.fecha_palpacion_programada)}</TableCell>
                        <TableCell className="capitalize">{v.resultado_palpacion ?? "—"}</TableCell>
                        <TableCell>{formatearFecha(v.fecha_probable_parto)}</TableCell>
                        <TableCell>
                          <Badge className={CLASE_NIVEL[v.nivel_alerta]}>{ETIQUETA_NIVEL[v.nivel_alerta]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to="/ingresar/reproduccion/$id"
                            params={{ id: String(v.id) }}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Ver ficha
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground">
                          No hay vacas que coincidan con los filtros.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg border border-warning/50 bg-warning/15 p-4 text-sm text-warning-foreground">
        <FileUp aria-hidden="true" className="mb-1 inline size-4" /> El archivo CSV usa separador ";" y
        fechas en formato AAAA-MM-DD. La columna obligatoria es "codigo".
      </p>

      <DialogAgregarVaca abierto={dialogoAbierto} onOpenChange={setDialogoAbierto} onExito={refrescarTodo} />
    </div>
  );
}

function TarjetaKpi({
  titulo,
  valor,
  icono: Icono,
  cargando,
  activa,
  onClick,
  clase,
}: {
  titulo: string;
  valor: number | string | undefined;
  icono: typeof Beef;
  cargando: boolean;
  activa?: boolean;
  onClick?: () => void;
  clase?: string;
}) {
  const Contenedor = onClick ? "button" : "div";
  return (
    <Contenedor
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-xl border p-4 text-left shadow-(--shadow-soft) transition-colors ${
        activa ? "border-primary bg-accent" : "border-border bg-card"
      } ${onClick ? "cursor-pointer hover:bg-accent" : ""}`}
    >
      <div className="flex items-center gap-2">
        <Icono aria-hidden="true" className={`size-4 ${clase ?? "text-muted-foreground"}`} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</span>
      </div>
      {cargando || valor === undefined ? (
        <Skeleton className="mt-2 h-7 w-14" />
      ) : (
        <p className="mt-1 font-display text-2xl font-bold">{valor}</p>
      )}
    </Contenedor>
  );
}

function ListaAcciones({
  titulo,
  items,
  sufijo,
  urgente,
}: {
  titulo: string;
  items: { id: number; codigo: string; nombre: string | null; dias: number | null }[] | undefined;
  sufijo: string;
  urgente?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className={`text-sm font-semibold ${urgente ? "text-critical" : ""}`}>{titulo}</p>
      {!items || items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Sin pendientes.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">
                {item.codigo}
                {item.nombre ? ` · ${item.nombre}` : ""}
                {item.dias !== null && (
                  <span className="text-xs text-muted-foreground"> ({item.dias} {sufijo})</span>
                )}
              </span>
              <Link
                to="/ingresar/reproduccion/$id"
                params={{ id: String(item.id) }}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                Actuar
              </Link>
            </li>
          ))}
          {items.length > 6 && (
            <li className="text-xs text-muted-foreground">y {items.length - 6} más...</li>
          )}
        </ul>
      )}
    </div>
  );
}
