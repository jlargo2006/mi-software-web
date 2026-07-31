// app/app/six-sigma/lib/tTest1.ts
import { buildContext, stDev, seMean } from "./statistics";
import { tCdf, tInv } from "./distributions";
import type { Cell } from "./types";

export type Alternative = "less" | "two-sided" | "greater";

export interface TTest1Model {
  ok: boolean;
  error?: string;

  column: string;
  values: number[];
  n: number;
  nMissing: number;
  mean: number;
  stDev: number;
  seMean: number;

  /** Nivel de confianza en % (95 = 95%). */
  confLevel: number;
  /** "two" = intervalo bilateral; "lower"/"upper" = cota unilateral. */
  ciKind: "two" | "lower" | "upper";
  ciLow: number;   // NaN si ciKind === "upper"
  ciHigh: number;  // NaN si ciKind === "lower"

  performTest: boolean;
  mu0: number;     // NaN si !performTest
  alternative: Alternative;
  df: number;
  tValue: number;  // NaN si !performTest
  pValue: number;  // NaN si !performTest
}

const fail = (error: string): TTest1Model => ({
  ok: false,
  error,
  column: "",
  values: [],
  n: 0,
  nMissing: 0,
  mean: NaN,
  stDev: NaN,
  seMean: NaN,
  confLevel: NaN,
  ciKind: "two",
  ciLow: NaN,
  ciHigh: NaN,
  performTest: false,
  mu0: NaN,
  alternative: "two-sided",
  df: NaN,
  tValue: NaN,
  pValue: NaN,
});

export interface TTest1Input {
  column: string;
  raw: Cell[];
  confLevel: number;
  performTest: boolean;
  mu0: number;
  alternative: Alternative;
}

export function tTest1(input: TTest1Input): TTest1Model {
  const { column, raw, confLevel, performTest, mu0, alternative } = input;

  if (!Number.isFinite(confLevel) || confLevel <= 0 || confLevel >= 100) {
    return fail("El nivel de confianza debe estar entre 0 y 100.");
  }
  if (performTest && !Number.isFinite(mu0)) {
    return fail("Introduce un valor numérico para la media hipotética.");
  }

  const ctx = buildContext(raw);
  if (ctx.n < 2) {
    return fail("Se necesitan al menos 2 observaciones numéricas.");
  }

  const n = ctx.n;
  const df = n - 1;
  const mean = ctx.mean;
  const s = stDev(ctx);
  const se = seMean(ctx);

  if (!Number.isFinite(s) || s === 0) {
    return fail("La desviación estándar es cero: todos los valores son iguales.");
  }

  const alpha = 1 - confLevel / 100;

  // Minitab: bilateral -> intervalo; unilateral -> cota en el sentido de H1.
  let ciKind: TTest1Model["ciKind"] = "two";
  let ciLow = NaN;
  let ciHigh = NaN;

  if (!performTest || alternative === "two-sided") {
    const tc = tInv(1 - alpha / 2, df);
    ciLow = mean - tc * se;
    ciHigh = mean + tc * se;
  } else if (alternative === "greater") {
    ciKind = "lower";
    ciLow = mean - tInv(1 - alpha, df) * se;
  } else {
    ciKind = "upper";
    ciHigh = mean + tInv(1 - alpha, df) * se;
  }

  let tValue = NaN;
  let pValue = NaN;
  if (performTest) {
    tValue = (mean - mu0) / se;
    if (alternative === "less") pValue = tCdf(tValue, df);
    else if (alternative === "greater") pValue = 1 - tCdf(tValue, df);
    else pValue = 2 * (1 - tCdf(Math.abs(tValue), df));
  }

  return {
    ok: true,
    column,
    values: ctx.values,
    n,
    nMissing: ctx.nMissing,
    mean,
    stDev: s,
    seMean: se,
    confLevel,
    ciKind,
    ciLow,
    ciHigh,
    performTest,
    mu0: performTest ? mu0 : NaN,
    alternative,
    df,
    tValue,
    pValue,
  };
}
