import { describe, expect, it } from "vitest";
import { CHECKOUT_URL, PRECO, montarLinkCheckout } from "@/lib/checkout";

describe("checkout", () => {
  it("costs R$ 39,99 one time", () => {
    expect(PRECO).toBe(39.99);
  });

  it("keeps UTM params from the page on the checkout link", () => {
    const link = montarLinkCheckout(CHECKOUT_URL, "?utm_source=instagram&utm_campaign=lancamento&x=1");
    const url = new URL(link);
    expect(url.origin + url.pathname).toBe("https://wa.me/message/SE6FO5MPL7BWM1");
    expect(url.searchParams.get("utm_source")).toBe("instagram");
    expect(url.searchParams.get("utm_campaign")).toBe("lancamento");
    expect(url.searchParams.has("x")).toBe(false);
  });

  it("leaves the link untouched without campaign params", () => {
    expect(montarLinkCheckout(CHECKOUT_URL, "")).toBe("https://wa.me/message/SE6FO5MPL7BWM1");
  });
});
