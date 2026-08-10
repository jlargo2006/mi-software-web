// app/app/six-sigma/studies/ht/mannwhitney/types.ts

export type MWAlternative = "two-sided" | "less" | "greater";

/** Simbolo de H\u2081 para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<MWAlternative, string> = {
  less: "<",
  "two-sided": "\u2260",
  greater: ">",
};

/** Texto largo para el desplegable de Controls. */
export const ALT_LABEL: Record<MWAlternative, string> = {
  less: "Difference < hypothesized difference",
  "two-sided": "Difference \u2260 hypothesized difference",
  greater: "Difference > hypothesized difference",
};

export type MWCIKind = "two" | "lower" | "upper";

export interface HTMannWhitneyParams {
  columnX: string;
  columnY: string;
  /** Diferencia hipotetica de medianas. Cadena: admite coma decimal. */
  hypothesizedDifference: string;
  alternative: MWAlternative;
  /** Nivel de confianza en porcentaje. Cadena: admite coma decimal. */
  confidenceLevel: string;
  performTest: boolean;
  showHistogram: boolean;
  showIndividualValue: boolean;
  showBoxplot: boolean;
}

export const HTMANNWHITNEY_DEFAULT: HTMannWhitneyParams = {
  columnX: "",
  columnY: "",
  hypothesizedDifference: "0",
  alternative: "two-sided",
  confidenceLevel: "95",
  performTest: true,
  showHistogram: false,
  showIndividualValue: false,
  showBoxplot: false,
};

/** Cinco numeros del boxplot al estilo Minitab, mas atipicos. */
export interface MWBox {
  q1: number;
  median: number;
  q3: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

export interface MWModel {
  colX: string;
  colY: string;
  valuesX: number[];
  valuesY: number[];
  /** Celdas descartadas por vacias o no numericas, por columna. */
  nMissingX: number;
  nMissingY: number;
  n1: number;
  n2: number;

  medianX: number;
  medianY: number;

  /** Estimador de Hodges-Lehmann: mediana de las diferencias x_i - y_j. */
  hlDifference: number;

  eta0: number;
  alternative: MWAlternative;
  performTest: boolean;

  /** W: suma de rangos de la primera muestra en la muestra combinada. */
  wValue: number;
  /** z y p sin corregir empates: varianza n1*n2*(N+1)/12. */
  zNotAdj: number;
  pNotAdj: number;
  /** z y p con la varianza corregida por empates. */
  zAdj: number;
  pAdj: number;
  /** Suma de (t^3 - t) sobre los grupos empatados. Cero si no hay empates. */
  tieTerm: number;
  /** true si hubo empates: el informe muestra entonces las dos filas. */
  tiesCorrected: boolean;

  ciKind: MWCIKind;
  confLevel: number;
  /** Confianza realmente alcanzada: la distribucion es discreta. */
  achievedConf: number;
  ciLow: number;
  ciHigh: number;

  boxX: MWBox;
  boxY: MWBox;
}

export type HTMannWhitneyResult =
  | ({ ok: true; error?: undefined } & MWModel)
  | { ok: false; error: string };
