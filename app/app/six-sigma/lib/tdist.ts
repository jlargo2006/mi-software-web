// app/app/six-sigma/lib/tdist.ts
// Distribucion t de Student: cuantil y colas.
// Se apoya en betaInv / betaInc de fdist.ts (mismo enfoque que lib/anova1way.ts).
//
// Nota: lib/anova1way.ts ya exporta su propio tQuantile identico a este.
// Cuando quieras unificar, basta con que anova1way.ts haga:
//     export { tQuantile } from "./tdist";
// y borre su implementacion local. No lo he tocado para no alterar
// un estudio que ya esta calibrado y funcionando.

import { betaInv, betaInc } from "./fdist";

/** Cuantil t: devuelve t tal que P(T_df <= t) = p. */
export function tQuantile(p: number, df: number): number {
  if (!Number.isFinite(p) || !Number.isFinite(df) || df <= 0) return NaN;
  if (p <= 0 || p >= 1) return NaN;
  if (p === 0.5) return 0;
  const upper = p > 0.5;
  const pp = upper ? p : 1 - p;
  // x = I^-1(2(1-pp); df/2, 1/2)  ->  t = sqrt(df (1/x - 1))
  const x = betaInv(2 * (1 - pp), df / 2, 0.5);
  const t = Math.sqrt(df * (1 / x - 1));
  return upper ? t : -t;
}

/** Cola superior: P(T_df > t). */
export function tSF(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  const x = df / (df + t * t);
  // P(|T| > |t|) = I(x; df/2, 1/2)
  const twoTail = betaInc(x, df / 2, 0.5);
  return t >= 0 ? twoTail / 2 : 1 - twoTail / 2;
}

/** Funcion de distribucion: P(T_df <= t). */
export function tCDF(t: number, df: number): number {
  return 1 - tSF(t, df);
}

/** P(|T_df| > |t|). */
export function tTwoTail(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  const x = df / (df + t * t);
  return betaInc(x, df / 2, 0.5);
}
