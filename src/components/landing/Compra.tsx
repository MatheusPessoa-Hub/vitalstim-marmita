import { ShoppingBag } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CHECKOUT_URL, PRECO_TEXTO, montarLinkCheckout } from "@/lib/checkout";
import { cn } from "@/lib/utils";
import { rastrearCheckout } from "./MetaPixel";

function useLinkCheckout() {
  const [href, setHref] = useState(CHECKOUT_URL);
  useEffect(() => {
    setHref(montarLinkCheckout(CHECKOUT_URL, window.location.search));
  }, []);
  return href;
}

export function LinkCompra({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const href = useLinkCheckout();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={rastrearCheckout}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}

export function BotaoCompra({ className, children = "Quero o app VitalStim" }: { className?: string; children?: ReactNode }) {
  return (
    <LinkCompra
      className={cn(
        "inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 active:translate-y-0",
        className,
      )}
    >
      {children}
    </LinkCompra>
  );
}

/** Sticky buy bar on phones. */
export function BarraCompraCelular() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-serif text-xl font-semibold text-primary">{PRECO_TEXTO}</p>
          <p className="text-xs text-muted-foreground">Pagamento único · sem mensalidade</p>
        </div>
        <BotaoCompra className="min-h-12 px-6 text-sm shadow-none">Quero o app</BotaoCompra>
      </div>
    </div>
  );
}

/** The two floating buy bubbles, in a color used nowhere else on the page. */
export function BolhasCompra() {
  const [mostrarSegunda, setMostrarSegunda] = useState(false);
  useEffect(() => {
    const onScroll = () => setMostrarSegunda(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <LinkCompra
        ariaLabel={`Comprar o VitalStim por ${PRECO_TEXTO}`}
        className="animate-bubble fixed bottom-28 right-4 z-50 flex size-[76px] flex-col items-center justify-center rounded-full bg-bubble text-bubble-foreground transition-transform hover:scale-105 md:bottom-8 md:right-8 md:size-[88px]"
      >
        <ShoppingBag className="size-6" aria-hidden="true" />
        <span className="mt-0.5 text-[11px] font-bold leading-none">{PRECO_TEXTO}</span>
      </LinkCompra>

      <LinkCompra
        ariaLabel="Comprar agora, sem mensalidade"
        className={cn(
          "animate-bubble fixed bottom-28 left-4 z-50 flex size-[64px] flex-col items-center justify-center rounded-full bg-bubble text-center text-bubble-foreground transition-all duration-300 md:bottom-auto md:left-6 md:top-1/2 md:size-[76px] md:-translate-y-1/2",
          mostrarSegunda ? "opacity-100" : "pointer-events-none -translate-x-24 opacity-0",
        )}
      >
        <span className="text-[11px] font-bold uppercase leading-tight tracking-wide">
          Comprar
          <br />
          agora
        </span>
      </LinkCompra>
    </>
  );
}
