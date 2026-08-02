// app/app/six-sigma/lib/eqvar.ts
// Motor de calculo del Test for Equal Variances.
// Reproduce la salida de Minitab: Bonferroni CIs (metodo de Bonett),
// test de Levene (Brown-Forsythe, desviaciones respecto a la mediana) y
// test de comparaciones multiples de Bonett.
//
// ---------------------------------------------------------------------------
// DETALLES CALIBRADOS CONTRA MINITAB (ejemplo BTU.In vs Damper)
// ---------------------------------------------------------------------------
// 1) Los IC NO son chi-cuadrado. El metodo clasico sqrt((n-1)s2/chi2) da
//    (2,4065; 4,0273) para el grupo 1, frente al (2,25901; 4,27664) real.
//    Minitab usa BONETT, robusto frente a no normalidad:
//
//      sigma en sqrt( exp( ln(c*s2) +- z * c * sqrt( (g4 - (n-3)/n)/(n-1) ) ) )
//      con c = n / (n - z)
//
//    El factor c multiplica TAMBIEN al error estandar, no solo al centro.
//
// 2) La curtosis g4 se calcula respecto a una MEDIA RECORTADA con proporcion
//    1/(2*sqrt(n-4)), y el recorte es FRACCIONARIO E INTERPOLADO. Con recorte
//    entero (3 o 4 observaciones) el grupo 1 falla en el tercer decimal.
//
// 3) El p-valor de comparaciones multiples sale de la version AUTOCONSISTENTE
//    del estadistico de Bonett: como c depende de z, se resuelve |T(z)| = z
//    por biseccion y p = 2*(1 - Phi(z*)).
//
// Resultados verificados:
//    StDev        3,0198680 / 2,7670195   (Minitab 3,01987 / 2,76702)
//    IC Bonf. 1   (2,25901; 4,27664)      exacto
//    IC Bonf. 2   (2,27551; 3,52261)      exacto
//    Levene       0,0000231 -> p = 0,996178   (Minitab 0,00 / 0,996)
//    Comp. mult.  p = 0,58698             (Minitab 0,586; desvia 0,001)

import { fPValue } from "./fdist";

export interface EqVarGroupResult {
  name: string;
  n: number;
  stdev: number;
  variance: number;
  /** IC de Bonferroni (Bonett) para la desviacion tipica. */
  ciLo: number;
  ciHi: number;
  /** Intervalo de comparacion multiple, para el grafico. */
  mcLo: number;
  mcHi: number;
  /** Curtosis usada por Bonett (diagnostico). */
  kurtosis: number;
  values: number[];
}

export interface EqVarModel {
  ok: boolean;
  error?: string;

  responseName: string;
  factorName: string;
  alpha: number;
  /** Nivel individual de cada IC de Bonferroni: 1 - alpha/k. */
  individualLevel: number;

  groups: EqVarGroupResult[];

  /** Comparaciones multiples (Bonett). Solo p-valor, como Minitab. */
  mcPValue: number;
  /** Estadistico de Bonett en el punto autoconsistente (diagnostico). */
  mcStatistic: number;

  leveneStatistic: number;
  levenePValue: number;
  leveneDf1: number;
  leveneDf2: number;

  allValues: number[];
}

export const EMPTY_EQVAR: EqVarModel = {
  ok: false,
  error: "Select the data columns.",
  responseName: "",
  factorName: "",
  alpha: 0.05,
  individualLevel: 0.975,
  groups: [],
  mcPValue: NaN,
  mcStatistic: NaN,
  leveneStatistic: NaN,
  levenePValue: NaN,
  leveneDf1: 0,
  leveneDf2: 0,
  allValues: [],
};

// --------------------------------------------------------------------------
// Utilidades estadisticas
// --------------------------------------------------------------------------

function mean(v: number[]): number {
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return NaN;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function variance(v: number[]): number {
  const n = v.length;
  if (n < 2) return NaN;
  const m = mean(v);
  return v.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1);
}

/**
 * Cuantil de la normal estandar (Acklam + refinado de Halley).
 * Duplicado a proposito respecto a anova1way.ts para no tocar un estudio
 * ya calibrado; unificar en lib/normal.ts cuando convenga.
 */
export function normQuantile(p: number): number {
  if (!(p > 0 && p < 1)) return NaN;
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
  let x: number;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pl) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  // Refinado de Halley
  const e = 0.5 * erfc(-x / Math.SQRT2) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + z / 2);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t *
                                  (1.48851587 +
                                    t * (-0.82215223 + t * 0.17087277))))))))
    );
  return x >= 0 ? r : 2 - r;
}

/** Cola superior de la normal: P(Z > z). */
function normSF(z: number): number {
  return 0.5 * erfc(z / Math.SQRT2);
}

/**
 * Media recortada con proporcion FRACCIONARIA e interpolada.
 * Recorta k = prop*n observaciones por cola; la parte fraccionaria se aplica
 * como peso parcial a las observaciones de los extremos del nucleo.
 * Este detalle es imprescindible: con recorte entero los IC no cuadran.
 */
function trimmedMean(values: number[], prop: number): number {
  const x = [...values].sort((a, b) => a - b);
  const n = x.length;
  const k = prop * n;
  const kf = Math.floor(k);
  const frac = k - kf;
  if (2 * kf >= n) return median(x);

  const core = x.slice(kf, n - kf);
  const w = new Array(core.length).fill(1);
  if (core.length >= 2) {
    w[0] -= frac;
    w[core.length - 1] -= frac;
  } else if (core.length === 1) {
    w[0] = 1;
  }
  let num = 0;
  let den = 0;
  for (let i = 0; i < core.length; i++) {
    num += core[i] * w[i];
    den += w[i];
  }
  return den > 0 ? num / den : median(x);
}

/** Curtosis de Bonett, calculada respecto a la media recortada. */
function bonettKurtosis(values: number[]): number {
  const n = values.length;
  const m = mean(values);
  const prop = n > 4 ? 1 / (2 * Math.sqrt(n - 4)) : 0;
  const tm = trimmedMean(values, prop);
  let num = 0;
  let den = 0;
  for (const x of values) {
    num += (x - tm) ** 4;
    den += (x - m) ** 2;
  }
  return den > 0 ? (n * num) / (den * den) : NaN;
}

/** Varianza asintotica del log de la varianza (parte sin el factor c). */
function bonettVar(n: number, g4: number): number {
  return (g4 - (n - 3) / n) / (n - 1);
}

/**
 * IC de Bonett para la desviacion tipica, a nivel de confianza `conf`.
 * En el estudio, conf es el nivel INDIVIDUAL de Bonferroni (1 - alpha/k).
 */
export function bonettCI(
  values: number[],
  conf: number
): { lo: number; hi: number; kurtosis: number } {
  const n = values.length;
  const s2 = variance(values);
  const g4 = bonettKurtosis(values);
  const z = normQuantile(1 - (1 - conf) / 2);
  const c = n / (n - z);
  const se = c * Math.sqrt(bonettVar(n, g4));
  const center = Math.log(c * s2);
  return {
    lo: Math.sqrt(Math.exp(center - z * se)),
    hi: Math.sqrt(Math.exp(center + z * se)),
    kurtosis: g4,
  };
}

// --------------------------------------------------------------------------
// Test de Levene (Brown-Forsythe: desviaciones respecto a la MEDIANA)
// --------------------------------------------------------------------------

function leveneTest(groups: number[][]): {
  statistic: number;
  pValue: number;
  df1: number;
  df2: number;
} {
  const k = groups.length;
  const N = groups.reduce((a, g) => a + g.length, 0);
  if (k < 2 || N - k <= 0) {
    return { statistic: NaN, pValue: NaN, df1: 0, df2: 0 };
  }

  const dev = groups.map((g) => {
    const md = median(g);
    return g.map((x) => Math.abs(x - md));
  });

  const grand = mean(dev.flat());
  let ssB = 0;
  let ssW = 0;
  for (const d of dev) {
    const m = mean(d);
    ssB += d.length * (m - grand) ** 2;
    for (const x of d) ssW += (x - m) ** 2;
  }

  const df1 = k - 1;
  const df2 = N - k;
  const statistic = ssW > 0 ? ssB / df1 / (ssW / df2) : NaN;
  const pValue = Number.isFinite(statistic) ? fPValue(statistic, df1, df2) : NaN;
  return { statistic, pValue, df1, df2 };
}

// --------------------------------------------------------------------------
// Comparaciones multiples de Bonett (version autoconsistente)
// --------------------------------------------------------------------------

/**
 * Estadistico de Bonett para dos grupos, evaluado en z.
 * Como c = n/(n-z) depende de z, el estadistico tambien.
 */
function bonettStatAt(
  a: { n: number; s2: number; g4: number },
  b: { n: number; s2: number; g4: number },
  z: number
): number {
  const ca = a.n / (a.n - z);
  const cb = b.n / (b.n - z);
  const va = bonettVar(a.n, a.g4);
  const vb = bonettVar(b.n, b.g4);
  return (Math.log(ca * a.s2) - Math.log(cb * b.s2)) / Math.sqrt(va + vb);
}

/** Resuelve |T(z)| = z por biseccion y devuelve el p-valor bilateral. */
function bonettMCTwoGroups(
  a: { n: number; s2: number; g4: number },
  b: { n: number; s2: number; g4: number }
): { p: number; stat: number } {
  const f = (z: number) => Math.abs(bonettStatAt(a, b, z)) - z;
  let lo = 1e-9;
  let hi = 5;
  if (f(lo) < 0) {
    // Varianzas practicamente identicas: p ~ 1.
    const s = Math.abs(bonettStatAt(a, b, 0));
    return { p: 2 * normSF(s), stat: s };
  }
  while (f(hi) > 0 && hi < 50) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid;
    else hi = mid;
  }
  const zStar = (lo + hi) / 2;
  return { p: 2 * normSF(zStar), stat: zStar };
}

/**
 * Con mas de dos grupos, el p-valor de comparaciones multiples es el minimo
 * de los p por pares ajustado por Bonferroni (k*(k-1)/2 comparaciones),
 * acotado a 1. Con k = 2 se reduce al par unico, que es el caso calibrado.
 */
function multipleComparisons(
  parts: { n: number; s2: number; g4: number }[]
): { p: number; stat: number } {
  const k = parts.length;
  if (k < 2) return { p: NaN, stat: NaN };
  if (k === 2) return bonettMCTwoGroups(parts[0], parts[1]);

  const m = (k * (k - 1)) / 2;
  let best = Infinity;
  let bestStat = NaN;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const r = bonettMCTwoGroups(parts[i], parts[j]);
      if (r.p < best) {
        best = r.p;
        bestStat = r.stat;
      }
    }
  }
  return { p: Math.min(1, best * m), stat: bestStat };
}

// --------------------------------------------------------------------------
// Calculo principal
// --------------------------------------------------------------------------

export function computeEqVar(
  rawGroups: { name: string; values: number[] }[],
  opts: { responseName: string; factorName: string; alpha: number }
): EqVarModel {
  const base = {
    ...EMPTY_EQVAR,
    responseName: opts.responseName,
    factorName: opts.factorName,
    alpha: opts.alpha,
  };

  const groups = rawGroups
    .map((g) => ({ name: g.name, values: g.values.filter((x) => Number.isFinite(x)) }))
    .filter((g) => g.values.length > 0);

  if (groups.length < 2) {
    return { ...base, error: "At least two levels with data are required." };
  }
  const small = groups.find((g) => g.values.length < 5);
  if (small) {
    return {
      ...base,
      error:
        `Level "${small.name}" has ${small.values.length} observations. ` +
        "The Bonett method needs at least 5 per level.",
    };
  }

  const k = groups.length;
  // Bonferroni: cada IC se construye al nivel 1 - alpha/k.
  const individualLevel = 1 - opts.alpha / k;

  const parts = groups.map((g) => ({
    n: g.values.length,
    s2: variance(g.values),
    g4: bonettKurtosis(g.values),
  }));

  const mc = multipleComparisons(parts);
  const lev = leveneTest(groups.map((g) => g.values));

  // --- Intervalos de comparacion multiple, para el grafico ---
  // Construidos por EQUIVALENCIA con el test: las semianchuras en escala
  // logaritmica se reparten como h_i = z * v_i / sqrt(sum v), de modo que
  // dos intervalos se solapan si y solo si el par no es significativo a
  // alpha. Es la propiedad que anuncia el pie de la grafica de Minitab.
  const zMC = normQuantile(1 - opts.alpha / 2);
  const vAll = parts.map((p) => bonettVar(p.n, p.g4));
  const vSum = Math.sqrt(vAll.reduce((a, v) => a + v, 0));

  const out: EqVarGroupResult[] = groups.map((g, i) => {
    const p = parts[i];
    const ci = bonettCI(g.values, individualLevel);
    const c = p.n / (p.n - zMC);
    const center = Math.log(c * p.s2);
    const h = vSum > 0 ? (zMC * vAll[i]) / vSum : 0;
    return {
      name: g.name,
      n: p.n,
      stdev: Math.sqrt(p.s2),
      variance: p.s2,
      ciLo: ci.lo,
      ciHi: ci.hi,
      mcLo: Math.sqrt(Math.exp(center - h)),
      mcHi: Math.sqrt(Math.exp(center + h)),
      kurtosis: ci.kurtosis,
      values: g.values,
    };
  });

  return {
    ...base,
    ok: true,
    error: undefined,
    individualLevel,
    groups: out,
    mcPValue: mc.p,
    mcStatistic: mc.stat,
    leveneStatistic: lev.statistic,
    levenePValue: lev.pValue,
    leveneDf1: lev.df1,
    leveneDf2: lev.df2,
    allValues: groups.flatMap((g) => g.values),
  };
}
