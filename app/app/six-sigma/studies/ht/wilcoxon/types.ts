// app/app/six-sigma/studies/ht/wilcoxon/types.ts

/** Hipotesis alternativa del contraste. */
export type WilcoxonAlternative = "two-sided" | "less" | "greater";

/** Simbolo de H\u2081 para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<WilcoxonAlternative, string> = {
  less: "<",
  "two-sided": "\u2260",
  greater: ">",
};

/** Texto largo para el desplegable de Controls. */
export const ALT_LABEL: Record<WilcoxonAlternative, string> = {
  less: "Median < hypothesized median",
  "two-sided": "Median \u2260 hypothesized median",
  greater: "Median > hypothesized median",
};

/** Tipo de intervalo derivado de la alternativa. */
export type WilcoxonCIKind = "two" | "lower" | "upper";

export interface HTWilcoxonParams {
  /** Columna analizada. */
  column: string;
  /** Mediana hipotetica (eta_0). Cadena: admite coma decimal. */
  hypothesizedMedian: string;
  alternative: WilcoxonAlternative;
  /** Nivel de confianza en porcentaje. Cadena: admite coma decimal. */
  confidenceLevel: string;
  performTest: boolean;
  /** Calcular ademas el intervalo de confianza para la mediana. */
  performCI: boolean;
  showHistogram: boolean;
  showIndividualValue: boolean;
  showBoxplot: boolean;
}

export const HTWILCOXON_DEFAULT: HTWilcoxonParams = {
  column: "",
  hypothesizedMedian: "0",
  alternative: "two-sided",
  confidenceLevel: "95",
  performTest: true,
  performCI: false,
  showHistogram: false,
  showIndividualValue: false,
  showBoxplot: false,
};

/** Cinco numeros del boxplot al estilo Minitab, mas atipicos. */
export interface WilcoxonBox {
  q1: number;
  median: number;
  q3: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

export interface WilcoxonModel {
  column: string;
  /** Observaciones validas usadas. */
  values: number[];
  /** Celdas descartadas por vacias o no numericas. */
  nMissing: number;
  /** N total valido (antes de descartar empates con eta_0). */
  n: number;
  /** N for Test: n menos las observaciones iguales a eta_0. */
  nTest: number;
  /** Observaciones iguales a eta_0, excluidas del contraste. */
  nZeros: number;

  /** Mediana muestral clasica. No es la que muestra Minitab. */
  sampleMedian: number;
  /** Estimador de Hodges-Lehmann: mediana de los promedios de Walsh. */
  hodgesLehmann: number;

  eta0: number;
  alternative: WilcoxonAlternative;
  performTest: boolean;

  /** Estadistico W+ : suma de rangos de las diferencias positivas. */
  wStatistic: number;
  zValue: number;
  pValue: number;
  /** true si hubo empates en |d| y se aplico correccion de varianza. */
  tiesCorrected: boolean;

  performCI: boolean;
  ciKind: WilcoxonCIKind;
  confLevel: number;
  /** Confianza realmente alcanzada: la distribucion es discreta. */
  achievedConf: number;
  ciLow: number;
  ciHigh: number;

  box: WilcoxonBox;
}

export type HTWilcoxonResult =
  | ({ ok: true; error?: undefined } & WilcoxonModel)
  | { ok: false; error: string };
