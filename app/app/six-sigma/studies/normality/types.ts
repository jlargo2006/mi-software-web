// studies/normality/types.ts
export interface NormalityParams {
  col: string | null; // columna numérica a analizar
}

export const NORMALITY_DEFAULT: NormalityParams = {
  col: null,
};

export interface NormalityResult {
  colName: string;
  n: number;
  mean: number;
  std: number;
  adStatistic: number;
  pValue: number;
  isNormal: boolean;

  // Datos ya calculados para el probability plot (compute puro; Results solo dibuja)
  pointsX: number[];
  pointsY: number[];
  lineX: [number, number];
  lineY: [number, number];
  tickVals: number[];
  tickText: string[];
  xRange: [number, number];
}
