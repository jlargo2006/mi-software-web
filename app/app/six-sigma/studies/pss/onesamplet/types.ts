// app/app/six-sigma/studies/pss/onesamplet/types.ts

export type Alternative = "two-sided" | "less" | "greater";
export type SolveFor = "size" | "difference" | "power";

export interface Pss1SampleTParams {
  /** Rango o lista: "10:40/5", "20", "10 20 30". Vacio = incognita. */
  sampleSizes: string;
  differences: string;
  powerValues: string;
  /** Desviacion tipica asumida. Obligatoria. */
  sd: string;
  alpha: number;
  alternative: Alternative;
}

export const PSS1SAMPLET_DEFAULT: Pss1SampleTParams = {
  sampleSizes: "",
  differences: "",
  powerValues: "",
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

export interface Pss1SampleTResult {
  ok: boolean;
  error?: string;

  solveFor: SolveFor;
  alpha: number;
  sd: number;
  alternative: Alternative;

  rows: PssRow[];
  curves: PssCurve[];
  /** Puntos de diseno a marcar sobre las curvas. */
  markers: { x: number; y: number }[];

  notes: string[];
}
