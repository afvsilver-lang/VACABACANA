import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { api, esApiError, type ImportarResumen } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/ingresar/importar")({
  component: ImportarDatos,
});

function ImportarDatos() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<ImportarResumen | null>(null);

  async function importar() {
    if (!archivo) {
      toast.error("Seleccione un archivo CSV primero");
      return;
    }
    setSubiendo(true);
    setResultado(null);
    try {
      const resumen = await api.importar.subir(archivo);
      setResultado(resumen);
      toast.success(`Importación completa: ${resumen.creadas} creadas, ${resumen.actualizadas} actualizadas`);
      queryClient.invalidateQueries({ queryKey: ["vacas"] });
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
      queryClient.invalidateQueries({ queryKey: ["analitica"] });
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      toast.error(esApiError(error) ? error.message : "No se pudo importar el archivo");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Importar datos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cargue un archivo CSV con el inventario de vacas. Las filas cuyo ID ya exista se actualizan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formato esperado</CardTitle>
          <CardDescription>
            Archivo .csv separado por punto y coma (;), con encabezado igual al siguiente:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            vaca_id;edad_meses;color;cachona;peso_kg;condicion_corporal;estado_salud;
            edad_primer_parto_meses;num_partos;intervalo_partos_meses;meses_desde_ultimo_parto;
            perdida_cria;produccion_leche_lt_dia;candidata_descarte;clasificacion_reproductiva
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            Los campos booleanos (cachona, perdida_cria, candidata_descarte) se indican con 0 o 1.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-accent">
            <UploadCloud className="size-7 text-accent-foreground" />
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <FileUp className="size-4" />
            {archivo ? archivo.name : "Seleccionar archivo CSV"}
          </Button>
          <Button onClick={importar} disabled={!archivo || subiendo}>
            {subiendo ? "Importando..." : "Importar"}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la importación</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-6 text-sm">
              <span>
                <strong className="text-success">{resultado.creadas}</strong> creadas
              </span>
              <span>
                <strong className="text-secondary">{resultado.actualizadas}</strong> actualizadas
              </span>
              <span>
                <strong className="text-critical">{resultado.errores.length}</strong> errores
              </span>
            </div>
            {resultado.errores.length > 0 && (
              <ul className="max-h-48 list-disc overflow-y-auto rounded-lg bg-critical/10 p-4 pl-8 text-xs text-critical">
                {resultado.errores.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
