import { useCallback, useEffect, useState } from "react";
import { diaVazio, type DiaPlano, type Plano, type Refeicao } from "@/lib/planner";

const KEY = "vitalstim:v1";

interface Estado {
  plano: Plano;
  fimDeSemana: boolean;
  marcados: string[];
}

const inicial: Estado = { plano: {}, fimDeSemana: false, marcados: [] };

function ler(): Estado {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return inicial;
    const p = JSON.parse(raw) as Partial<Estado>;
    return { plano: p.plano ?? {}, fimDeSemana: !!p.fimDeSemana, marcados: p.marcados ?? [] };
  } catch {
    return inicial;
  }
}

/** Planner state persisted in localStorage (read after hydration). */
export function usePlanner() {
  const [estado, setEstado] = useState<Estado>(inicial);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setEstado(ler());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (pronto) window.localStorage.setItem(KEY, JSON.stringify(estado));
  }, [estado, pronto]);

  const atualizarDia = useCallback((iso: string, fn: (d: DiaPlano) => DiaPlano) => {
    setEstado((e) => {
      const atual = e.plano[iso] ?? diaVazio();
      return { ...e, plano: { ...e.plano, [iso]: fn(structuredClone(atual)) } };
    });
  }, []);

  const escolher = useCallback(
    (iso: string, r: Refeicao, marmitaId: string | null) =>
      atualizarDia(iso, (d) => ({ ...d, [r]: { ...d[r], marmitaId } })),
    [atualizarDia],
  );

  const mudarPorcoes = useCallback(
    (iso: string, r: Refeicao, delta: number) =>
      atualizarDia(iso, (d) => ({
        ...d,
        [r]: { ...d[r], porcoes: Math.min(10, Math.max(1, d[r].porcoes + delta)) },
      })),
    [atualizarDia],
  );

  const setFimDeSemana = useCallback(
    (v: boolean) => setEstado((e) => ({ ...e, fimDeSemana: v })),
    [],
  );

  const alternarMarcado = useCallback(
    (chave: string) =>
      setEstado((e) => ({
        ...e,
        marcados: e.marcados.includes(chave)
          ? e.marcados.filter((c) => c !== chave)
          : [...e.marcados, chave],
      })),
    [],
  );

  const limparMarcados = useCallback(() => setEstado((e) => ({ ...e, marcados: [] })), []);

  return {
    ...estado,
    pronto,
    escolher,
    mudarPorcoes,
    setFimDeSemana,
    alternarMarcado,
    limparMarcados,
  };
}
