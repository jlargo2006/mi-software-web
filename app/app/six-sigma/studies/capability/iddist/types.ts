// app/app/six-sigma/studies/capability/iddist/types.ts
import type { FamilyId, FamilyFit } from "./families";

export interface IdDistParams {
  col: string | null;
  /** null = usar todas las familias y transformaciones. */
  families: FamilyId[] | null;
  /** Limites de lambda para la busqueda de Box-Cox. */
  bcLo: string;
  bcHi: string;
  /** true = redondear lambda al valor "comodo" mas proximo. */
  bcRound: boolean;
}

export const IDDIST_DEFAULT: IdDistParams = {
  col: null,
  families: null,
  bcLo: "-5",
  bcHi: "5",
  bcRound: false,
};

export interface Descriptives {
  n: number;
  nMissing: number;
  mean: number;
  sd: number;
  median: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
}

export interface IdDistModel {
  colName: string;
  desc: Descriptives;
  fits: FamilyFit[];
  /** Mejor ajuste entre los que tienen p-valor utilizable. */
  best: FamilyFit | null;
  boxcoxLambda: number | null;
  johnsonText: string | null;
  values: number[];
}

export type IdDistResult =
  | ({ ok: true; error?: undefined } & IdDistModel)
  | { ok: false; error: string };
