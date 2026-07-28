// app/app/six-sigma/studies/pss/onesamplet/compute.ts
import type { ColumnSnapshot } from "../../types";
import { nctCdf, tQuantile } from "../_shared/mathutil";
import { emptyCore, runPss, type PssSpec } from "../_shared/engine";
import type { Alternative } from "../_shared/types";
import type { Pss1SampleTParams, Pss1SampleTResult } from "./types";

/** Potencia del test t de una muestra. */
export function powerOf(
  n: number,
  diff: number,
  sd: number,
  alpha: number,
  alt: Alternative
): number {
  if (n < 2 || sd <= 0) return NaN;
  const df = n - 1;
  const ncp = (diff / sd) * Math.sqrt(n);

  if (alt === "two-sided") {
    const tc = tQuantile(1 - alpha / 2, df);
    const upper = 1 - nctCdf(tc, df, ncp);
    const lower = nctCdf(-tc, df, ncp);
    return Math.min(1, Math.max(0, upper + lower));
  }
  if (alt === "greater") {
    const tc = tQuantile(1 - alpha, df);
    return Math.min(1, Math.max(0, 1 - nctCdf(tc, df, ncp)));
  }
  const tc = tQuantile(alpha, df);
  return Math.min(1, Math.max(0, nctCdf(tc, df, ncp)));
}

const SPEC: PssSpec = { powerOf, minN: 2 };

export function computePss1SampleT(
  _data: ColumnSnapshot,
  params: Pss1SampleTParams
): Pss1SampleTResult {
  const run = runPss(SPEC, params);
  if (!run.ok) return { ok: false, error: run.error, ...emptyCore(params) };
  return { ...run };
}
