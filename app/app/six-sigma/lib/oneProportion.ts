// app/app/six-sigma/lib/oneProportion.ts
import type {
  OPAlternative,
  OPCIKind,
  OPMethod,
  HTOneProportionResult,
} from "../studies/ht/oneproportion/types";

export interface OPInput {
  x: number;
  n: number;
  p0: number;
  alternative: OPAlternative;
  confLevel: number;
  method: OPMethod;
}

/**
 * El test exacto recorre las n+1 tablas posibles, asi que el coste crece con
 * n. Por encima de este limite se cae a la aproximacion normal.
 */
export const OP_EXACT_MAX_N = 1_000_000;

/** Log-gamma (Lanczos). */
function lgamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  const z = x - 1;
  let a = 0.99999999999980993;
  const t = z + 7.5;
  for (let i = 0; i < g.length; i++) a += g[i] / (z + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

function lbeta(a: number, b: number): number {
  return lgamma(a) + lgamma(b) - lgamma(a + b);
}

/**
 * Beta incompleta regularizada I_x(a,b) por fraccion continua de Lentz.
 * Es la pieza que permite invertir el binomial: P(X <= k) con X ~ Bin(n,p)
 * equivale a I_{1-p}(n-k, k+1).
 */
function betaInc(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // La fraccion converge rapido solo en una mitad del dominio.
  if (x > (a + 1) / (a + b + 2)) return 1 - betaInc(1 - x, b, a);

  const lfront =
    a * Math.log(x) + b * Math.log(1 - x) - Math.log(a) - lbeta(a, b);
  const tiny = 1e-300;
  let f = 1;
  let c = 1;
  let d = 0;
  for (let i = 0; i <= 300; i++) {
    const m = Math.floor(i / 2);
    let num: number;
    if (i === 0) num = 1;
    else if (i % 2 === 0)
      num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    else
      num =
        (-((a + m) * (a + b + m)) * x) / ((a + 2 * m) * (a + 2 * m + 1));

    d = 1 + num * d;
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    c = 1 + num / c;
    if (Math.abs(c) < tiny) c = tiny;
    const cd = c * d;
    f *= cd;
    if (Math.abs(1 - cd) < 1e-15) break;
  }
  return Math.exp(lfront) * (f - 1);
}

/**
 * Cuantil de la Beta: devuelve x tal que I_x(a,b) = p. Biseccion con arranque
 * en 1/2, suficiente y estable para los tamanos de este estudio.
 */
function betaInv(p: number, a: number, b: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let mid = 0.5;
  for (let i = 0; i < 200; i++) {
    mid = (lo + hi) / 2;
    if (betaInc(mid, a, b) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-15) break;
  }
  return (lo + hi) / 2;
}

/** Funcion de distribucion normal estandar (Abramowitz-Stegun 7.1.26). */
function normalCdf(z: number): number {
  const sg = z < 0 ? -1 : 1;
  const a = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-a * a);
  return 0.5 * (1 + sg * y);
}

/** Cuantil normal estandar (Acklam). */
function normalInv(p: number): number {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pl = 0.02425;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p > 1 - pl) return -normalInv(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

/** P(X <= k) con X ~ Bin(n,p), via la Beta incompleta. */
function binomCdf(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  return betaInc(1 - p, n - k, k + 1);
}

/** Log de la masa binomial en k. */
function lbinomPmf(k: number, n: number, p: number): number {
  if (p <= 0) return k === 0 ? 0 : -Infinity;
  if (p >= 1) return k === n ? 0 : -Infinity;
  return (
    lgamma(n + 1) -
    lgamma(k + 1) -
    lgamma(n - k + 1) +
    k * Math.log(p) +
    (n - k) * Math.log(1 - p)
  );
}

/**
 * Intervalo de Clopper-Pearson, obtenido invirtiendo el binomial exacto. Es
 * conservador por construccion: la cobertura real nunca baja del nivel
 * pedido, a costa de resultar algo ancho.
 */
function clopperPearson(
  x: number,
  n: number,
  alpha: number,
  kind: OPCIKind
): [number, number] {
  const aLow = kind === "two" ? alpha / 2 : alpha;
  const aHigh = kind === "two" ? alpha / 2 : alpha;
  let lo = 0;
  let hi = 1;
  if (kind !== "upper" && x > 0) lo = betaInv(aLow, x, n - x + 1);
  if (kind !== "lower" && x < n) hi = betaInv(1 - aHigh, x + 1, n - x);
  if (kind === "lower") hi = 1;
  if (kind === "upper") lo = 0;
  return [lo, hi];
}

/**
 * P-valor exacto. El bilateral suma la probabilidad de todos los k cuya masa
 * no supera la observada, no dobla una cola: con distribuciones asimetricas
 * ambos criterios difieren.
 */
function exactP(
  x: number,
  n: number,
  p0: number,
  alternative: OPAlternative
): number {
  if (alternative === "less") return binomCdf(x, n, p0);
  if (alternative === "greater")
    return x === 0 ? 1 : 1 - binomCdf(x - 1, n, p0);

  const obs = lbinomPmf(x, n, p0);
  const tol = 1 + 1e-7;
  let s = 0;
  for (let k = 0; k <= n; k++) {
    const v = lbinomPmf(k, n, p0);
    if (v > -Infinity && Math.exp(v - obs) <= tol) s += Math.exp(v);
  }
  return Math.min(1, s);
}

export function oneProportion(input: OPInput): HTOneProportionResult {
  const { x, n, p0, alternative, confLevel } = input;

  // --- 1. Validacion -----------------------------------------------------
  if (!Number.isFinite(x) || !Number.isFinite(n)) {
    return { ok: false, error: "Enter the number of events and trials." };
  }
  if (!Number.isInteger(x) || !Number.isInteger(n) || x < 0 || n < 0) {
    return {
      ok: false,
      error: "Events and trials must be non-negative whole numbers.",
    };
  }
  if (n < 1) {
    return { ok: false, error: "The number of trials must be at least 1." };
  }
  if (x > n) {
    return {
      ok: false,
      error: "The number of events cannot exceed the number of trials.",
    };
  }
  if (!Number.isFinite(p0) || p0 <= 0 || p0 >= 1) {
    return {
      ok: false,
      error: "The hypothesized proportion must be between 0 and 1.",
    };
  }
  if (!(confLevel > 0 && confLevel < 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }

  const p = x / n;
  const ciKind: OPCIKind =
    alternative === "two-sided"
      ? "two"
      : alternative === "greater"
        ? "lower"
        : "upper";
  const alpha = 1 - confLevel / 100;

  // El metodo exacto deja de ser viable con n enorme.
  const method: OPMethod =
    input.method === "exact" && n > OP_EXACT_MAX_N ? "normal" : input.method;

  let ciLow: number;
  let ciHigh: number;
  let pValue: number;
  let zValue = NaN;

  if (method === "exact") {
    [ciLow, ciHigh] = clopperPearson(x, n, alpha, ciKind);
    pValue = exactP(x, n, p0, alternative);
  } else {
    // Wald para el intervalo, con la proporcion observada.
    const seCI = Math.sqrt((p * (1 - p)) / n);
    const zc = normalInv(1 - (ciKind === "two" ? alpha / 2 : alpha));
    ciLow = ciKind === "upper" ? 0 : Math.max(0, p - zc * seCI);
    ciHigh = ciKind === "lower" ? 1 : Math.min(1, p + zc * seCI);

    // El test usa la varianza bajo H0, con p0, no con la observada.
    const seTest = Math.sqrt((p0 * (1 - p0)) / n);
    zValue = seTest > 0 ? (p - p0) / seTest : NaN;
    pValue =
      alternative === "two-sided"
        ? 2 * (1 - normalCdf(Math.abs(zValue)))
        : alternative === "greater"
          ? 1 - normalCdf(zValue)
          : normalCdf(zValue);
    pValue = Math.min(1, Math.max(0, pValue));
  }

  const lowExpected = method === "normal" && (n * p0 < 5 || n * (1 - p0) < 5);

  return {
    ok: true,
    x,
    n,
    p,
    p0,
    alternative,
    confLevel,
    ciKind,
    method,
    ciLow,
    ciHigh,
    pValue,
    zValue,
    lowExpected,
  };
}
