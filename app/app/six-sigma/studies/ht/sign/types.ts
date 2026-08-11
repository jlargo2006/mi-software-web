// app/app/six-sigma/studies/ht/sign/types.ts

/** Hipotesis alternativa del contraste. */
export type SignAlternative = "two-sided" | "less" | "greater";

/** Simbolo de H\u2081 para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<SignAlternative, string> = {
  less: "<",
  "two-sided": "\u2260",
  greater: ">",
};

/** Texto largo para el desplegable de Controls. */
export const ALT_LABEL: Record<SignAlternative, string> = {
  less: "Median < hypothesized median",
  "two-sided": "Median \u2260 hypothesized median",
  greater: "Median > hypothesized median",
};

export type SignCIKind = "two" | "lower" | "upper";

export interface HTSignParams {
  column: string;
  /** Mediana hipotetica (eta_0). Cadena: admite coma decimal. */
  hypothesizedMedian: string;
  alternative: SignAlternative;
  /** Nivel de confianza en porcentaje. Cadena: admite coma decimal. */
  confidenceLevel: string;
  performTest: boolean;
  performCI: boolean;
  showHistogram: boolean;
  showIndividualValue: boolean;
  showBoxplot: boolean;
}

export const HTSIGN_DEFAULT: HTSignParams = {
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
export interface SignBox {
  q1: number;
  median: number;
  q3: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

/**
 * Una fila de la tabla de intervalo. Minitab muestra hasta tres: el interior
 * alcanzable, el interpolado al nivel pedido y el exterior alcanzable.
 */
export interface SignCIRow {
  low: number;
  high: number;
  /** Confianza en porcentaje. */
  conf: number;
  /** Posiciones del estadistico de orden, null en la fila interpolada. */
  posLow: number | null;
  posHigh: number | null;
  interpolated: boolean;
}

export interface SignModel {
  column: string;
  values: number[];
  nMissing: number;
  n: number;

  /** Recuentos respecto a eta_0. */
  nBelow: number;
  nEqual: number;
  nAbove: number;
  /** N for Test: nBelow + nAbove. */
  nTest: number;

  /** Mediana muestral: es la que muestra el informe del test del signo. */
  sampleMedian: number;

  eta0: number;
  alternative: SignAlternative;
  performTest: boolean;
  /** P-valor binomial exacto. */
  pValue: number;

  performCI: boolean;
  ciKind: SignCIKind;
  confLevel: number;
  rows: SignCIRow[];

  box: SignBox;
}

export type HTSignResult =
  | ({ ok: true; error?: undefined } & SignModel)
  | { ok: false; error: string };
