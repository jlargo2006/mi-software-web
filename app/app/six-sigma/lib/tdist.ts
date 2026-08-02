// app/app/six-sigma/lib/tdist.ts
// Distribucion t de Student: cuantil y colas.
// Solo depende de fPValue y betaInv de fdist.ts (las dos que ya usa anova1way).
//
// Las colas se obtienen de la identidad T^2 ~ F(1, df):
//     P(|T_df| > |t|) = P(F_1,df > t^2)
// Asi reutilizamos fPValue, que ya esta calibrado, y no hace falta
// betaInc (que fdist.ts no exporta con esta firma).

import { fPValue, betaInv } from "./fdist";

/** Cuantil t: devuelve t tal que P(T_df <= t) = p. */
export function tQuantile(p: number, df: number): number {
  if (!Number.isFinite(p) || !Number.isFinite(df) || df <= 0) return NaN;
  if (p <= 0 || p >= 1) return NaN;
  if (p === 0.5) return 0;
  const upper = p > 0.5;
  const pp = upper ? p : 1 - p;
  const x = betaInv(2 * (1 - pp), df / 2, 0.5);
  const t = Math.sqrt(df * (1 / x - 1));
  return upper ? t : -t;
}

/** P(|T_df| > |t|). */
export function tTwoTail(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  if (t === 0) return 1;
  return fPValue(t * t, 1, df);
}

/** Cola superior: P(T_df > t). */
export function tSF(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  const half = tTwoTail(t, df) / 2;
  return t >= 0 ? half : 1 - half;
}

/** Funcion de distribucion: P(T_df <= t). */
export function tCDF(t: number, df: number): number {
  const sf = tSF(t, df);
  return Number.isFinite(sf) ? 1 - sf : NaN;
}
