// app/app/six-sigma/studies/pss/factorial/types.ts

/** Que incognita se despeja. Se derivan las otras dos de las tres dadas. */
export type FactSolveFor = "reps" | "effect" | "power";

export const SOLVE_LABEL: Record<FactSolveFor, string> = {
  reps: "Replicates",
  effect: "Effects",
  power: "Power values",
};

export interface PssFactParams {
  numFactors: string;
  /** Corridas del diseno base: 4, 8, 16, 32... */
  cornerPoints: string;
  centerPoints: string;
  /** "none" o una potencia de dos. */
  blocks: string;
  /** Terminos que NO se ajustan; devuelven grados de libertad al error. */
  termsOmitted: string;

  solveFor: FactSolveFor;
  /** Listas separadas por espacios o comas. La incognita se deja vacia. */
  replicates: string;
  effects: string;
  powerValues: string;

  sd: string;
  alpha: string;
  showCurve: boolean;
}

export const PSSFACT_DEFAULT: PssFactParams = {
  numFactors: "3",
  cornerPoints: "8",
  centerPoints: "0",
  blocks: "none",
  termsOmitted: "0",
  solveFor: "reps",
  replicates: "",
  effects: "2",
  powerValues: "0,9",
  sd: "1",
  alpha: "0,05",
  showCurve: true,
};

export interface PssFactRow {
  centerPoints: number;
  effect: number;
  reps: number;
  totalRuns: number;
  /** Solo cuando se despejan las replicas. */
  targetPower: number;
  actualPower: number;
  df: number;
  /** Corridas en las esquinas: las unicas que estiman efectos. */
  cornerRuns: number;
  /** Aviso si el diseno se queda sin grados de libertad. */
  saturated: boolean;
}

export interface CurvePoint {
  effect: number;
  power: number;
}

export interface PssFactModel {
  numFactors: number;
  cornerPoints: number;
  blocksLabel: string;
  blocks: number;
  termsOmitted: number;
  sd: number;
  alpha: number;
  solveFor: FactSolveFor;
  rows: PssFactRow[];
  /** Una curva por combinacion de replicas y puntos centrales. */
  curves: { label: string; reps: number; cp: number; points: CurvePoint[] }[];
  /** Puntos a resaltar sobre las curvas. */
  markers: { effect: number; power: number }[];
  showCurve: boolean;
}

export type PssFactResult =
  | ({ ok: true; error?: undefined } & PssFactModel)
  | { ok: false; error: string };
