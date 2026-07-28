// app/app/six-sigma/studies/pss/oneproportion/compute.ts
import type { ColumnSnapshot } from "../../types";
import { binomCdf, binomSf, normCdf } from "../_shared/mathutil";
import { emptyCore, runPss, type PssSpec } from "../_shared/engine";
import { parsePositive, parseRange } from "../_shared/rangeParser";
import type { Alternative } from "../_shared/types";
import type { PssPropParams, PssPropResult, PropMethod } from "./types";

/** Menor c con P(X >= c | p0) <= alpha. */
function critUpper(n: number, p0: number, alpha: number): number {
  for (let c = 0; c <= n + 1; c++) if (binomSf(c, n, p0) <= alpha) return c;
  return n + 2;
}

/** Mayor c con P(X <= c | p0) <= alpha. */
function critLower(n: number, p0: number, alpha: number): number {
  for (let c = n; c >= -1; c--) if (binomCdf(c, n, p0) <= alpha) return c;
  return -2;
}

/** Potencia exacta del test binomial. */
function powerExact(
  n: number,
  p0: number,
  p1: number,
  alpha: number,
  alt: Alternative
): number {
  if (alt === "greater") return binomSf(critUpper(n, p0, alpha), n, p1);
  if (alt === "less") return binomCdf(critLower(n, p0, alpha), n, p1);
  const cu = critUpper(n, p0, alpha / 2);
  const cl = critLower(n, p0, alpha / 2);
  return Math.min(1, binomSf(cu, n, p1) + binomCdf(cl, n, p1));
}

/** Potencia por aproximacion normal, con las varianzas de cada hipotesis. */
function powerNormal(
  n: number,
  p0: number,
  p1: number,
  alpha: number,
  alt: Alternative
): number {
  const s0 = Math.sqrt((p0 * (1 - p0)) / n);
  const s1 = Math.sqrt((p1 * (1 - p1)) / n);
  if (s1 <= 0) return p1 === p0 ? alpha : 1;

  const zA = (a: number): number => {
    // cuantil normal por biseccion sobre normCdf
    let lo = -12;
    let hi = 12;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (normCdf(mid) < a) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  if (alt === "greater") {
    const c = p0 + zA(1 - alpha) * s0;
    return 1 - normCdf((c - p1) / s1);
  }
  if (alt === "less") {
    const c = p0 - zA(1 - alpha) * s0;
    return normCdf((c - p1) / s1);
  }
  const z = zA(1 - alpha / 2);
  const cu = p0 + z * s0;
  const cl = p0 - z * s0;
  return Math.min(1, 1 - normCdf((cu - p1) / s1) + normCdf((cl - p1) / s1));
}

export function powerOfProportion(
  n: number,
  p0: number,
  p1: number,
  alpha: number,
  alt: Alternative,
  method: PropMethod
): number {
  if (n < 1 || p1 <= 0 || p1 >= 1 || p0 <= 0 || p0 >= 1) return NaN;
  return method === "exact"
    ? powerExact(n, p0, p1, alpha, alt)
    : powerNormal(n, p0, p1, alpha, alt);
}

export function computePssProportion(
  _data: ColumnSnapshot,
  params: PssPropParams
): PssPropResult {
  const fail = (error: string): PssPropResult => ({
    ok: false,
    error,
    nullProportion: NaN,
    method: params.method,
    ...emptyCore(params),
  });

  const p0 = parsePositive(params.nullProportion);
  if (!Number.isFinite(p0) || p0 <= 0 || p0 >= 1)
    return fail("Hypothesized proportion must be strictly between 0 and 1.");

  /* El usuario escribe proporciones de comparacion; el motor razona en
     diferencias. Traducimos p1 -> p1 - p0 antes de entrar. */
  const comp = parseRange(params.differences);
  if (comp.error) return fail(comp.error);
  if (comp.values.some((v) => v <= 0 || v >= 1))
    return fail("Comparison proportions must be strictly between 0 and 1.");
  if (comp.values.some((v) => v === p0))
    return fail("Comparison proportions must differ from the hypothesized proportion.");

  const diffs = comp.values.map((v) => v - p0);

  /* Margen disponible hacia el lado que corresponda, para acotar la
     biseccion y la curva sin salirse de (0,1). */
  const alt = params.alternative;
  const room =
    alt === "less" ? p0 : alt === "greater" ? 1 - p0 : Math.max(p0, 1 - p0);

  const spec: PssSpec = {
    powerOf: (n, diff, _sd, alpha, a) =>
      powerOfProportion(n, p0, p0 + diff, alpha, a, params.method),
    minN: 1,
    sizeLabel: "Sample sizes",
    requiresSd: false,
    maxAbsDiff: room * 0.999,
    monotoneInN: params.method !== "exact",
    /* El eje natural es p en (0,1); centramos en p0 sin salir del rango. */
    curveDomain: (ds) => {
      const m = Math.max(...ds.map(Math.abs)) * 1.6;
      const lo = Math.max(0.001, p0 - m) - p0;
      const hi = Math.min(0.999, p0 + m) - p0;
      return [lo, hi];
    },
  };

  const run = runPss(spec, {
    ...params,
    differences: diffs.length > 0 ? diffs.map((d) => String(d)).join(" ") : "",
  });
  if (!run.ok) return fail(run.error);

  const notes = [...run.notes];
  if (params.method === "exact")
    notes.push(
      "Power is calculated from the exact binomial distribution. The actual power can exceed the target because the sample size is a whole number."
    );

  return { ...run, nullProportion: p0, method: params.method, notes };
}
