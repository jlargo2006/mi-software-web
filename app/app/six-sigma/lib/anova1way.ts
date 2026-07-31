// app/app/six-sigma/lib/anova1way.ts
// Motor de calculo de One-way ANOVA (varianzas iguales asumidas).
// Reproduce la salida de Minitab: tabla ANOVA, Model Summary, Means y residuos.

import { fPValue, betaInv } from "./fdist";

/** Cuantil t de Student: devuelve t tal que P(T_df <= t) = p. */
export function tQuantile(p: number, df: number): number {
  if (!Number.isFinite(p) || !Number.isFinite(df) || df <= 0) return NaN;
  if (p === 0.5) return 0;
  const upper = p > 0.5;
  const pp = upper ? p : 1 - p;
  // x = I^-1(2(1-pp); df/2, 1/2)  ->  t = sqrt(df (1/x - 1))
  const x = betaInv(2 * (1 - pp), df / 2, 0.5);
  const t = Math.sqrt(df * (1 / x - 1));
  return upper ? t : -t;
}

/**
 * Cuantil de la normal estandar (inversa de la CDF).
 * Algoritmo de Acklam con un paso de refinado de Halley:
 * error relativo por debajo de 1e-15, suficiente para el papel probabilistico.
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

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let x: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // Refinado de Halley usando la CDF via erfc.
  const e = 0.5 * erfc(-x / Math.SQRT2) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  x = x - u / (1 + (x * u) / 2);
  return x;
}

/** Funcion de error complementaria (aproximacion de Numerical Recipes). */
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

/** Un residuo, con todo lo necesario para los cuatro paneles. */
export interface AnovaResidual {
  /** Orden de aparicion en la hoja (1-based). */
  order: number;
  /** Nivel del factor al que pertenece. */
  level: string;
  /** Valor observado. */
  observed: number;
  /** Valor ajustado = media del nivel. */
  fit: number;
  /** Residuo ordinario = observado - ajustado. */
  residual: number;
  /** Residuo estandarizado = e / (s sqrt(1 - 1/n_i)). */
  standardized: number;
  /** Puntuacion normal esperada (Blom) para el papel probabilistico. */
  normalScore: number;
  /** Percentil acumulado (Blom) en %, eje del papel probabilistico. */
  percent: number;
}

export interface AnovaLevel {
  /** Etiqueta del nivel tal cual aparece en los datos. */
  name: string;
  n: number;
  mean: number;
  /** Desviacion tipica del propio nivel (columna StDev de Minitab). */
  stdev: number;
  /** IC con desviacion AGRUPADA y gl del error. */
  ciLo: number;
  ciHi: number;
  values: number[];
}

export interface Anova1WayModel {
  ok: boolean;
  error?: string;

  responseName: string;
  factorName: string;
  alpha: number;

  levels: AnovaLevel[];

  // --- Analysis of Variance ---
  dfFactor: number;
  dfError: number;
  dfTotal: number;
  ssFactor: number;
  ssError: number;
  ssTotal: number;
  msFactor: number;
  msError: number;
  fValue: number;
  pValue: number;

  // --- Model Summary ---
  s: number;
  rSq: number; // %
  rSqAdj: number; // %
  rSqPred: number; // %

  /** = s (Pooled StDev). */
  pooledStDev: number;
  /** t critico usado en los IC de las medias. */
  tCrit: number;
  /** Todos los valores, para graficos. */
  allValues: number[];

  /** Residuos ordenados por su aparicion en la hoja. */
  residuals: AnovaResidual[];
}

export const EMPTY_ANOVA: Anova1WayModel = {
  ok: false,
  error: "Select the response and factor columns.",
  responseName: "",
  factorName: "",
  alpha: 0.05,
  levels: [],
  dfFactor: 0,
  dfError: 0,
  dfTotal: 0,
  ssFactor: 0,
  ssError: 0,
  ssTotal: 0,
  msFactor: 0,
  msError: 0,
  fValue: NaN,
  pValue: NaN,
  s: NaN,
  rSq: NaN,
  rSqAdj: NaN,
  rSqPred: NaN,
  pooledStDev: NaN,
  tCrit: NaN,
  allValues: [],
  residuals: [],
};

/** Grupo de entrada. `order` es opcional: posicion original de cada valor. */
export interface AnovaGroup {
  name: string;
  values: number[];
  order?: number[];
}

function mean(v: number[]): number {
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function sdOf(v: number[]): number {
  const n = v.length;
  if (n < 2) return NaN;
  const m = mean(v);
  return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1));
}

/**
 * Nucleo del calculo. Recibe los grupos ya formados y etiquetados.
 * Cada grupo debe traer al menos un valor; los vacios se descartan antes.
 */
export function computeAnova1Way(
  groups: AnovaGroup[],
  opts: {
    responseName: string;
    factorName: string;
    alpha: number;
  }
): Anova1WayModel {
  // Se filtran los no finitos manteniendo el emparejamiento valor <-> orden.
  const clean = groups
    .map((g) => {
      const values: number[] = [];
      const order: number[] = [];
      for (let i = 0; i < g.values.length; i++) {
        if (!Number.isFinite(g.values[i])) continue;
        values.push(g.values[i]);
        order.push(g.order?.[i] ?? values.length);
      }
      return { name: g.name, values, order };
    })
    .filter((g) => g.values.length > 0);

  if (clean.length < 2) {
    return {
      ...EMPTY_ANOVA,
      alpha: opts.alpha,
      responseName: opts.responseName,
      factorName: opts.factorName,
      error: "At least two factor levels with data are required.",
    };
  }

  const N = clean.reduce((a, g) => a + g.values.length, 0);
  const k = clean.length;

  const dfFactor = k - 1;
  const dfError = N - k;
  const dfTotal = N - 1;

  if (dfError < 1) {
    return {
      ...EMPTY_ANOVA,
      alpha: opts.alpha,
      responseName: opts.responseName,
      factorName: opts.factorName,
      error: "Not enough observations: each level needs replicates.",
    };
  }

  const allValues = clean.flatMap((g) => g.values);
  const grand = mean(allValues);

  let ssFactor = 0;
  let ssError = 0;
  for (const g of clean) {
    const mi = mean(g.values);
    ssFactor += g.values.length * (mi - grand) ** 2;
    for (const x of g.values) ssError += (x - mi) ** 2;
  }
  const ssTotal = ssFactor + ssError;

  const msFactor = ssFactor / dfFactor;
  const msError = ssError / dfError;
  const fValue = msFactor / msError;
  const pValue = fPValue(fValue, dfFactor, dfError);

  const s = Math.sqrt(msError);

  const rSq = (ssFactor / ssTotal) * 100;
  const rSqAdj = (1 - (msError * dfTotal) / ssTotal) * 100;

  // PRESS: en one-way, el leverage de cada observacion es 1/n_i (exacto).
  let press = 0;
  for (const g of clean) {
    const ni = g.values.length;
    const mi = mean(g.values);
    const h = 1 / ni;
    for (const x of g.values) press += ((x - mi) / (1 - h)) ** 2;
  }
  const rSqPred = (1 - press / ssTotal) * 100;

  // IC de las medias: desviacion AGRUPADA y gl del ERROR (como Minitab).
  const tCrit = tQuantile(1 - opts.alpha / 2, dfError);

  const levels: AnovaLevel[] = clean.map((g) => {
    const ni = g.values.length;
    const mi = mean(g.values);
    const half = tCrit * (s / Math.sqrt(ni));
    return {
      name: g.name,
      n: ni,
      mean: mi,
      stdev: sdOf(g.values),
      ciLo: mi - half,
      ciHi: mi + half,
      values: g.values,
    };
  });

  // ---- Residuos ----
  // Ajustado = media del nivel. Leverage exacto h_i = 1/n_i.
  type Partial = Omit<AnovaResidual, "normalScore" | "percent">;
  const partial: Partial[] = [];
  for (const g of clean) {
    const ni = g.values.length;
    const mi = mean(g.values);
    const denom = s * Math.sqrt(1 - 1 / ni);
    for (let i = 0; i < ni; i++) {
      const e = g.values[i] - mi;
      partial.push({
        order: g.order[i],
        level: g.name,
        observed: g.values[i],
        fit: mi,
        residual: e,
        standardized: denom > 0 ? e / denom : NaN,
      });
    }
  }

  // Puntuaciones normales de Blom: p = (rank - 3/8) / (n + 1/4).
  const byResidual = [...partial].sort((a, b) => a.residual - b.residual);
  const nRes = byResidual.length;
  const scoreOf = new Map<Partial, { normalScore: number; percent: number }>();
  byResidual.forEach((item, idx) => {
    const p = (idx + 1 - 0.375) / (nRes + 0.25);
    scoreOf.set(item, { normalScore: normQuantile(p), percent: p * 100 });
  });

  const residuals: AnovaResidual[] = partial
    .map((item) => ({ ...item, ...scoreOf.get(item)! }))
    .sort((a, b) => a.order - b.order);

  return {
    ok: true,
    responseName: opts.responseName,
    factorName: opts.factorName,
    alpha: opts.alpha,
    levels,
    dfFactor,
    dfError,
    dfTotal,
    ssFactor,
    ssError,
    ssTotal,
    msFactor,
    msError,
    fValue,
    pValue,
    s,
    rSq,
    rSqAdj,
    rSqPred,
    pooledStDev: s,
    tCrit,
    allValues,
    residuals,
  };
}

/**
 * Formato apilado: una columna de respuesta + una columna de factor.
 * Los niveles se ordenan de forma natural (numerica si todos son numeros).
 * Se conserva el indice de fila original para el grafico de orden.
 */
export function groupsFromStacked(
  response: unknown[],
  factor: unknown[]
): AnovaGroup[] {
  const map = new Map<string, { values: number[]; order: number[] }>();
  const n = Math.min(response.length, factor.length);
  let seq = 0;

  for (let i = 0; i < n; i++) {
    const lvlRaw = factor[i];
    const lvl = String(lvlRaw ?? "").trim();
    if (lvl === "") continue;

    const rRaw = response[i];
    if (rRaw === null || rRaw === undefined || String(rRaw).trim() === "") continue;
    const num =
      typeof rRaw === "number" ? rRaw : Number(String(rRaw).trim().replace(",", "."));
    if (!Number.isFinite(num)) continue;

    seq += 1;
    if (!map.has(lvl)) map.set(lvl, { values: [], order: [] });
    const bucket = map.get(lvl)!;
    bucket.values.push(num);
    bucket.order.push(seq);
  }

  const keys = [...map.keys()];
  const allNumeric = keys.every((k) => Number.isFinite(Number(k.replace(",", "."))));
  keys.sort((a, b) =>
    allNumeric
      ? Number(a.replace(",", ".")) - Number(b.replace(",", "."))
      : a.localeCompare(b)
  );

  return keys.map((name) => ({
    name,
    values: map.get(name)!.values,
    order: map.get(name)!.order,
  }));
}

/**
 * Formato desapilado: una columna por nivel. El nombre del nivel es el de la columna.
 * El orden de observacion se asigna recorriendo columna a columna.
 */
export function groupsFromUnstacked(
  cols: { name: string; raw: unknown[] }[]
): AnovaGroup[] {
  let seq = 0;
  return cols.map((c) => {
    const values: number[] = [];
    const order: number[] = [];
    for (const v of c.raw) {
      if (v === null || v === undefined || String(v).trim() === "") continue;
      const num =
        typeof v === "number" ? v : Number(String(v).trim().replace(",", "."));
      if (!Number.isFinite(num)) continue;
      seq += 1;
      values.push(num);
      order.push(seq);
    }
    return { name: c.name, values, order };
  });
}
