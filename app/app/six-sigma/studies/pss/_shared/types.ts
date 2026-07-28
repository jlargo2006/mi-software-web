// app/app/six-sigma/studies/pss/_shared/types.ts

export type Alternative = "two-sided" | "less" | "greater";
export type SolveFor = "size" | "difference" | "power";

/** Campos comunes a todos los estudios de Power and Sample Size. */
export interface PssBaseParams {
  /** Rango o lista: "10:40/5", "20", "10 20 30". Vacio = incognita. */
  sampleSizes: string;
  differences: string;
  powerValues: string;
  sd: string;
  alpha: number;
  alternative: Alternative;
}

export const PSS_BASE_DEFAULT: PssBaseParams = {
  sampleSizes: "",
  differences: "",
  powerValues: "0.9",
  sd: "1",
  alpha: 0.05,
  alternative: "two-sided",
};

export interface PssRow {
  n: number;
  difference: number;
  /** Potencia objetivo; solo presente al resolver el tamano muestral. */
  targetPower: number | null;
  /** Potencia real alcanzada. */
  power: number;
}

export interface PssCurve {
  n: number;
  x: number[];
  y: number[];
}

/** Nucleo del resultado, identico en todos los estudios PSS. */
export interface PssCore {
  solveFor: SolveFor;
  alpha: number;
  sd: number;
  alternative: Alternative;
  rows: PssRow[];
  curves: PssCurve[];
  markers: { x: number; y: number }[];
  notes: string[];
}

export interface PssBaseResult extends PssCore {
  ok: boolean;
  error?: string;
}

export const ALT_TEXT: Record<Alternative, string> = {
  "two-sided": "≠ null",
  less: "< null",
  greater: "> null",
};

/** Etiqueta larga para el desplegable y las cabeceras. */
export const ALT_LABEL: Record<Alternative, string> = {
  less: "Less than",
  "two-sided": "Not equal",
  greater: "Greater than",
};
