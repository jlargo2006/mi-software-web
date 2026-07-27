// app/app/six-sigma/studies/multivari/types.ts

export interface MultiVariParams {
  /** Factor mas interno: define las posiciones del eje X. */
  factor1: string | null;
  /** Segundo nivel (agrupa a factor1). */
  factor2: string | null;
  /** Tercer nivel (agrupa a factor2). */
  factor3: string | null;
  /** Cuarto nivel, el mas externo. Opcional. */
  factor4: string | null;
  /** Columna de respuesta numerica. */
  responseCol: string | null;

  showPoints: boolean;
  showGrandMean: boolean;
  /** Ordenar niveles alfabeticamente en lugar de por orden de aparicion. */
  sortLevels: boolean;
}

export const MULTIVARI_DEFAULT: MultiVariParams = {
  factor1: null,
  factor2: null,
  factor3: null,
  factor4: null,
  responseCol: null,
  showPoints: true,
  showGrandMean: false,
  sortLevels: false,
};

/** Observacion individual situada en el eje X. */
export interface MVPoint {
  path: string[];
  x: number;
  value: number;
}

/**
 * Media de un grupo en un nivel de la jerarquia.
 * depth 0 = nivel mas externo; depth L-1 = celda hoja.
 */
export interface MVGroupMean {
  depth: number;
  path: string[];
  /** Clave del grupo padre; "" en el nivel mas externo. */
  parent: string;
  /** Centro del grupo en el eje X. */
  x: number;
  mean: number;
  n: number;
}

/** Etiqueta bajo el eje para un grupo de nivel intermedio. */
export interface MVAxisLabel {
  depth: number;
  text: string;
  x: number;
}

export interface MVFactorSummary {
  factor: string;
  levels: { label: string; n: number; mean: number; sd: number | null }[];
}

export interface MultiVariResult {
  ok: boolean;
  error?: string;

  /** Nombres de factor, de mas externo a mas interno. */
  factorNames: string[];
  responseName: string;

  points: MVPoint[];
  /** Medias de todos los niveles, ordenadas por depth ascendente. */
  groupMeans: MVGroupMean[];

  /** Ticks del eje X: posicion y etiqueta del factor mas interno. */
  tickVals: number[];
  tickText: string[];
  /** Etiquetas de los niveles superiores, en filas bajo el eje. */
  axisLabels: MVAxisLabel[];
  /** Posiciones X de las lineas verticales separadoras del nivel externo. */
  separators: number[];

  xRange: [number, number];
  yRange: [number, number];
  yRangeMeans: [number, number];
  grandMean: number;

  n: number;
  missing: number;
  unbalanced: boolean;

  summaries: MVFactorSummary[];
  notes: string[];
}
