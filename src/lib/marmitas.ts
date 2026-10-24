import data from "@/data/marmitas.json";

export type Categoria = "Frango" | "Carnes" | "Suínos" | "Peixes" | "Vegetarianas" | "Veganas";
export type Secao = "Hortifruti" | "Proteínas" | "Grãos" | "Mercearia";
export type Unidade = "g" | "ml" | "un";

export interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: Unidade;
  secao: Secao;
}

export interface Marmita {
  id: string;
  nome: string;
  categoria: Categoria;
  gramas: number;
  kcal: number;
  ingredientes: Ingrediente[];
  imagem: string;
}

export const CATEGORIAS: Categoria[] = ["Frango", "Carnes", "Suínos", "Peixes", "Vegetarianas", "Veganas"];
export const SECOES: Secao[] = ["Hortifruti", "Proteínas", "Grãos", "Mercearia"];

const imagens = import.meta.glob("/src/assets/marmitas/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const MARMITAS: Marmita[] = (data as unknown as Marmita[]).map((m) => ({
  id: m.id,
  nome: m.nome,
  categoria: m.categoria,
  gramas: m.gramas,
  kcal: m.kcal,
  ingredientes: m.ingredientes,
  imagem: m.imagem,
}));

const porId = new Map(MARMITAS.map((m) => [m.id, m]));
export const getMarmita = (id: string) => porId.get(id);

export function imagemDe(m: Marmita): string | undefined {
  return imagens[`/src/assets/marmitas/${m.imagem}`];
}

export function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarMarmitas(filtro: Categoria | "Todas", busca: string): Marmita[] {
  const q = normalizar(busca.trim());
  return MARMITAS.filter(
    (m) =>
      (filtro === "Todas" || m.categoria === filtro) &&
      (!q || normalizar(m.nome).includes(q) || normalizar(m.categoria).includes(q)),
  );
}
