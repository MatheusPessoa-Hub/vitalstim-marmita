import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, LineChart, List } from "lucide-react";
import { useState } from "react";
import { CatalogoMarmitas } from "@/components/vitalstim/CatalogoMarmitas";
import { ComprasTab } from "@/components/vitalstim/ComprasTab";
import { Logo } from "@/components/vitalstim/Logo";
import { SemanaTab } from "@/components/vitalstim/SemanaTab";
import { Toaster } from "@/components/ui/sonner";
import { usePlanner } from "@/hooks/use-planner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "VitalStim · Planejador de marmitas da semana" },
      {
        name: "description",
        content: "Escolha almoço e jantar de cada dia entre 101 marmitas e gere a lista de compras da semana.",
      },
      { property: "og:title", content: "VitalStim · Planejador de marmitas" },
      {
        property: "og:description",
        content: "Monte o cardápio da semana e gere a lista de compras automaticamente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#264D3F" },
    ],
    links: [{ rel: "manifest", href: "/manifest.webmanifest" }],
  }),
  component: AppPage,
});

type Aba = "semana" | "marmitas" | "compras";

const ABAS: { id: Aba; rotulo: string; Icone: typeof CalendarDays }[] = [
  { id: "semana", rotulo: "Semana", Icone: CalendarDays },
  { id: "marmitas", rotulo: "Marmitas", Icone: LineChart },
  { id: "compras", rotulo: "Compras", Icone: List },
];

function AppPage() {
  const planner = usePlanner();
  const [aba, setAba] = useState<Aba>("semana");
  const [hoje] = useState(() => new Date());

  const irPara = (a: Aba) => {
    setAba(a);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-xl items-center px-5">
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 pb-32 pt-24">
        {!planner.pronto ? null : aba === "semana" ? (
          <SemanaTab planner={planner} hoje={hoje} />
        ) : aba === "marmitas" ? (
          <div className="flex flex-col gap-5">
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cardápio</p>
              <h1 className="mt-2 text-[34px] leading-[1.05] text-primary">Todas as marmitas.</h1>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Veja os pratos, os pesos e as calorias estimadas de cada porção.
              </p>
            </section>
            <CatalogoMarmitas />
          </div>
        ) : (
          <ComprasTab planner={planner} hoje={hoje} onIrParaSemana={() => irPara("semana")} />
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        aria-label="Navegação principal"
      >
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 p-2">
          {ABAS.map(({ id, rotulo, Icone }) => (
            <button
              key={id}
              type="button"
              onClick={() => irPara(id)}
              aria-current={aba === id ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2.5 text-xs font-semibold transition-colors",
                aba === id ? "bg-secondary text-primary" : "text-muted-foreground",
              )}
            >
              <Icone className="size-5" />
              {rotulo}
            </button>
          ))}
        </div>
      </nav>
      <Toaster position="top-center" />
    </div>
  );
}
