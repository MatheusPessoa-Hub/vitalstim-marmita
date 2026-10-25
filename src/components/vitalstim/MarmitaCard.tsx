import { imagemDe, type Marmita } from "@/lib/marmitas";

interface Props {
  marmita: Marmita;
  onEscolher?: ((m: Marmita) => void) | undefined;
  rotuloBotao?: string | undefined;
}

export function MarmitaCard({ marmita, onEscolher, rotuloBotao = "Escolher este prato" }: Props) {
  const src = imagemDe(marmita);
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] bg-card shadow-[var(--shadow-soft)]">
      <div className="aspect-[4/3] w-full bg-muted">
        {src ? (
          <img
            src={src}
            alt={marmita.nome}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {marmita.categoria}
        </span>
        <h3 className="font-sans text-sm font-semibold leading-snug text-foreground">{marmita.nome}</h3>
        <p className="text-xs text-muted-foreground">
          {marmita.gramas} g · {marmita.kcal} kcal (estim.)
        </p>
        {onEscolher ? (
          <button
            type="button"
            onClick={() => onEscolher(marmita)}
            className="mt-auto w-full rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {rotuloBotao}
          </button>
        ) : null}
      </div>
    </article>
  );
}
