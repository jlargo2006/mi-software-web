// app/app/six-sigma/studies/improve/correlation/types.ts

export type CorrType = "pearson" | "spearman";

export const CORR_LABEL: Record<CorrType, string> = {
  pearson: "Pearson",
  spearman: "Spearman rho",
};

export type CorrAlternative = "two-sided" | "less" | "greater";

export const CORR_ALT_LABEL: Record<CorrAlternative, string> = {
  less: "Correlation < 0",
  "two-sided": "Correlation \u2260 0",
  greater: "Correlation > 0",
};

export interface ImpCorrParams {
  /** Columnas a correlacionar, en orden. Minimo dos. */
  columns: string[];
  corrType: CorrType;
  alternative: CorrAlternative;
  confidenceLevel: string;
  showPValues: boolean;
  showCI: boolean;
  /** Grafico de dispersion con el resultado superpuesto. */
  showMatrixPlot: boolean;
}

export const IMPCORR_DEFAULT: ImpCorrParams = {
  columns: [],
  corrType: "pearson",
  alternative: "two-sided",
  confidenceLevel: "95",
  showPValues: true,
  showCI: true,
  showMatrixPlot: true,
};

export type CorrCIKind = "two" | "lower" | "upper";

export interface CorrPair {
  /** Indices en el array de columnas. i > j siempre: triangulo inferior. */
  i: number;
  j: number;
  labelI: string;
  labelJ: string;
  /** Observaciones completas de este par. */
  n: number;
  r: number;
  ciLow: number;
  ciHigh: number;
  pValue: number;
  /** Datos emparejados, para el grafico. */
  x: number[];
  y: number[];
}

export interface ImpCorrModel {
  labels: string[];
  corrType: CorrType;
  alternative: CorrAlternative;
  confLevel: number;
  ciKind: CorrCIKind;
  pairs: CorrPair[];
  /** Filas sin ningun valor ausente en las columnas seleccionadas. */
  nCompleteRows: number;
  /** true si algun par usa menos filas que otro: borrado por parejas. */
  unequalN: boolean;
}

export type ImpCorrResult =
  | ({ ok: true; error?: undefined } & ImpCorrModel)
  | { ok: false; error: string };
