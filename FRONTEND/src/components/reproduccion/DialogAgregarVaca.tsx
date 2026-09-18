import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { api, esApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VACIO = {
  codigo: "",
  nombre: "",
  hierro: "",
  raza: "",
  fecha_nacimiento: "",
  fecha_ultimo_parto: "",
  estado_corporal: "",
  observaciones: "",
};

export function DialogAgregarVaca({
  abierto,
  onOpenChange,
  onExito,
}: {
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
  onExito: () => void;
}) {
  const [datos, setDatos] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);

  function campo<K extends keyof typeof VACIO>(clave: K) {
    return {
      value: datos[clave],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDatos((s) => ({ ...s, [clave]: e.target.value })),
    };
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!datos.codigo.trim()) {
      toast.error("El código o número de identificación es obligatorio");
      return;
    }
    setEnviando(true);
    try {
      await api.reproduccion.crear({
        codigo: datos.codigo.trim(),
        nombre: datos.nombre.trim() || undefined,
        hierro: datos.hierro.trim() || undefined,
        raza: datos.raza.trim() || undefined,
        fecha_nacimiento: datos.fecha_nacimiento || undefined,
        fecha_ultimo_parto: datos.fecha_ultimo_parto || undefined,
        estado_corporal: datos.estado_corporal ? Number(datos.estado_corporal) : undefined,
        observaciones: datos.observaciones.trim() || undefined,
      });
      toast.success(`Vaca ${datos.codigo} registrada`);
      setDatos(VACIO);
      onOpenChange(false);
      onExito();
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo registrar la vaca");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agregar vaca</DialogTitle>
          <DialogDescription>
            Datos generales de la ficha. Los eventos reproductivos (parto, servicio, palpación) se
            registran después desde la ficha de la vaca.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="codigo">Código / identificación *</Label>
            <Input id="codigo" {...campo("codigo")} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...campo("nombre")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hierro">Número de hierro / arete</Label>
            <Input id="hierro" {...campo("hierro")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="raza">Raza</Label>
            <Input id="raza" {...campo("raza")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
            <Input id="fecha_nacimiento" type="date" {...campo("fecha_nacimiento")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha_ultimo_parto">Fecha del último parto</Label>
            <Input id="fecha_ultimo_parto" type="date" {...campo("fecha_ultimo_parto")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estado_corporal">Estado corporal (1 a 5)</Label>
            <Input id="estado_corporal" type="number" step="0.1" min="1" max="5" {...campo("estado_corporal")} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="observaciones">Observaciones veterinarias</Label>
            <Input id="observaciones" {...campo("observaciones")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Agregar vaca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
