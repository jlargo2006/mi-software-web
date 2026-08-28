// app/app/six-sigma/studies/capability/nonnormal/distributions.ts
//
// Ajuste por maxima verosimilitud de las distribuciones no normales que se
// usan en capacidad, mas el estadistico de Anderson-Darling de cada ajuste.
//
// Se excluyen a proposito las versiones de tres parametros (Weibull-3P,
// lognormal-3P, gamma-3P). El parametro de umbral tiene una verosimilitud mal
// condicionada: cuando el umbral se acerca al minimo muestral la funcion
// diverge, y el optimizador encuentra ajustes de AD espectacular que no se
// sostienen fuera de la muestra. Con dos parametros el ajuste es honesto.

import { logGamma, normCDF, normInv } from "../../../lib/stats";

export type DistId =
  | "weibull"
  | "lognormal"
  | "exponential"
  | "gamma"
  | "logistic"
  | "loglogistic"
  | "normal"
  | "smallestEV"
  | "largestEV";

export interface DistDef {
  id: DistId;
  /** Nombre para la interfaz. */
  label: string;
  /** Nombres de los dos parametros, en orden. */
  paramNames: [string, string];
  /** true si la distribucion solo admite valores positivos. */
  positiveOnly: boolean;
}

export const DISTRIBUTIONS: DistDef[] = [
  { id: "weibull", label: "Weibull", paramNames: ["Shape", "Scale"], positiveOnly: true },
  { id: "lognormal", label: "Lognormal", paramNames: ["Location", "Scale"], positiveOnly: true },
  { id: "exponential", label: "Exponential", paramNames: ["Mean", "\u2014"], positiveOnly: true },
  { id: "gamma", label: "Gamma", paramNames: ["Shape", "Scale"], positiveOnly: true },
  { id: "logistic", label: "Logistic", paramNames: ["Location", "Scale"], positiveOnly: false },
  { id: "loglogistic", label: "Loglogistic", paramNames: ["Location", "Scale"], positiveOnly: true },
  { id: "normal", label: "Normal", paramNames: ["Mean", "StDev"], positiveOnly: false },
  { id: "smallestEV", label: "Smallest Extreme Value", paramNames: ["Location", "Scale"], positiveOnly: false },
  { id: "largestEV", label: "Largest Extreme Value", paramNames: ["Location", "Scale"], positiveOnly: false },
];

export const distLabel = (id: DistId): string =>
  DISTRIBUTIONS.find((d) => d.id === id)?.label ?? id;

// ---------------------------------------------------------------------------
// Funciones especiales
// ---------------------------------------------------------------------------

/** Derivada de log Gamma(x). Recurrencia hasta x >= 6 y luego serie asintotica. */
function digamma(x: number): number {
  let r = 0;
  let v = x;
  while (v < 6) {
    r -= 1 / v;
    v += 1;
  }
  const f = 1 / (v * v);
  return (
    r +
    Math.log(v) -
    0.5 / v -
    f *
      (1 / 12 -
        f * (1 / 120 - f * (1 / 252 - f * (1 / 240 - f * (1 / 132)))))
  );
}

/** Segunda derivada de log Gamma(x). */
function trigamma(x: number): number {
  let r = 0;
  let v = x;
  while (v < 6) {
    r += 1 / (v * v);
    v += 1;
  }
  const f = 1 / (v * v);
  return (
    r +
    (1 / v) *
      (1 + f * (0.5 + f * (1 / 6 - f * (1 / 30 - f * (1 / 42 - f * (1 / 30))))))
  );
}

/**
 * Gamma incompleta regularizada P(a, x). Serie para x < a+1, fraccion continua
 * de Lentz en el resto: cada una converge donde la otra es lenta.
 */
function gammaP(a: number, x: number): number {
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

// ---------------------------------------------------------------------------
// Nelder-Mead en dos dimensiones
// ---------------------------------------------------------------------------

/**
 * Minimiza f sobre dos parametros. Se usa en las distribuciones cuya ecuacion
 * de verosimilitud no tiene solucion cerrada ni una derivada comoda; es mas
 * lento que Newton pero no necesita gradiente y no se descarrila.
 */
function nelderMead(
  f: (p: [number, number]) => number,
  start: [number, number],
  step: [number, number]
): [number, number] {
  let simplex: Array<{ p: [number, number]; v: number }> = [
    start,
    [start[0] + step[0], start[1]] as [number, number],
    [start[0], start[1] + step[1]] as [number, number],
  ].map((p) => ({ p: p as [number, number], v: f(p as [number, number]) }));

  const centroid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];

  for (let it = 0; it < 600; it++) {
    simplex.sort((a, b) => a.v - b.v);
    const [best, mid, worst] = simplex;
    if (Math.abs(worst.v - best.v) < 1e-12) break;

    const c = centroid(best.p, mid.p);
    const refl: [number, number] = [2 * c[0] - worst.p[0], 2 * c[1] - worst.p[1]];
    const vr = f(refl);

    if (vr < best.v) {
      const exp: [number, number] = [3 * c[0] - 2 * worst.p[0], 3 * c[1] - 2 * worst.p[1]];
      const ve = f(exp);
      simplex[2] = ve < vr ? { p: exp, v: ve } : { p: refl, v: vr };
    } else if (vr < mid.v) {
      simplex[2] = { p: refl, v: vr };
    } else {
      const con: [number, number] = [
        (c[0] + worst.p[0]) / 2,
        (c[1] + worst.p[1]) / 2,
      ];
      const vc = f(con);
      if (vc < worst.v) {
        simplex[2] = { p: con, v: vc };
      } else {
        simplex = simplex.map((s, i) =>
          i === 0
            ? s
            : {
                p: [
                  (s.p[0] + best.p[0]) / 2,
                  (s.p[1] + best.p[1]) / 2,
                ] as [number, number],
                v: f([
                  (s.p[0] + best.p[0]) / 2,
                  (s.p[1] + best.p[1]) / 2,
                ]),
              }
        );
      }
    }
  }
  simplex.sort((a, b) => a.v - b.v);
  return simplex[0].p;
}

// ---------------------------------------------------------------------------
// CDF, PDF y cuantiles
// ---------------------------------------------------------------------------

const SQRT2PI = Math.sqrt(2 * Math.PI);

export function distCDF(id: DistId, x: number, a: number, b: number): number {
  switch (id) {
    case "weibull":
      return x <= 0 ? 0 : 1 - Math.exp(-Math.pow(x / b, a));
    case "lognormal":
      return x <= 0 ? 0 : normCDF((Math.log(x) - a) / b);
    case "exponential":
      return x <= 0 ? 0 : 1 - Math.exp(-x / a);
    case "gamma":
      return x <= 0 ? 0 : gammaP(a, x / b);
    case "logistic":
      return 1 / (1 + Math.exp(-(x - a) / b));
    case "loglogistic":
      return x <= 0 ? 0 : 1 / (1 + Math.exp(-(Math.log(x) - a) / b));
    case "normal":
      return normCDF((x - a) / b);
    case "smallestEV":
      return 1 - Math.exp(-Math.exp((x - a) / b));
    case "largestEV":
      return Math.exp(-Math.exp(-(x - a) / b));
  }
}

export function distPDF(id: DistId, x: number, a: number, b: number): number {
  switch (id) {
    case "weibull": {
      if (x <= 0) return 0;
      const z = x / b;
      return (a / b) * Math.pow(z, a - 1) * Math.exp(-Math.pow(z, a));
    }
    case "lognormal": {
      if (x <= 0) return 0;
      const z = (Math.log(x) - a) / b;
      return Math.exp(-0.5 * z * z) / (x * b * SQRT2PI);
    }
    case "exponential":
      return x <= 0 ? 0 : Math.exp(-x / a) / a;
    case "gamma":
      return x <= 0
        ? 0
        : Math.exp((a - 1) * Math.log(x) - x / b - logGamma(a) - a * Math.log(b));
    case "logistic": {
      const e = Math.exp(-(x - a) / b);
      return e / (b * (1 + e) ** 2);
    }
    case "loglogistic": {
      if (x <= 0) return 0;
      const e = Math.exp(-(Math.log(x) - a) / b);
      return e / (x * b * (1 + e) ** 2);
    }
    case "normal": {
      const z = (x - a) / b;
      return Math.exp(-0.5 * z * z) / (b * SQRT2PI);
    }
    case "smallestEV": {
      const z = (x - a) / b;
      return Math.exp(z - Math.exp(z)) / b;
    }
    case "largestEV": {
      const z = -(x - a) / b;
      return Math.exp(z - Math.exp(z)) / b;
    }
  }
}

export function distQuantile(id: DistId, p: number, a: number, b: number): number {
  const q = Math.min(Math.max(p, 1e-12), 1 - 1e-12);
  switch (id) {
    case "weibull":
      return b * Math.pow(-Math.log(1 - q), 1 / a);
    case "lognormal":
      return Math.exp(a + b * normInv(q));
    case "exponential":
      return -a * Math.log(1 - q);
    case "gamma": {
      // Sin inversa analitica: biseccion sobre la CDF, que es monotona.
      let lo = 1e-12;
      let hi = Math.max(a * b * 10, 1);
      while (gammaP(a, hi / b) < q && hi < 1e12) hi *= 2;
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        if (gammaP(a, mid / b) < q) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    case "logistic":
      return a + b * Math.log(q / (1 - q));
    case "loglogistic":
      return Math.exp(a + b * Math.log(q / (1 - q)));
    case "normal":
      return a + b * normInv(q);
    case "smallestEV":
      return a + b * Math.log(-Math.log(1 - q));
    case "largestEV":
      return a - b * Math.log(-Math.log(q));
  }
}

/** Media teorica del modelo ajustado. */
export function distMean(id: DistId, a: number, b: number): number {
  const EULER = 0.5772156649015329;
  switch (id) {
    case "weibull":
      return b * Math.exp(logGamma(1 + 1 / a));
    case "lognormal":
      return Math.exp(a + (b * b) / 2);
    case "exponential":
      return a;
    case "gamma":
      return a * b;
    case "logistic":
      return a;
    case "loglogistic":
      // Solo finita si b < 1; en otro caso se informa la mediana.
      return b < 1
        ? (Math.exp(a) * Math.PI * b) / Math.sin(Math.PI * b)
        : Math.exp(a);
    case "normal":
      return a;
    case "smallestEV":
      return a - EULER * b;
    case "largestEV":
      return a + EULER * b;
  }
}

// ---------------------------------------------------------------------------
// Ajuste por maxima verosimilitud
// ---------------------------------------------------------------------------

export interface FitResult {
  id: DistId;
  label: string;
  a: number;
  b: number;
  /** Estadistico de Anderson-Darling del ajuste. */
  ad: number;
  /** p-valor, o null si no hay tabla fiable para esa familia. */
  adP: number | null;
  ok: boolean;
  error?: string;
}

/** Weibull: Newton-Raphson sobre la ecuacion de verosimilitud del shape. */
function fitWeibull(x: number[]): [number, number] {
  const n = x.length;
  const logs = x.map(Math.log);
  const sumLog = logs.reduce((s, v) => s + v, 0);
  let k = 1;
  for (let it = 0; it < 100; it++) {
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < n; i++) {
      const p = Math.pow(x[i], k);
      s0 += p;
      s1 += p * logs[i];
      s2 += p * logs[i] * logs[i];
    }
    const f = s1 / s0 - 1 / k - sumLog / n;
    const df = s2 / s0 - (s1 * s1) / (s0 * s0) + 1 / (k * k);
    const step = f / df;
    k -= step;
    if (!(k > 0)) k = 1e-3;
    if (Math.abs(step) < 1e-12) break;
  }
  let s0 = 0;
  for (let i = 0; i < n; i++) s0 += Math.pow(x[i], k);
  return [k, Math.pow(s0 / n, 1 / k)];
}

/** Gamma: Newton sobre s = log(media) - media(log x). */
function fitGamma(x: number[]): [number, number] {
  const n = x.length;
  const m = x.reduce((s, v) => s + v, 0) / n;
  const meanLog = x.reduce((s, v) => s + Math.log(v), 0) / n;
  const s = Math.log(m) - meanLog;
  // Semilla de Minka, precisa hasta la segunda cifra.
  let k = (3 - s + Math.sqrt((3 - s) ** 2 + 24 * s)) / (12 * s);
  for (let it = 0; it < 100; it++) {
    const f = Math.log(k) - digamma(k) - s;
    const df = 1 / k - trigamma(k);
    const step = f / df;
    k -= step;
    if (!(k > 0)) k = 1e-3;
    if (Math.abs(step) < 1e-12) break;
  }
  return [k, m / k];
}

function meanStd(x: number[]): [number, number] {
  const n = x.length;
  const m = x.reduce((s, v) => s + v, 0) / n;
  const v = x.reduce((s, u) => s + (u - m) ** 2, 0) / n;
  return [m, Math.sqrt(v)];
}

/** Ajuste numerico generico por Nelder-Mead sobre la log-verosimilitud. */
function fitNumeric(
  id: DistId,
  x: number[],
  start: [number, number],
  step: [number, number]
): [number, number] {
  const nll = (p: [number, number]) => {
    const [a, b] = p;
    if (!(b > 0)) return 1e300;
    let s = 0;
    for (const v of x) {
      const d = distPDF(id, v, a, b);
      if (!(d > 0)) return 1e300;
      s -= Math.log(d);
    }
    return s;
  };
  return nelderMead(nll, start, step);
}

/**
 * Anderson-Darling del ajuste. La formula es la misma para toda familia; lo
 * que cambia es el p-valor, porque la distribucion del estadistico depende de
 * que parametros se hayan estimado.
 */
function adStatistic(id: DistId, x: number[], a: number, b: number): number {
  const s = [...x].sort((u, v) => u - v);
  const n = s.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const F1 = Math.min(Math.max(distCDF(id, s[i], a, b), 1e-15), 1 - 1e-15);
    const F2 = Math.min(Math.max(distCDF(id, s[n - 1 - i], a, b), 1e-15), 1 - 1e-15);
    sum += (2 * (i + 1) - 1) * (Math.log(F1) + Math.log(1 - F2));
  }
  return -n - sum / n;
}

/** Interpolacion lineal en una tabla de puntos criticos de Stephens. */
function pFromTable(
  adj: number,
  crit: [number, number][] // [estadistico, p]
): number {
  if (adj <= crit[0][0]) return crit[0][1];
  const last = crit[crit.length - 1];
  if (adj >= last[0]) return last[1];
  for (let i = 1; i < crit.length; i++) {
    if (adj <= crit[i][0]) {
      const [x0, p0] = crit[i - 1];
      const [x1, p1] = crit[i];
      return p0 + ((adj - x0) / (x1 - x0)) * (p1 - p0);
    }
  }
  return last[1];
}

/**
 * p-valor del AD. Solo se devuelve donde hay tabla publicada:
 *
 *  - normal y lognormal: aproximacion analitica habitual;
 *  - Weibull y valor extremo: tabla de Stephens con A* = A2*(1 + 0,2/raiz n);
 *  - exponencial: tabla propia, A* = A2*(1 + 0,6/n).
 *
 * Para gamma, logistica y loglogistica se devuelve null. No hay una tabla
 * fiable de un solo parametro, y un p-valor inventado es peor que ninguno:
 * la eleccion de distribucion determina las colas, y las colas son el
 * resultado entero del estudio.
 */
function adPValue(id: DistId, ad: number, n: number): number | null {
  if (id === "normal" || id === "lognormal") {
    const adj = ad * (1 + 0.75 / n + 2.25 / (n * n));
    if (adj >= 0.6) return Math.exp(1.2937 - 5.709 * adj + 0.0186 * adj * adj);
    if (adj >= 0.34) return Math.exp(0.9177 - 4.279 * adj - 1.38 * adj * adj);
    if (adj >= 0.2) return 1 - Math.exp(-8.318 + 42.796 * adj - 59.938 * adj * adj);
    return 1 - Math.exp(-13.436 + 101.14 * adj - 223.73 * adj * adj);
  }
  if (id === "weibull" || id === "smallestEV" || id === "largestEV") {
    const adj = ad * (1 + 0.2 / Math.sqrt(n));
    return pFromTable(adj, [
      [0.474, 0.25],
      [0.637, 0.1],
      [0.757, 0.05],
      [0.877, 0.025],
      [1.038, 0.01],
    ]);
  }
  if (id === "exponential") {
    const adj = ad * (1 + 0.6 / n);
    return pFromTable(adj, [
      [0.916, 0.25],
      [1.062, 0.1],
      [1.321, 0.05],
      [1.591, 0.025],
      [1.959, 0.01],
    ]);
  }
  return null;
}

/** Ajusta una distribucion a los datos. Nunca lanza: informa en `ok`. */
export function fitDistribution(id: DistId, data: number[]): FitResult {
  const def = DISTRIBUTIONS.find((d) => d.id === id)!;
  const label = def.label;
  const n = data.length;

  if (def.positiveOnly && data.some((v) => v <= 0)) {
    return {
      id,
      label,
      a: NaN,
      b: NaN,
      ad: NaN,
      adP: null,
      ok: false,
      error: `${label} requires strictly positive data.`,
    };
  }

  let a: number;
  let b: number;

  try {
    switch (id) {
      case "weibull":
        [a, b] = fitWeibull(data);
        break;
      case "lognormal": {
        const logs = data.map(Math.log);
        [a, b] = meanStd(logs);
        break;
      }
      case "exponential":
        a = data.reduce((s, v) => s + v, 0) / n;
        b = NaN;
        break;
      case "gamma":
        [a, b] = fitGamma(data);
        break;
      case "normal":
        [a, b] = meanStd(data);
        break;
      case "logistic": {
        const [m, s] = meanStd(data);
        [a, b] = fitNumeric(id, data, [m, (s * Math.sqrt(3)) / Math.PI], [s / 5, s / 10]);
        break;
      }
      case "loglogistic": {
        const logs = data.map(Math.log);
        const [m, s] = meanStd(logs);
        [a, b] = fitNumeric(id, data, [m, (s * Math.sqrt(3)) / Math.PI], [s / 5, s / 10]);
        break;
      }
      case "smallestEV": {
        const [m, s] = meanStd(data);
        const sc = (s * Math.sqrt(6)) / Math.PI;
        [a, b] = fitNumeric(id, data, [m + 0.5772 * sc, sc], [sc / 5, sc / 10]);
        break;
      }
      case "largestEV": {
        const [m, s] = meanStd(data);
        const sc = (s * Math.sqrt(6)) / Math.PI;
        [a, b] = fitNumeric(id, data, [m - 0.5772 * sc, sc], [sc / 5, sc / 10]);
        break;
      }
    }
  } catch {
    return { id, label, a: NaN, b: NaN, ad: NaN, adP: null, ok: false, error: "Fit failed." };
  }

  if (!Number.isFinite(a) || (id !== "exponential" && !Number.isFinite(b))) {
    return {
      id,
      label,
      a: NaN,
      b: NaN,
      ad: NaN,
      adP: null,
      ok: false,
      error: "The maximum-likelihood fit did not converge.",
    };
  }

  const ad = adStatistic(id, data, a, b);
  return { id, label, a, b, ad, adP: adPValue(id, ad, n), ok: true };
}

/** Ajusta todas las candidatas y las devuelve ordenadas por AD ascendente. */
export function fitAll(data: number[]): FitResult[] {
  return DISTRIBUTIONS.map((d) => fitDistribution(d.id, data)).sort((p, q) => {
    if (p.ok && !q.ok) return -1;
    if (!p.ok && q.ok) return 1;
    if (!p.ok && !q.ok) return 0;
    return p.ad - q.ad;
  });
}
