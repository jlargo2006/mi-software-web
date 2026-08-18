// app/app/six-sigma/studies/improve/bestsubsets/types.ts

/** Tope de predictores: 2^k subconjuntos, y 12 ya son 4095 ajustes. */
export const MAX_PREDICTORS = 12;

export interface ImpSubsetsParams {
  response: string;
  /** Predictores que entran o salen libremente. */
  freePredictors: string[];
  /** Cuantos modelos mostrar por cada tamano, de 1 a 5. */
  modelsPerSize: string;
}

export const IMPSUBSETS_DEFAULT: ImpSubsetsParams = {
  response: "",
  freePredictors: [],
  modelsPerSize: "2",
};

export interface SubsetRow {
  /** Numero de predictores del modelo. */
  vars: number;
  /** Indices, sobre el orden de freePredictors, de los que entran. */
  members: number[];
  r2: number;
  r2adj: number;
  r2pred: number;
  cp: number;
  s: number;
  /** Parametros del modelo, intercepto incluido. */
  p: number;
}

export interface ImpSubsetsModel {
  response: string;
  predictors: string[];
  rows: SubsetRow[];
  /** Mejor modelo de cada tamano, para el grafico de criterios. */
  bestBySize: SubsetRow[];
  n: number;
  nMissing: number;
  /** Subconjuntos evaluados y descartados por colinealidad. */
  nEvaluated: number;
  nSkipped: number;
  /** Fila con el Cp mas cercano a p sin pasarse: la recomendacion. */
  recommended: SubsetRow | null;
}

export type ImpSubsetsResult =
  | ({ ok: true; error?: undefined } & ImpSubsetsModel)
  | { ok: false; error: string };
