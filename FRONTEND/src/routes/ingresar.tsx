import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Cog,
  Database,
  FileUp,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Sprout,
  Users,
  X,
} from "lucide-react";

import { api, type Usuario } from "@/lib/api";
import { borrarToken, obtenerToken } from "@/lib/auth";
import { ChatBot } from "@/components/chat/ChatBot";

export const Route = createFileRoute("/ingresar")({
  head: () => ({
    meta: [
      { title: "Sistema | Olinda Alerta Reproductiva" },
      {
        name: "description",
        content:
          "Sistema interno: inventario de vacas, alertas de riesgo, seguimientos y analítica reproductiva.",
      },
    ],
  }),
  component: IngresarLayout,
});

const modulos = [
  { to: "/ingresar", icono: LayoutDashboard, nombre: "Resumen", exact: true },
  { to: "/ingresar/reproduccion", icono: HeartPulse, nombre: "Reproducción" },
  { to: "/ingresar/vacas", icono: Database, nombre: "Inventario" },
  { to: "/ingresar/alertas", icono: Bell, nombre: "Alertas" },
  { to: "/ingresar/vacas/nueva", icono: PlusCircle, nombre: "Registrar vaca" },
  { to: "/ingresar/importar", icono: FileUp, nombre: "Importar" },
  { to: "/ingresar/seguimientos", icono: ClipboardList, nombre: "Seguimientos" },
  { to: "/ingresar/analitica", icono: BarChart3, nombre: "Analítica" },
  { to: "/ingresar/configuracion", icono: Cog, nombre: "Configuración" },
] as const;

function IngresarLayout() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function verificarSesion() {
      if (!obtenerToken()) {
        await navigate({ to: "/login" });
        return;
      }
      try {
        const datos = await api.auth.yo();
        if (!cancelado) {
          setUsuario(datos);
          setVerificando(false);
        }
      } catch {
        borrarToken();
        await navigate({ to: "/login" });
      }
    }

    void verificarSesion();
    return () => {
      cancelado = true;
    };
  }, [navigate]);

  async function cerrarSesion() {
    borrarToken();
    await navigate({ to: "/login" });
  }

  if (verificando || !usuario) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  const modulosVisibles =
    usuario.rol === "admin"
      ? [...modulos, { to: "/ingresar/usuarios", icono: Users, nombre: "Usuarios" } as const]
      : modulos;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-md">
            <span className="grid size-9 place-items-center rounded-lg gradiente-campo">
              <Sprout aria-hidden="true" className="size-5 text-primary-foreground" />
            </span>
            <span className="hidden font-display text-base font-semibold leading-tight sm:inline">
              Olinda
            </span>
          </Link>

          <nav
            aria-label="Navegación del sistema"
            className="hidden flex-1 flex-wrap items-center justify-end gap-1 lg:flex"
          >
            {modulosVisibles.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                activeOptions={{ exact: "exact" in m && m.exact }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              >
                <m.icono aria-hidden="true" className="size-4" />
                {m.nombre}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold">{usuario.nombre_completo ?? usuario.username}</p>
              <p className="text-xs capitalize text-muted-foreground">{usuario.rol}</p>
            </div>
            <button
              type="button"
              onClick={() => void cerrarSesion()}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut aria-hidden="true" className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="grid size-10 place-items-center rounded-lg border border-border text-foreground lg:hidden"
          >
            {menuAbierto ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>

        {menuAbierto && (
          <nav
            aria-label="Navegación del sistema móvil"
            className="border-t border-border bg-background px-5 py-3 lg:hidden"
          >
            <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-2 py-2">
              <div className="leading-tight">
                <p className="text-sm font-semibold">{usuario.nombre_completo ?? usuario.username}</p>
                <p className="text-xs capitalize text-muted-foreground">{usuario.rol}</p>
              </div>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-critical hover:bg-critical/10"
              >
                <LogOut aria-hidden="true" className="size-4" />
                Salir
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {modulosVisibles.map((m) => (
                <li key={m.to}>
                  <Link
                    to={m.to}
                    activeOptions={{ exact: "exact" in m && m.exact }}
                    onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    activeProps={{ className: "!bg-primary !text-primary-foreground" }}
                  >
                    <m.icono aria-hidden="true" className="size-4" />
                    {m.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8">
        <Outlet />
      </main>

      <ChatBot />
    </div>
  );
}
