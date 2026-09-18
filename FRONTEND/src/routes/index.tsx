import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  ClipboardList,
  Database,
  Download,
  Gauge,
  ListChecks,
  Menu,
  ShieldCheck,
  Sprout,
  TrendingDown,
  X,
} from "lucide-react";
import heroGanaderia from "@/assets/hero-ganaderia.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Olinda Alerta Reproductiva | Riesgo reproductivo bovino" },
      {
        name: "description",
        content:
          "Centralice los registros reproductivos de sus vacas, identifique animales con riesgo de superar 14 meses entre partos y tome decisiones oportunas basadas en datos.",
      },
      { property: "og:title", content: "Olinda Alerta Reproductiva" },
      {
        property: "og:description",
        content:
          "Alertas tempranas del riesgo reproductivo en ganado bovino a partir de los registros de la Ganadería Olinda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const enlaces = [
  { href: "#inicio", texto: "Inicio" },
  { href: "#beneficios", texto: "Beneficios" },
  { href: "#funcionamiento", texto: "Funcionamiento" },
];

const beneficios = [
  {
    icono: BellRing,
    titulo: "Detección temprana",
    texto:
      "Identifique las vacas que se acercan al límite de 14 meses antes de que el intervalo se prolongue.",
  },
  {
    icono: ListChecks,
    titulo: "Priorización de animales",
    texto:
      "Ordene el hato por nivel de riesgo y concentre el trabajo en los animales que más lo necesitan.",
  },
  {
    icono: Database,
    titulo: "Información centralizada",
    texto:
      "Un solo lugar para fechas de parto, servicios, condición corporal, salud y antecedentes.",
  },
  {
    icono: Gauge,
    titulo: "Decisiones basadas en datos",
    texto:
      "Cada alerta muestra el puntaje, los factores que lo aumentaron y los umbrales aplicados.",
  },
  {
    icono: ClipboardList,
    titulo: "Seguimiento reproductivo",
    texto:
      "Registre acciones, responsables, resultados y próximas revisiones para cada animal.",
  },
  {
    icono: Download,
    titulo: "Reportes descargables",
    texto: "Exporte el inventario y los resultados en CSV para informes y análisis externos.",
  },
];

const pasos = [
  {
    numero: "01",
    titulo: "Registrar o importar información",
    texto:
      "Cargue las vacas una a una o importe los registros históricos desde un archivo CSV con la plantilla del sistema.",
  },
  {
    numero: "02",
    titulo: "Validar y preparar los datos",
    texto:
      "El sistema revisa identificaciones duplicadas, valores faltantes y datos fuera de rango antes de guardar.",
  },
  {
    numero: "03",
    titulo: "Evaluar el riesgo reproductivo",
    texto:
      "Reglas transparentes y configurables asignan un puntaje de 0 a 100 y un nivel: bajo, medio, alto o crítico.",
  },
  {
    numero: "04",
    titulo: "Priorizar el seguimiento del animal",
    texto:
      "Se genera un listado priorizado con la recomendación correspondiente a cada nivel de riesgo.",
  },
];

const niveles = [
  { nombre: "Bajo", rango: "0 a 24", clase: "bg-success text-success-foreground" },
  { nombre: "Medio", rango: "25 a 49", clase: "bg-secondary text-secondary-foreground" },
  { nombre: "Alto", rango: "50 a 74", clase: "bg-warning text-warning-foreground" },
  { nombre: "Crítico", rango: "75 a 100", clase: "bg-critical text-critical-foreground" },
];

function Landing() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="#inicio" className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <span className="grid size-9 place-items-center rounded-lg gradiente-campo">
              <Sprout aria-hidden="true" className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-base font-semibold leading-tight sm:text-lg">
              Olinda Alerta Reproductiva
            </span>
          </a>

          <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
            {enlaces.map((e) => (
              <a
                key={e.href}
                href={e.href}
                className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {e.texto}
              </a>
            ))}
            <Link
              to="/ingresar"
              className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ingresar
            </Link>
            <Link
              to="/ingresar"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-(--shadow-soft) transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ingresar al sistema
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="grid size-10 place-items-center rounded-lg border border-border text-foreground md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {menuAbierto ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>

        {menuAbierto && (
          <nav aria-label="Navegación móvil" className="border-t border-border bg-background px-5 py-3 md:hidden">
            <ul className="flex flex-col gap-1">
              {enlaces.map((e) => (
                <li key={e.href}>
                  <a
                    href={e.href}
                    onClick={() => setMenuAbierto(false)}
                    className="block rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {e.texto}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/ingresar"
                  onClick={() => setMenuAbierto(false)}
                  className="mt-1 block rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Ingresar al sistema
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main>
        {/* Sección principal */}
        <section id="inicio" className="gradiente-beige">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                <CalendarClock aria-hidden="true" className="size-3.5" />
                Intervalo esperado: 12 a 14 meses
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Anticipe el riesgo reproductivo de su ganado
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Centralice los registros de sus vacas, identifique los animales que requieren
                seguimiento y tome decisiones oportunas mediante alertas basadas en datos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/ingresar"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-(--shadow-raised) transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Ver dashboard
                </Link>
                <a
                  href="#funcionamiento"
                  className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Conocer cómo funciona
                </a>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
                {niveles.map((n) => (
                  <div key={n.nombre} className="rounded-lg border border-border bg-card p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {n.nombre}
                    </dt>
                    <dd className="mt-2 flex items-center gap-2 text-sm font-semibold">
                      <span aria-hidden="true" className={`size-2.5 rounded-full ${n.clase}`} />
                      {n.rango}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Puntaje de riesgo en escala de 0 a 100 puntos.
              </p>
            </div>

            <div className="relative">
              <img
                src={heroGanaderia}
                width={1600}
                height={1104}
                alt="Vacas pastando en potrero con indicadores de salud y alertas superpuestos"
                className="w-full rounded-2xl border border-border object-cover shadow-(--shadow-raised)"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4 shadow-(--shadow-soft)">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Umbral crítico
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-critical">14 meses</p>
                  <p className="text-xs text-muted-foreground">entre partos</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-(--shadow-soft)">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Inicio de advertencia
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-warning">12 meses</p>
                  <p className="text-xs text-muted-foreground">desde el último parto</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problema */}
        <section id="problema" className="border-y border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">El costo de un intervalo prolongado</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Una vaca con intervalos reproductivos prolongados sigue generando gastos de
                alimentación, manejo y cuidado, pero no está aportando la producción reproductiva
                esperada. En los registros de la Ganadería Olinda se observan intervalos de 14, 16,
                18 y hasta más de 20 meses entre partos.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                El problema es que la dificultad suele detectarse cuando el animal ya superó el
                tiempo esperado. Analizar la información histórica permite anticipar cuáles vacas
                tienen mayor riesgo de superar los 14 meses.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
                <CalendarClock aria-hidden="true" className="size-4" />
                Intervalo reproductivo esperado: entre 12 y 14 meses
              </p>
            </div>
            <ul className="grid gap-4">
              <li className="rounded-xl border border-border bg-background p-5">
                <TrendingDown aria-hidden="true" className="size-6 text-critical" />
                <h3 className="mt-3 text-base font-semibold">Costos sin retorno</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cada mes adicional sin cría mantiene los gastos del animal sin la producción esperada.
                </p>
              </li>
              <li className="rounded-xl border border-border bg-background p-5">
                <AlertTriangle aria-hidden="true" className="size-6 text-warning" />
                <h3 className="mt-3 text-base font-semibold">Detección tardía</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sin análisis histórico, el problema se identifica cuando el intervalo ya se superó.
                </p>
              </li>
              <li className="rounded-xl border border-border bg-background p-5">
                <Database aria-hidden="true" className="size-6 text-secondary" />
                <h3 className="mt-3 text-base font-semibold">Registros dispersos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Partos, servicios y condición corporal quedan en cuadernos o archivos separados.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* Beneficios */}
        <section id="beneficios" className="bg-background">
          <div className="mx-auto w-full max-w-6xl px-5 py-14 lg:py-20">
            <h2 className="text-3xl font-bold tracking-tight">Beneficios</h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Lo que la herramienta aporta al manejo reproductivo diario del hato.
            </p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {beneficios.map(({ icono: Icono, titulo, texto }) => (
                <li
                  key={titulo}
                  className="rounded-xl border border-border bg-card p-6 shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-raised)"
                >
                  <span className="grid size-11 place-items-center rounded-lg bg-accent">
                    <Icono aria-hidden="true" className="size-5 text-accent-foreground" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Funcionamiento */}
        <section id="funcionamiento" className="gradiente-campo text-primary-foreground">
          <div className="mx-auto w-full max-w-6xl px-5 py-14 lg:py-20">
            <h2 className="text-3xl font-bold tracking-tight">Cómo funciona</h2>
            <p className="mt-3 max-w-2xl text-base text-primary-foreground/80">
              Cuatro pasos, desde el registro del animal hasta la priorización del seguimiento.
            </p>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pasos.map((p) => (
                <li
                  key={p.numero}
                  className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-6"
                >
                  <span className="font-display text-3xl font-bold text-primary-foreground/70">
                    {p.numero}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{p.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">{p.texto}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <Link
                to="/ingresar"
                className="inline-flex items-center justify-center rounded-lg bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Ingresar al sistema
              </Link>
            </div>
          </div>
        </section>

        {/* Advertencia */}
        <section className="bg-background">
          <div className="mx-auto w-full max-w-4xl px-5 py-12">
            <div className="flex gap-4 rounded-xl border border-warning/50 bg-warning/15 p-6">
              <ShieldCheck aria-hidden="true" className="size-6 shrink-0 text-warning-foreground" />
              <p className="text-sm leading-relaxed text-warning-foreground">
                Las alertas constituyen una herramienta de apoyo para la toma de decisiones y no
                reemplazan la valoración de un médico veterinario o profesional responsable del
                manejo reproductivo.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Proyecto académico de analítica de datos aplicado a la Ganadería Olinda
          </p>
          <nav aria-label="Enlaces del pie de página" className="flex flex-wrap gap-4">
            {enlaces.map((e) => (
              <a key={e.href} href={e.href} className="text-sm text-muted-foreground hover:text-primary">
                {e.texto}
              </a>
            ))}
            <Link to="/ingresar" className="text-sm text-muted-foreground hover:text-primary">
              Ingresar
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
