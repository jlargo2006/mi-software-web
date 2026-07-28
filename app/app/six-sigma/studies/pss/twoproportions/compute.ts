// app/app/six-sigma/studies/pss/twoproportions/compute.ts
import type { ColumnSnapshot } from "../../types";
import { normCdf, zQuantile } from "../_shared/mathutil";
import { emptyCore, runPss, type PssSpec } from "../_shared/engine";
import { parsePositive, parseRange } from "../_shared/rangeParser";
import type { Alternative } from "../_shared/types";
import type { PssTwoPropParams, PssTwoPropResult } from "./types";

/**
 * Potencia del test de dos proporciones por aproximacion normal.
 * El valor critico usa la varianza combinada (H0) y la potencia la
 * varianza sin combinar (H1). n es el tamano de CADA grupo.
 */
export function powerTwoProportions(
  n: number,
  p1: number,
  p2: number,
  alpha: number,
  alt: Alternative
): number {
  if (n < 1 || p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1) return NaN;

  const delta = p1 - p2;
  const pBar = (p1 + p2) / 2;
  const se0 = Math.sqrt((2 * pBar * (1 - pBar)) / n);
  const se1 = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / n);
  if (se1 <= 0) return delta === 0 ? alpha : 1;

  if (alt === "greater") return 1 - normCdf((zQuantile(1 - alpha) * se0 - delta) / se1);
  if (alt === "less") return normCdf((-zQuantile(1 - alpha) * se0 - delta) / se1);

  const zc = zQuantile(1 - alpha / 2);
  return Math.min(
    1,
    1 - normCdf((zc * se0 - delta) / se1) + normCdf((-zc * se0 - delta) / se1)
  );
}

export function computePssTwoProportions(
  _data: ColumnSnapshot,
  params: PssTwoPropParams
): PssTwoPropResult {
  const fail = (error: string): PssTwoPropResult => ({
    ok: false,
    error,
    baselineProportion: NaN,
    ...emptyCore(params),
  });

  const p2 = parsePositive(params.baselineProportion);
  if (!Number.isFinite(p2) || p2 <= 0 || p2 >= 1)
    return fail("Baseline proportion must be strictly between 0 and 1.");

  /* El usuario escribe proporciones de comparacion; el motor razona en
     diferencias. Traducimos p1 -> p1 - p2 antes de entrar. */
  const comp = parseRange(params.differences);
  if (comp.error) return fail(comp.error);
  if (comp.values.some((v) => v <= 0 || v >= 1))
    return fail("Comparison proportions must be strictly between 0 and 1.");
  if (comp.values.some((v) => v === p2))
    return fail("Comparison proportions must differ from the baseline proportion.");

  const diffs = comp.values.map((v) => v - p2);

  const alt = params.alternative;
  const room =
    alt === "less" ? p2 : alt === "greater" ? 1 - p2 : Math.max(p2, 1 - p2);

  const spec: PssSpec = {
    powerOf: (n, diff, _sd, alpha, a) => powerTwoProportions(n, p2 + diff, p2, alpha, a),
    minN: 1,
    sizeLabel: "Sample sizes",
    requiresSd: false,
    maxAbsDiff: room * 0.999,
    /* El eje natural es p en (0,1); centramos en p2 sin salir del rango. */
    curveDomain: (ds) => {
      const m = Math.max(...ds.map(Math.abs)) * 1.6;
      return [Math.max(0.001, p2 - m) - p2, Math.min(0.999, p2 + m) - p2];
    },
  };

  const run = runPss(spec, {
    ...params,
    differences: diffs.length > 0 ? diffs.map((d) => String(d)).join(" ") : "",
  });
  if (!run.ok) return fail(run.error);

  /* Imprescindible: la tabla no distingue n total de n por grupo. */
  const notes = [...run.notes, "The sample size is for each group."];

  return { ...run, baselineProportion: p2, notes };
}
