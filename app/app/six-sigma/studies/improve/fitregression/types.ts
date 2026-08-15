// app/app/six-sigma/studies/improve/fitregression/types.ts
import type { MultiRegFit } from "../../../lib/multiregression";

export const MAX_PREDICTORS = 20;

/** Umbrales de VIF. Entre 5 y 10 el coeficiente ya no es aceptable. */
export const VIF_WARN = 5;
export const VIF_SEVERE = 10;

export interface ImpFitRegParams {
  response: string;
  predictors: string[];
  confidenceLevel: string;
  /** Nivel con el que se juzga la significacion de los terminos. */
  alpha: string;
  showResidualPlots: boolean;
}

export const IMPFITREG_DEFAULT: ImpFitRegParams = {
  response: "",
  predictors: [],
  confidenceLevel: "95",
  alpha: "0,05",
  showResidualPlots: true,
};

export interface FitRegUnusual {
  /** Numero de observacion, base 1 sobre las filas completas. */
  obs: number;
  y: number;
  fit: number;
  resid: number;
  stdResid: number;
  largeResid: boolean;
  unusualX: boolean;
}

export type FitRegAdviceKind =
  | "vifSevere"
  | "vifWarn"
  | "notSignificant"
  | "singleTerm"
  | "final";

export interface FitRegAdvice {
  kind: FitRegAdviceKind;
  /** Termino que conviene retirar, si procede. */
  term: string | null;
  headline: string;
  detail: string;
  /** Predictores que quedarian tras aplicar el consejo. */
  nextPredictors: string[];
}

export interface ImpFitRegModel {
  response: string;
  predictors: string[];
  fit: MultiRegFit;
  equation: string;
  unusual: FitRegUnusual[];
  /** Umbral de palanca con el que se marca la X. */
  leverageLimit: number;
  advice: FitRegAdvice;
  alpha: number;
  confLevel: number;
  n: number;
  nMissing: number;
}

export type ImpFitRegResult =
  | ({ ok: true; error?: undefined } & ImpFitRegModel)
  | { ok: false; error: string };
