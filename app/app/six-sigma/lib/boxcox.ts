// app/app/six-sigma/lib/boxcox.ts

/**
 * Transformacion de Box-Cox tal como la almacena Minitab: potencia simple,
 * y logaritmo natural en lambda cero. No es la version (x^L - 1)/L, que se
 * usa solo para estimar lambda.
 */
export function bcTransform(v: number, lambda: number): number {
  if (Math.abs(lambda) < 1e-12) return Math.log(v);
  return Math.pow(v, lambda);
}

/**
 * Desviacion tipica agrupada de los datos transformados y estandarizados.
 *
 * Se usa la version normalizada por la media geometrica,
 *   w = (x^L - 1) / (L * gm^(L-1)),
 * porque deja todas las lambdas en una escala comparable: sin ese factor la
 * curva no tendria minimo, bastaria encoger la escala.
 *
 * Con subgrupos de mas de un elemento se combina la variabilidad interna de
 * cada subgrupo, que es lo que interesa en control de procesos.
 */
export function bcStdDev(
  x: number[],
  groups: number[][],
  lambda: number,
  logGm: number
): number {
  const gm = Math.exp(logGm);
  const w = new Array<number>(x.length);
  if (Math.abs(lambda) < 1e-12) {
    for (let i = 0; i < x.length; i++) w[i] = gm * Math.log(x[i]);
  } else {
    const den = lambda * Math.pow(gm, lambda - 1);
    for (let i = 0; i < x.length; i++) w[i] = (Math.pow(x[i], lambda) - 1) / den;
  }

  let ssw = 0;
  let df = 0;
  for (const g of groups) {
    if (g.length < 2) continue;
    let m = 0;
    for (const i of g) m += w[i];
    m /= g.length;
    for (const i of g) ssw += (w[i] - m) * (w[i] - m);
    df += g.length - 1;
  }
  if (df === 0) return NaN;
  return Math.sqrt(ssw / df);
}

export interface BoxCoxFit {
  lambdaHat: number;
  sdMin: number;
  lowerCL: number;
  upperCL: number;
  sdLimit: number;
}

/**
 * Busca el lambda optimo en [-5, 5] por rejilla y refinamiento, y los limites
 * de confianza donde la curva corta el nivel
 *   sdMin * exp(chi2(1, 1-alpha) / (2 * df)),
 * que es la traduccion del criterio de razon de verosimilitudes a la escala
 * de la desviacion tipica.
 */
export function boxCoxFit(
  x: number[],
  groups: number[][],
  chi2Crit: number
): BoxCoxFit | null {
  const logGm = x.reduce((a, v) => a + Math.log(v), 0) / x.length;
  const sd = (l: number) => bcStdDev(x, groups, l, logGm);

  let df = 0;
  for (const g of groups) if (g.length >= 2) df += g.length - 1;
  if (df < 2) return null;

  // Rejilla gruesa y luego fina alrededor del mejor punto.
  let best = -5;
  let bestSd = Infinity;
  for (let l = -5; l <= 5.0000001; l += 0.01) {
    const s = sd(l);
    if (Number.isFinite(s) && s < bestSd) {
      bestSd = s;
      best = l;
    }
  }
  for (let l = best - 0.02; l <= best + 0.02; l += 0.0001) {
    const s = sd(l);
    if (Number.isFinite(s) && s < bestSd) {
      bestSd = s;
      best = l;
    }
  }

  const limit = bestSd * Math.exp(chi2Crit / (2 * df));

  // Corte por biseccion a cada lado del minimo.
  const cross = (from: number, to: number): number => {
    let lo = from;
    let hi = to;
    if (!(sd(lo) > limit)) return NaN;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (sd(mid) > limit) lo = mid;
      else hi = mid;
      if (Math.abs(hi - lo) < 1e-9) break;
    }
    return (lo + hi) / 2;
  };

  return {
    lambdaHat: best,
    sdMin: bestSd,
    lowerCL: cross(-5, best),
    upperCL: cross(5, best),
    sdLimit: limit,
  };
}

/** Cuantil de la chi-cuadrado con un grado de libertad. */
export function chi2Crit1(conf: number): number {
  // Con 1 gl es el cuadrado del cuantil normal, sin necesidad de tablas.
  const p = 1 - (1 - conf / 100) / 1;
  const z = normalInvLocal(p);
  return z * z;
}

function normalInvLocal(p: number): number {
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
  if (p > 1 - pl) return -normalInvLocal(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}
