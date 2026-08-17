// app/app/six-sigma/studies/doe/factorial/analyze/types.ts
import type { AliasGroup, Term } from "../../../../lib/factorialmodel";
import type { MultiRegFit } from "../../../../lib/multiregression";

export const MAX_FACTORS = 8;
export type ResidualKind = "regular" | "standardized" | "deleted";

export const RESID_LABEL: Record<ResidualKind, string> = {
  regular: "Regular",
  standardized: "Standardized",
  deleted: "Deleted",
};

export interface DoeAnalyzeParams {
  response: string;
  factors: string[];
  /** Orden maximo de interaccion incluido en el modelo. */
  maxOrder: string;
  /** Terminos retirados por el usuario, por clave. */
  excluded: string[];
  alpha: string;
  residualKind: ResidualKind;
  showPareto: boolean;
  showNormal: boolean;
  showResiduals: boolean;
  showMainEffects: boolean;
  showInteraction: boolean;
}

export const DOEANALYZE_DEFAULT: DoeAnalyzeParams = {
  response: "",
  factors: [],
  maxOrder: "3",
  excluded: [],
  alpha: "0,05",
  residualKind: "standardized",
  showPareto: true,
  showNormal: true,
  showResiduals: true,
  showMainEffects: false,
  showInteraction: false,
};

export interface TermRow {
  term: Term;
  /** 2 x coeficiente: la diferencia entre el nivel alto y el bajo. */
  effect: number;
  coef: number;
  se: number;
  t: number;
  p: number;
  vif: number;
  adjSS: number;
  adjMS: number;
  fValue: number;
  fP: number;
  significant: boolean;
}

export interface AnovaGroup {
  label: string;
  df: number;
  ss: number;
  ms: number;
  f: number;
  p: number;
  /** Filas de los terminos que agrupa. */
  members: TermRow[];
}

export interface UncodedTerm {
  label: string;
  value: number;
}

export interface UnusualRow {
  obs: number;
  y: number;
  fit: number;
  resid: number;
  stdResid: number;
  largeResid: boolean;
  unusualX: boolean;
}

export type AdviceKind = "remove" | "final" | "lenth" | "hierarchy";

export interface Advice {
  kind: AdviceKind;
  term: string | null;
  headline: string;
  detail: string;
  /** Terminos que quedarian tras aplicar el consejo. */
  nextTerms: string[];
}

/** Un punto de un grafico de efectos o de medias. */
export interface MeanPoint {
  label: string;
  mean: number;
}

export interface EffectsPlotRow {
  label: string;
  /** Efecto tipificado: |T| en el Pareto, con signo en el normal. */
  std: number;
  signed: number
  significant: boolean;
}

export interface DoeAnalyzeModel {
  response: string;
  factors: string[];
  /** Letras del diseno por factor. */
  letters: string[];
  fit: MultiRegFit;
  rows: TermRow[];
  groups: AnovaGroup[];
  modelDF: number;
  modelSS: number;
  modelMS: number;
  modelF: number;
  modelP: number;

  uncoded: UncodedTerm[];
  unusual: UnusualRow[];
  leverageLimit: number;
  aliases: AliasGroup[];
  aliasClean: boolean;

  /** Metodo de Lenth: solo cuando no quedan grados de libertad. */
  usedLenth: boolean;
  pse: number;
  lenthDF: number;
  lenthMargin: number;
  /** Umbral del Pareto: valor critico de la t. */
  paretoLimit: number;

  effectsPlot: EffectsPlotRow[];
  /** Medias ajustadas por nivel, un bloque por factor. */
  mainEffects: { factor: string; points: MeanPoint[] }[];
  /** Medias ajustadas cruzadas, un bloque por par de factores. */
  interactions: {
    rowFactor: string;
    colFactor: string;
    xLabels: string[];
    series: { label: string; means: number[] }[];
  }[];

  advice: Advice;
  alpha: number;
  grandMean: number;
  n: number;
  nMissing: number;
  residualKind: ResidualKind;
}

export type DoeAnalyzeResult =
  | ({ ok: true; error?: undefined } & DoeAnalyzeModel)
  | { ok: false; error: string };
