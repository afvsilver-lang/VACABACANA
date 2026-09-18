import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { api, esApiError, type VacaEntrada } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/ingresar/vacas/nueva")({
  component: RegistrarVaca,
});

type FormState = {
  vaca_id: string;
  edad_meses: string;
  color: string;
  cachona: boolean;
  peso_kg: string;
  condicion_corporal: string;
  estado_salud: string;
  edad_primer_parto_meses: string;
  num_partos: string;
  intervalo_partos_meses: string;
  meses_desde_ultimo_parto: string;
  perdida_cria: boolean;
  produccion_leche_lt_dia: string;
  candidata_descarte: boolean;
  clasificacion_reproductiva: string;
};

const ESTADO_INICIAL: FormState = {
  vaca_id: "",
  edad_meses: "",
  color: "",
  cachona: false,
  peso_kg: "",
  condicion_corporal: "",
  estado_salud: "sana",
  edad_primer_parto_meses: "",
  num_partos: "",
  intervalo_partos_meses: "",
  meses_desde_ultimo_parto: "",
  perdida_cria: false,
  produccion_leche_lt_dia: "",
  candidata_descarte: false,
  clasificacion_reproductiva: "",
};

function numeroONulo(valor: string): number | undefined {
  if (valor.trim() === "") return undefined;
  const n = Number(valor);
  return Number.isNaN(n) ? undefined : n;
}

function RegistrarVaca() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [errorId, setErrorId] = useState<string | null>(null);

  function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!form.vaca_id.trim()) {
      setErrorId("El ID de la vaca es obligatorio.");
      return;
    }
    setErrorId(null);
    setEnviando(true);

    const datos: VacaEntrada = {
      vaca_id: form.vaca_id.trim(),
      edad_meses: numeroONulo(form.edad_meses) ?? null,
      color: form.color.trim() || null,
      cachona: form.cachona,
      peso_kg: numeroONulo(form.peso_kg) ?? null,
      condicion_corporal: numeroONulo(form.condicion_corporal) ?? null,
      estado_salud: form.estado_salud.trim() || null,
      edad_primer_parto_meses: numeroONulo(form.edad_primer_parto_meses) ?? null,
      num_partos: numeroONulo(form.num_partos) ?? null,
      intervalo_partos_meses: numeroONulo(form.intervalo_partos_meses) ?? null,
      meses_desde_ultimo_parto: numeroONulo(form.meses_desde_ultimo_parto) ?? null,
      perdida_cria: form.perdida_cria,
      produccion_leche_lt_dia: numeroONulo(form.produccion_leche_lt_dia) ?? null,
      candidata_descarte: form.candidata_descarte,
      clasificacion_reproductiva: form.clasificacion_reproductiva.trim() || null,
    };

    try {
      await api.vacas.crear(datos);
      toast.success(`Vaca ${datos.vaca_id} registrada`);
      navigate({ to: "/ingresar/vacas/$vacaId", params: { vacaId: datos.vaca_id } });
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo registrar la vaca");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrar vaca</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete los datos disponibles. Solo el ID es obligatorio.
        </p>
      </div>

      <form onSubmit={enviar}>
        <Card>
          <CardHeader>
            <CardTitle>Datos del animal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo label="ID de la vaca *" error={errorId ?? undefined}>
              <Input
                value={form.vaca_id}
                onChange={(e) => actualizar("vaca_id", e.target.value)}
                placeholder="S02501"
                required
              />
            </Campo>
            <Campo label="Color">
              <Input value={form.color} onChange={(e) => actualizar("color", e.target.value)} placeholder="negro" />
            </Campo>
            <Campo label="Edad (meses)">
              <Input
                type="number"
                step="0.1"
                value={form.edad_meses}
                onChange={(e) => actualizar("edad_meses", e.target.value)}
              />
            </Campo>
            <Campo label="Peso (kg)">
              <Input
                type="number"
                step="0.1"
                value={form.peso_kg}
                onChange={(e) => actualizar("peso_kg", e.target.value)}
              />
            </Campo>
            <Campo label="Condición corporal (1-5)">
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.condicion_corporal}
                onChange={(e) => actualizar("condicion_corporal", e.target.value)}
              />
            </Campo>
            <Campo label="Estado de salud">
              <Input
                value={form.estado_salud}
                onChange={(e) => actualizar("estado_salud", e.target.value)}
                placeholder="sana"
              />
            </Campo>
            <Campo label="Edad al primer parto (meses)">
              <Input
                type="number"
                step="0.1"
                value={form.edad_primer_parto_meses}
                onChange={(e) => actualizar("edad_primer_parto_meses", e.target.value)}
              />
            </Campo>
            <Campo label="Número de partos">
              <Input
                type="number"
                value={form.num_partos}
                onChange={(e) => actualizar("num_partos", e.target.value)}
              />
            </Campo>
            <Campo label="Intervalo entre partos (meses)">
              <Input
                type="number"
                step="0.1"
                value={form.intervalo_partos_meses}
                onChange={(e) => actualizar("intervalo_partos_meses", e.target.value)}
              />
            </Campo>
            <Campo label="Meses desde el último parto">
              <Input
                type="number"
                step="0.1"
                value={form.meses_desde_ultimo_parto}
                onChange={(e) => actualizar("meses_desde_ultimo_parto", e.target.value)}
              />
            </Campo>
            <Campo label="Producción de leche (lt/día)">
              <Input
                type="number"
                step="0.1"
                value={form.produccion_leche_lt_dia}
                onChange={(e) => actualizar("produccion_leche_lt_dia", e.target.value)}
              />
            </Campo>
            <Campo label="Clasificación reproductiva">
              <Input
                value={form.clasificacion_reproductiva}
                onChange={(e) => actualizar("clasificacion_reproductiva", e.target.value)}
                placeholder="Buena / Mala"
              />
            </Campo>

            <div className="col-span-full grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
              <ConmutadorCampo
                label="Cachona"
                checked={form.cachona}
                onCheckedChange={(v) => actualizar("cachona", v)}
              />
              <ConmutadorCampo
                label="Pérdida de cría"
                checked={form.perdida_cria}
                onCheckedChange={(v) => actualizar("perdida_cria", v)}
              />
              <ConmutadorCampo
                label="Candidata a descarte"
                checked={form.candidata_descarte}
                onCheckedChange={(v) => actualizar("candidata_descarte", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/ingresar/vacas" })}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? "Guardando..." : "Registrar vaca"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Campo({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  );
}

function ConmutadorCampo({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch checked={checked} onCheckedChange={onCheckedChange} id={label} />
      <Label htmlFor={label} className="cursor-pointer">
        {label}
      </Label>
    </div>
  );
}
