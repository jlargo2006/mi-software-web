// app/app/six-sigma/studies/dotplot/types.ts

export type DotplotYMode = "one" | "multiple";
export type DotplotArrangement = "simple" | "stack" | "withGroups" | "stackGroups";

export interface DotplotParams {
  yMode: DotplotYMode;
  cols: string[];              // One Y usa cols[0]; Multiple usa todas
  groupBy: string | null;      // columna categórica (With/Stack Groups)
  arrangement: DotplotArrangement;
  binMode: "nice" | "fixed";
  nBins: number;
}

export const DOTPLOT_DEFAULT: DotplotParams = {
  yMode: "one",
  cols: [],
  groupBy: null,
  arrangement: "simple",
  binMode: "nice",
  nBins: 10,
};

export interface DotPoint {
  x: number;      // centro del bin
  y: number;      // altura de apilado (1,2,3…)
  series: string; // nombre de serie (para color/leyenda)
}

export interface DotPanel {
  label: string;      // etiqueta de fila (grupo, Y, o Y×grupo)
  points: DotPoint[];
  maxStack: number;
}

export interface DotplotResult {
  panels: DotPanel[];
  seriesNames: string[];   // series distintas (para leyenda/colores)
  xStart: number;
  xEnd: number;
  title: string;
  xTitle: string;
  showLegend: boolean;
}
