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
