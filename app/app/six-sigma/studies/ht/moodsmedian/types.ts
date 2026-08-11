// app/app/six-sigma/studies/ht/moodsmedian/types.ts

export interface HTMoodsMedianParams {
  /** Columna numerica con la respuesta. */
  responseColumn: string;
  /** Columna con el factor de agrupacion. Puede ser texto. */
  factorColumn: string;
  /** Nivel de confianza en porcentaje. Cadena: admite coma decimal. */
  confidenceLevel: string;
  showBoxplot: boolean;
  showIndividualValue: boolean;
}

export const HTMOODSMEDIAN_DEFAULT: HTMoodsMedianParams = {
  responseColumn: "",
  factorColumn: "",
  confidenceLevel: "95",
  showBoxplot: false,
  showIndividualValue: false,
};

/** Cinco numeros del boxplot al estilo Minitab, mas atipicos. */
export interface MoodBox {
  q1: number;
  median: number;
  q3: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

/** Una fila de la tabla descriptiva: un nivel del factor. */
export interface MoodGroup {
  level: string;
  n: number;
  median: number;
  /** Observaciones <= mediana global. */
  nLE: number;
  /** Observaciones > mediana global. */
  nGT: number;
  q1: number;
  q3: number;
  /** Q3 - Q1. */
  iqr: number;
  /** Intervalo para la mediana del grupo. */
  ciLow: number;
  ciHigh: number;
  /** Valores ordenados del grupo, para los graficos. */
  values: number[];
  box: MoodBox;
}

export interface MoodModel {
  responseColumn: string;
  factorColumn: string;
  /** Filas descartadas: respuesta vacia o no numerica, o factor vacio. */
  nMissing: number;
  nTotal: number;
  /** Mediana de la muestra completa. */
  overallMedian: number;
  groups: MoodGroup[];
  confLevel: number;

  chiSquare: number;
  df: number;
  pValue: number;
  /** true si alguna frecuencia esperada es menor que 5. */
  lowExpected: boolean;
}

export type HTMoodsMedianResult =
  | ({ ok: true; error?: undefined } & MoodModel)
  | { ok: false; error: string };
