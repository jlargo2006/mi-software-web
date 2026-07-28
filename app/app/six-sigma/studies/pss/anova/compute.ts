// app/app/six-sigma/studies/pss/anova/compute.ts
import type { ColumnSnapshot } from "../../types";
import { fQuantile, ncfCdf } from "../_shared/mathutil";
import { emptyCore, runPss, type PssSpec } from "../_shared/engine";
import { parsePositive } from "../_shared/rangeParser";
import type { PssAnovaParams, PssAnovaResult } from "./types";

/**
 * Potencia del ANOVA de un factor con k niveles equilibrados.
 * "diff" es la diferencia maxima entre medias; se asume el reparto mas
 * desfavorable: dos medias en los extremos y las k-2 restantes en el centro.
 *   ncp = n * diff^2 / (2 * sd^2)
 *   df1 = k - 1,  df2 = k * (n - 1)
 * n es el tamano de CADA nivel.
 */
export function powerOfAnova(
  n: number,
  diff: number,
  sd: number,
  alpha: number,
  k: number
): number {
  if (n < 2 || sd <= 0 || k < 2) return NaN;
  const df1 = k - 1;
  const df2 = k * (n - 1);
  const ncp = (n * diff * diff) / (2 * sd * sd);
  const fc = fQuantile(1 - alpha, df1, df2);
  return Math.min(1, Math.max(0, 1 - ncfCdf(fc, df1, df2, ncp)));
}

export function computePssAnova(
  _data: ColumnSnapshot,
  params: PssAnovaParams
): PssAnovaResult {
  const fail = (error: string): PssAnovaResult => ({
    ok: false,
    error,
    levels: NaN,
    ...emptyCore(params),
  });

  const k = parsePositive(params.levels);
  if (!Number.isFinite(k) || !Number.isInteger(k) || k < 2)
    return fail("Number of levels must be an integer of 2 or more.");
  if (k > 200) return fail("Number of levels must be 200 or less.");

  const spec: PssSpec = {
    // El motor pasa "alt"; en ANOVA no aplica y se ignora.
    powerOf: (n, diff, sd, alpha) => powerOfAnova(n, Math.abs(diff), sd, alpha, k),
    minN: 2,
    sizeLabel: "Sample sizes per level",
  };

  const run = runPss(spec, { ...params, alternative: "greater" });
  if (!run.ok) return fail(run.error);

  return {
    ...run,
    levels: k,
    notes: [...run.notes, "The sample size is for each level."],
  };
}
