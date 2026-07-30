// app/app/six-sigma/lib/anova1way.ts
// Motor de cÃ¡lculo de One-way ANOVA (varianzas iguales asumidas).
// Reproduce la salida de Minitab: tabla ANOVA, Model Summary y Means.

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

export interface AnovaLevel {
  /** Etiqueta del nivel tal cual aparece en los datos. */
  name: string;
  n: number;
  mean: number;
  /** DesviaciÃ³n tÃ­pica del propio nivel (columna StDev de Minitab). */
  stdev: number;
  /** IC con desviaciÃ³n AGRUPADA y gl del error. */
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
  rSq: number;      // %
  rSqAdj: number;   // %
  rSqPred: number;  // %

  /** = s (Pooled StDev). */
  pooledStDev: number;
  /** t crÃ­tico usado en los IC de las medias. */
  tCrit: number;
  /** Todos los valores, para grÃ¡ficos. */
  allValues: number[];
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

/**
 * NÃºcleo del cÃ¡lculo. Recibe los grupos ya formados y etiquetados.
 * Cada grupo debe traer al menos un valor; los vacÃ­os se descartan antes.
 */
export function computeAnova1Way(
  groups: { name: string; values: number[] }[],
  opts: {
    responseName: string;
    factorName: string;
    alpha: number;
  }
): Anova1WayModel {
  const clean = groups
    .map((g) => ({
      name: g.name,
      values: g.values.filter((x) => Number.isFinite(x)),
    }))
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

  // PRESS: en one-way, el leverage de cada observaciÃ³n es 1/n_i (exacto).
  let press = 0;
  for (const g of clean) {
    const ni = g.values.length;
    const mi = mean(g.values);
    const h = 1 / ni;
    for (const x of g.values) press += ((x - mi) / (1 - h)) ** 2;
  }
  const rSqPred = (1 - press / ssTotal) * 100;

  // IC de las medias: desviaciÃ³n AGRUPADA y gl del ERROR (como Minitab).
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
  };
}

/**
 * Formato apilado: una columna de respuesta + una columna de factor.
 * Los niveles se ordenan de forma natural (numÃ©rica si todos son nÃºmeros).
 */
export function groupsFromStacked(
  response: unknown[],
  factor: unknown[]
): { name: string; values: number[] }[] {
  const map = new Map<string, number[]>();
  const n = Math.min(response.length, factor.length);

  for (let i = 0; i < n; i++) {
    const lvlRaw = factor[i];
    const lvl = String(lvlRaw ?? "").trim();
    if (lvl === "") continue;

    const rRaw = response[i];
    if (rRaw === null || rRaw === undefined || String(rRaw).trim() === "") continue;
    const num =
      typeof rRaw === "number" ? rRaw : Number(String(rRaw).trim().replace(",", "."));
    if (!Number.isFinite(num)) continue;

    if (!map.has(lvl)) map.set(lvl, []);
    map.get(lvl)!.push(num);
  }

  const keys = [...map.keys()];
  const allNumeric = keys.every((k) => Number.isFinite(Number(k.replace(",", "."))));
  keys.sort((a, b) =>
    allNumeric
      ? Number(a.replace(",", ".")) - Number(b.replace(",", "."))
      : a.localeCompare(b)
  );

  return keys.map((name) => ({ name, values: map.get(name)! }));
}

/** Formato desapilado: una columna por nivel. El nombre del nivel es el de la columna. */
export function groupsFromUnstacked(
  cols: { name: string; raw: unknown[] }[]
): { name: string; values: number[] }[] {
  return cols.map((c) => ({
    name: c.name,
    values: c.raw
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
      .map((v) =>
        typeof v === "number" ? v : Number(String(v).trim().replace(",", "."))
      )
      .filter((v) => Number.isFinite(v)),
  }));
}
