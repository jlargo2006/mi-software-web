// app/app/six-sigma/studies/timeseries/types.ts

export type TSMode = "one" | "multiple";
export type TSTimeType = "datetime" | "date" | "time";

export interface TimeSeriesParams {
  yMode: TSMode;
  cols: string[];             // columnas Y numéricas
  groups: boolean;
  groupBy: string | null;     // columna categórica (With Groups)
  timeCol: string | null;     // columna de tiempo (vacío → Index)
  timeType: TSTimeType;       // interpretación del eje X si hay timeCol
  smoother: boolean;
  smoothDegree: number;       // Degree of smoothing (def. 0.5)
  smoothSteps: number;        // Number of steps (def. 2)
  xTickMode: "auto" | "fixed";   // ticks del eje X
  xTickCount: number;            // nº de ticks si fixed  
}

export const TIMESERIES_DEFAULT: TimeSeriesParams = {
  yMode: "one",
  cols: [],
  groups: false,
  groupBy: null,
  timeCol: null,
  timeType: "datetime",
  smoother: false,
  smoothDegree: 0.5,
  smoothSteps: 2,
  xTickMode: "auto",
  xTickCount: 10,  
};

export interface TSLine {
  name: string;          // etiqueta de la serie (leyenda)
  x: (number | string)[];
  y: number[];
  smoothX?: number[];    // línea Lowess (si aplica)
  smoothY?: number[];
}

export interface TimeSeriesResult {
  lines: TSLine[];
  hasSmoother: boolean;
  title: string;
  xTitle: string;
  yTitle: string;
  xIsCategoryTime: boolean; // true si el eje X usa valores de la columna tiempo
}
