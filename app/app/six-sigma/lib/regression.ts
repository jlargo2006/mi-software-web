// app/app/six-sigma/lib/regression.ts

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
    let nu: number;
    if (i === 0) nu = 1;
    else if (i % 2 === 0)
      nu = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    else nu = (-((a + m) * (a + b + m)) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + nu * d;
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    c = 1 + nu / c;
    if (Math.abs(c) < tiny) c = tiny;
    const cd = c * d;
    f *= cd;
    if (Math.abs(1 - cd) < 1e-15) break;
  }
  return Math.exp(lfront) * (f - 1);
}

/** Cola superior de la t de Student. */
export function tSf(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return NaN;
  const p = 0.5 * betaInc(df / (df + t * t), df / 2, 0.5);
  return t >= 0 ? p : 1 - p;
}

/** Cola superior de la F de Snedecor. */
export function fSf(f: number, df1: number, df2: number): number {
  // Una F no calculable devuelve NaN, no 1: un p-valor de 1,000 es un
  // resultado creible y ocultaria que no habia nada que contrastar.
  if (!Number.isFinite(f) || !Number.isFinite(df1) || !Number.isFinite(df2)) {
    return NaN;
  }
  if (df1 <= 0 || df2 <= 0) return NaN;
  if (f <= 0) return 1;
  return Math.min(1, Math.max(0, betaInc(df2 / (df2 + df1 * f), df2 / 2, df1 / 2)));
}

/** Cuantil de la t de Student, por biseccion sobre la cola. */
export function tQuantile(p: number, df: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -300;
  let hi = 300;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (1 - tSf(mid, df) < p) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-12) break;
  }
  return (lo + hi) / 2;
}

/** Cuantil normal estandar (Acklam). */
export function normalInv(p: number): number {
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

/** Inversa de una matriz pequena por Gauss-Jordan con pivoteo parcial. */
function inverse(A: number[][]): number[][] | null {
  const n = A.length;
  const M = A.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let i = 0; i < n; i++) {
    let piv = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
    }
    if (Math.abs(M[piv][i]) < 1e-14) return null;
    [M[i], M[piv]] = [M[piv], M[i]];
    const d = M[i][i];
    for (let j = 0; j < 2 * n; j++) M[i][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i];
      if (f === 0) continue;
      for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[i][j];
    }
  }
  return M.map((row) => row.slice(n));
}

function binom(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

export interface PolyFit {
  order: number;
  /** Coeficientes en base cruda, de menor a mayor potencia. */
  coefs: number[];
  /**
   * Centro usado internamente y coeficientes en la base (x - centro). El
   * ajuste se resuelve centrado porque en grado 3 con x del orden de 2000 la
   * matriz X'X en base cruda tiene entradas del orden de 1e21 y pierde toda
   * la precision.
   */
  center: number;
  centeredCoefs: number[];
  /** Inversa de X'X en la base centrada, para los errores tipicos. */
  xtxInv: number[][];

  n: number;
  fitted: number[];
  residuals: number[];
  sse: number;
  sst: number;
  ssr: number;
  dfModel: number;
  dfError: number;
  dfTotal: number;
  mse: number;
  s: number;
  r2: number;
  r2adj: number;
  fValue: number;
  pValue: number;
}

/**
 * Ajuste polinomico por minimos cuadrados. Devuelve null si no hay
 * suficientes puntos distintos para determinar los coeficientes.
 */
export function polyFit(x: number[], y: number[], order: number): PolyFit | null {
  const n = x.length;
  const p = order + 1;
  if (n <= p) return null;
  // Con menos valores distintos que coeficientes el sistema es singular.
  if (new Set(x).size < p) return null;

  const center = x.reduce((a, b) => a + b, 0) / n;
  const xc = x.map((v) => v - center);

  // Matriz de diseno en base centrada.
  const X = xc.map((v) => Array.from({ length: p }, (_, j) => Math.pow(v, j)));

  const xtx: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const xty: number[] = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < p; a++) {
      xty[a] += X[i][a] * y[i];
      for (let b = 0; b < p; b++) xtx[a][b] += X[i][a] * X[i][b];
    }
  }

  const inv = inverse(xtx);
  if (!inv) return null;

  const cc = new Array(p).fill(0);
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) cc[a] += inv[a][b] * xty[b];
  }

  // Expansion binomial de sum a_k (x - c)^k a la base cruda.
  const coefs = new Array(p).fill(0);
  for (let k = 0; k < p; k++) {
    for (let j = 0; j <= k; j++) {
      coefs[j] += cc[k] * binom(k, j) * Math.pow(-center, k - j);
    }
  }

  const fitted = X.map((row) => row.reduce((a, v, j) => a + v * cc[j], 0));
  const residuals = y.map((v, i) => v - fitted[i]);
  const my = y.reduce((a, b) => a + b, 0) / n;

  const sse = residuals.reduce((a, r) => a + r * r, 0);
  const sst = y.reduce((a, v) => a + (v - my) * (v - my), 0);
  const ssr = Math.max(0, sst - sse);

  const dfError = n - p;
  const mse = sse / dfError;
  const r2 = sst > 0 ? ssr / sst : 0;
  const r2adj = sst > 0 ? 1 - (1 - r2) * ((n - 1) / dfError) : 0;
  const fValue = mse > 0 ? ssr / order / mse : NaN;

  return {
    order,
    coefs,
    center,
    centeredCoefs: cc,
    xtxInv: inv,
    n,
    fitted,
    residuals,
    sse,
    sst,
    ssr,
    dfModel: order,
    dfError,
    dfTotal: n - 1,
    mse,
    s: Math.sqrt(mse),
    r2: r2 * 100,
    r2adj: r2adj * 100,
    fValue,
    pValue: Number.isFinite(fValue) ? fSf(fValue, order, dfError) : NaN,
  };
}

/** Valor ajustado y su error tipico en un punto. */
export function predictAt(
  fit: PolyFit,
  x0: number
): { fit: number; seFit: number } {
  const p = fit.order + 1;
  const v = Array.from({ length: p }, (_, j) => Math.pow(x0 - fit.center, j));
  let yh = 0;
  for (let j = 0; j < p; j++) yh += v[j] * fit.centeredCoefs[j];
  let q = 0;
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) q += v[a] * fit.xtxInv[a][b] * v[b];
  }
  return { fit: yh, seFit: fit.s * Math.sqrt(Math.max(0, q)) };
}

/**
 * Formato de coeficiente al estilo Minitab: cuatro cifras significativas,
 * con un maximo de seis decimales. Es lo que hace que el termino cubico
 * aparezca como 0,000000 en lugar de en notacion cientifica.
 */
export function coefText(v: number): string {
  if (!Number.isFinite(v)) return "*";
  if (v === 0) return "0";
  const mag = Math.floor(Math.log10(Math.abs(v)));
  const dec = Math.max(0, Math.min(6, 3 - mag));
  return v.toFixed(dec).replace(".", ",");
}
