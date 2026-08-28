// app/app/six-sigma/studies/capability/iddist/families.ts
//
// Identificacion de distribucion individual: dieciseis candidatas, cada una
// ajustada por maxima verosimilitud y evaluada con Anderson-Darling.
//
// Todas las familias, salvo la gamma, se plantean como localizacion-escala en
// un espacio transformado:
//
//        u = mu + sigma * g(p)
//
// con u = log x y g = SEV para la Weibull, u = x y g = logistica para la
// logistica, y asi sucesivamente. Es lo que hace que el ajuste salga como una
// RECTA en el grafico de probabilidad, igual que en Minitab, y lo que permite
// una banda de confianza con una sola formula para todas.

import { logGamma, normCDF, normInv } from "../../../lib/stats";

export type FamilyId =
  | "normal"
  | "boxcox"
  | "lognormal"
  | "lognormal3"
  | "exponential"
  | "exponential2"
  | "weibull"
  | "weibull3"
  | "smallestEV"
  | "largestEV"
  | "gamma"
  | "gamma3"
  | "logistic"
  | "loglogistic"
  | "loglogistic3"
  | "johnson";

export const FAMILY_ORDER: FamilyId[] = [
  "normal",
  "boxcox",
  "lognormal",
  "lognormal3",
  "exponential",
  "exponential2",
  "weibull",
  "weibull3",
  "smallestEV",
  "largestEV",
  "gamma",
  "gamma3",
  "logistic",
  "loglogistic",
  "loglogistic3",
  "johnson",
];

export const FAMILY_LABEL: Record<FamilyId, string> = {
  normal: "Normal",
  boxcox: "Box-Cox Transformation",
  lognormal: "Lognormal",
  lognormal3: "3-Parameter Lognormal",
  exponential: "Exponential",
  exponential2: "2-Parameter Exponential",
  weibull: "Weibull",
  weibull3: "3-Parameter Weibull",
  smallestEV: "Smallest Extreme Value",
  largestEV: "Largest Extreme Value",
  gamma: "Gamma",
  gamma3: "3-Parameter Gamma",
  logistic: "Logistic",
  loglogistic: "Loglogistic",
  loglogistic3: "3-Parameter Loglogistic",
  johnson: "Johnson Transformation",
};

/** Familias que exigen datos estrictamente positivos. */
const POSITIVE_ONLY: FamilyId[] = [
  "boxcox",
  "lognormal",
  "exponential",
  "weibull",
  "gamma",
  "loglogistic",
];

// ---------------------------------------------------------------------------
// Nucleos estandarizados: CDF y cuantil de la forma de cada familia
// ---------------------------------------------------------------------------

type Kernel = "normal" | "sev" | "lev" | "logistic";

const kernelCDF = (k: Kernel, z: number): number => {
  switch (k) {
    case "normal":
      return normCDF(z);
    case "sev":
      return 1 - Math.exp(-Math.exp(z));
    case "lev":
      return Math.exp(-Math.exp(-z));
    case "logistic":
      return 1 / (1 + Math.exp(-z));
  }
};

const kernelQ = (k: Kernel, p: number): number => {
  const q = Math.min(Math.max(p, 1e-12), 1 - 1e-12);
  switch (k) {
    case "normal":
      return normInv(q);
    case "sev":
      return Math.log(-Math.log(1 - q));
    case "lev":
      return -Math.log(-Math.log(q));
    case "logistic":
      return Math.log(q / (1 - q));
  }
};

// ---------------------------------------------------------------------------
// Funciones especiales
// ---------------------------------------------------------------------------

function digamma(x: number): number {
  let r = 0;
  let v = x;
  while (v < 6) {
    r -= 1 / v;
    v += 1;
  }
  const f = 1 / (v * v);
  return (
    r + Math.log(v) - 0.5 / v -
    f * (1 / 12 - f * (1 / 120 - f * (1 / 252 - f * (1 / 240 - f * (1 / 132)))))
  );
}

function trigamma(x: number): number {
  let r = 0;
  let v = x;
  while (v < 6) {
    r += 1 / (v * v);
    v += 1;
  }
  const f = 1 / (v * v);
  return (
    r + (1 / v) *
      (1 + f * (0.5 + f * (1 / 6 - f * (1 / 30 - f * (1 / 42 - f * (1 / 30))))))
  );
}

/** Gamma incompleta regularizada P(a, x). */
export function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let i = 0; i < 300; i++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/** Cola superior de una chi-cuadrado con 1 grado de libertad. */
const chiSqUpper1 = (stat: number): number =>
  stat <= 0 ? 1 : 1 - gammaP(0.5, stat / 2);

/** Cuantil de una gamma(shape, scale) por biseccion sobre la CDF. */
function gammaQuantile(shape: number, scale: number, p: number): number {
  const q = Math.min(Math.max(p, 1e-12), 1 - 1e-12);
  let lo = 1e-12;
  let hi = Math.max(shape * scale * 10, 1);
  while (gammaP(shape, hi / scale) < q && hi < 1e12) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (gammaP(shape, mid / scale) < q) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// Optimizadores
// ---------------------------------------------------------------------------

/** Busqueda por seccion dorada de un minimo unidimensional. */
function goldenMin(
  f: (t: number) => number,
  lo: number,
  hi: number,
  iters = 200
): number {
  const phi = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  let c = b - phi * (b - a);
  let d = a + phi * (b - a);
  let fc = f(c);
  let fd = f(d);
  for (let i = 0; i < iters; i++) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - phi * (b - a);
      fc = f(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + phi * (b - a);
      fd = f(d);
    }
    if (Math.abs(b - a) < 1e-12) break;
  }
  return (a + b) / 2;
}

function nelderMead2(
  f: (p: [number, number]) => number,
  start: [number, number],
  step: [number, number]
): [number, number] {
  let s: Array<{ p: [number, number]; v: number }> = [
    start,
    [start[0] + step[0], start[1]],
    [start[0], start[1] + step[1]],
  ].map((p) => ({ p: p as [number, number], v: f(p as [number, number]) }));

  for (let it = 0; it < 800; it++) {
    s.sort((a, b) => a.v - b.v);
    const [best, mid, worst] = s;
    if (Math.abs(worst.v - best.v) < 1e-12) break;
    const c: [number, number] = [
      (best.p[0] + mid.p[0]) / 2,
      (best.p[1] + mid.p[1]) / 2,
    ];
    const refl: [number, number] = [2 * c[0] - worst.p[0], 2 * c[1] - worst.p[1]];
    const vr = f(refl);
    if (vr < best.v) {
      const ex: [number, number] = [3 * c[0] - 2 * worst.p[0], 3 * c[1] - 2 * worst.p[1]];
      const ve = f(ex);
      s[2] = ve < vr ? { p: ex, v: ve } : { p: refl, v: vr };
    } else if (vr < mid.v) {
      s[2] = { p: refl, v: vr };
    } else {
      const con: [number, number] = [(c[0] + worst.p[0]) / 2, (c[1] + worst.p[1]) / 2];
      const vc = f(con);
      if (vc < worst.v) s[2] = { p: con, v: vc };
      else
        s = s.map((e, i) =>
          i === 0
            ? e
            : {
                p: [(e.p[0] + best.p[0]) / 2, (e.p[1] + best.p[1]) / 2] as [number, number],
                v: f([(e.p[0] + best.p[0]) / 2, (e.p[1] + best.p[1]) / 2]),
              }
        );
    }
  }
  s.sort((a, b) => a.v - b.v);
  return s[0].p;
}

// ---------------------------------------------------------------------------
// Estadistico de Anderson-Darling y p-valores
// ---------------------------------------------------------------------------

export function adFromCDF(sorted: number[], cdf: (x: number) => number): number {
  const n = sorted.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const F1 = Math.min(Math.max(cdf(sorted[i]), 1e-15), 1 - 1e-15);
    const F2 = Math.min(Math.max(cdf(sorted[n - 1 - i]), 1e-15), 1 - 1e-15);
    sum += (2 * (i + 1) - 1) * (Math.log(F1) + Math.log(1 - F2));
  }
  return -n - sum / n;
}

type Table = [number, number][]; // [estadistico critico, p]

/**
 * Puntos criticos de Anderson-Darling.
 *
 * OJO con el exponencial: la tabla correcta es 0,736 para el 25 % y 0,916 para
 * el 10 %. En el modulo Nonnormal quedo desplazada una columna (0,916 como
 * punto del 25 %), y ahi hay que corregirla tambien.
 */
const TABLE_EV: Table = [
  [0.474, 0.25],
  [0.637, 0.1],
  [0.757, 0.05],
  [0.877, 0.025],
  [1.038, 0.01],
];
const TABLE_EXP: Table = [
  [0.736, 0.25],
  [0.916, 0.1],
  [1.062, 0.05],
  [1.321, 0.025],
  [1.591, 0.01],
];
const TABLE_LOGISTIC: Table = [
  [0.426, 0.25],
  [0.563, 0.1],
  [0.66, 0.05],
  [0.769, 0.025],
  [0.906, 0.01],
];
/** Gamma: los puntos criticos dependen del shape. */
const TABLE_GAMMA: { shape: number; t: Table }[] = [
  {
    shape: 1,
    t: [
      [0.486, 0.25],
      [0.657, 0.1],
      [0.786, 0.05],
      [0.917, 0.025],
      [1.092, 0.01],
    ],
  },
  {
    shape: 2,
    t: [
      [0.477, 0.25],
      [0.643, 0.1],
      [0.768, 0.05],
      [0.894, 0.025],
      [1.062, 0.01],
    ],
  },
  {
    shape: Infinity,
    t: [
      [0.47, 0.25],
      [0.631, 0.1],
      [0.752, 0.05],
      [0.873, 0.025],
      [1.035, 0.01],
    ],
  },
];

export interface PValue {
  /** Valor interpolado, o null si no hay tabla para la familia. */
  p: number | null;
  /** "gt" cuando cae por encima del primer punto, "lt" por debajo del ultimo. */
  bound: "lt" | "gt" | null;
}

function fromTable(adj: number, t: Table): PValue {
  if (adj <= t[0][0]) return { p: t[0][1], bound: "gt" };
  const last = t[t.length - 1];
  if (adj >= last[0]) return { p: last[1], bound: "lt" };
  for (let i = 1; i < t.length; i++) {
    if (adj <= t[i][0]) {
      const [x0, p0] = t[i - 1];
      const [x1, p1] = t[i];
      return { p: p0 + ((adj - x0) / (x1 - x0)) * (p1 - p0), bound: null };
    }
  }
  return { p: last[1], bound: "lt" };
}

function gammaTable(shape: number): Table {
  const pts = TABLE_GAMMA;
  if (shape <= pts[0].shape) return pts[0].t;
  if (!Number.isFinite(shape) || shape >= 100) return pts[2].t;
  // Interpolacion en 1/shape entre las tres columnas tabuladas.
  const inv = 1 / shape;
  const lo = inv >= 0.5 ? pts[0] : pts[1];
  const hi = inv >= 0.5 ? pts[1] : pts[2];
  const iLo = 1 / lo.shape;
  const iHi = Number.isFinite(hi.shape) ? 1 / hi.shape : 0;
  const w = (inv - iLo) / (iHi - iLo);
  return lo.t.map(([c, p], i) => [c + w * (hi.t[i][0] - c), p] as [number, number]);
}

/** p-valor analitico para las familias que se reducen a una normal. */
function normalP(ad: number, n: number): PValue {
  const adj = ad * (1 + 0.75 / n + 2.25 / (n * n));
  let p: number;
  if (adj >= 0.6) p = Math.exp(1.2937 - 5.709 * adj + 0.0186 * adj * adj);
  else if (adj >= 0.34) p = Math.exp(0.9177 - 4.279 * adj - 1.38 * adj * adj);
  else if (adj >= 0.2) p = 1 - Math.exp(-8.318 + 42.796 * adj - 59.938 * adj * adj);
  else p = 1 - Math.exp(-13.436 + 101.14 * adj - 223.73 * adj * adj);
  if (p < 0.005) return { p: 0.005, bound: "lt" };
  return { p: Math.min(p, 1), bound: null };
}

// ---------------------------------------------------------------------------
// Resultado de un ajuste
// ---------------------------------------------------------------------------

export interface FamilyFit {
  id: FamilyId;
  label: string;
  ok: boolean;
  error?: string;

  location: number | null;
  shape: number | null;
  scale: number | null;
  threshold: number | null;
  /** true si la escala se informa como estimacion ML ajustada (n - 1). */
  scaleAdjusted: boolean;

  ad: number;
  adP: number | null;
  adBound: "lt" | "gt" | null;
  logLik: number;
  /** Razon de verosimilitudes contra la version de dos parametros. */
  lrtP: number | null;

  /** Aviso propio del ajuste, cuando la verosimilitud es problematica. */
  warning?: string;

  // --- Grafico de probabilidad ---
  /** Eje horizontal logaritmico. */
  logAxis: boolean;
  /** Nucleo del eje vertical. */
  kernel: Kernel;
  /** Valor del eje horizontal para un dato original. */
  plotX: (x: number) => number;
  /** Valor del eje horizontal del percentil ajustado p. */
  fitX: (p: number) => number;
  /** Banda de confianza al 95 % en unidades del eje, o null. */
  band: ((p: number) => [number, number]) | null;
  /** Etiqueta del eje horizontal. */
  xLabel: string;
  /** Nota bajo el panel. */
  subNote?: string;
}

const NOFIT = (id: FamilyId, error: string): FamilyFit => ({
  id,
  label: FAMILY_LABEL[id],
  ok: false,
  error,
  location: null,
  shape: null,
  scale: null,
  threshold: null,
  scaleAdjusted: false,
  ad: NaN,
  adP: null,
  adBound: null,
  logLik: NaN,
  lrtP: null,
  logAxis: false,
  kernel: "normal",
  plotX: (x) => x,
  fitX: () => NaN,
  band: null,
  xLabel: "",
});

// ---------------------------------------------------------------------------
// Utilidades de muestra
// ---------------------------------------------------------------------------

const mean = (v: number[]) => v.reduce((s, u) => s + u, 0) / v.length;
const sdPop = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((s, u) => s + (u - m) ** 2, 0) / v.length);
};
const sdSample = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((s, u) => s + (u - m) ** 2, 0) / (v.length - 1));
};

const Z975 = 1.959963984540054;

/**
 * Ensambla la parte grafica de un ajuste de localizacion-escala en el espacio
 * u. El eje horizontal va en unidades de (x - umbral), o en unidades de la
 * transformacion cuando la hay.
 *
 * La banda de confianza usa el mismo error tipico del Sixpack,
 *   se = sigma * raiz( 1/n + g^2 / (2(n-1)) ),
 * legitimo aqui porque en el espacio u la familia es exactamente
 * localizacion-escala. La gamma no lo es, y por eso no lleva banda.
 */
function plotting(args: {
  kernel: Kernel;
  fromU: (u: number) => number;
  loc: number;
  scale: number;
  n: number;
  logAxis: boolean;
  threshold: number;
  transform?: (x: number) => number;
  fixedScale?: boolean;
  xLabel: string;
}): Pick<FamilyFit, "logAxis" | "kernel" | "plotX" | "fitX" | "band" | "xLabel"> {
  const { kernel, fromU, loc, scale, n, logAxis, threshold, transform, xLabel } = args;
  return {
    logAxis,
    kernel,
    plotX: transform ? transform : (x: number) => x - threshold,
    fitX: (p: number) => fromU(loc + scale * kernelQ(kernel, p)),
    band: (p: number) => {
      const g = kernelQ(kernel, p);
      const se = args.fixedScale
        ? scale / Math.sqrt(n)
        : scale * Math.sqrt(1 / n + (g * g) / (2 * (n - 1)));
      const u = loc + scale * g;
      return [fromU(u - Z975 * se), fromU(u + Z975 * se)];
    },
    xLabel,
  };
}

// ---------------------------------------------------------------------------
// Ajustes elementales
// ---------------------------------------------------------------------------

const fitNormalU = (u: number[]): [number, number] => [mean(u), sdPop(u)];

/** Weibull sobre y > 0: Newton sobre la ecuacion del shape. */
function fitWeibull(y: number[]): [number, number] {
  const n = y.length;
  const logs = y.map(Math.log);
  const sumLog = logs.reduce((s, v) => s + v, 0);
  let k = 1;
  for (let it = 0; it < 200; it++) {
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < n; i++) {
      const p = Math.pow(y[i], k);
      s0 += p;
      s1 += p * logs[i];
      s2 += p * logs[i] * logs[i];
    }
    const f = s1 / s0 - 1 / k - sumLog / n;
    const df = s2 / s0 - (s1 * s1) / (s0 * s0) + 1 / (k * k);
    const step = f / df;
    k -= step;
    if (!(k > 0)) k = 1e-3;
    if (Math.abs(step) < 1e-13) break;
  }
  let s0 = 0;
  for (let i = 0; i < n; i++) s0 += Math.pow(y[i], k);
  return [k, Math.pow(s0 / n, 1 / k)];
}

/** Gamma sobre y > 0: Newton sobre s = log(media) - media(log). */
function fitGamma(y: number[]): [number, number] {
  const n = y.length;
  const m = mean(y);
  const meanLog = y.reduce((s, v) => s + Math.log(v), 0) / n;
  const s = Math.log(m) - meanLog;
  let k = (3 - s + Math.sqrt((3 - s) ** 2 + 24 * s)) / (12 * s);
  for (let it = 0; it < 200; it++) {
    const f = Math.log(k) - digamma(k) - s;
    const df = 1 / k - trigamma(k);
    const step = f / df;
    k -= step;
    if (!(k > 0)) k = 1e-3;
    if (Math.abs(step) < 1e-13) break;
  }
  return [k, m / k];
}

/** Logistica en u por Nelder-Mead. */
function fitLogisticU(u: number[]): [number, number] {
  const m = mean(u);
  const s = sdPop(u);
  const nll = (p: [number, number]) => {
    const [a, b] = p;
    if (!(b > 0)) return 1e300;
    let t = 0;
    for (const v of u) {
      const e = -(v - a) / b;
      t += Math.log(b) - e + 2 * Math.log(1 + Math.exp(e));
    }
    return t;
  };
  return nelderMead2(nll, [m, (s * Math.sqrt(3)) / Math.PI], [s / 5, s / 10]);
}

/** Valor extremo en u por Nelder-Mead. sign = +1 menor, -1 mayor. */
function fitEVU(u: number[], sign: 1 | -1): [number, number] {
  const m = mean(u);
  const s = sdPop(u);
  const sc = (s * Math.sqrt(6)) / Math.PI;
  const nll = (p: [number, number]) => {
    const [a, b] = p;
    if (!(b > 0)) return 1e300;
    let t = 0;
    for (const v of u) {
      const z = (sign * (v - a)) / b;
      t += Math.log(b) - z + Math.exp(z);
    }
    return t;
  };
  return nelderMead2(nll, [m + sign * 0.5772 * sc, sc], [sc / 5, sc / 10]);
}

// ---------------------------------------------------------------------------
// Log-verosimilitudes, para la razon de verosimilitudes de los umbrales
// ---------------------------------------------------------------------------

const llNormalU = (u: number[], jac: number): number => {
  const n = u.length;
  const s = sdPop(u);
  return -n * (Math.log(s) + 0.5 * Math.log(2 * Math.PI) + 0.5) - jac;
};

const llWeibull = (y: number[]): number => {
  const [k, l] = fitWeibull(y);
  let t = 0;
  for (const v of y)
    t += Math.log(k / l) + (k - 1) * Math.log(v / l) - Math.pow(v / l, k);
  return t;
};

const llGamma = (y: number[]): number => {
  const [a, b] = fitGamma(y);
  let t = 0;
  for (const v of y)
    t += (a - 1) * Math.log(v) - v / b - logGamma(a) - a * Math.log(b);
  return t;
};

const llLoglogistic = (y: number[]): number => {
  const u = y.map(Math.log);
  const [a, b] = fitLogisticU(u);
  let t = 0;
  for (let i = 0; i < y.length; i++) {
    const e = -(u[i] - a) / b;
    t += -Math.log(b) + e - 2 * Math.log(1 + Math.exp(e)) - u[i];
  }
  return t;
};

const llExp = (x: number[], th: number): number => {
  const m = mean(x) - th;
  let t = 0;
  for (const v of x) t += -Math.log(m) - (v - th) / m;
  return t;
};

/**
 * Umbral por perfil de verosimilitud, acotado por debajo del minimo muestral.
 * La cota es necesaria: la verosimilitud diverge cuando el umbral se acerca al
 * minimo, asi que sin ella el optimizador se va al borde.
 */
function profileThreshold(x: number[], ll: (y: number[]) => number): number {
  const xmin = Math.min(...x);
  const span = Math.max(...x) - xmin;
  const lo = xmin - Math.max(span, 1) * 2;
  const hi = xmin - Math.max(span, 1) * 1e-9;
  return goldenMin((th) => -ll(x.map((v) => v - th)), lo, hi);
}

// ---------------------------------------------------------------------------
// Transformaciones
// ---------------------------------------------------------------------------

/** Lambda de Box-Cox por maxima verosimilitud en el intervalo [lo, hi]. */
export function boxcoxLambda(x: number[], lo: number, hi: number): number {
  const n = x.length;
  const sumLog = x.reduce((s, v) => s + Math.log(v), 0);
  const negLL = (lam: number) => {
    const y =
      Math.abs(lam) < 1e-10
        ? x.map(Math.log)
        : x.map((v) => (Math.pow(v, lam) - 1) / lam);
    const s2 = sdPop(y) ** 2;
    if (!(s2 > 0)) return 1e300;
    return (n / 2) * Math.log(s2) - (lam - 1) * sumLog;
  };
  return goldenMin(negLL, lo, hi);
}

export const boxcoxApply = (x: number, lam: number): number =>
  Math.abs(lam) < 1e-10 ? Math.log(x) : (Math.pow(x, lam) - 1) / lam;

export interface JohnsonFit {
  family: "SB" | "SL" | "SU";
  apply: (x: number) => number;
  /** Ecuacion legible, como la imprime Minitab. */
  text: string;
}

/**
 * Transformacion de Johnson por el procedimiento de Chou: se recorre una
 * rejilla de valores z, se ajusta por cuantiles la familia que corresponda
 * segun el criterio del cociente, y se conserva la de mejor Anderson-Darling.
 */
export function fitJohnson(x: number[]): JohnsonFit | null {
  const s = [...x].sort((a, b) => a - b);
  const n = s.length;
  const quant = (p: number): number => {
    const h = (n - 1) * Math.min(Math.max(p, 0), 1);
    const lo = Math.floor(h);
    const hi = Math.min(lo + 1, n - 1);
    return s[lo] + (h - lo) * (s[hi] - s[lo]);
  };

  let best: { fit: JohnsonFit; ad: number } | null = null;

  for (let zi = 0; zi < 70; zi++) {
    const z = 0.25 + zi * 0.05;
    const x3 = quant(normCDF(z));
    const x1 = quant(normCDF(-z));
    const x2 = quant(normCDF(z / 3));
    const x0 = quant(normCDF(-z / 3));

    const m = x3 - x2;
    const nn = x0 - x1;
    const pp = x2 - x0;
    if (!(m > 0) || !(nn > 0) || !(pp > 0)) continue;

    const ratio = (m * nn) / (pp * pp);
    let cand: JohnsonFit | null = null;

    if (ratio > 1.0001) {
      // Su, no acotada
      const r = m / nn;
      const b = Math.cosh(0.5 * Math.log(r));
      const delta = z / Math.acosh(b);
      const lambda =
        (2 * pp * Math.sqrt(b * b - 1)) /
        ((r + 1 / r - 2) * Math.sqrt(r + 1 / r + 2));
      const gam = delta * Math.asinh((1 / r - r) / (2 * Math.sqrt(ratio - 1)));
      const eps = (x2 + x0) / 2 + (pp * (1 / r - r)) / (2 * (ratio - 1));
      if (!(delta > 0) || !(lambda > 0)) continue;
      cand = {
        family: "SU",
        apply: (v: number) => gam + delta * Math.asinh((v - eps) / lambda),
        text: `${gam.toFixed(5)} + ${delta.toFixed(6)} \u00D7 Asinh( ( X \u2212 ${eps.toFixed(
          5
        )} ) / ${lambda.toFixed(5)} )`,
      };
    } else if (ratio < 0.9999) {
      // Sb, acotada
      const A = 1 + pp / m;
      const B = 1 + pp / nn;
      const disc = A * B;
      if (!(disc > 4)) continue;
      const delta = z / Math.acosh(0.5 * Math.sqrt(disc));
      const denom = (pp / m) * (pp / nn) - 1;
      if (Math.abs(denom) < 1e-12) continue;
      const lambda = (pp * Math.sqrt(((disc - 2) ** 2 - 4) > 0 ? (disc - 2) ** 2 - 4 : 0)) / (2 * denom * denom) || 0;
      const lam2 =
        (pp * Math.sqrt(Math.max(disc - 2, 0) ** 2 - 4 > 0 ? Math.max(disc - 2, 0) ** 2 - 4 : 0)) /
        Math.abs(denom);
      const L = lam2 > 0 ? lam2 : lambda;
      if (!(delta > 0) || !(L > 0)) continue;
      const gam =
        delta *
        Math.asinh(((pp / nn - pp / m) * Math.sqrt(disc - 4)) / (2 * denom));
      const eps = (x2 + x0) / 2 - L / 2 + (pp * (pp / nn - pp / m)) / (2 * denom);
      const lo = eps;
      const hi = eps + L;
      if (!(s[0] > lo) || !(s[n - 1] < hi)) continue;
      cand = {
        family: "SB",
        apply: (v: number) => gam + delta * Math.log((v - lo) / (hi - v)),
        text: `${gam.toFixed(5)} + ${delta.toFixed(6)} \u00D7 Ln( ( X ${
          lo < 0 ? "+ " + (-lo).toFixed(5) : "\u2212 " + lo.toFixed(5)
        } ) / ( ${hi.toFixed(3)} \u2212 X ) )`,
      };
    } else {
      // Sl, lognormal desplazada
      const r = m / pp;
      if (!(r > 1)) continue;
      const delta = z / Math.log(r);
      const eps = (x2 + x0) / 2 - (pp / 2) * ((r + 1) / (r - 1));
      if (!(delta > 0) || !(s[0] > eps)) continue;
      cand = {
        family: "SL",
        apply: (v: number) => delta * Math.log(v - eps),
        text: `${delta.toFixed(6)} \u00D7 Ln( X \u2212 ${eps.toFixed(5)} )`,
      };
    }

    if (!cand) continue;
    let zs: number[];
    try {
      zs = x.map(cand.apply);
    } catch {
      continue;
    }
    if (zs.some((v) => !Number.isFinite(v))) continue;
    const mu = mean(zs);
    const sg = sdPop(zs);
    if (!(sg > 0)) continue;
    const ad = adFromCDF(
      [...zs].sort((a, b) => a - b),
      (t) => normCDF((t - mu) / sg)
    );
    if (!best || ad < best.ad) best = { fit: cand, ad };
  }

  return best ? best.fit : null;
}

// ---------------------------------------------------------------------------
// Ajuste de una familia
// ---------------------------------------------------------------------------

export interface FitContext {
  x: number[];
  sorted: number[];
  n: number;
  bcLambda: number | null;
  johnson: JohnsonFit | null;
}

export function fitFamily(id: FamilyId, ctx: FitContext): FamilyFit {
  const { x, sorted, n } = ctx;
  const label = FAMILY_LABEL[id];
  const xmin = Math.min(...x);

  if (POSITIVE_ONLY.includes(id) && xmin <= 0) {
    return NOFIT(id, `${label} requires strictly positive data.`);
  }

  const base = {
    id,
    label,
    ok: true as const,
    location: null as number | null,
    shape: null as number | null,
    scale: null as number | null,
    threshold: null as number | null,
    scaleAdjusted: false,
    adP: null as number | null,
    adBound: null as "lt" | "gt" | null,
    lrtP: null as number | null,
  };

  try {
    switch (id) {
      case "normal": {
        const [mu, sg] = fitNormalU(x);
        const ad = adFromCDF(sorted, (t) => normCDF((t - mu) / sg));
        const pv = normalP(ad, n);
        return {
          ...base,
          location: mu,
          scale: sdSample(x),
          scaleAdjusted: true,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: llNormalU(x, 0),
          ...plotting({
            kernel: "normal",
            fromU: (u) => u,
            loc: mu,
            scale: sg,
            n,
            logAxis: false,
            threshold: 0,
            xLabel: "value",
          }),
        };
      }

      case "boxcox": {
        const lam = ctx.bcLambda;
        if (lam === null) return NOFIT(id, "Box-Cox needs strictly positive data.");
        const y = x.map((v) => boxcoxApply(v, lam));
        const [mu, sg] = fitNormalU(y);
        const ad = adFromCDF(
          [...y].sort((a, b) => a - b),
          (t) => normCDF((t - mu) / sg)
        );
        const pv = normalP(ad, n);
        return {
          ...base,
          location: mu,
          scale: sdSample(y),
          scaleAdjusted: true,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: NaN,
          ...plotting({
            kernel: "normal",
            fromU: (u) => u,
            loc: mu,
            scale: sg,
            n,
            logAxis: false,
            threshold: 0,
            transform: (v) => boxcoxApply(v, lam),
            xLabel: "transformed value",
          }),
          subNote: `After Box-Cox transformation (\u03BB = ${lam.toFixed(2)})`,
        };
      }

      case "johnson": {
        const j = ctx.johnson;
        if (!j) return NOFIT(id, "No Johnson transformation could be found.");
        const z = x.map(j.apply);
        const [mu, sg] = fitNormalU(z);
        const ad = adFromCDF(
          [...z].sort((a, b) => a - b),
          (t) => normCDF((t - mu) / sg)
        );
        const pv = normalP(ad, n);
        return {
          ...base,
          location: mu,
          scale: sdSample(z),
          scaleAdjusted: true,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: NaN,
          ...plotting({
            kernel: "normal",
            fromU: (u) => u,
            loc: mu,
            scale: sg,
            n,
            logAxis: false,
            threshold: 0,
            transform: j.apply,
            xLabel: "transformed value",
          }),
          subNote: "After Johnson transformation",
        };
      }

      case "lognormal": {
        const u = x.map(Math.log);
        const [mu, sg] = fitNormalU(u);
        const ad = adFromCDF(sorted, (t) => normCDF((Math.log(t) - mu) / sg));
        const pv = normalP(ad, n);
        return {
          ...base,
          location: mu,
          scale: sdSample(u),
          scaleAdjusted: true,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: llNormalU(u, u.reduce((s, v) => s + v, 0)),
          ...plotting({
            kernel: "normal",
            fromU: Math.exp,
            loc: mu,
            scale: sg,
            n,
            logAxis: true,
            threshold: 0,
            xLabel: "value",
          }),
        };
      }

      case "lognormal3": {
        const th = profileThreshold(x, (y) => {
          const u = y.map(Math.log);
          return llNormalU(u, u.reduce((s, v) => s + v, 0));
        });
        const u = x.map((v) => Math.log(v - th));
        const [mu, sg] = fitNormalU(u);
        const ad = adFromCDF(sorted, (t) =>
          t <= th ? 0 : normCDF((Math.log(t - th) - mu) / sg)
        );
        const ll3 = llNormalU(u, u.reduce((s, v) => s + v, 0));
        const u0 = x.map(Math.log);
        const ll2 = llNormalU(u0, u0.reduce((s, v) => s + v, 0));
        return {
          ...base,
          location: mu,
          scale: sdSample(u),
          scaleAdjusted: true,
          threshold: th,
          ad,
          adP: null,
          logLik: ll3,
          lrtP: chiSqUpper1(2 * (ll3 - ll2)),
          warning:
            "Variance/covariance matrix of the estimated parameters does not exist. The threshold is held fixed when computing intervals.",
          ...plotting({
            kernel: "normal",
            fromU: Math.exp,
            loc: mu,
            scale: sg,
            n,
            logAxis: true,
            threshold: th,
            xLabel: "value \u2212 threshold",
          }),
        };
      }

      case "exponential": {
        const theta = mean(x);
        const ad = adFromCDF(sorted, (t) => 1 - Math.exp(-t / theta));
        const pv = fromTable(ad * (1 + 0.6 / n), TABLE_EXP);
        return {
          ...base,
          scale: theta,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: llExp(x, 0),
          ...plotting({
            kernel: "sev",
            fromU: Math.exp,
            loc: Math.log(theta),
            scale: 1,
            n,
            logAxis: true,
            threshold: 0,
            fixedScale: true,
            xLabel: "value",
          }),
        };
      }

      case "exponential2": {
        // Minitab no usa el maximo de verosimilitud del umbral, que seria el
        // minimo muestral, sino el estimador corregido de sesgo. De ahi que su
        // razon de verosimilitudes salga 1,000: el modelo de tres parametros
        // ajusta algo peor que el de dos.
        const scale = ((mean(x) - xmin) * n) / (n - 1);
        const th = xmin - scale / n;
        const ad = adFromCDF(sorted, (t) =>
          t <= th ? 0 : 1 - Math.exp(-(t - th) / scale)
        );
        const pv = fromTable(ad * (1 + 0.6 / n), TABLE_EXP);
        const ll2 = llExp(x, th);
        const ll1 = llExp(x, 0);
        return {
          ...base,
          scale,
          threshold: th,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: ll2,
          lrtP: chiSqUpper1(2 * (ll2 - ll1)),
          warning:
            "Variance/covariance matrix of the estimated parameters does not exist. The threshold is held fixed when computing intervals.",
          ...plotting({
            kernel: "sev",
            fromU: Math.exp,
            loc: Math.log(scale),
            scale: 1,
            n,
            logAxis: true,
            threshold: th,
            fixedScale: true,
            xLabel: "value \u2212 threshold",
          }),
        };
      }

      case "weibull": {
        const [k, l] = fitWeibull(x);
        const ad = adFromCDF(sorted, (t) => 1 - Math.exp(-Math.pow(t / l, k)));
        const pv = fromTable(ad * (1 + 0.2 / Math.sqrt(n)), TABLE_EV);
        return {
          ...base,
          shape: k,
          scale: l,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: llWeibull(x),
          ...plotting({
            kernel: "sev",
            fromU: Math.exp,
            loc: Math.log(l),
            scale: 1 / k,
            n,
            logAxis: true,
            threshold: 0,
            xLabel: "value",
          }),
        };
      }

      case "weibull3": {
        const th = profileThreshold(x, llWeibull);
        const [k, l] = fitWeibull(x.map((v) => v - th));
        const ad = adFromCDF(sorted, (t) =>
          t <= th ? 0 : 1 - Math.exp(-Math.pow((t - th) / l, k))
        );
        const pv = fromTable(ad * (1 + 0.2 / Math.sqrt(n)), TABLE_EV);
        const ll3 = llWeibull(x.map((v) => v - th));
        const ll2 = llWeibull(x);
        return {
          ...base,
          shape: k,
          scale: l,
          threshold: th,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: ll3,
          lrtP: chiSqUpper1(2 * (ll3 - ll2)),
          ...plotting({
            kernel: "sev",
            fromU: Math.exp,
            loc: Math.log(l),
            scale: 1 / k,
            n,
            logAxis: true,
            threshold: th,
            xLabel: "value \u2212 threshold",
          }),
        };
      }

      case "smallestEV":
      case "largestEV": {
        const sign: 1 | -1 = id === "smallestEV" ? 1 : -1;
        const [a, b] = fitEVU(x, sign);
        const kernel: Kernel = id === "smallestEV" ? "sev" : "lev";
        const ad = adFromCDF(sorted, (t) => kernelCDF(kernel, (t - a) / b));
        const pv = fromTable(ad * (1 + 0.2 / Math.sqrt(n)), TABLE_EV);
        let ll = 0;
        for (const v of x) {
          const z = (sign * (v - a)) / b;
          ll += -Math.log(b) + z - Math.exp(z);
        }
        return {
          ...base,
          location: a,
          scale: b,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: ll,
          ...plotting({
            kernel,
            fromU: (u) => u,
            loc: a,
            scale: b,
            n,
            logAxis: false,
            threshold: 0,
            xLabel: "value",
          }),
        };
      }

      case "gamma":
      case "gamma3": {
        const isThree = id === "gamma3";
        const th = isThree ? profileThreshold(x, llGamma) : 0;
        const [a, b] = fitGamma(x.map((v) => v - th));
        const ad = adFromCDF(sorted, (t) => (t <= th ? 0 : gammaP(a, (t - th) / b)));
        const pv = isThree
          ? { p: null as number | null, bound: null as "lt" | "gt" | null }
          : fromTable(ad, gammaTable(a));
        const ll3 = llGamma(x.map((v) => v - th));
        const ll2 = llGamma(x);
        return {
          ...base,
          shape: a,
          scale: b,
          threshold: isThree ? th : null,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: ll3,
          lrtP: isThree ? chiSqUpper1(2 * (ll3 - ll2)) : null,
          warning: isThree
            ? "The profile likelihood of the threshold is unbounded here, so the fit depends on where the search starts. Minitab reports the same condition as a missing variance/covariance matrix."
            : undefined,
          // La gamma no es localizacion-escala: la curva ajustada sale curvada
          // en el grafico y no se dibuja banda de confianza.
          logAxis: true,
          kernel: "normal" as Kernel,
          plotX: (v: number) => v - th,
          fitX: (p: number) => gammaQuantile(a, b, p),
          band: null,
          xLabel: isThree ? "value \u2212 threshold" : "value",
        };
      }

      case "logistic": {
        const [a, b] = fitLogisticU(x);
        const ad = adFromCDF(sorted, (t) => kernelCDF("logistic", (t - a) / b));
        const pv = fromTable(ad, TABLE_LOGISTIC);
        let ll = 0;
        for (const v of x) {
          const e = -(v - a) / b;
          ll += -Math.log(b) + e - 2 * Math.log(1 + Math.exp(e));
        }
        return {
          ...base,
          location: a,
          scale: b,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: ll,
          ...plotting({
            kernel: "logistic",
            fromU: (u) => u,
            loc: a,
            scale: b,
            n,
            logAxis: false,
            threshold: 0,
            xLabel: "value",
          }),
        };
      }

      case "loglogistic":
      case "loglogistic3": {
        const isThree = id === "loglogistic3";
        const th = isThree ? profileThreshold(x, llLoglogistic) : 0;
        const u = x.map((v) => Math.log(v - th));
        const [a, b] = fitLogisticU(u);
        const ad = adFromCDF(sorted, (t) =>
          t <= th ? 0 : kernelCDF("logistic", (Math.log(t - th) - a) / b)
        );
        const pv = isThree
          ? { p: null as number | null, bound: null as "lt" | "gt" | null }
          : fromTable(ad, TABLE_LOGISTIC);
        const ll3 = llLoglogistic(x.map((v) => v - th));
        const ll2 = llLoglogistic(x);
        return {
          ...base,
          location: a,
          scale: b,
          threshold: isThree ? th : null,
          ad,
          adP: pv.p,
          adBound: pv.bound,
          logLik: ll3,
          lrtP: isThree ? chiSqUpper1(2 * (ll3 - ll2)) : null,
          warning: isThree
            ? "Variance/covariance matrix of the estimated parameters does not exist. The threshold is held fixed when computing intervals."
            : undefined,
          ...plotting({
            kernel: "logistic",
            fromU: Math.exp,
            loc: a,
            scale: b,
            n,
            logAxis: true,
            threshold: th,
            xLabel: isThree ? "value \u2212 threshold" : "value",
          }),
        };
      }
    }
  } catch {
    return NOFIT(id, "The maximum-likelihood fit did not converge.");
  }
  return NOFIT(id, "Unknown family.");
}

/** Posiciones de trazado por rangos medianos de Benard. */
export const benard = (i: number, n: number): number => (i - 0.3) / (n + 0.4);

/** Posicion vertical de un porcentaje en el eje de un panel. */
export const percentToZ = (k: Kernel, pct: number): number => kernelQ(k, pct / 100);

export const PERCENT_TICKS = [0.1, 1, 10, 50, 90, 99, 99.9];

export type { Kernel };
