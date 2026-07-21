// studies/graphicalSummary/types.ts
export interface GraphicalSummaryParams {
  col: string | null;
  confidence: number; // en porcentaje, p.ej. 95.0
}

export const GRAPHICAL_SUMMARY_DEFAULT: GraphicalSummaryParams = {
  col: null,
  confidence: 95.0,
};

export interface GraphicalSummaryResult {
  colName: string;
  n: number;
  nMissing: number;
  // Anderson-Darling
  aSquared: number; // A²* ajustado
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
