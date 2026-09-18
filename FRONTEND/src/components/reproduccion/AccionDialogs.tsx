import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { api, esApiError, type ResultadoPalpacion } from "@/lib/api";
import { hoyISO } from "@/lib/fechas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropsBase {
  reproduccionId: number;
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
  onExito: () => void;
}

function useEnviar<T>(accion: () => Promise<T>, onExito: () => void, onOpenChange: (v: boolean) => void) {
  const [enviando, setEnviando] = useState(false);
  async function ejecutar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await accion();
      onExito();
      onOpenChange(false);
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo completar la acción");
    } finally {
      setEnviando(false);
    }
  }
  return { enviando, ejecutar };
}

export function DialogRegistrarParto({ reproduccionId, abierto, onOpenChange, onExito }: PropsBase) {
  const [fecha, setFecha] = useState(hoyISO());
  const { enviando, ejecutar } = useEnviar(
    () => api.reproduccion.registrarParto(reproduccionId, fecha),
    () => {
      toast.success("Parto registrado");
      onExito();
    },
    onOpenChange,
  );

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar parto</DialogTitle>
          <DialogDescription>
            Inicia un nuevo ciclo reproductivo. Se limpian los datos de servicio y palpación anteriores
            (quedan guardados en el historial).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={ejecutar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-parto">Fecha del parto</Label>
            <Input id="fecha-parto" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Registrar parto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DialogPonerConToro({ reproduccionId, abierto, onOpenChange, onExito }: PropsBase) {
  const [fecha, setFecha] = useState(hoyISO());
  const [toro, setToro] = useState("");
  const { enviando, ejecutar } = useEnviar(
    () => api.reproduccion.ponerConToro(reproduccionId, fecha, toro),
    () => {
      toast.success("Puesta con el toro");
      onExito();
    },
    onOpenChange,
  );

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Poner con el toro</DialogTitle>
          <DialogDescription>Registra el inicio del servicio con el toro elegido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={ejecutar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-servicio">Fecha de ingreso con el toro</Label>
            <Input
              id="fecha-servicio"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="toro">Toro</Label>
            <Input id="toro" value={toro} onChange={(e) => setToro(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando || !toro.trim()}>
              {enviando ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DialogRetirarToro({ reproduccionId, abierto, onOpenChange, onExito }: PropsBase) {
  const [fecha, setFecha] = useState(hoyISO());
  const { enviando, ejecutar } = useEnviar(
    () => api.reproduccion.retirarDelToro(reproduccionId, fecha),
    () => {
      toast.success("Retirada del toro");
      onExito();
    },
    onOpenChange,
  );

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirar del toro</DialogTitle>
          <DialogDescription>Registra la fecha en que la vaca fue retirada del toro.</DialogDescription>
        </DialogHeader>
        <form onSubmit={ejecutar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-retiro">Fecha de retiro</Label>
            <Input
              id="fecha-retiro"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DialogProgramarPalpacion({ reproduccionId, abierto, onOpenChange, onExito }: PropsBase) {
  const [fecha, setFecha] = useState("");
  const { enviando, ejecutar } = useEnviar(
    () => api.reproduccion.programarPalpacion(reproduccionId, fecha || undefined),
    () => {
      toast.success("Palpación programada");
      onExito();
    },
    onOpenChange,
  );

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar palpación</DialogTitle>
          <DialogDescription>
            Si deja la fecha vacía, se calcula automáticamente con los días configurados desde el
            servicio. Recuerde: la palpación debe realizarla un médico veterinario o una persona
            capacitada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={ejecutar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-programada">Fecha programada (opcional)</Label>
            <Input
              id="fecha-programada"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Programar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DialogRegistrarPalpacion({
  reproduccionId,
  abierto,
  onOpenChange,
  onExito,
  resultadoInicial,
  titulo,
}: PropsBase & { resultadoInicial?: ResultadoPalpacion; titulo?: string }) {
  const [fecha, setFecha] = useState(hoyISO());
  const [resultado, setResultado] = useState<ResultadoPalpacion>(resultadoInicial ?? "preñada");

  useEffect(() => {
    if (abierto) {
      setFecha(hoyISO());
      setResultado(resultadoInicial ?? "preñada");
    }
  }, [abierto, resultadoInicial]);

  const { enviando, ejecutar } = useEnviar(
    () => api.reproduccion.registrarPalpacion(reproduccionId, fecha, resultado),
    () => {
      toast.success("Palpación registrada");
      onExito();
    },
    onOpenChange,
  );

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo ?? "Registrar palpación"}</DialogTitle>
          <DialogDescription>
            Advertencia: la palpación debe ser realizada por un médico veterinario o una persona
            capacitada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={ejecutar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-palpacion">Fecha de la palpación</Label>
            <Input
              id="fecha-palpacion"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Resultado</Label>
            <Select value={resultado} onValueChange={(v) => setResultado(v as ResultadoPalpacion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preñada">Preñada</SelectItem>
                <SelectItem value="vacia">Vacía</SelectItem>
                <SelectItem value="dudosa">Dudosa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar resultado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
