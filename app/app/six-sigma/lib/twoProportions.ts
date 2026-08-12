// app/app/six-sigma/lib/twoProportions.ts
import type {
  TPAlternative,
  TPCIKind,
  HTTwoProportionsResult,
} from "../studies/ht/twoproportions/types";

export interface TPInput {
  label1: string;
  label2: string;
  x1: number;
  n1: number;
  x2: number;
  n2: number;
  eta0: number;
  alternative: TPAlternative;
  confLevel: number;
  continuityCorrection: boolean;
  showFisher: boolean;
}

/**
 * Fisher exacto recorre todas las tablas posibles, asi que el coste crece con
 * el total. Por encima de este limite se omite y el informe muestra solo la
 * aproximacion normal.
 */
export const TP_FISHER_MAX_N = 100_000;

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

function lchoose(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
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

/**
 * Test exacto de Fisher sobre la tabla 2x2. El p-valor bilateral se obtiene
 * sumando la probabilidad de todas las tablas cuya probabilidad hipergeometrica
 * no supera la observada, no doblando una cola: con tablas asimetricas ambos
 * criterios difieren.
 */
function fisherExact(
  x1: number,
  n1: number,
  x2: number,
  n2: number,
  alternative: TPAlternative
): number {
  const total = n1 + n2;
  const events = x1 + x2;
  const lo = Math.max(0, events - n2);
  const hi = Math.min(n1, events);
  if (hi < lo) return NaN;

  const lconst = lchoose(total, events);
  const lp = (k: number) =>
    lchoose(n1, k) + lchoose(n2, events - k) - lconst;

  if (alternative === "less") {
    // Cola inferior: p1 pequena.
    let s = 0;
    for (let k = lo; k <= x1; k++) s += Math.exp(lp(k));
    return Math.min(1, s);
  }
  if (alternative === "greater") {
    let s = 0;
    for (let k = x1; k <= hi; k++) s += Math.exp(lp(k));
    return Math.min(1, s);
  }

  // Bilateral por suma de probabilidades.
  const obs = lp(x1);
  const tol = 1 + 1e-7;
  let s = 0;
  for (let k = lo; k <= hi; k++) {
    const v = lp(k);
    if (Math.exp(v - obs) <= tol) s += Math.exp(v);
  }
  return Math.min(1, s);
}

export function twoProportions(input: TPInput): HTTwoProportionsResult {
  const {
    label1,
    label2,
    x1,
    n1,
    x2,
    n2,
    eta0,
    alternative,
    confLevel,
    continuityCorrection,
  } = input;

  // --- 1. Validacion -----------------------------------------------------
  const ints = [x1, n1, x2, n2];
  if (ints.some((v) => !Number.isFinite(v))) {
    return { ok: false, error: "Enter events and trials for both samples." };
  }
  if (ints.some((v) => !Number.isInteger(v) || v < 0)) {
    return {
      ok: false,
      error: "Events and trials must be non-negative whole numbers.",
    };
  }
  if (n1 < 1 || n2 < 1) {
    return { ok: false, error: "The number of trials must be at least 1." };
  }
  if (x1 > n1 || x2 > n2) {
    return {
      ok: false,
      error: "The number of events cannot exceed the number of trials.",
    };
  }
  if (!Number.isFinite(eta0) || eta0 <= -1 || eta0 >= 1) {
    return {
      ok: false,
      error: "The hypothesized difference must be between -1 and 1.",
    };
  }
  if (!(confLevel > 0 && confLevel < 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const difference = p1 - p2;

  // --- 2. Intervalo: proporciones SEPARADAS ------------------------------
  const ciKind: TPCIKind =
    alternative === "two-sided"
      ? "two"
      : alternative === "greater"
        ? "lower"
        : "upper";
  const alpha = 1 - confLevel / 100;
  const zCrit = normalInv(1 - (ciKind === "two" ? alpha / 2 : alpha));
  const seCI = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
  const half = zCrit * seCI;

  let ciLow = -1;
  let ciHigh = 1;
  if (ciKind !== "upper") ciLow = difference - half;
  if (ciKind !== "lower") ciHigh = difference + half;
  if (ciKind === "lower") ciHigh = 1;
  if (ciKind === "upper") ciLow = -1;

  // --- 3. Test: proporcion COMBINADA cuando eta0 = 0 ---------------------
  // Con eta0 distinto de cero la hipotesis nula no implica p1 = p2, asi que
  // no cabe combinar: se usan las varianzas separadas.
  const shiftedNull = eta0 !== 0;
  const pooledP = (x1 + x2) / (n1 + n2);
  const seTest = shiftedNull
    ? seCI
    : Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

  let zValue = NaN;
  let pNormal = NaN;
  if (seTest > 0) {
    const diff = difference - eta0;
    let num = diff;
    if (continuityCorrection) {
      // Acerca la diferencia a eta0 en media unidad de la escala discreta.
      const cc = 0.5 * (1 / n1 + 1 / n2);
      num = diff > 0 ? Math.max(0, diff - cc) : Math.min(0, diff + cc);
    }
    zValue = num / seTest;
    pNormal =
      alternative === "two-sided"
        ? 2 * (1 - normalCdf(Math.abs(zValue)))
        : alternative === "greater"
          ? 1 - normalCdf(zValue)
          : normalCdf(zValue);
    pNormal = Math.min(1, Math.max(0, pNormal));
  }

  // --- 4. Fisher exacto --------------------------------------------------
  // Solo tiene sentido con eta0 = 0: contrasta independencia en la tabla 2x2.
  let pFisher = NaN;
  if (input.showFisher && !shiftedNull && n1 + n2 <= TP_FISHER_MAX_N) {
    pFisher = fisherExact(x1, n1, x2, n2, alternative);
  }

  // --- 5. Aviso de frecuencias esperadas bajas ---------------------------
  const eventsTot = x1 + x2;
  const total = n1 + n2;
  const expected = [
    (eventsTot * n1) / total,
    (eventsTot * n2) / total,
    ((total - eventsTot) * n1) / total,
    ((total - eventsTot) * n2) / total,
  ];
  const lowExpected = expected.some((e) => e < 5);

  return {
    ok: true,
    label1,
    label2,
    x1,
    n1,
    x2,
    n2,
    p1,
    p2,
    difference,
    eta0,
    alternative,
    confLevel,
    ciKind,
    ciLow,
    ciHigh,
    pooledP,
    continuityCorrection,
    zValue,
    pNormal,
    showFisher: input.showFisher,
    pFisher,
    lowExpected,
    shiftedNull,
  };
}
