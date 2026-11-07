import { describe, expect, it } from "vitest";
import { cpfValido, proximoPasso } from "@/lib/vendas/fluxo";

describe("fluxo de venda no WhatsApp", () => {
  it("valida CPF pelos dígitos verificadores", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224724")).toBe(false);
    expect(cpfValido("11111111111")).toBe(false);
  });

  it("Quero comprar → nome → CPF → gera Pix", () => {
    const a = proximoPasso("menu", { botaoId: "comprar" });
    expect(a.estado).toBe("pedir_nome");
    const b = proximoPasso(a.estado, { texto: "Maria Souza" });
    expect(b).toMatchObject({ estado: "pedir_cpf", nome: "Maria Souza" });
    const c = proximoPasso(b.estado, { texto: "52998224725" });
    expect(c.estado).toBe("aguardando_pix");
    expect(c.acoes).toEqual([{ tipo: "gerar_pix" }]);
  });

  it("CPF inválido não gera Pix", () => {
    const r = proximoPasso("pedir_cpf", { texto: "123" });
    expect(r.estado).toBe("pedir_cpf");
    expect(r.acoes.some((x) => x.tipo === "gerar_pix")).toBe(false);
  });
});
