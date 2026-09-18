import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { api, esApiError, type Rol, type Usuario } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/ingresar/usuarios")({
  component: Usuarios,
});

const ROLES: { valor: Rol; etiqueta: string }[] = [
  { valor: "admin", etiqueta: "Administrador" },
  { valor: "operador", etiqueta: "Operador" },
  { valor: "lectura", etiqueta: "Solo lectura" },
];

const CLASE_ROL: Record<Rol, string> = {
  admin: "bg-primary text-primary-foreground",
  operador: "bg-secondary text-secondary-foreground",
  lectura: "bg-muted text-muted-foreground",
};

function Usuarios() {
  const queryClient = useQueryClient();
  const { data: usuarios, isLoading, isError, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: api.usuarios.listar,
  });

  const [nuevo, setNuevo] = useState({
    username: "",
    password: "",
    nombre_completo: "",
    rol: "operador" as Rol,
  });
  const [creando, setCreando] = useState(false);

  const { data: yo } = useQuery({ queryKey: ["auth", "yo"], queryFn: api.auth.yo });

  async function crearUsuario(evento: FormEvent) {
    evento.preventDefault();
    if (!nuevo.username.trim() || nuevo.password.length < 8) {
      toast.error("Usuario obligatorio y contraseña de al menos 8 caracteres");
      return;
    }
    setCreando(true);
    try {
      await api.usuarios.crear({
        username: nuevo.username.trim(),
        password: nuevo.password,
        nombre_completo: nuevo.nombre_completo.trim() || undefined,
        rol: nuevo.rol,
      });
      toast.success(`Usuario ${nuevo.username} creado`);
      setNuevo({ username: "", password: "", nombre_completo: "", rol: "operador" });
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    } catch (err) {
      toast.error(esApiError(err) ? err.message : "No se pudo crear el usuario");
    } finally {
      setCreando(false);
    }
  }

  async function cambiarRol(usuario: Usuario, rol: Rol) {
    try {
      await api.usuarios.actualizar(usuario.id, { rol });
      toast.success(`Rol de ${usuario.username} actualizado`);
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    } catch (err) {
      toast.error(esApiError(err) ? err.message : "No se pudo actualizar el rol");
    }
  }

  async function cambiarActivo(usuario: Usuario, activo: boolean) {
    try {
      await api.usuarios.actualizar(usuario.id, { activo });
      toast.success(activo ? `${usuario.username} activado` : `${usuario.username} desactivado`);
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    } catch (err) {
      toast.error(esApiError(err) ? err.message : "No se pudo actualizar el usuario");
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión de personal autorizado.</p>
        </div>
        <p className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-sm text-critical">
          {esApiError(error) ? error.message : "No se pudo cargar la lista de usuarios."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personal autorizado para ingresar al sistema. Solo administradores pueden gestionar cuentas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario</CardTitle>
          <CardDescription>Cree una cuenta para un miembro del equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={crearUsuario} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nuevo-username">Usuario</Label>
              <Input
                id="nuevo-username"
                value={nuevo.username}
                onChange={(e) => setNuevo((s) => ({ ...s, username: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nuevo-nombre">Nombre completo</Label>
              <Input
                id="nuevo-nombre"
                value={nuevo.nombre_completo}
                onChange={(e) => setNuevo((s) => ({ ...s, nombre_completo: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nuevo-password">Contraseña</Label>
              <Input
                id="nuevo-password"
                type="password"
                autoComplete="new-password"
                value={nuevo.password}
                onChange={(e) => setNuevo((s) => ({ ...s, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Rol</Label>
              <Select value={nuevo.rol} onValueChange={(v) => setNuevo((s) => ({ ...s, rol: v as Rol }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.valor} value={r.valor}>
                      {r.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={creando}>
                <UserPlus className="size-4" />
                {creando ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas registradas</CardTitle>
          <CardDescription>Active, desactive o cambie el rol de cada persona.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Activo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.username}
                      {yo?.id === u.id && (
                        <Badge variant="outline" className="ml-2">
                          usted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{u.nombre_completo ?? "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={u.rol}
                        onValueChange={(v) => void cambiarRol(u, v as Rol)}
                        disabled={yo?.id === u.id}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue>
                            <Badge className={CLASE_ROL[u.rol]}>
                              {ROLES.find((r) => r.valor === u.rol)?.etiqueta ?? u.rol}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.valor} value={r.valor}>
                              {r.etiqueta}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.activo}
                        onCheckedChange={(v) => void cambiarActivo(u, v)}
                        disabled={yo?.id === u.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {usuarios?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Sin usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
