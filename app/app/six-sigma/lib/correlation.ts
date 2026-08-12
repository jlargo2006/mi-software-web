// app/app/six-sigma/lib/correlation.ts
import type {
  CorrAlternative,
  CorrCIKind,
  CorrType,
} from "../studies/improve/correlation/types";

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

/** Beta incompleta regularizada por fraccion continua de Lentz. */
function betaInc(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (x > (a + 1) / (a + b + 2)) return 1 - betaInc(1 - x, b, a);
  const lfront =
    a * Math.log(x) + b * Math.log(1 - x) - Math.log(a) - lbeta(a, b);
  const tiny = 1e-300;
  let f = 1;
  let c = 1;
  let d = 0;
  for (let i = 0; i <= 300; i++) {
    const m = Math.floor(i / 2);
    let numr: number;
    if (i === 0) numr = 1;
    else if (i % 2 === 0)
      numr = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    else numr = (-((a + m) * (a + b + m)) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + numr * d;
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    c = 1 + numr / c;
    if (Math.abs(c) < tiny) c = tiny;
    const cd = c * d;
    f *= cd;
    if (Math.abs(1 - cd) < 1e-15) break;
  }
  return Math.exp(lfront) * (f - 1);
}

/** Cola superior de la t de Student. */
function tSf(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return NaN;
  const p = 0.5 * betaInc(df / (df + t * t), df / 2, 0.5);
  return t >= 0 ? p : 1 - p;
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

/** Correlacion de Pearson de dos vectores ya emparejados. */
export function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return NaN;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // Con una variable constante la correlacion no esta definida.
  if (sxx <= 0 || syy <= 0) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

/** Rangos con promedio en los empates, como exige Spearman. */
export function ranks(v: number[]): number[] {
  const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b] || a - b);
  const out = new Array<number>(v.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) out[idx[k]] = avg;
    i = j + 1;
  }
  return out;
}

export interface CorrStats {
  n: number;
  r: number;
  ciLow: number;
  ciHigh: number;
  pValue: number;
}

/**
 * Correlacion, intervalo y p-valor de un par.
 *
 * El intervalo usa la transformacion z de Fisher con error tipico
 * 1/raiz(n-3), que es la convencion de Minitab. El p-valor procede del
 * estadistico t con n-2 grados de libertad, no de la z: son criterios
 * distintos y pueden discrepar en muestras pequenas.
 *
 * Spearman aplica exactamente lo mismo a los rangos.
 */
export function correlationStats(
  xIn: number[],
  yIn: number[],
  type: CorrType,
  alternative: CorrAlternative,
  confLevel: number,
  ciKind: CorrCIKind
): CorrStats {
  const n = xIn.length;
  const x = type === "spearman" ? ranks(xIn) : xIn;
  const y = type === "spearman" ? ranks(yIn) : yIn;
  const r = pearson(x, y);

  const empty: CorrStats = { n, r, ciLow: NaN, ciHigh: NaN, pValue: NaN };
  if (!Number.isFinite(r)) return empty;

  // --- p-valor ------------------------------------------------------------
  let pValue = NaN;
  const df = n - 2;
  if (df > 0) {
    if (Math.abs(r) >= 1) {
      // Correlacion perfecta: el estadistico t diverge.
      pValue = alternative === "two-sided" ? 0 : r > 0 === (alternative === "greater") ? 0 : 1;
    } else {
      const t = r * Math.sqrt(df / (1 - r * r));
      pValue =
        alternative === "two-sided"
          ? 2 * tSf(Math.abs(t), df)
          : alternative === "greater"
            ? tSf(t, df)
            : 1 - tSf(t, df);
      pValue = Math.min(1, Math.max(0, pValue));
    }
  }

  // --- intervalo ----------------------------------------------------------
  let ciLow = -1;
  let ciHigh = 1;
  if (n > 3 && Math.abs(r) < 1) {
    const alpha = 1 - confLevel / 100;
    const se = 1 / Math.sqrt(n - 3);
    const zc = normalInv(1 - (ciKind === "two" ? alpha / 2 : alpha));
    const z = Math.atanh(r);
    if (ciKind !== "upper") ciLow = Math.tanh(z - zc * se);
    if (ciKind !== "lower") ciHigh = Math.tanh(z + zc * se);
    if (ciKind === "lower") ciHigh = 1;
    if (ciKind === "upper") ciLow = -1;
  }

  return { n, r, ciLow, ciHigh, pValue };
}
