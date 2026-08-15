// app/app/six-sigma/studies/improve/matrixplot/types.ts

export type MatrixKind = "matrix" | "eachYX";
export type SmootherKind = "none" | "lowess";

export const KIND_LABEL: Record<MatrixKind, string> = {
  matrix: "Matrix of plots",
  eachYX: "Each Y versus each X",
};

/** Tope de paneles: por encima el grafico deja de leerse y se atasca. */
export const MAX_PANELS = 100;

export interface ImpMatrixParams {
  kind: MatrixKind;
  /** Variables del modo matriz. */
  variables: string[];
  /** Modo "cada Y frente a cada X". */
  yVariables: string[];
  xVariables: string[];
  /** Columna de agrupacion. Vacio: sin grupos. */
  groupColumn: string;
  smoother: SmootherKind;
  /** Fraccion de suavizado, de 0 a 1. */
  smootherF: string;
  smootherSteps: string;
}

export const IMPMATRIX_DEFAULT: ImpMatrixParams = {
  kind: "matrix",
  variables: [],
  yVariables: [],
  xVariables: [],
  groupColumn: "",
  smoother: "none",
  smootherF: "0,5",
  smootherSteps: "2",
};

/** Una serie dentro de un panel: un grupo, o todos los puntos si no hay. */
export interface PanelSeries {
  label: string;
  x: number[];
  y: number[];
}

export interface Panel {
  row: number;
  col: number;
  xName: string;
  yName: string;
  /** Celda de la diagonal: solo lleva el rotulo, sin puntos. */
  diagonal: boolean;
  series: PanelSeries[];
  smooth: { x: number[]; y: number[] } | null;
  /** Correlacion de Pearson sobre los pares completos del panel. */
  r: number;
  n: number;
}

export interface ImpMatrixModel {
  kind: MatrixKind;
  rowVars: string[];
  colVars: string[];
  panels: Panel[];
  /** Rango con margen de cada variable, para alinear filas y columnas. */
  ranges: Record<string, [number, number]>;
  groupColumn: string | null;
  groupLabels: string[];
  smoother: SmootherKind;
  nRows: number;
  nCols: number;
  nUsed: number;
  nMissing: number;
}

export type ImpMatrixResult =
  | ({ ok: true; error?: undefined } & ImpMatrixModel)
  | { ok: false; error: string };
