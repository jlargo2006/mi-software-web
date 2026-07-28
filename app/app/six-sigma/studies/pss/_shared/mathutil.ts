// app/app/six-sigma/studies/pss1samplet/mathutil.ts
// Funciones de distribucion necesarias para el calculo de potencia.

/** log Gamma (Lanczos, g=7, n=9). */
export function lgamma(x: number): number {
  const g = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  }
  const z = x - 1;
  let a = g[0];
  const t = z + 7.5;
  for (let i = 1; i < 9; i++) a += g[i] / (z + i);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Funcion de error complementaria (Numerical Recipes, ~1e-7 rel.). */
function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 2 / (2 + z);
  const ty = 4 * t - 2;
  const cof = [
    -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
    -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
    4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
    1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9,
    5.059343495e-9, -9.91364156e-10, -2.27365122e-10, 9.6467911e-11,
    2.394038e-12, -6.886027e-12, 8.94487e-13, 3.13092e-13, -1.12708e-13,
    3.81e-16, 7.106e-15,
  ];
  let d = 0;
  let dd = 0;
  for (let j = cof.length - 1; j > 0; j--) {
    const tmp = d;
    d = ty * d - dd + cof[j];
    dd = tmp;
  }
  const ans = t * Math.exp(-z * z + 0.5 * (cof[0] + ty * d) - dd);
  return x >= 0 ? ans : 2 - ans;
}

/** CDF normal estandar. */
export function normCdf(x: number): number {
  return 0.5 * erfc(-x / Math.SQRT2);
}

/** Fraccion continua para la beta incompleta (Lentz). */
function betacf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return h;
}

/** Beta incompleta regularizada I_x(a,b). */
export function betai(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  return x < (a + 1) / (a + b + 2)
    ? (bt * betacf(a, b, x)) / a
    : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** CDF de la t de Student central. */
export function tCdf(t: number, df: number): number {
  const p = 0.5 * betai(df / 2, 0.5, df / (df + t * t));
  return t >= 0 ? 1 - p : p;
}

/** Cuantil de la t central por biseccion. */
export function tQuantile(p: number, df: number): number {
  let lo = -1000;
  let hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** log pdf de una chi-cuadrado con k grados de libertad. */
function chi2LogPdf(v: number, k: number): number {
  return (k / 2 - 1) * Math.log(v) - v / 2 - (k / 2) * Math.LN2 - lgamma(k / 2);
}

/**
 * CDF de la t no central, por integracion de Simpson sobre la chi-cuadrado:
 *   P(T' <= t) = E_V[ Phi( t*sqrt(V/df) - ncp ) ],  V ~ chi2(df)
 * Estable para todo ncp, a diferencia de las series clasicas.
 */
export function nctCdf(t: number, df: number, ncp: number, N = 4000): number {
  const sdV = Math.sqrt(2 * df);
  const lo = Math.max(1e-12, df - 12 * sdV);
  const hi = df + 12 * sdV + 40;
  const h = (hi - lo) / N;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    const v = lo + i * h;
    const w = i === 0 || i === N ? 1 : i % 2 === 1 ? 4 : 2;
    sum += w * Math.exp(chi2LogPdf(v, df)) * normCdf(t * Math.sqrt(v / df) - ncp);
  }
  const r = (sum * h) / 3;
  return Math.min(1, Math.max(0, r));
}
  /* ---------- distribucion F ---------- */

/** CDF de la F central. */
export function fCdf(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0;
  return betai(df1 / 2, df2 / 2, (df1 * x) / (df1 * x + df2));
}

/** Cuantil de la F central por biseccion. */
export function fQuantile(p: number, df1: number, df2: number): number {
  let lo = 0;
  let hi = 2;
  while (fCdf(hi, df1, df2) < p && hi < 1e12) hi *= 2;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (fCdf(mid, df1, df2) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * CDF de la F no central: mezcla Poisson de betas incompletas.
 *   P(F' <= x) = sum_j pois(j; ncp/2) * I_y(df1/2 + j, df2/2)
 * La suma arranca en la moda de la Poisson y avanza en ambos sentidos con
 * pesos en escala logaritmica, de modo que sigue siendo estable con ncp grande
 * (la biseccion del motor llega a explorar ncp de varios miles).
 */
export function ncfCdf(x: number, df1: number, df2: number, ncp: number): number {
  if (x <= 0) return 0;
  if (ncp <= 0) return fCdf(x, df1, df2);

  const lambda = ncp / 2;
  const y = (df1 * x) / (df1 * x + df2);
  const logW = (j: number) => -lambda + j * Math.log(lambda) - lgamma(j + 1);

  const j0 = Math.max(0, Math.floor(lambda));
  const TOL = 1e-13;
  let sum = 0;

  // Rama ascendente desde la moda.
  for (let j = j0; j < j0 + 200000; j++) {
    const w = Math.exp(logW(j));
    const term = w * betai(df1 / 2 + j, df2 / 2, y);
    sum += term;
    if (j > j0 + 5 && w < TOL && term < TOL) break;
  }
  // Rama descendente.
  for (let j = j0 - 1; j >= 0; j--) {
    const w = Math.exp(logW(j));
    const term = w * betai(df1 / 2 + j, df2 / 2, y);
    sum += term;
    if (w < TOL && term < TOL) break;
  }

  return Math.min(1, Math.max(0, sum));
}

/* ---------- binomial ---------- */

/** log de la funcion beta incompleta no hace falta: usamos betai ya presente. */

/** P(X = k) con X ~ Bin(n, p), en escala logaritmica para n grande. */
export function binomPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  const logC = lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/** P(X <= k). Usa la relacion con la beta incompleta: exacta y O(1). */
export function binomCdf(k: number, n: number, p: number): number {
  const kf = Math.floor(k);
  if (kf < 0) return 0;
  if (kf >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;
  return Math.min(1, Math.max(0, betai(n - kf, kf + 1, 1 - p)));
}

/** P(X >= k). */
export function binomSf(k: number, n: number, p: number): number {
  return Math.min(1, Math.max(0, 1 - binomCdf(k - 1, n, p)));
}

/** Cuantil de la normal estandar, por biseccion sobre normCdf. */
export function zQuantile(a: number): number {
  if (a <= 0) return -Infinity;
  if (a >= 1) return Infinity;
  let lo = -12;
  let hi = 12;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (normCdf(mid) < a) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

