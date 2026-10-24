import { Check, Copy, Share2, ShoppingBasket } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { usePlanner } from "@/hooks/use-planner";
import { SECOES } from "@/lib/marmitas";
import {
  contarMarmitas,
  diasDaSemana,
  formatarQuantidade,
  gerarLista,
  isoDate,
  listaComoTexto,
  type ItemCompra,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type Planner = ReturnType<typeof usePlanner>;

export function ComprasTab({ planner, hoje, onIrParaSemana }: { planner: Planner; hoje: Date; onIrParaSemana: () => void }) {
  const datas = useMemo(() => diasDaSemana(hoje, planner.fimDeSemana).map(isoDate), [hoje, planner.fimDeSemana]);
  const total = contarMarmitas(planner.plano, datas);
  const [lista, setLista] = useState<ItemCompra[] | null>(null);

  const gerar = () => {
    const itens = gerarLista(planner.plano, datas);
    setLista(itens);
    planner.limparMarcados();
    if (!itens.length) toast("Planeje pelo menos uma marmita na aba Semana.");
  };

  const texto = lista ? listaComoTexto(lista) : "";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Lista copiada!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const compartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Lista de compras", text: texto });
      } catch {
        /* cancelado */
      }
    } else {
      copiar();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Compras</p>
        <h1 className="mt-2 text-[34px] leading-[1.05] text-primary">Sua lista da semana.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Somamos os ingredientes de todas as marmitas planejadas, já multiplicados pelas porções.
        </p>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-secondary p-4">
        <div>
          <p className="font-serif text-2xl font-semibold text-primary">{total}</p>
          <p className="text-xs text-muted-foreground">
            {total === 1 ? "marmita planejada" : "marmitas planejadas"} nesta semana
          </p>
        </div>
        <button
          type="button"
          onClick={gerar}
          disabled={total === 0}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-50"
        >
          Gerar lista de compras
        </button>
      </div>

      {total === 0 && !lista?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border px-6 py-10 text-center">
          <ShoppingBasket className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Ainda não há marmitas na sua semana.</p>
          <button type="button" onClick={onIrParaSemana} className="text-sm font-semibold text-primary">
            Planejar a semana →
          </button>
        </div>
      ) : null}

      {lista && lista.length > 0 ? (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={compartilhar}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              <Share2 className="size-4" /> Compartilhar
            </button>
            <button
              type="button"
              onClick={copiar}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              <Copy className="size-4" /> Copiar
            </button>
          </div>

          {SECOES.map((secao) => {
            const itens = lista.filter((i) => i.secao === secao);
            if (!itens.length) return null;
            return (
              <section key={secao} className="rounded-[20px] bg-card p-4 shadow-[var(--shadow-soft)]" aria-label={secao}>
                <h2 className="mb-2 text-xl text-foreground">{secao}</h2>
                <ul className="divide-y divide-border">
                  {itens.map((i) => {
                    const marcado = planner.marcados.includes(i.chave);
                    return (
                      <li key={i.chave}>
                        <label className="flex cursor-pointer items-center gap-3 py-3">
                          <input
                            type="checkbox"
                            checked={marcado}
                            onChange={() => planner.alternarMarcado(i.chave)}
                            className="peer sr-only"
                          />
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                              marcado ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                            )}
                          >
                            {marcado ? <Check className="size-4" /> : null}
                          </span>
                          <span className={cn("flex-1 text-[15px]", marcado && "text-muted-foreground line-through")}>
                            {i.nome}, {formatarQuantidade(i.total, i.unidade)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          <p className="text-center text-xs text-muted-foreground">
            Quantidades para comprar cruas, somando todas as porções. Calorias e pesos são estimativas.
          </p>
        </>
      ) : null}
    </div>
  );
}
