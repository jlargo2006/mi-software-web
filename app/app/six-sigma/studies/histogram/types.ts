// app/app/six-sigma/studies/histogram/types.ts

export interface HistogramParams {
  cols: string[];       // columnas añadidas (sin límite)
  fit: boolean;         // superponer curva normal
  groups: boolean;      // true = todas en un panel; false = un panel por columna
  binMode: "nice" | "fixed";
  nBins: number;        // usado solo si binMode === "fixed"
}

export const HISTOGRAM_DEFAULT: HistogramParams = {
  cols: [],
  fit: false,
  groups: false,
  binMode: "nice",
  nBins: 10,
};

export interface HistogramSeries {
  name: string;          // nombre de columna
  values: number[];      // datos limpios (numéricos, finitos)
  n: number;
  mean: number;
  stDev: number;
  bins: { start: number; end: number; size: number };
  // curva normal (si fit); vacías si no aplica
  curveX: number[];
  curveY: number[];
}

export interface HistogramResult {
  series: HistogramSeries[];
  groups: boolean;
  fit: boolean;
}
