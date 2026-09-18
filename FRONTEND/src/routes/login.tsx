import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Sprout } from "lucide-react";

import { api, esApiError } from "@/lib/api";
import { guardarToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Ingresar | Olinda Alerta Reproductiva" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const resultado = await api.auth.login(username.trim(), password);
      guardarToken(resultado.access_token);
      await navigate({ to: "/ingresar" });
    } catch (err) {
      setError(esApiError(err) ? err.message : "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-(--shadow-soft)">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="grid size-11 place-items-center rounded-lg gradiente-campo">
            <Sprout aria-hidden="true" className="size-5 text-primary-foreground" />
          </span>
          <h1 className="text-xl font-bold tracking-tight">Acceso al sistema</h1>
          <p className="text-sm text-muted-foreground">
            Solo personal autorizado de la Ganadería Olinda.
          </p>
        </div>

        <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md border border-critical/40 bg-critical/10 p-2.5 text-sm text-critical">
              {error}
            </p>
          )}

          <Button type="submit" disabled={cargando} className="mt-1">
            {cargando ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-primary"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
