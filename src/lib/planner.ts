import { getMarmita, SECOES, type Secao, type Unidade } from "./marmitas";

export type Refeicao = "almoco" | "jantar";

export interface Slot {
  marmitaId: string | null;
  porcoes: number;
}

export interface DiaPlano {
  almoco: Slot;
  jantar: Slot;
}

/** Key = ISO date (yyyy-mm-dd) */
export type Plano = Record<string, DiaPlano>;

export const DIAS_CURTOS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
export const DIAS_LONGOS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ddmm(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Monday..Sunday of the week containing `hoje`. */
export function diasDaSemana(hoje: Date, incluirFimDeSemana: boolean): Date[] {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dow = base.getDay(); // 0 = domingo
  const diffSegunda = dow === 0 ? -6 : 1 - dow;
  const segunda = new Date(base);
  segunda.setDate(base.getDate() + diffSegunda);
  const total = incluirFimDeSemana ? 7 : 5;
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

export const slotVazio = (): Slot => ({ marmitaId: null, porcoes: 1 });
export const diaVazio = (): DiaPlano => ({ almoco: slotVazio(), jantar: slotVazio() });

export function contarMarmitas(plano: Plano, datas: string[]) {
  let total = 0;
  for (const iso of datas) {
    const dia = plano[iso];
    if (!dia) continue;
    for (const r of ["almoco", "jantar"] as Refeicao[]) {
      if (dia[r].marmitaId) total += dia[r].porcoes;
    }
  }
  return total;
}

export interface ItemCompra {
  chave: string;
  nome: string;
  secao: Secao;
  unidade: Unidade;
  total: number;
}

/** Sums all ingredients of planned meals (for the given dates), multiplied by portions. */
export function gerarLista(plano: Plano, datas: string[]): ItemCompra[] {
  const mapa = new Map<string, ItemCompra>();
  for (const iso of datas) {
    const dia = plano[iso];
    if (!dia) continue;
    for (const r of ["almoco", "jantar"] as Refeicao[]) {
      const slot = dia[r];
      if (!slot.marmitaId) continue;
      const m = getMarmita(slot.marmitaId);
      if (!m) continue;
      for (const ing of m.ingredientes) {
        const chave = `${ing.nome}|${ing.unidade}`;
        const atual = mapa.get(chave) ?? {
          chave,
          nome: ing.nome,
          secao: ing.secao,
          unidade: ing.unidade,
          total: 0,
        };
        atual.total += ing.quantidade * slot.porcoes;
        mapa.set(chave, atual);
      }
    }
  }
  return [...mapa.values()].sort(
    (a, b) => SECOES.indexOf(a.secao) - SECOES.indexOf(b.secao) || a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

const fmt = (n: number, casas = 1) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: casas, minimumFractionDigits: 0 });

/** "1 kg", "750 g", "1,2 L", "3 un" */
export function formatarQuantidade(total: number, unidade: Unidade): string {
  if (unidade === "un") return `${Math.ceil(total)} un`;
  if (unidade === "g") {
    if (total >= 1000) return `${fmt(Math.round(total / 100) / 10)} kg`;
    return `${Math.max(5, Math.ceil(total / 5) * 5)} g`;
  }
  if (total >= 1000) return `${fmt(Math.round(total / 100) / 10)} L`;
  return `${Math.max(5, Math.ceil(total / 5) * 5)} ml`;
}

export function listaComoTexto(itens: ItemCompra[]): string {
  const linhas: string[] = ["Lista de compras · VitalStim", ""];
  for (const secao of SECOES) {
    const doGrupo = itens.filter((i) => i.secao === secao);
    if (!doGrupo.length) continue;
    linhas.push(secao.toUpperCase());
    for (const i of doGrupo) linhas.push(`• ${i.nome}, ${formatarQuantidade(i.total, i.unidade)}`);
    linhas.push("");
  }
  return linhas.join("\n").trim();
}
