// app/app/six-sigma/lib/moodsMedian.ts
import type {
  MoodBox,
  MoodGroup,
  HTMoodsMedianResult,
} from "../studies/ht/moodsmedian/types";

export interface MoodInput {
  responseColumn: string;
  factorColumn: string;
  rawResponse: readonly (number | string | null | undefined)[];
  rawFactor: readonly (number | string | null | undefined)[];
  confLevel: number;
}

/**
 * Por encima de este tamano de grupo la confianza del intervalo se calcula
 * con la aproximacion normal con correccion de continuidad; por debajo, con
 * el binomial exacto. Mismo criterio que en lib/sign.ts.
 */
export const MOOD_EXACT_MAX_N = 50;

function cellNum(c: number | string | null | undefined): number {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

function cellText(c: number | string | null | undefined): string {
  if (c === null || c === undefined) return "";
  return String(c).trim();
}

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

function lchoose(n: number, j: number): number {
  return lgamma(n + 1) - lgamma(j + 1) - lgamma(n - j + 1);
}

/** P(X <= k) con X ~ Bin(n, 1/2). Exacto. */
function binomCdfHalf(n: number, k: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let s = 0;
  for (let j = 0; j <= k; j++) s += Math.exp(lchoose(n, j) - n * Math.LN2);
  return Math.min(1, s);
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

/** Gamma incompleta regularizada P(a,x) por serie. */
function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  let sum = 1 / a;
  let term = sum;
  for (let n = 1; n < 1000; n++) {
    term *= x / (a + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
}

/** Gamma incompleta regularizada Q(a,x) por fraccion continua. */
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  if (x < a + 1) return 1 - gammaP(a, x);
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
}

/** Cola superior de la chi-cuadrado con df grados de libertad. */
function chiSquareSf(x: number, df: number): number {
  if (!(x > 0) || !(df > 0)) return 1;
  return Math.min(1, Math.max(0, gammaQ(df / 2, x / 2)));
}

function medianSorted(s: readonly number[]): number {
  const n = s.length;
  if (n === 0) return NaN;
  const h = n >> 1;
  return n % 2 ? s[h] : (s[h - 1] + s[h]) / 2;
}

/** Cuantil al estilo Minitab: posicion (n+1)p con interpolacion lineal. */
function quantileMinitab(s: readonly number[], p: number): number {
  const n = s.length;
  if (n === 0) return NaN;
  const pos = (n + 1) * p;
  if (pos <= 1) return s[0];
  if (pos >= n) return s[n - 1];
  const lo = Math.floor(pos);
  return s[lo - 1] + (pos - lo) * (s[lo] - s[lo - 1]);
}

function makeBox(sorted: readonly number[]): MoodBox {
  const q1 = quantileMinitab(sorted, 0.25);
  const q3 = quantileMinitab(sorted, 0.75);
  const iqr = q3 - q1;
  const loLimit = q1 - 1.5 * iqr;
  const hiLimit = q3 + 1.5 * iqr;
  const inside = sorted.filter((v) => v >= loLimit && v <= hiLimit);
  const outliers = sorted.filter((v) => v < loLimit || v > hiLimit);
  return {
    q1,
    median: medianSorted(sorted),
    q3,
    lowerFence: inside.length ? inside[0] : sorted[0],
    upperFence: inside.length
      ? inside[inside.length - 1]
      : sorted[sorted.length - 1],
    outliers,
  };
}

/** Confianza del intervalo (x_(k), x_(n+1-k)) para la mediana, bilateral. */
function coverage(n: number, k: number): number {
  if (n <= MOOD_EXACT_MAX_N) return 1 - 2 * binomCdfHalf(n, k - 1);
  const z = (k - 0.5 - n / 2) / Math.sqrt(n / 4);
  return 1 - 2 * normalCdf(z);
}

/**
 * Intervalo para la mediana por estadisticos de orden, con la interpolacion
 * no lineal de Hettmansperger-Sheather cuando el nivel pedido cae entre dos
 * niveles alcanzables.
 */
function medianCI(sorted: readonly number[], target: number): [number, number] {
  const n = sorted.length;
  if (n < 2) return [NaN, NaN];
  const half = Math.floor(n / 2);
  if (coverage(n, 1) < target) return [sorted[0], sorted[n - 1]];

  let k = 1;
  while (k < half && coverage(n, k + 1) >= target) k++;
  const kOut = k;
  const kIn = k + 1;
  const cOut = coverage(n, kOut);

  if (kIn > half || Math.abs(cOut - target) < 1e-12) {
    return [sorted[kOut - 1], sorted[n - kOut]];
  }
  const cIn = coverage(n, kIn);
  const lam =
    ((n - kOut) * (cOut - target)) /
    (kOut * (target - cIn) + (n - kOut) * (cOut - target));
  const lo = (1 - lam) * sorted[kOut - 1] + lam * sorted[kIn - 1];
  const hi = (1 - lam) * sorted[n - kOut] + lam * sorted[n - kIn];
  return [lo, hi];
}

export function moodsMedian(input: MoodInput): HTMoodsMedianResult {
  const { responseColumn, factorColumn, rawResponse, rawFactor, confLevel } =
    input;

  // --- 1. Limpieza por pares (respuesta, factor) -------------------------
  const rows: { v: number; g: string }[] = [];
  let nMissing = 0;
  const len = Math.max(rawResponse.length, rawFactor.length);
  for (let i = 0; i < len; i++) {
    const v = cellNum(rawResponse[i]);
    const g = cellText(rawFactor[i]);
    if (Number.isFinite(v) && g !== "") rows.push({ v, g });
    else nMissing++;
  }
  const nTotal = rows.length;

  if (nTotal < 2) {
    return {
      ok: false,
      error: "Select a numeric response column and a grouping column.",
    };
  }
  if (!(confLevel > 0 && confLevel < 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }

  // --- 2. Mediana global -------------------------------------------------
  const allSorted = rows.map((r) => r.v).sort((a, b) => a - b);
  const overallMedian = medianSorted(allSorted);

  // --- 3. Grupos, en orden alfabetico como hace el informe ---------------
  const byLevel = new Map<string, number[]>();
  for (const r of rows) {
    const arr = byLevel.get(r.g);
    if (arr) arr.push(r.v);
    else byLevel.set(r.g, [r.v]);
  }
  const levels = [...byLevel.keys()].sort((a, b) => a.localeCompare(b));

  if (levels.length < 2) {
    return {
      ok: false,
      error: "The grouping column must contain at least two different levels.",
    };
  }

  const target = confLevel / 100;
  const groups: MoodGroup[] = levels.map((level) => {
    const values = (byLevel.get(level) as number[]).sort((a, b) => a - b);
    const n = values.length;
    // Los valores iguales a la mediana global cuentan como "<=".
    let nLE = 0;
    for (const v of values) if (v <= overallMedian) nLE++;
    const q1 = quantileMinitab(values, 0.25);
    const q3 = quantileMinitab(values, 0.75);
    const [ciLow, ciHigh] = medianCI(values, target);
    return {
      level,
      n,
      median: medianSorted(values),
      nLE,
      nGT: n - nLE,
      q1,
      q3,
      iqr: q3 - q1,
      ciLow,
      ciHigh,
      values,
      box: makeBox(values),
    };
  });

  // --- 4. Chi-cuadrado sobre la tabla 2 x k ------------------------------
  // Pearson sin correccion de continuidad, DF = k - 1.
  const totLE = groups.reduce((s, g) => s + g.nLE, 0);
  const totGT = nTotal - totLE;
  let chiSquare = 0;
  let lowExpected = false;
  for (const g of groups) {
    const eLE = (totLE * g.n) / nTotal;
    const eGT = (totGT * g.n) / nTotal;
    if (eLE < 5 || eGT < 5) lowExpected = true;
    if (eLE > 0) chiSquare += ((g.nLE - eLE) * (g.nLE - eLE)) / eLE;
    if (eGT > 0) chiSquare += ((g.nGT - eGT) * (g.nGT - eGT)) / eGT;
  }
  const df = groups.length - 1;
  const pValue = chiSquareSf(chiSquare, df);

  return {
    ok: true,
    responseColumn,
    factorColumn,
    nMissing,
    nTotal,
    overallMedian,
    groups,
    confLevel,
    chiSquare,
    df,
    pValue,
    lowExpected,
  };
}
