// app/app/six-sigma/lib/mannWhitney.ts
import type {
  MWAlternative,
  MWBox,
  MWCIKind,
  HTMannWhitneyResult,
} from "../studies/ht/mannwhitney/types";

export interface MWInput {
  colX: string;
  colY: string;
  rawX: readonly (number | string | null | undefined)[];
  rawY: readonly (number | string | null | undefined)[];
  eta0: number;
  alternative: MWAlternative;
  confLevel: number;
  performTest: boolean;
}

/**
 * Limite para el calculo O(n1*n2) de las diferencias por pares, necesario
 * para Hodges-Lehmann y el intervalo. 4000x4000 son 16 millones de valores.
 */
export const MW_MAX_PAIRS = 16_000_000;

function cellNum(c: number | string | null | undefined): number {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
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

/** Cuantil normal estandar (Acklam). Precision ~1e-9, sobrada aqui. */
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

function medianSorted(s: readonly number[] | Float64Array): number {
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

function makeBox(sorted: readonly number[]): MWBox {
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

export function mannWhitney(input: MWInput): HTMannWhitneyResult {
  const { colX, colY, rawX, rawY, eta0, alternative, confLevel } = input;

  // --- 1. Limpieza -------------------------------------------------------
  const valuesX: number[] = [];
  const valuesY: number[] = [];
  let nMissingX = 0;
  let nMissingY = 0;
  for (const c of rawX) {
    const v = cellNum(c);
    if (Number.isFinite(v)) valuesX.push(v);
    else nMissingX++;
  }
  for (const c of rawY) {
    const v = cellNum(c);
    if (Number.isFinite(v)) valuesY.push(v);
    else nMissingY++;
  }
  const n1 = valuesX.length;
  const n2 = valuesY.length;

  if (n1 < 1 || n2 < 1) {
    return { ok: false, error: "Select two columns to run the analysis." };
  }
  if (!Number.isFinite(eta0)) {
    return {
      ok: false,
      error: "The hypothesized difference is not a valid number.",
    };
  }
  if (!(confLevel > 0 && confLevel < 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }
  if (n1 * n2 > MW_MAX_PAIRS) {
    return {
      ok: false,
      error: `The pairwise computation is limited to ${MW_MAX_PAIRS} pairs (this pair of columns needs ${n1 * n2}).`,
    };
  }

  const sortedX = [...valuesX].sort((a, b) => a - b);
  const sortedY = [...valuesY].sort((a, b) => a - b);

  // --- 2. Rangos sobre la muestra combinada ------------------------------
  // La hipotesis nula es eta_1 - eta_2 = eta_0, asi que se desplaza la
  // primera muestra antes de mezclar: con eta_0 = 0 no cambia nada.
  const shifted = valuesX.map((v) => v - eta0);
  const pooled = [...shifted, ...valuesY];
  const N = n1 + n2;

  const idx = Array.from({ length: N }, (_, i) => i).sort(
    (a, b) => pooled[a] - pooled[b]
  );
  const ranks = new Array<number>(N);
  let tieTerm = 0;
  let i = 0;
  while (i < N) {
    let j = i;
    while (j + 1 < N && pooled[idx[j + 1]] === pooled[idx[i]]) j++;
    const avg = (i + j) / 2 + 1; // rangos 1-based
    const t = j - i + 1;
    if (t > 1) tieTerm += t * t * t - t;
    for (let k = i; k <= j; k++) ranks[idx[k]] = avg;
    i = j + 1;
  }
  const tiesCorrected = tieTerm > 0;

  // W de Minitab: suma de rangos de la PRIMERA muestra, no la U.
  let wValue = 0;
  for (let k = 0; k < n1; k++) wValue += ranks[k];

  // --- 3. Aproximacion normal con correccion de continuidad --------------
  let zValue = NaN;
  let pValue = NaN;
  if (input.performTest) {
    const meanW = (n1 * (N + 1)) / 2;
    // Varianza con correccion por empates en la muestra combinada.
    const varW =
      ((n1 * n2) / 12) * (N + 1 - tieTerm / (N * (N - 1)));
    if (varW > 0) {
      const diff = wValue - meanW;
      // Correccion de continuidad: acerca W a la media en media unidad.
      const cc = diff > 0 ? -0.5 : diff < 0 ? 0.5 : 0;
      zValue = (diff + cc) / Math.sqrt(varW);
      pValue =
        alternative === "two-sided"
          ? 2 * (1 - normalCdf(Math.abs(zValue)))
          : alternative === "greater"
            ? 1 - normalCdf(zValue)
            : normalCdf(zValue);
      pValue = Math.min(1, Math.max(0, pValue));
    }
  }

  // --- 4. Hodges-Lehmann e intervalo -------------------------------------
  // Todas las diferencias x_i - y_j. Son n1*n2 valores: 40.000 aqui.
  const diffs = new Float64Array(n1 * n2);
  let p = 0;
  for (let a = 0; a < n1; a++) {
    const xa = valuesX[a];
    for (let bIdx = 0; bIdx < n2; bIdx++) diffs[p++] = xa - valuesY[bIdx];
  }
  diffs.sort();
  const m = diffs.length;
  const hlDifference = medianSorted(diffs);

  const ciKind: MWCIKind =
    alternative === "two-sided"
      ? "two"
      : alternative === "greater"
        ? "lower"
        : "upper";
  const tails = ciKind === "two" ? 2 : 1;

  const alpha = 1 - confLevel / 100;
  const tail = ciKind === "two" ? alpha / 2 : alpha;
  const muU = (n1 * n2) / 2;
  const sdU = Math.sqrt(
    ((n1 * n2) / 12) * (N + 1 - tieTerm / (N * (N - 1)))
  );
  // k = numero de diferencias que se recortan por cada cola.
  const k = Math.max(0, Math.round(muU - normalInv(1 - tail) * sdU));

  let ciLow = -Infinity;
  let ciHigh = Infinity;
  if (ciKind !== "upper") ciLow = diffs[Math.min(k, m - 1)];
  if (ciKind !== "lower") ciHigh = diffs[Math.max(0, m - 1 - k)];

  // Confianza efectivamente alcanzada con ese k entero.
  const zEff = sdU > 0 ? (muU - k - 0.5) / sdU : 0;
  const achievedConf = (1 - tails * (1 - normalCdf(zEff))) * 100;

  return {
    ok: true,
    colX,
    colY,
    valuesX,
    valuesY,
    nMissingX,
    nMissingY,
    n1,
    n2,
    medianX: medianSorted(sortedX),
    medianY: medianSorted(sortedY),
    hlDifference,
    eta0,
    alternative,
    performTest: input.performTest,
    wValue,
    zValue,
    pValue,
    tiesCorrected,
    ciKind,
    confLevel,
    achievedConf,
    ciLow,
    ciHigh,
    boxX: makeBox(sortedX),
    boxY: makeBox(sortedY),
  };
}
