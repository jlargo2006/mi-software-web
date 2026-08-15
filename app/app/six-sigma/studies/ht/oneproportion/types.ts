// app/app/six-sigma/studies/ht/oneproportion/types.ts

export type OPAlternative = "two-sided" | "less" | "greater";

/** Simbolo de H\u2081 para cabeceras y leyendas. */
export const ALT_SYMBOL: Record<OPAlternative, string> = {
  less: "<",
  "two-sided": "\u2260",
  greater: ">",
};

/** Texto largo para el desplegable de Controls. */
export const ALT_LABEL: Record<OPAlternative, string> = {
  less: "Proportion < hypothesized proportion",
  "two-sided": "Proportion \u2260 hypothesized proportion",
  greater: "Proportion > hypothesized proportion",
};

export type OPMethod = "exact" | "normal";

export const METHOD_LABEL: Record<OPMethod, string> = {
  exact: "Exact",
  normal: "Normal approximation",
};

export type OPCIKind = "two" | "lower" | "upper";

export interface HTOneProportionParams {
  /** Eventos y ensayos. Cadenas: admiten coma decimal. */
  events: string;
  trials: string;
  /** Proporcion hipotetica p\u2080. */
  hypothesizedProportion: string;
  alternative: OPAlternative;
  /** Nivel de confianza en porcentaje. */
  confidenceLevel: string;
  /** Metodo exacto (binomial) o aproximacion normal. */
  method: OPMethod;
}

export const HTONEPROPORTION_DEFAULT: HTOneProportionParams = {
  events: "",
  trials: "",
  hypothesizedProportion: "0,5",
  alternative: "two-sided",
  confidenceLevel: "95",
  method: "exact",
};

export interface OPModel {
  x: number;
  n: number;
  /** Proporcion observada x/n. */
  p: number;

  p0: number;
  alternative: OPAlternative;
  confLevel: number;
  ciKind: OPCIKind;
  method: OPMethod;

  /** Clopper-Pearson si el metodo es exacto, Wald si es normal. */
  ciLow: number;
  ciHigh: number;

  pValue: number;
  /**
   * Estadistico Z. Solo con la aproximacion normal; NaN con el metodo
   * exacto, que no produce ninguno.
   */
  zValue: number;

  /** true si el metodo normal se usa con np\u2080 o n(1-p\u2080) menor que 5. */
  lowExpected: boolean;
}

export type HTOneProportionResult =
  | ({ ok: true; error?: undefined } & OPModel)
  | { ok: false; error: string };
