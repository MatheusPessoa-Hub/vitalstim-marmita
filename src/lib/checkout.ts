/**
 * Sales configuration for the VitalStim landing page.
 * Change the checkout link or the Meta Pixel ID here — every buy button reads from this file.
 */
export const CHECKOUT_URL = "https://wa.me/message/SE6FO5MPL7BWM1";

/** Meta Pixel ID. Leave empty to keep the pixel off. */
export const META_PIXEL_ID = "";

export const PRECO = 17.90;
export const PRECO_TEXTO = "R$ 17,90";
export const GARANTIA_DIAS = 7;

/** Link sent on WhatsApp after the Pix is confirmed. */
export const APP_URL = "https://marmita-vitalstim.lovable.app";

/** Campaign params carried from the landing URL to the checkout link. */
const PARAMS_RASTREIO = /^(utm_[a-z]+|fbclid|gclid|ttclid|src|sck)$/i;

export function montarLinkCheckout(base: string, buscaAtual: string): string {
  const url = new URL(base);
  const atuais = new URLSearchParams(buscaAtual);
  atuais.forEach((valor, chave) => {
    if (PARAMS_RASTREIO.test(chave) && valor && !url.searchParams.has(chave)) {
      url.searchParams.set(chave, valor);
    }
  });
  return url.toString();
}
