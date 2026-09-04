// studies/graphicalSummary/types.ts
export interface GraphicalSummaryParams {
  col: string | null;
  /** By variable (opcional): un panel por nivel, como Minitab. */
  byCol: string | null;
  confidence: number; // en porcentaje, p.ej. 95.0
}

export const GRAPHICAL_SUMMARY_DEFAULT: GraphicalSummaryParams = {
  col: null,
  byCol: null,
  confidence: 95.0,
};

/** Resultado de UN panel: una columna, o un nivel de la By variable. */
export interface GraphicalSummaryPanel {
  colName: string;
  /** Nivel de la By variable, o null si no hay By variable. */
  level: string | null;
  /**
   * Los valores numericos de ESTE panel. Antes Results releia data[col], lo
   * que con By variable pintaria los 53 datos en los tres paneles.
   */
  values: number[];
  n: number;
  nMissing: number;
  // Anderson-Darling
  /** A² crudo, el que se muestra. */
  aSquared: number;
  /** A² corregido. Solo para el p-valor; no se muestra. */
  aStar: number;
  pValue: number;
  // descriptivos
  mean: number;
  stDev: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  // intervalos de confianza
  confidence: number; // % efectivo usado
  ciMean: [number, number];
  ciMedian: [number, number];
  ciStDev: [number, number];
}

export interface GraphicalSummaryResult {
  /** Nombre de la By variable, o null. Gobierna los encabezados. */
  byName: string | null;
  panels: GraphicalSummaryPanel[];
}
