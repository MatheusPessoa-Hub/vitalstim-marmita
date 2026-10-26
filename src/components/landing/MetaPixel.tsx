import { useEffect } from "react";
import { META_PIXEL_ID, PRECO } from "@/lib/checkout";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function chamar(...args: unknown[]) {
  const f = window.fbq;
  if (!f) return;
  if (f.callMethod) f.callMethod.apply(f, args);
  else f.queue?.push(args);
}

/** Loads the Meta Pixel only when an ID is configured in src/lib/checkout.ts. */
export function MetaPixel() {
  useEffect(() => {
    if (!META_PIXEL_ID || window.fbq) return;
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod.apply(n, args);
      else n.queue!.push(args);
    } as Fbq;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
    window._fbq = n;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    chamar("init", META_PIXEL_ID, {}, { agent: "lovable" });
    chamar("track", "PageView");
  }, []);
  return null;
}

export function rastrearCheckout() {
  if (!META_PIXEL_ID) return;
  const eventID = `ic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  chamar("track", "InitiateCheckout", { value: PRECO, currency: "BRL" }, { eventID });
}
