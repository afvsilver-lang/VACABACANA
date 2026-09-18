import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api, esApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/ingresar/configuracion")({
  component: ConfiguracionPagina,
});

function ConfiguracionPagina() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["configuracion"],
    queryFn: api.configuracion.obtener,
  });

  const { data: repro, isLoading: cargandoRepro } = useQuery({
    queryKey: ["reproduccion", "configuracion"],
    queryFn: api.reproduccion.configuracion.obtener,
  });

  const [form, setForm] = useState({
    umbral_advertencia_meses: "",
    umbral_critico_meses: "",
    peso_intervalo: "",
    peso_condicion_corporal: "",
    peso_estado_salud: "",
    peso_perdida_cria: "",
    version_reglas: "",
  });
  const [guardando, setGuardando] = useState(false);

  const [formRepro, setFormRepro] = useState({
    dias_fin_recuperacion: "",
    dias_fin_apta: "",
    dias_fin_atencion: "",
    dias_alerta_critica: "",
    dias_para_palpacion: "",
    dias_aviso_palpacion_proxima: "",
    dias_gestacion: "",
  });
  const [guardandoRepro, setGuardandoRepro] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        umbral_advertencia_meses: String(data.umbral_advertencia_meses),
        umbral_critico_meses: String(data.umbral_critico_meses),
        peso_intervalo: String(data.peso_intervalo),
        peso_condicion_corporal: String(data.peso_condicion_corporal),
        peso_estado_salud: String(data.peso_estado_salud),
        peso_perdida_cria: String(data.peso_perdida_cria),
        version_reglas: data.version_reglas,
      });
    }
  }, [data]);

  useEffect(() => {
    if (repro) {
      setFormRepro({
        dias_fin_recuperacion: String(repro.dias_fin_recuperacion),
        dias_fin_apta: String(repro.dias_fin_apta),
        dias_fin_atencion: String(repro.dias_fin_atencion),
        dias_alerta_critica: String(repro.dias_alerta_critica),
        dias_para_palpacion: String(repro.dias_para_palpacion),
        dias_aviso_palpacion_proxima: String(repro.dias_aviso_palpacion_proxima),
        dias_gestacion: String(repro.dias_gestacion),
      });
    }
  }, [repro]);

  async function guardarRepro(evento: React.FormEvent) {
    evento.preventDefault();
    setGuardandoRepro(true);
    try {
      await api.reproduccion.configuracion.actualizar({
        dias_fin_recuperacion: Number(formRepro.dias_fin_recuperacion),
        dias_fin_apta: Number(formRepro.dias_fin_apta),
        dias_fin_atencion: Number(formRepro.dias_fin_atencion),
        dias_alerta_critica: Number(formRepro.dias_alerta_critica),
        dias_para_palpacion: Number(formRepro.dias_para_palpacion),
        dias_aviso_palpacion_proxima: Number(formRepro.dias_aviso_palpacion_proxima),
        dias_gestacion: Number(formRepro.dias_gestacion),
      });
      toast.success("Configuración de reproducción actualizada");
      queryClient.invalidateQueries({ queryKey: ["reproduccion"] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo guardar la configuración");
    } finally {
      setGuardandoRepro(false);
    }
  }

  const sumaPesos =
    (Number(form.peso_intervalo) || 0) +
    (Number(form.peso_condicion_corporal) || 0) +
    (Number(form.peso_estado_salud) || 0) +
    (Number(form.peso_perdida_cria) || 0);

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setGuardando(true);
    try {
      await api.configuracion.actualizar({
        umbral_advertencia_meses: Number(form.umbral_advertencia_meses),
        umbral_critico_meses: Number(form.umbral_critico_meses),
        peso_intervalo: Number(form.peso_intervalo),
        peso_condicion_corporal: Number(form.peso_condicion_corporal),
        peso_estado_salud: Number(form.peso_estado_salud),
        peso_perdida_cria: Number(form.peso_perdida_cria),
        version_reglas: form.version_reglas,
      });
      toast.success("Configuración actualizada");
      queryClient.invalidateQueries({ queryKey: ["configuracion"] });
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
      queryClient.invalidateQueries({ queryKey: ["analitica"] });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo guardar la configuración");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Umbrales y pesos usados para calcular el puntaje de riesgo reproductivo (0 a 100).
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
      <form onSubmit={guardar} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Umbrales de meses desde el último parto</CardTitle>
            <CardDescription>Definen cuándo empieza la advertencia y cuándo se vuelve crítico.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo label="Umbral de advertencia (meses)">
              <Input
                type="number"
                step="0.1"
                value={form.umbral_advertencia_meses}
                onChange={(e) => setForm((p) => ({ ...p, umbral_advertencia_meses: e.target.value }))}
              />
            </Campo>
            <Campo label="Umbral crítico (meses)">
              <Input
                type="number"
                step="0.1"
                value={form.umbral_critico_meses}
                onChange={(e) => setForm((p) => ({ ...p, umbral_critico_meses: e.target.value }))}
              />
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pesos de cada factor</CardTitle>
            <CardDescription>
              Puntos máximos que aporta cada factor al puntaje total. Se recomienda que sumen cerca de 100.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo label="Meses desde último parto">
              <Input
                type="number"
                step="1"
                value={form.peso_intervalo}
                onChange={(e) => setForm((p) => ({ ...p, peso_intervalo: e.target.value }))}
              />
            </Campo>
            <Campo label="Condición corporal baja">
              <Input
                type="number"
                step="1"
                value={form.peso_condicion_corporal}
                onChange={(e) => setForm((p) => ({ ...p, peso_condicion_corporal: e.target.value }))}
              />
            </Campo>
            <Campo label="Estado de salud">
              <Input
                type="number"
                step="1"
                value={form.peso_estado_salud}
                onChange={(e) => setForm((p) => ({ ...p, peso_estado_salud: e.target.value }))}
              />
            </Campo>
            <Campo label="Pérdida de cría">
              <Input
                type="number"
                step="1"
                value={form.peso_perdida_cria}
                onChange={(e) => setForm((p) => ({ ...p, peso_perdida_cria: e.target.value }))}
              />
            </Campo>
            <p className={`col-span-full text-sm ${sumaPesos === 100 ? "text-muted-foreground" : "text-warning-foreground"}`}>
              Suma actual de pesos: <strong>{sumaPesos}</strong> {sumaPesos !== 100 && "(se recomienda 100)"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Versión de reglas</CardTitle>
          </CardHeader>
          <CardContent>
            <Campo label="Identificador de versión">
              <Input
                value={form.version_reglas}
                onChange={(e) => setForm((p) => ({ ...p, version_reglas: e.target.value }))}
              />
            </Campo>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </form>
      )}

      <div>
        <h2 className="text-xl font-bold tracking-tight">Control reproductivo por fechas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Umbrales (en días) que usa el módulo de Reproducción para clasificar el estado de cada vaca.
        </p>
      </div>

      {cargandoRepro ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <form onSubmit={guardarRepro} className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Escala de días posparto</CardTitle>
              <CardDescription>
                Define los rangos de "Recuperación posparto", "Apta para el toro", "Atención" y las
                alertas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo label="Fin de recuperación posparto (días)">
                <Input
                  type="number"
                  value={formRepro.dias_fin_recuperacion}
                  onChange={(e) => setFormRepro((p) => ({ ...p, dias_fin_recuperacion: e.target.value }))}
                />
              </Campo>
              <Campo label="Fin del período apta para el toro (días)">
                <Input
                  type="number"
                  value={formRepro.dias_fin_apta}
                  onChange={(e) => setFormRepro((p) => ({ ...p, dias_fin_apta: e.target.value }))}
                />
              </Campo>
              <Campo label="Fin del período de atención / meta de preñez (días)">
                <Input
                  type="number"
                  value={formRepro.dias_fin_atencion}
                  onChange={(e) => setFormRepro((p) => ({ ...p, dias_fin_atencion: e.target.value }))}
                />
              </Campo>
              <Campo label="Alerta crítica desde (días)">
                <Input
                  type="number"
                  value={formRepro.dias_alerta_critica}
                  onChange={(e) => setFormRepro((p) => ({ ...p, dias_alerta_critica: e.target.value }))}
                />
              </Campo>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Palpación y gestación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo label="Días desde el servicio para programar palpación">
                <Input
                  type="number"
                  value={formRepro.dias_para_palpacion}
                  onChange={(e) => setFormRepro((p) => ({ ...p, dias_para_palpacion: e.target.value }))}
                />
              </Campo>
              <Campo label="Aviso de palpación próxima (días antes)">
                <Input
                  type="number"
                  value={formRepro.dias_aviso_palpacion_proxima}
                  onChange={(e) =>
                    setFormRepro((p) => ({ ...p, dias_aviso_palpacion_proxima: e.target.value }))
                  }
                />
              </Campo>
              <Campo label="Duración de la gestación bovina (días)">
                <Input
                  type="number"
                  value={formRepro.dias_gestacion}
                  onChange={(e) => setFormRepro((p) => ({ ...p, dias_gestacion: e.target.value }))}
                />
              </Campo>
            </CardContent>
          </Card>

          <p className="rounded-lg border border-warning/50 bg-warning/15 p-3 text-sm text-warning-foreground">
            La palpación para confirmar la gestación debe ser realizada por un médico veterinario o una
            persona capacitada.
          </p>

          <div className="flex justify-end">
            <Button type="submit" disabled={guardandoRepro}>
              {guardandoRepro ? "Guardando..." : "Guardar umbrales de reproducción"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
