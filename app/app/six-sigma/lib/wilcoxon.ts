// app/app/six-sigma/lib/wilcoxon.ts
import type {
  WilcoxonAlternative,
  WilcoxonCIKind,
  HTWilcoxonResult,
} from "../studies/ht/wilcoxon/types";

export interface WilcoxonInput {
  column: string;
  raw: readonly (number | string | null | undefined)[];
  eta0: number;
  alternative: WilcoxonAlternative;
  confLevel: number;
  performTest: boolean;
  performCI: boolean;
}

/** Limite practico para el calculo O(n^2) de los promedios de Walsh. */
export const WALSH_MAX_N = 4000;

/**
 * Celda cruda -> numero. Acepta coma decimal. NaN si esta vacia o no es
 * numerica; esas celdas se descartan y se cuentan en nMissing.
 */
function cellNum(c: number | string | null | undefined): number {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

/** Funcion de distribucion normal estandar (Abramowitz-Stegun 7.1.26). */
function normalCdf(z: number): number {
  const s = z < 0 ? -1 : 1;
  const a = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-a * a);
  return 0.5 * (1 + s * y);
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

/** Mediana de una secuencia ya ordenada. */
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
  const frac = pos - lo;
  return s[lo - 1] + frac * (s[lo] - s[lo - 1]);
}

/**
 * Rangos promediados para empates (midranks). Devuelve el rango de cada
 * elemento en su posicion original y el termino de correccion por empates.
 */
function midranks(v: readonly number[]): { ranks: number[]; tieTerm: number } {
  const n = v.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => v[a] - v[b]
  );
  const ranks = new Array<number>(n);
  let tieTerm = 0;
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && v[idx[j + 1]] === v[idx[i]]) j++;
    const avg = (i + j) / 2 + 1; // rangos 1-based
    const t = j - i + 1;
    if (t > 1) tieTerm += t * t * t - t;
    for (let k = i; k <= j; k++) ranks[idx[k]] = avg;
    i = j + 1;
  }
  return { ranks, tieTerm };
}

/**
 * Promedios de Walsh (x_i + x_j)/2 con i <= j, ordenados.
 * Son n(n+1)/2 valores: 125.250 para n=500. Coste O(n^2) en tiempo y memoria.
 */
function walshAverages(s: readonly number[]): Float64Array {
  const n = s.length;
  const w = new Float64Array((n * (n + 1)) / 2);
  let k = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) w[k++] = (s[i] + s[j]) / 2;
  }
  w.sort();
  return w;
}

export function wilcoxonSignedRank(input: WilcoxonInput): HTWilcoxonResult {
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
  if (n > WALSH_MAX_N) {
    return {
      ok: false,
      error: `The Hodges-Lehmann estimator is limited to ${WALSH_MAX_N} observations (this column has ${n}).`,
    };
  }

  // Validaciones de parametros: van despues de la limpieza para que, con la
  // columna aun sin elegir, el usuario vea "Select a column" y no un aviso
  // sobre la mediana hipotetica (que es NaN por construccion al abrir).
  if (input.performTest && !Number.isFinite(eta0)) {
    return { ok: false, error: "The hypothesized median is not a valid number." };
  }
  if (input.performCI && !(confLevel > 0 && confLevel < 100)) {
    return { ok: false, error: "The confidence level must be between 0 and 100." };
  }

  const sorted = [...values].sort((a, b) => a - b);

  // --- 2. Diferencias respecto a eta_0; se descartan los ceros -----------
  // Minitab excluye las observaciones exactamente iguales a la mediana
  // hipotetica, y por eso "N for Test" puede ser menor que N.
  const diffs: number[] = [];
  for (const v of values) {
    const d = v - eta0;
    if (d !== 0) diffs.push(d);
  }
  const nTest = diffs.length;
  const nZeros = n - nTest;

  // --- 3. Estadistico W+ -------------------------------------------------
  let wStatistic = NaN;
  let zValue = NaN;
  let pValue = NaN;
  let tiesCorrected = false;

  if (input.performTest && nTest > 0) {
    const abs = diffs.map(Math.abs);
    const { ranks, tieTerm } = midranks(abs);
    let wPlus = 0;
    for (let i = 0; i < nTest; i++) if (diffs[i] > 0) wPlus += ranks[i];
    wStatistic = wPlus;

    const mean = (nTest * (nTest + 1)) / 4;
    // Varianza con correccion por empates en |d|.
    const varW = (nTest * (nTest + 1) * (2 * nTest + 1)) / 24 - tieTerm / 48;
    tiesCorrected = tieTerm > 0;

    zValue = varW > 0 ? (wPlus - mean) / Math.sqrt(varW) : NaN;
    if (Number.isFinite(zValue)) {
      pValue =
        alternative === "two-sided"
          ? 2 * (1 - normalCdf(Math.abs(zValue)))
          : alternative === "greater"
            ? 1 - normalCdf(zValue)
            : normalCdf(zValue);
      pValue = Math.min(1, Math.max(0, pValue));
    }
  }

  // --- 4. Estimador puntual e intervalo ----------------------------------
  // Ojo: la columna "Median" del informe de Minitab es Hodges-Lehmann, la
  // mediana de los promedios de Walsh, NO la mediana muestral. En reparto
  // asimetrico ambas difieren de forma bien visible.
  const walsh = walshAverages(sorted);
  const m = walsh.length;
  const hodgesLehmann = medianSorted(walsh);
  const sampleMedian = medianSorted(sorted);

  const ciKind: WilcoxonCIKind =
    alternative === "two-sided"
      ? "two"
      : alternative === "greater"
        ? "lower"
        : "upper";

  let ciLow = -Infinity;
  let ciHigh = Infinity;
  let achievedConf = NaN;

  if (input.performCI && nTest > 0) {
    const alpha = 1 - confLevel / 100;
    const tail = ciKind === "two" ? alpha / 2 : alpha;
    const mu = (nTest * (nTest + 1)) / 4;
    const sd = Math.sqrt((nTest * (nTest + 1) * (2 * nTest + 1)) / 24);
    // k = numero de promedios de Walsh que se recortan por cada cola.
    const k = Math.max(0, Math.floor(mu - normalInv(1 - tail) * sd));
    if (ciKind !== "upper") ciLow = walsh[Math.min(k, m - 1)];
    if (ciKind !== "lower") ciHigh = walsh[Math.max(0, m - 1 - k)];
    // Confianza realmente alcanzada con ese k entero: la distribucion es
    // discreta, asi que rara vez coincide con el nivel pedido.
    const zEff = sd > 0 ? (mu - k) / sd : 0;
    const oneTail = 1 - normalCdf(zEff);
    achievedConf = (1 - (ciKind === "two" ? 2 * oneTail : oneTail)) * 100;
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
    nTest,
    nZeros,
    sampleMedian,
    hodgesLehmann,
    eta0,
    alternative,
    performTest: input.performTest,
    wStatistic,
    zValue,
    pValue,
    tiesCorrected,
    performCI: input.performCI,
    ciKind,
    confLevel,
    achievedConf,
    ciLow,
    ciHigh,
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
