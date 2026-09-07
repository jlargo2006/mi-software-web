// app/app/six-sigma/studies/ht/moodsmedian/types.ts

/**
 * Disposicion de los datos:
 *   "stacked"   -> una columna de respuesta + una de factor (lo de siempre)
 *   "unstacked" -> una columna por muestra, sin columna de factor
 */
export type MoodDataFormat = "stacked" | "unstacked";

export interface HTMoodsMedianParams {
  format: MoodDataFormat;
  /** Columna numerica con la respuesta. Solo en formato stacked. */
  responseColumn: string;
  /** Columna con el factor de agrupacion. Puede ser texto. Solo stacked. */
  factorColumn: string;
  /**
   * Una columna por muestra. Solo en formato unstacked. El nombre de cada
   * columna hace de nivel; las columnas pueden tener distinta longitud.
   */
  sampleColumns: string[];
  /** Nivel de confianza en porcentaje. Cadena: admite coma decimal. */
  confidenceLevel: string;
  showBoxplot: boolean;
  showIndividualValue: boolean;
}

export const HTMOODSMEDIAN_DEFAULT: HTMoodsMedianParams = {
  format: "stacked",
  responseColumn: "",
  factorColumn: "",
  // Dos huecos vacios de partida: es el minimo del test y evita que el
  // usuario tenga que pulsar "Add sample" antes de poder elegir nada.
  sampleColumns: ["", ""],
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
