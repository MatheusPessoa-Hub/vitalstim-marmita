import { describe, expect, it } from "vitest";
import { CATEGORIAS, MARMITAS } from "@/lib/marmitas";
import { contarMarmitas, diasDaSemana, formatarQuantidade, gerarLista, isoDate, type Plano } from "@/lib/planner";

describe("catálogo", () => {
  it("tem 101 pratos com a distribuição pedida", () => {
    expect(MARMITAS).toHaveLength(101);
    const por = Object.fromEntries(CATEGORIAS.map((c) => [c, MARMITAS.filter((m) => m.categoria === c).length]));
    expect(por).toEqual({ Frango: 20, Carnes: 18, Suínos: 15, Peixes: 16, Vegetarianas: 16, Veganas: 16 });
  });

  it("porções entre 285 e 425 g", () => {
    for (const m of MARMITAS) {
      expect(m.gramas).toBeGreaterThanOrEqual(285);
      expect(m.gramas).toBeLessThanOrEqual(425);
    }
  });

  it("veganas sem ovo nem laticínios; vegetarianas sem carne", () => {
    const animais = /frango|patinho|alcatra|cox[aã]o|m[uú]sculo|su[ií]n|pernil|bisteca|lingui|til[aá]pia|salm[aã]o|merluza|pescada|atum|sardinha|camar[aã]o/i;
    const laticinios = /ovo|queijo|mu[cç]arela|parmes[aã]o|ricota|creme de leite|requeij|leite desnatado|iogurte/i;
    for (const m of MARMITAS.filter((x) => x.categoria === "Vegetarianas" || x.categoria === "Veganas")) {
      for (const i of m.ingredientes) expect(i.nome).not.toMatch(animais);
    }
    for (const m of MARMITAS.filter((x) => x.categoria === "Veganas")) {
      for (const i of m.ingredientes) expect(i.nome).not.toMatch(laticinios);
    }
  });
});

describe("semana", () => {
  it("segunda a sexta da semana atual, e fim de semana opcional", () => {
    const sabado = new Date(2026, 9, 24); // sáb 24/10/2026
    const dias = diasDaSemana(sabado, false).map(isoDate);
    expect(dias).toEqual(["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"]);
    expect(diasDaSemana(sabado, true).map(isoDate).slice(5)).toEqual(["2026-10-24", "2026-10-25"]);
  });
});

describe("lista de compras", () => {
  const m1 = MARMITAS.find((m) => m.id === "m001")!; // estrogonofe de frango: 160 g frango, 60 g arroz
  const plano: Plano = {
    "2026-10-19": { almoco: { marmitaId: "m001", porcoes: 2 }, jantar: { marmitaId: null, porcoes: 1 } },
    "2026-10-20": { almoco: { marmitaId: "m001", porcoes: 1 }, jantar: { marmitaId: "m001", porcoes: 1 } },
  };
  const datas = ["2026-10-19", "2026-10-20"];

  it("conta marmitas somando porções", () => {
    expect(contarMarmitas(plano, datas)).toBe(4);
  });

  it("soma ingredientes multiplicados pelas porções", () => {
    const lista = gerarLista(plano, datas);
    const frango = m1.ingredientes.find((i) => i.nome === "Peito de frango")!.quantidade;
    expect(lista.find((i) => i.nome === "Peito de frango")?.total).toBe(frango * 4);
    expect(lista.find((i) => i.nome === "Arroz branco")?.secao).toBe("Grãos");
  });

  it("ignora dias fora da semana", () => {
    expect(gerarLista(plano, ["2026-10-19"]).find((i) => i.nome === "Peito de frango")?.total).toBe(
      m1.ingredientes.find((i) => i.nome === "Peito de frango")!.quantidade * 2,
    );
  });

  it("formata quantidades", () => {
    expect(formatarQuantidade(1000, "g")).toBe("1 kg");
    expect(formatarQuantidade(1240, "g")).toBe("1,2 kg");
    expect(formatarQuantidade(243, "g")).toBe("245 g");
    expect(formatarQuantidade(2.5, "un")).toBe("3 un");
  });
});
