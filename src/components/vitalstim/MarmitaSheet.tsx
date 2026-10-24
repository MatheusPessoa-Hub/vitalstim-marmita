import { X } from "lucide-react";
import { useEffect } from "react";
import type { Marmita } from "@/lib/marmitas";
import { CatalogoMarmitas } from "./CatalogoMarmitas";

interface Props {
  aberto: boolean;
  contexto: string;
  onFechar: () => void;
  onEscolher: (m: Marmita) => void;
}

/** Bottom sheet: "Qual marmita você quer?" */
export function MarmitaSheet({ aberto, contexto, onFechar, onEscolher }: Props) {
  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-titulo"
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-[28px] bg-background shadow-[var(--shadow-lift)] animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 pb-4 pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {contexto}
            </p>
            <h2 id="sheet-titulo" className="mt-1 text-[26px] leading-tight text-primary">
              Qual marmita você quer?
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-4">
          <CatalogoMarmitas onEscolher={onEscolher} />
        </div>
      </div>
    </div>
  );
}
