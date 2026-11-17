import { describe, expect, it } from "vitest";
import { proximoPasso, TEXTOS } from "@/lib/vendas/fluxo";

describe("fluxo de venda no WhatsApp", () => {
  it("Quero comprar gera o Pix diretamente, sem pedir nome ou CPF", () => {
    const a = proximoPasso("menu", { botaoId: "comprar" });
    expect(a.estado).toBe("aguardando_pix");
    expect(a.acoes).toEqual([{ tipo: "gerar_pix" }]);
  });

  it("Gerar novo Pix também vai direto para a cobrança", () => {
    const a = proximoPasso("aguardando_pix", { botaoId: "novo_pix" });
    expect(a.estado).toBe("aguardando_pix");
    expect(a.acoes).toEqual([{ tipo: "gerar_pix" }]);
  });

  it("usa exatamente a nova saudação solicitada", () => {
    expect(TEXTOS.boasVindas).toBe("Olá! 👋 Aqui é a *VitalStim*, o planejador de marmitas da semana. 🍛\n\nUma semana mais organizada ,saudável e fitness . *Pagamento único de R$ 17,90*, acesso vitalício e *sem mensalidade*.\n\nComo posso te ajudar?");
  });

  it("Conhecer o app envia o vídeo antes dos botões", () => {
    const r = proximoPasso("menu", { botaoId: "conhecer" });
    expect(r.estado).toBe("menu");
    expect(r.acoes[0]).toMatchObject({ tipo: "video" });
    expect(r.acoes[1]).toMatchObject({ tipo: "botoes" });
  });

  it("Já paguei continua acionando a conferência do Pix", () => {
    const r = proximoPasso("aguardando_pix", { botaoId: "ja_paguei" });
    expect(r.acoes).toEqual([{ tipo: "conferir_pix" }]);
  });
});
