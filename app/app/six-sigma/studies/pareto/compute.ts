// studies/pareto/compute.ts
import type { ColumnSnapshot } from "../types";
import type { ParetoParams, ParetoResult, ParetoBar } from "./types";

function toNumber(v: unknown): number {
  const n = Number(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function computePareto(
  data: ColumnSnapshot,
  params: ParetoParams
): ParetoResult {
  const catCol = params.categoryCol ? data[params.categoryCol] : undefined;
  const cntCol = params.countCol ? data[params.countCol] : undefined;

  const cats = catCol?.values ?? [];
  const cnts = cntCol?.values ?? [];

  // Agrega por categoria (suma si se repite).
  const map = new Map<string, number>();
  const n = Math.min(cats.length, cnts.length);
  for (let i = 0; i < n; i++) {
    const name = String(cats[i] ?? "").trim();
    if (!name) continue; // ignora filas sin categoria
    const val = toNumber(cnts[i]);
    map.set(name, (map.get(name) ?? 0) + val);
  }

  // Ordena descendente por conteo.
  let entries = Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const total = entries.reduce((s, e) => s + e.count, 0);

  // Combinacion de la cola en "Other".
  if (params.combine === "combine" && total > 0) {
    const threshold = params.combinePercent; // p.ej. 95
    const kept: typeof entries = [];
    let cum = 0;
    let otherCount = 0;
    let cutReached = false;
    for (const e of entries) {
      const cumPctBefore = (cum / total) * 100;
      if (!cutReached && cumPctBefore < threshold) {
        kept.push(e);
        cum += e.count;
      } else {
        cutReached = true;
        otherCount += e.count;
      }
    }
    entries = kept;
    if (otherCount > 0) entries.push({ category: "Other", count: otherCount });
  }

  // Construye barras con % y acumulado.
  let cum = 0;
  const bars: ParetoBar[] = entries.map((e) => {
    const percent = total > 0 ? (e.count / total) * 100 : 0;
    cum += e.count;
    const cumPercent = total > 0 ? (cum / total) * 100 : 0;
    return {
      category: e.category,
      count: e.count,
      percent,
      cumPercent,
      isOther: e.category === "Other",
    };
  });

  return {
    countTitle: cntCol?.name ?? "Count",
    total,
    bars,
  };
}
