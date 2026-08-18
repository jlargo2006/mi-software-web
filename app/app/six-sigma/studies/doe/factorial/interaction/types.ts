// app/app/six-sigma/studies/doe/factorial/interaction/types.ts

export const MAX_FACTORS = 8;
export const MAX_LEVELS = 8;
/** Tope de paneles: por encima el grafico deja de leerse. */
export const MAX_PANELS = 64;

export interface DoeIntParams {
  response: string;
  factors: string[];
  /** Matriz completa k x k, o una sola fila con cada par una vez. */
  fullMatrix: boolean;
  /** Mismo eje vertical en todos los paneles. */
  sharedScale: boolean;
}

export const DOEINT_DEFAULT: DoeIntParams = {
  response: "",
  factors: [],
  fullMatrix: true,
  sharedScale: true,
};

export interface IntSeries {
  /** Nivel del factor de la fila. */
  label: string;
  /** Indice del nivel, fija el color. */
  levelIndex: number;
  /** Media de cada celda; null si esa combinacion no se ha corrido. */
  means: (number | null)[];
  ns: number[];
}

export interface IntPanel {
  row: number;
  col: number;
  rowFactor: string;
  colFactor: string;
  /** Celda de la diagonal: solo lleva el rotulo. */
  diagonal: boolean;
  /** Etiquetas del eje horizontal, los niveles del factor de la columna. */
  xLabels: string[];
  series: IntSeries[];
}

export interface PairSummary {
  a: string;
  b: string;
  /**
   * Efecto de interaccion: la mitad de la diferencia entre el efecto simple
   * de A con B alto y con B bajo. NaN si algun factor tiene mas de dos
   * niveles, donde ese numero no esta definido.
   */
  effect: number;
  /**
   * Desviacion maxima respecto al modelo aditivo. Vale para cualquier numero
   * de niveles y es cero exacto cuando las lineas son paralelas.
   */
  maxDeparture: number;
  /** Celdas de la tabla cruzada que no tienen ninguna corrida. */
  emptyCells: number;
}

export interface DoeIntModel {
  response: string;
  factors: string[];
  /** Niveles de cada factor, en el orden del eje. */
  levels: string[][];
  panels: IntPanel[];
  pairs: PairSummary[];
  grandMean: number;
  yRange: [number, number];
  fullMatrix: boolean;
  sharedScale: boolean;
  nRows: number;
  nCols: number;
  /** Mayor efecto principal, para poner las interacciones en contexto. */
  largestMain: number;
  largestMainName: string;
  n: number;
  nMissing: number;
}

export type DoeIntResult =
  | ({ ok: true; error?: undefined } & DoeIntModel)
  | { ok: false; error: string };
