// app/app/six-sigma/studies/multivari/types.ts

export interface MultiVariParams {
  /** Factor X: el mas interno, va en el eje horizontal. */
  factor1: string | null;
  /** Factor de serie: define color y linea que une medias. */
  factor2: string | null;
  /** Factor de panel (columnas). */
  factor3: string | null;
  /** Factor de panel (filas). Opcional. */
  factor4: string | null;
  /** Columna de respuesta numerica. */
  responseCol: string | null;

  showPoints: boolean;
  connectMeans: boolean;
  showGrandMean: boolean;
}

export const MULTIVARI_DEFAULT: MultiVariParams = {
  factor1: null,
  factor2: null,
  factor3: null,
  factor4: null,
  responseCol: null,
  showPoints: true,
  connectMeans: true,
  showGrandMean: false,
};

/** Una observacion individual ya clasificada. */
export interface MVPoint {
  row: string; // nivel de factor4 ("" si no hay)
  panel: string; // nivel de factor3 ("" si no hay)
  series: string; // nivel de factor2 ("" si no hay)
  x: string; // nivel de factor1
  value: number;
}

/** Media de una celda (row x panel x series x x). */
export interface MVMean {
  row: string;
  panel: string;
  series: string;
  x: string;
  mean: number;
  n: number;
}

/** Resumen por nivel de un factor, para la tabla lateral. */
export interface MVFactorSummary {
  factor: string;
  levels: { label: string; n: number; mean: number; sd: number | null }[];
}

export interface MultiVariResult {
  ok: boolean;
  error?: string;

  labels: {
    x: string;
    series: string | null;
    panel: string | null;
    row: string | null;
    response: string;
  };

  xLevels: string[];
  seriesLevels: string[];
  panelLevels: string[];
  rowLevels: string[];

  points: MVPoint[];
  means: MVMean[];

  grandMean: number;
  yRange: [number, number];

  n: number;
  missing: number;
  unbalanced: boolean;

  summaries: MVFactorSummary[];
  notes: string[];
}
