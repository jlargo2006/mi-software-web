// app/app/six-sigma/lib/sign.ts
import type {
  SignAlternative,
  SignCIKind,
  SignCIRow,
  HTSignResult,
} from "../studies/ht/sign/types";

export interface SignInput {
  column: string;
  raw: readonly (number | string | null | undefined)[];
  eta0: number;
  alternative: SignAlternative;
  confLevel: number;
  performTest: boolean;
  performCI: boolean;
}

/**
 * Por encima de este tamano la confianza alcanzada se calcula con la
 * aproximacion normal con correccion de continuidad, que es lo que hace
 * Minitab: con n=500 el binomial exacto da 94,5631% donde Minitab imprime
 * 94,55%. Por debajo se usa el binomial exacto, donde la discretizacion es
 * grande y el valor exacto es el informativo.
 */
export const SIGN_EXACT_MAX_N = 50;

function cellNum(c: number | string | null | undefined): number {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

/** Log-gamma (Lanczos). Base para el binomial exacto sin desbordar. */
function lgamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return (
      Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
    );
  }
  const z = x - 1;
  let a = 0.99999999999980993;
  const t = z + 7.5;
  for (let i = 0; i < g.length; i++) a += g[i] / (z + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

const LN2 = Math.LN2;

/** log C(n,j) */
function lchoose(n: number, j: number): number {
  return lgamma(n + 1) - lgamma(j + 1) - lgamma(n - j + 1);
}

/** P(X <= k) con X ~ Bin(n, 1/2). Exacto. */
function binomCdfHalf(n: number, k: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let s = 0;
  for (let j = 0; j <= k; j++) s += Math.exp(lchoose(n, j) - n * LN2);
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

/**
 * Confianza del intervalo (x_(k), x_(n+1-k)) para la mediana.
 * tails = 2 para el bilateral, 1 para los limites unilaterales.
 */
function coverage(n: number, k: number, tails: 1 | 2): number {
  if (n <= SIGN_EXACT_MAX_N) {
    return 1 - tails * binomCdfHalf(n, k - 1);
  }
  // Normal con correccion de continuidad: (k-1)+0.5 = k-0.5
  const z = (k - 0.5 - n / 2) / Math.sqrt(n / 4);
  return 1 - tails * normalCdf(z);
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

export function signTest(input: SignInput): HTSignResult {
  const { column, raw, eta0, alternative, confLevel } = input;

  // --- 1. Limpieza -------------------------------------------------------
  const values: number[] = [];
  let nMissing = 0;
  for (const c of raw) {
    const v = cellNum(c);
    if (Number.isFinite(v)) values.push(v);
    else nMissing++;
  }
  const n = values.length;

  if (n < 1) {
    return { ok: false, error: "Select a column to run the analysis." };
  }
  if (input.performTest && !Number.isFinite(eta0)) {
    return { ok: false, error: "The hypothesized median is not a valid number." };
  }
  if (input.performCI && !(confLevel > 0 && confLevel < 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sampleMedian = medianSorted(sorted);

  // --- 2. Recuentos respecto a eta_0 -------------------------------------
  let nBelow = 0;
  let nAbove = 0;
  for (const v of values) {
    if (v < eta0) nBelow++;
    else if (v > eta0) nAbove++;
  }
  const nEqual = n - nBelow - nAbove;
  const nTest = nBelow + nAbove;

  // --- 3. P-valor binomial exacto ----------------------------------------
  // Las observaciones iguales a eta_0 no aportan signo y se excluyen.
  let pValue = NaN;
  if (input.performTest && nTest > 0) {
    if (alternative === "two-sided") {
      const m = Math.min(nBelow, nAbove);
      pValue = Math.min(1, 2 * binomCdfHalf(nTest, m));
    } else if (alternative === "less") {
      // Mediana menor que eta_0: pocos valores por encima.
      pValue = binomCdfHalf(nTest, nAbove);
    } else {
      pValue = binomCdfHalf(nTest, nBelow);
    }
    pValue = Math.min(1, Math.max(0, pValue));
  }

  // --- 4. Intervalo por estadisticos de orden ----------------------------
  const ciKind: SignCIKind =
    alternative === "two-sided"
      ? "two"
      : alternative === "greater"
        ? "lower"
        : "upper";
  const tails: 1 | 2 = ciKind === "two" ? 2 : 1;
  const target = confLevel / 100;
  const rows: SignCIRow[] = [];

  if (input.performCI && n >= 2) {
    // coverage decrece con k: se busca el ultimo k que aun cubre el nivel.
    let k = 1;
    while (k < Math.floor(n / 2) && coverage(n, k + 1, tails) >= target) k++;
    const kOut = k; // conf >= target
    const kIn = k + 1; // conf < target
    const cOut = coverage(n, kOut, tails);
    const cIn = coverage(n, kIn, tails);

    const bound = (idx: number): [number, number] => [
      sorted[idx - 1],
      sorted[n - idx],
    ];
    const mk = (kk: number, conf: number): SignCIRow => {
      const [lo, hi] = bound(kk);
      return {
        low: ciKind === "upper" ? -Infinity : lo,
        high: ciKind === "lower" ? Infinity : hi,
        conf: conf * 100,
        posLow: ciKind === "upper" ? null : kk,
        posHigh: ciKind === "lower" ? null : n + 1 - kk,
        interpolated: false,
      };
    };

    if (kIn > Math.floor(n / 2) || Math.abs(cOut - target) < 1e-12) {
      rows.push(mk(kOut, cOut));
    } else {
      // Interpolacion no lineal de Hettmansperger-Sheather entre los dos
      // intervalos alcanzables que rodean al nivel pedido.
      const lam =
        ((n - kOut) * (cOut - target)) /
        (kOut * (target - cIn) + (n - kOut) * (cOut - target));
      const [loIn, hiIn] = bound(kIn);
      const [loOut, hiOut] = bound(kOut);
      const li = (1 - lam) * loOut + lam * loIn;
      const hi = (1 - lam) * hiOut + lam * hiIn;

      rows.push(mk(kIn, cIn));
      rows.push({
        low: ciKind === "upper" ? -Infinity : li,
        high: ciKind === "lower" ? Infinity : hi,
        conf: target * 100,
        posLow: null,
        posHigh: null,
        interpolated: true,
      });
      rows.push(mk(kOut, cOut));
    }
  }

  // --- 5. Boxplot --------------------------------------------------------
  const q1 = quantileMinitab(sorted, 0.25);
  const q3 = quantileMinitab(sorted, 0.75);
  const iqr = q3 - q1;
  const loLimit = q1 - 1.5 * iqr;
  const hiLimit = q3 + 1.5 * iqr;
  const inside = sorted.filter((v) => v >= loLimit && v <= hiLimit);
  const outliers = sorted.filter((v) => v < loLimit || v > hiLimit);

  return {
    ok: true,
    column,
    values,
    nMissing,
    n,
    nBelow,
    nEqual,
    nAbove,
    nTest,
    sampleMedian,
    eta0,
    alternative,
    performTest: input.performTest,
    pValue,
    performCI: input.performCI,
    ciKind,
    confLevel,
    rows,
    box: {
      q1,
      median: sampleMedian,
      q3,
      lowerFence: inside.length ? inside[0] : sorted[0],
      upperFence: inside.length
        ? inside[inside.length - 1]
        : sorted[sorted.length - 1],
      outliers,
    },
  };
}
