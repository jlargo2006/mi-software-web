// app/app/six-sigma/studies/ht/twoproportions/types.ts

export type TPAlternative = "two-sided" | "less" | "greater";

/** Simbolo de H\u2081 para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<TPAlternative, string> = {
  less: "<",
  "two-sided": "\u2260",
  greater: ">",
};

/** Texto largo para el desplegable de Controls. */
export const ALT_LABEL: Record<TPAlternative, string> = {
  less: "Difference < hypothesized difference",
  "two-sided": "Difference \u2260 hypothesized difference",
  greater: "Difference > hypothesized difference",
};

export type TPCIKind = "two" | "lower" | "upper";

export interface HTTwoProportionsParams {
  /** Eventos y ensayos de cada muestra. Cadenas: admiten coma decimal. */
  events1: string;
  trials1: string;
  events2: string;
  trials2: string;
  /** Etiquetas editables para las cabeceras del informe. */
  label1: string;
  label2: string;
  /** Diferencia hipotetica p1 - p2. */
  hypothesizedDifference: string;
  alternative: TPAlternative;
  /** Nivel de confianza en porcentaje. */
  confidenceLevel: string;
  /** Aplicar correccion de continuidad al test normal. */
  continuityCorrection: boolean;
  /** Mostrar la fila del test exacto de Fisher. */
  showFisher: boolean;
}

export const HTTWOPROPORTIONS_DEFAULT: HTTwoProportionsParams = {
  events1: "",
  trials1: "",
  events2: "",
  trials2: "",
  label1: "Sample 1",
  label2: "Sample 2",
  hypothesizedDifference: "0",
  alternative: "two-sided",
  confidenceLevel: "95",
  continuityCorrection: false,
  showFisher: true,
};

export interface TPModel {
  label1: string;
  label2: string;
  x1: number;
  n1: number;
  x2: number;
  n2: number;
  p1: number;
  p2: number;
  /** Diferencia observada p1 - p2. */
  difference: number;

  eta0: number;
  alternative: TPAlternative;
  confLevel: number;
  ciKind: TPCIKind;
  /** Intervalo por aproximacion normal con las proporciones separadas. */
  ciLow: number;
  ciHigh: number;

  /** Proporcion combinada, usada solo por el test. */
  pooledP: number;
  continuityCorrection: boolean;
  zValue: number;
  pNormal: number;

  showFisher: boolean;
  /** P-valor exacto de Fisher. NaN si no se pudo calcular. */
  pFisher: number;
  /** true si alguna celda esperada es menor que 5. */
  lowExpected: boolean;
  /**
   * true si eta0 != 0: el test normal usa entonces las proporciones
   * separadas y Fisher deja de ser aplicable.
   */
  shiftedNull: boolean;
}

export type HTTwoProportionsResult =
  | ({ ok: true; error?: undefined } & TPModel)
  | { ok: false; error: string };
