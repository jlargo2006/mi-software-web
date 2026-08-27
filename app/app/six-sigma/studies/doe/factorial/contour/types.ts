// app/app/six-sigma/studies/doe/factorial/contour/types.ts

export const MAX_CONTOUR_FACTORS = 6;
export const MIN_CONTOUR_FACTORS = 2;
export const GRID_N = 81;

export interface DoeContourParams {
  response: string;
  /** Factores del modelo. Los dos de los ejes salen de aqui. */
  factors: string[];
  xFactor: string;
  yFactor: string;
  /** Valor al que se fija cada factor que no esta en los ejes. */
  holds: Record<string, number>;
  /** Claves de termino fuera del modelo. */
  excluded: string[];
  /** Contornos: automaticos o la banda de especificacion. */
  useSpec: boolean;
  specLow: number | null;
  specHigh: number | null;
  /** Relleno de color bajo los contornos. */
  filled: boolean;
}

export const DOECONTOUR_DEFAULT: DoeContourParams = {
  response: "",
  factors: [],
  xFactor: "",
  yFactor: "",
  holds: {},
  excluded: [],
  useSpec: false,
  specLow: null,
  specHigh: null,
  filled: true,
};

export interface ContourTerm {
  key: string;
  members: number[];
  order: number;
  coef: number;
  included: boolean;
}

export interface HoldInfo {
  factor: string;
  value: number;
  /** true si el valor cae fuera de los dos niveles: es extrapolacion. */
  outside: boolean;
}

export interface DoeContourModel {
  response: string;
  factors: string[];
  /** [bajo, alto] numericos de cada factor. */
  bounds: [number, number][];
  xFactor: string;
  yFactor: string;
  xIndex: number;
  yIndex: number;
  /** Ejes de la rejilla, en unidades naturales. */
  xGrid: number[];
  yGrid: number[];
  /** z[j][i]: prediccion en (xGrid[i], yGrid[j]). */
  z: number[][];
  /** Rango de la prediccion dentro del recuadro dibujado. */
  zRange: [number, number];
  terms: ContourTerm[];
  constant: number;
  holds: HoldInfo[];
  /** Contornos a trazar. */
  levels: number[];
  useSpec: boolean;
  specLow: number | null;
  specHigh: number | null;
  /** Niveles pedidos que la superficie no alcanza en este recuadro. */
  unreachable: number[];
  filled: boolean;
  /** Predicciones en las cuatro esquinas del recuadro y en su centro. */
  probes: { x: number; y: number; z: number; label: string }[];
  reduced: boolean;
  n: number;
  nMissing: number;
  centerMean: number | null;
  centerN: number;
}

export type DoeContourResult =
  | ({ ok: true; error?: undefined } & DoeContourModel)
  | { ok: false; error: string };
