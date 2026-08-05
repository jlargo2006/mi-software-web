// app/app/six-sigma/lib/tPaired.ts
//
// Motor del Paired t-Test. Verificado contra Minitab (Mat-A / Mat-B, n = 10):
//   Mat-A        10  10,630  2,451  0,775
//   Mat-B        10  11,040  2,518  0,796
//   Difference       -0,410  0,387  0,122   IC 95% (-0,687; -0,133)
//   T = -3,35   P = 0,009
//
// Notas de implementacion:
//
// 1) El emparejamiento es POR FILA. Si falta un valor en cualquiera de las dos
//    columnas se descarta la fila entera. Filtrar cada columna por separado
//    daria medias marginales incoherentes con la media de las diferencias.
//
// 2) Los cuartiles del boxplot siguen el metodo de Minitab: posicion (n+1)p
//    con interpolacion lineal. Los metodos de Plotly ("linear", "inclusive",
//    "exclusive") dan valores distintos; ver boxStats().

export type Alternative = "less" | "two-sided" | "greater";
export type CIKind = "two" | "lower" | "upper";

export interface PairedBox {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

export interface TPairedModel {
  ok: boolean;
  error?: string;

  colX: string;
  colY: string;

  /** Pares validos usados en el analisis. */
  n: number;
  /** Filas descartadas por valor ausente o no numerico en alguna columna. */
  droppedRows: number;

  meanX: number;
  sdX: number;
  seX: number;
  meanY: number;
  sdY: number;
  seY: number;

  meanDiff: number;
  sdDiff: number;
  seDiff: number;

  performTest: boolean;
  mu0: number;
  alternative: Alternative;
  confLevel: number;

  ciKind: CIKind;
  ciLow: number;
  ciHigh: number;

  tValue: number;
  pValue: number;
  df: number;

  /** Diferencias x - y, en orden de fila. */
  differences: number[];
  /** Pares usados, alineados con `differences`. */
  pairs: { x: number; y: number }[];
  /** Cinco numeros de las diferencias, con cuartiles al estilo Minitab. */
  box: PairedBox;
}

export interface TPairedInput {
  colX: string;
  colY: string;
  rawX: readonly (number | string | null | undefined)[];
  rawY: readonly (number | string | null | undefined)[];
  confLevel: number;
  performTest: boolean;
  mu0: number;
  alternative: Alternative;
}

// --- Utilidades numericas ---------------------------------------------------

const mean = (v: readonly number[]): number =>
  v.reduce((s, x) => s + x, 0) / v.length;

function stDev(v: readonly number[]): number {
  const n = v.length;
  if (n < 2) return NaN;
  const m = mean(v);
  let ss = 0;
  for (const x of v) ss += (x - m) ** 2;
  return Math.sqrt(ss / (n - 1));
}

/**
 * Celda cruda -> numero. Acepta coma decimal, igual que la entrada de
 * parametros. Devuelve NaN si la celda esta vacia o no es numerica; la fila
 * se descartara entera en tPaired().
 */
function cellNum(c: number | string | null | undefined): number {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

/** log Gamma (Lanczos). */
function lnGamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const z = x - 1;
  let a = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) a += g[i] / (z + i + 1);
  const t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Fraccion continua de Lentz para la beta incompleta. */
function betaCF(a: number, b: number, x: number): number {
  const TINY = 1e-300;
  const EPS = 3e-16;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Beta incompleta regularizada I_x(a, b). */
function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta =
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x);
  const front = Math.exp(lbeta);
  return x < (a + 1) / (a + b + 2)
    ? (front * betaCF(a, b, x)) / a
    : 1 - (Math.exp(
        lnGamma(a + b) - lnGamma(a) - lnGamma(b) +
        b * Math.log(1 - x) + a * Math.log(x)
      ) * betaCF(b, a, 1 - x)) / b;
}

/**
 * Cola superior de la t de Student: P(T > t) con `df` grados de libertad.
 * Validado contra scipy.stats.t.sf a 1e-17.
 */
export function tSF(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  const p = 0.5 * betaInc(df / 2, 0.5, df / (df + t * t));
  return t > 0 ? p : 1 - p;
}

/**
 * Cuantil de la t de Student: valor t con P(T <= t) = p.
 * Biseccion sobre tSF. Validado contra scipy.stats.t.ppf a 3e-15.
 */
export function tQuantile(p: number, df: number): number {
  if (!(p > 0 && p < 1) || !Number.isFinite(df) || df <= 0) return NaN;
  if (p === 0.5) return 0;
  let lo = -1e3;
  let hi = 1e3;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (1 - tSF(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Percentil al estilo Minitab: posicion (n+1)p con interpolacion lineal.
 * IMPORTANTE: no coincide con ningun `quartilemethod` de Plotly. Con las
 * diferencias del caso Mat-A/Mat-B da Q1 = -0,650 y Q3 = -0,200, que es lo
 * que muestra Minitab; Plotly "inclusive" daria Q1 = -0,575.
 */
export function percentileMinitab(sorted: readonly number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  const pos = (n + 1) * p;
  if (pos <= 1) return sorted[0];
  if (pos >= n) return sorted[n - 1];
  const lo = Math.floor(pos);
  const frac = pos - lo;
  return sorted[lo - 1] + frac * (sorted[lo] - sorted[lo - 1]);
}

/** Cinco numeros + vallas de 1,5 RIC y atipicos. */
export function boxStats(values: readonly number[]): PairedBox {
  const s = [...values].sort((a, b) => a - b);
  const q1 = percentileMinitab(s, 0.25);
  const median = percentileMinitab(s, 0.5);
  const q3 = percentileMinitab(s, 0.75);
  const iqr = q3 - q1;
  const loFence = q1 - 1.5 * iqr;
  const hiFence = q3 + 1.5 * iqr;
  const inside = s.filter((v) => v >= loFence && v <= hiFence);
  return {
    min: s[0],
    q1,
    median,
    q3,
    max: s[s.length - 1],
    lowerFence: inside.length ? inside[0] : s[0],
    upperFence: inside.length ? inside[inside.length - 1] : s[s.length - 1],
    outliers: s.filter((v) => v < loFence || v > hiFence),
  };
}

// --- Modelo vacio -----------------------------------------------------------

function empty(colX: string, colY: string, error?: string): TPairedModel {
  return {
    ok: false,
    error,
    colX,
    colY,
    n: 0,
    droppedRows: 0,
    meanX: NaN, sdX: NaN, seX: NaN,
    meanY: NaN, sdY: NaN, seY: NaN,
    meanDiff: NaN, sdDiff: NaN, seDiff: NaN,
    performTest: false,
    mu0: NaN,
    alternative: "two-sided",
    confLevel: NaN,
    ciKind: "two",
    ciLow: NaN,
    ciHigh: NaN,
    tValue: NaN,
    pValue: NaN,
    df: NaN,
    differences: [],
    pairs: [],
    box: {
      min: NaN, q1: NaN, median: NaN, q3: NaN, max: NaN,
      lowerFence: NaN, upperFence: NaN, outliers: [],
    },
  };
}

// --- Calculo principal ------------------------------------------------------

export function tPaired(input: TPairedInput): TPairedModel {
  const { colX, colY, rawX, rawY, performTest, alternative } = input;

  if (!colX || !colY) return empty(colX, colY);
  if (colX === colY) {
    return empty(colX, colY, "Select two different columns.");
  }

  // 1) Emparejar por fila, descartando filas incompletas.
  const rows = Math.max(rawX.length, rawY.length);
  const pairs: { x: number; y: number }[] = [];
  let dropped = 0;
  for (let i = 0; i < rows; i++) {
    const a = cellNum(rawX[i]);
    const b = cellNum(rawY[i]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      pairs.push({ x: a, y: b });
    } else {
      dropped++;
    }
  }

  const n = pairs.length;
  if (n < 2) {
    return {
      ...empty(colX, colY, `Only ${n} complete pair(s). At least 2 are required.`),
      droppedRows: dropped,
    };
  }

  const xs = pairs.map((p) => p.x);
  const ys = pairs.map((p) => p.y);
  const differences = pairs.map((p) => p.x - p.y);

  const meanX = mean(xs);
  const sdX = stDev(xs);
  const meanY = mean(ys);
  const sdY = stDev(ys);
  const meanDiff = mean(differences);
  const sdDiff = stDev(differences);
  const seDiff = sdDiff / Math.sqrt(n);
  const df = n - 1;

  const confLevel = Number.isFinite(input.confLevel) ? input.confLevel : 95;
  if (!(confLevel > 0 && confLevel < 100)) {
    return {
      ...empty(colX, colY, "Confidence level must be between 0 and 100."),
      droppedRows: dropped,
    };
  }
  const alpha = 1 - confLevel / 100;

  const mu0 = performTest && Number.isFinite(input.mu0) ? input.mu0 : 0;

  // 2) Intervalo o cota, en el sentido de H1.
  const ciKind: CIKind =
    !performTest || alternative === "two-sided"
      ? "two"
      : alternative === "greater"
        ? "lower"
        : "upper";

  let ciLow = -Infinity;
  let ciHigh = Infinity;
  if (ciKind === "two") {
    const tc = tQuantile(1 - alpha / 2, df);
    ciLow = meanDiff - tc * seDiff;
    ciHigh = meanDiff + tc * seDiff;
  } else {
    const tc = tQuantile(1 - alpha, df);
    if (ciKind === "lower") ciLow = meanDiff - tc * seDiff;
    else ciHigh = meanDiff + tc * seDiff;
  }

  // 3) Estadistico y p-valor.
  let tValue = NaN;
  let pValue = NaN;
  if (performTest) {
    tValue = seDiff > 0 ? (meanDiff - mu0) / seDiff : NaN;
    if (Number.isFinite(tValue)) {
      pValue =
        alternative === "two-sided"
          ? 2 * tSF(Math.abs(tValue), df)
          : alternative === "greater"
            ? tSF(tValue, df)
            : 1 - tSF(tValue, df);
    }
  }

  return {
    ok: true,
    colX,
    colY,
    n,
    droppedRows: dropped,
    meanX, sdX, seX: sdX / Math.sqrt(n),
    meanY, sdY, seY: sdY / Math.sqrt(n),
    meanDiff, sdDiff, seDiff,
    performTest,
    mu0,
    alternative,
    confLevel,
    ciKind,
    ciLow,
    ciHigh,
    tValue,
    pValue,
    df,
    differences,
    pairs,
    box: boxStats(differences),
  };
}
