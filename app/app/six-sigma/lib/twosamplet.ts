// app/app/six-sigma/lib/twosamplet.ts
// Motor de calculo del 2-Sample t (Welch por defecto, pooled opcional).
// Reproduce la salida de Minitab: Descriptive Statistics, Estimation for
// Difference y Test.
//
// Detalle critico calibrado contra Minitab: los grados de libertad de
// Welch-Satterthwaite se TRUNCAN (Math.floor) y el valor truncado se usa
// tambien para el p-valor y para el t critico del IC. Con df = 80,1897 sin
// truncar, el IC del ejemplo BTU.In difiere en el cuarto decimal.

import { tQuantile, tTwoTail, tSF, tCDF } from "./tdist";

export type TAlternative = "two-sided" | "less" | "greater";

export interface TSampleStats {
  name: string;
  n: number;
  mean: number;
  stdev: number;
  seMean: number;
  values: number[];
}

export interface TwoSampleTModel {
  ok: boolean;
  error?: string;

  responseName: string;
  factorName: string;
  alpha: number;
  alternative: TAlternative;
  /** Diferencia hipotetica bajo H0 (normalmente 0). */
  hypDiff: number;
  /** true = pooled (varianzas iguales); false = Welch. */
  pooled: boolean;

  s1: TSampleStats;
  s2: TSampleStats;

  /** mean1 - mean2 */
  difference: number;
  /** Error estandar de la diferencia. */
  seDiff: number;
  /** Desviacion agrupada (solo si pooled). */
  pooledStDev: number;

  /** DF usado en el calculo (ya truncado si Welch). */
  df: number;
  /** DF de Welch sin truncar, informativo. */
  dfExact: number;

  tValue: number;
  pValue: number;

  /** Limites del IC. En contrastes de una cola, uno de los dos es infinito. */
  ciLo: number;
  ciHi: number;
  tCrit: number;

  allValues: number[];
}

export const EMPTY_TWOSAMPLET: TwoSampleTModel = {
  ok: false,
  error: "Select the sample columns.",
  responseName: "",
  factorName: "",
  alpha: 0.05,
  alternative: "two-sided",
  hypDiff: 0,
  pooled: false,
  s1: { name: "", n: 0, mean: NaN, stdev: NaN, seMean: NaN, values: [] },
  s2: { name: "", n: 0, mean: NaN, stdev: NaN, seMean: NaN, values: [] },
  difference: NaN,
  seDiff: NaN,
  pooledStDev: NaN,
  df: 0,
  dfExact: NaN,
  tValue: NaN,
  pValue: NaN,
  ciLo: NaN,
  ciHi: NaN,
  tCrit: NaN,
  allValues: [],
};

function mean(v: number[]): number {
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function sdOf(v: number[]): number {
  const n = v.length;
  if (n < 2) return NaN;
  const m = mean(v);
  return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1));
}

export function computeTwoSampleT(
  g1: { name: string; values: number[] },
  g2: { name: string; values: number[] },
  opts: {
    responseName: string;
    factorName: string;
    alpha: number;
    alternative: TAlternative;
    hypDiff: number;
    pooled: boolean;
  }
): TwoSampleTModel {
  const v1 = g1.values.filter((x) => Number.isFinite(x));
  const v2 = g2.values.filter((x) => Number.isFinite(x));

  const base = {
    ...EMPTY_TWOSAMPLET,
    responseName: opts.responseName,
    factorName: opts.factorName,
    alpha: opts.alpha,
    alternative: opts.alternative,
    hypDiff: opts.hypDiff,
    pooled: opts.pooled,
  };

  if (v1.length < 2 || v2.length < 2) {
    return { ...base, error: "Each sample needs at least two observations." };
  }

  const n1 = v1.length;
  const n2 = v2.length;
  const m1 = mean(v1);
  const m2 = mean(v2);
  const sd1 = sdOf(v1);
  const sd2 = sdOf(v2);
  const var1 = sd1 * sd1;
  const var2 = sd2 * sd2;

  const s1: TSampleStats = {
    name: g1.name,
    n: n1,
    mean: m1,
    stdev: sd1,
    seMean: sd1 / Math.sqrt(n1),
    values: v1,
  };
  const s2: TSampleStats = {
    name: g2.name,
    n: n2,
    mean: m2,
    stdev: sd2,
    seMean: sd2 / Math.sqrt(n2),
    values: v2,
  };

  const difference = m1 - m2;

  let seDiff: number;
  let df: number;
  let dfExact: number;
  let pooledStDev = NaN;

  if (opts.pooled) {
    const sp2 = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    pooledStDev = Math.sqrt(sp2);
    seDiff = pooledStDev * Math.sqrt(1 / n1 + 1 / n2);
    df = n1 + n2 - 2;
    dfExact = df;
  } else {
    const a = var1 / n1;
    const b = var2 / n2;
    seDiff = Math.sqrt(a + b);
    // Welch-Satterthwaite
    dfExact = (a + b) ** 2 / (a * a / (n1 - 1) + b * b / (n2 - 1));
    // Minitab trunca y usa el valor truncado en p-valor e IC.
    df = Math.max(1, Math.floor(dfExact));
  }

  const tValue = (difference - opts.hypDiff) / seDiff;

  let pValue: number;
  let ciLo: number;
  let ciHi: number;
  let tCrit: number;

  if (opts.alternative === "two-sided") {
    pValue = tTwoTail(tValue, df);
    tCrit = tQuantile(1 - opts.alpha / 2, df);
    ciLo = difference - tCrit * seDiff;
    ciHi = difference + tCrit * seDiff;
  } else if (opts.alternative === "greater") {
    pValue = tSF(tValue, df);
    tCrit = tQuantile(1 - opts.alpha, df);
    ciLo = difference - tCrit * seDiff;
    ciHi = Infinity;
  } else {
    pValue = tCDF(tValue, df);
    tCrit = tQuantile(1 - opts.alpha, df);
    ciLo = -Infinity;
    ciHi = difference + tCrit * seDiff;
  }

  return {
    ...base,
    ok: true,
    error: undefined,
    s1,
    s2,
    difference,
    seDiff,
    pooledStDev,
    df,
    dfExact,
    tValue,
    pValue,
    ciLo,
    ciHi,
    tCrit,
    allValues: [...v1, ...v2],
  };
}
