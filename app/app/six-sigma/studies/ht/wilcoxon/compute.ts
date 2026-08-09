// app/app/six-sigma/studies/ht/wilcoxon/compute.ts
import { wilcoxonSignedRank } from "../../../lib/wilcoxon";
import type { HTWilcoxonParams, HTWilcoxonResult } from "./types";

/** Cadena de parametro -> numero. Acepta coma decimal. */
function num(s: string): number {
  const t = (s ?? "").trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

export function computeHTWilcoxon(
  params: HTWilcoxonParams,
  columns: { name: string; values: unknown[] }[]
): HTWilcoxonResult {
  const col = columns.find((c) => c.name === params.column);
  if (!col) {
    return { ok: false, error: "Select a column to run the analysis." };
  }

  const eta0 = num(params.hypothesizedMedian);
  if (!Number.isFinite(eta0)) {
    return { ok: false, error: "The hypothesized median is not a valid number." };
  }

  const confLevel = num(params.confidenceLevel);
  if (params.performCI && (!Number.isFinite(confLevel) || confLevel <= 0 || confLevel >= 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }

  const model = wilcoxonSignedRank({
    column: col.name,
    raw: col.values as (number | string | null | undefined)[],
    eta0,
    alternative: params.alternative,
    confLevel,
    performTest: params.performTest,
    performCI: params.performCI,
  });

  if ("error" in model) return { ok: false, error: model.error };
  return { ok: true, ...model };
}
