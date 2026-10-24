import { Moon, Sun, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { usePlanner } from "@/hooks/use-planner";
import { getMarmita, imagemDe, type Marmita } from "@/lib/marmitas";
import {
  contarMarmitas,
  ddmm,
  DIAS_CURTOS,
  DIAS_LONGOS,
  diaVazio,
  diasDaSemana,
  isoDate,
  type Refeicao,
} from "@/lib/planner";
import { cn } from "@/lib/utils";
import { MarmitaSheet } from "./MarmitaSheet";

type Planner = ReturnType<typeof usePlanner>;

export function SemanaTab({ planner, hoje }: { planner: Planner; hoje: Date }) {
  const dias = useMemo(() => diasDaSemana(hoje, planner.fimDeSemana), [hoje, planner.fimDeSemana]);
  const datas = useMemo(() => dias.map(isoDate), [dias]);
  const [ativo, setAtivo] = useState<string>(() => {
    const iso = isoDate(hoje);
    const semana = diasDaSemana(hoje, false).map(isoDate);
    return semana.includes(iso) ? iso : semana[0];
  });
  const ativoValido = datas.includes(ativo) ? ativo : datas[0];
  const dataAtiva = dias[datas.indexOf(ativoValido)];
  const diaPlano = planner.plano[ativoValido] ?? diaVazio();
  const total = contarMarmitas(planner.plano, datas);

  const [sheet, setSheet] = useState<Refeicao | null>(null);
  const fechar = useCallback(() => setSheet(null), []);
  const escolher = useCallback(
    (m: Marmita) => {
      if (sheet) planner.escolher(ativoValido, sheet, m.id);
      setSheet(null);
    },
    [sheet, planner, ativoValido],
  );

  return (
    <div className="flex flex-col gap-7">
      <section className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Seu planejamento
          </p>
          <h1 className="mt-2 text-[38px] leading-[1.05] text-primary">Uma semana mais leve.</h1>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
            Escolha o dia, o almoço e o jantar. Depois, gere a lista de compras.
          </p>
        </div>
        <div
          className="flex w-28 shrink-0 flex-col items-center rounded-[20px] border border-border bg-secondary px-3 py-4 text-center"
          aria-live="polite"
        >
          <span className="font-serif text-3xl font-semibold text-primary" data-testid="contador">
            {total}
          </span>
          <span className="text-xs leading-tight text-muted-foreground">
            {total === 1 ? "marmita planejada" : "marmitas planejadas"}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl text-foreground">Escolha o dia</h2>
          <button
            type="button"
            onClick={() => planner.setFimDeSemana(!planner.fimDeSemana)}
            className="text-sm font-semibold text-primary"
          >
            {planner.fimDeSemana ? "− Tirar fim de semana" : "+ Incluir fim de semana"}
          </button>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {dias.map((d, i) => {
            const iso = datas[i];
            const sel = iso === ativoValido;
            const temAlgo = !!(planner.plano[iso]?.almoco.marmitaId || planner.plano[iso]?.jantar.marmitaId);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setAtivo(iso)}
                aria-pressed={sel}
                className={cn(
                  "relative flex w-[76px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border py-3 transition-colors",
                  sel
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary",
                )}
              >
                <span className={cn("text-xs tracking-wide", sel ? "opacity-80" : "text-muted-foreground")}>
                  {DIAS_CURTOS[d.getDay()]}
                </span>
                <span className="text-[15px] font-semibold">{ddmm(d)}</span>
                <span className={cn("text-xs", sel ? "opacity-80" : "text-muted-foreground")}>
                  {temAlgo ? "Planejado" : "Escolher"}
                </span>
                {temAlgo && !sel ? (
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl text-foreground">{DIAS_LONGOS[dataAtiva.getDay()]}</h2>
            <p className="text-sm text-muted-foreground">{ddmm(dataAtiva)} · suas refeições</p>
          </div>
          <span className="text-sm text-muted-foreground">Escolha e avance</span>
        </div>

        {(["almoco", "jantar"] as Refeicao[]).map((r) => (
          <RefeicaoCard
            key={r}
            refeicao={r}
            marmitaId={diaPlano[r].marmitaId}
            porcoes={diaPlano[r].porcoes}
            onMais={() => planner.mudarPorcoes(ativoValido, r, 1)}
            onMenos={() => planner.mudarPorcoes(ativoValido, r, -1)}
            onAbrir={() => setSheet(r)}
            onRemover={() => planner.escolher(ativoValido, r, null)}
          />
        ))}
      </section>

      <MarmitaSheet
        aberto={sheet !== null}
        contexto={`${DIAS_LONGOS[dataAtiva.getDay()]} · ${sheet === "jantar" ? "Jantar" : "Almoço"}`}
        onFechar={fechar}
        onEscolher={escolher}
      />
    </div>
  );
}

interface RefeicaoProps {
  refeicao: Refeicao;
  marmitaId: string | null;
  porcoes: number;
  onMais: () => void;
  onMenos: () => void;
  onAbrir: () => void;
  onRemover: () => void;
}

function RefeicaoCard({ refeicao, marmitaId, porcoes, onMais, onMenos, onAbrir, onRemover }: RefeicaoProps) {
  const titulo = refeicao === "almoco" ? "Almoço" : "Jantar";
  const Icone = refeicao === "almoco" ? Sun : Moon;
  const m = marmitaId ? getMarmita(marmitaId) : undefined;
  const src = m ? imagemDe(m) : undefined;

  return (
    <article
      className="rounded-[20px] border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
      aria-label={titulo}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icone className="size-5" />
          </span>
          <h3 className="font-sans text-lg font-semibold text-foreground">{titulo}</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-1" aria-label="Porções">
          <button
            type="button"
            onClick={onMenos}
            disabled={porcoes <= 1}
            aria-label={`Menos porções de ${titulo.toLowerCase()}`}
            className="flex size-8 items-center justify-center rounded-full text-lg text-foreground disabled:text-muted-foreground"
          >
            −
          </button>
          <span className="w-6 text-center font-semibold" aria-live="polite">
            {porcoes}
          </span>
          <button
            type="button"
            onClick={onMais}
            aria-label={`Mais porções de ${titulo.toLowerCase()}`}
            className="flex size-8 items-center justify-center rounded-full bg-card text-lg font-semibold text-foreground shadow-sm"
          >
            +
          </button>
        </div>
      </header>

      {m ? (
        <div className="mt-4 flex gap-3 rounded-2xl bg-muted p-2">
          {src ? (
            <img src={src} alt={m.nome} width={1024} height={768} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <span className="w-fit rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {m.categoria}
            </span>
            <p className="text-sm font-semibold leading-snug text-foreground">{m.nome}</p>
            <p className="text-xs text-muted-foreground">
              {m.gramas} g · {m.kcal} kcal (estim.) · {porcoes} {porcoes === 1 ? "porção" : "porções"}
            </p>
          </div>
          <div className="flex flex-col items-end justify-between">
            <button
              type="button"
              onClick={onRemover}
              aria-label="Remover marmita"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <button type="button" onClick={onAbrir} className="px-1 text-xs font-semibold text-primary">
              Trocar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-4 py-8">
          <p className="text-[15px] text-muted-foreground">
            O que vai ter no {refeicao === "almoco" ? "almoço" : "jantar"}?
          </p>
          <button
            type="button"
            onClick={onAbrir}
            className="rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
          >
            + Escolher marmita
          </button>
        </div>
      )}
    </article>
  );
}
