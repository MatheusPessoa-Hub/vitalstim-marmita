import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIAS, filtrarMarmitas, MARMITAS, type Categoria, type Marmita } from "@/lib/marmitas";
import { cn } from "@/lib/utils";
import { MarmitaCard } from "./MarmitaCard";

interface Props {
  onEscolher?: (m: Marmita) => void;
  rotuloBotao?: string;
}

export function CatalogoMarmitas({ onEscolher, rotuloBotao }: Props) {
  const [filtro, setFiltro] = useState<Categoria | "Todas">("Todas");
  const [busca, setBusca] = useState("");
  const lista = useMemo(() => filtrarMarmitas(filtro, busca), [filtro, busca]);

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar uma marmita..."
          aria-label="Buscar uma marmita"
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1" role="tablist" aria-label="Filtros">
        {(["Todas", ...CATEGORIAS] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={filtro === c}
            onClick={() => setFiltro(c)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filtro === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {MARMITAS.length} opções para escolher, com filtro vegetariano e vegano.
      </p>

      {lista.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhuma marmita encontrada para “{busca}”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {lista.map((m) => (
            <MarmitaCard key={m.id} marmita={m} onEscolher={onEscolher} rotuloBotao={rotuloBotao} />
          ))}
        </div>
      )}
    </div>
  );
}
