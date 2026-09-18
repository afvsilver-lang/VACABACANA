import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { api, esApiError, type ReproduccionDetalle } from "@/lib/api";
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

export function DialogEditarVaca({
  reproduccion,
  abierto,
  onOpenChange,
  onExito,
}: {
  reproduccion: ReproduccionDetalle;
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
  onExito: () => void;
}) {
  const [datos, setDatos] = useState({
    nombre: reproduccion.nombre ?? "",
    hierro: reproduccion.hierro ?? "",
    raza: reproduccion.raza ?? "",
    fecha_nacimiento: reproduccion.fecha_nacimiento ?? "",
    estado_corporal: reproduccion.estado_corporal?.toString() ?? "",
    observaciones: reproduccion.observaciones ?? "",
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setDatos({
        nombre: reproduccion.nombre ?? "",
        hierro: reproduccion.hierro ?? "",
        raza: reproduccion.raza ?? "",
        fecha_nacimiento: reproduccion.fecha_nacimiento ?? "",
        estado_corporal: reproduccion.estado_corporal?.toString() ?? "",
        observaciones: reproduccion.observaciones ?? "",
      });
    }
  }, [abierto, reproduccion]);

  function campo<K extends keyof typeof datos>(clave: K) {
    return {
      value: datos[clave],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDatos((s) => ({ ...s, [clave]: e.target.value })),
    };
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await api.reproduccion.actualizar(reproduccion.id, {
        nombre: datos.nombre.trim() || undefined,
        hierro: datos.hierro.trim() || undefined,
        raza: datos.raza.trim() || undefined,
        fecha_nacimiento: datos.fecha_nacimiento || undefined,
        estado_corporal: datos.estado_corporal ? Number(datos.estado_corporal) : undefined,
        observaciones: datos.observaciones.trim() || undefined,
      });
      toast.success("Cambios guardados");
      onOpenChange(false);
      onExito();
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudieron guardar los cambios");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar registro</DialogTitle>
          <DialogDescription>Datos generales de {reproduccion.codigo}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-nombre">Nombre</Label>
            <Input id="e-nombre" {...campo("nombre")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-hierro">Número de hierro / arete</Label>
            <Input id="e-hierro" {...campo("hierro")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-raza">Raza</Label>
            <Input id="e-raza" {...campo("raza")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-fecha_nacimiento">Fecha de nacimiento</Label>
            <Input id="e-fecha_nacimiento" type="date" {...campo("fecha_nacimiento")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e-estado_corporal">Estado corporal (1 a 5)</Label>
            <Input id="e-estado_corporal" type="number" step="0.1" min="1" max="5" {...campo("estado_corporal")} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="e-observaciones">Observaciones veterinarias</Label>
            <Input id="e-observaciones" {...campo("observaciones")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
