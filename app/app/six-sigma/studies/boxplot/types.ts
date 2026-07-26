// app/app/six-sigma/studies/boxplot/types.ts

export type BoxplotYMode = "one" | "multiple";
export type BoxplotOrientation = "vertical" | "horizontal";

export interface BoxplotParams {
  yMode: BoxplotYMode;
  cols: string[];            // graph variables (numéricas)
  groups: boolean;           // Simple vs With Groups
  groupBy: string | null;    // columna categórica (solo si groups=true)
  orientation: BoxplotOrientation;
}

export const BOXPLOT_DEFAULT: BoxplotParams = {
  yMode: "one",
  cols: [],
  groups: false,
  groupBy: null,
  orientation: "vertical",
};

/** Una caja individual dentro de un panel. */
export interface BoxSeries {
  label: string;     // etiqueta en eje categórico
  values: number[];  // observaciones (Plotly calcula cuartiles/outliers)
}

export interface BoxPanel {
  title: string | null;   // título del panel (One Y Simple = por columna)
  boxes: BoxSeries[];
}

export interface BoxplotResult {
  panels: BoxPanel[];
  orientation: BoxplotOrientation;
  valueTitle: string;    // eje de valores
  catTitle: string;      // eje categórico ("Data" o nombre del grupo)
  title: string;
}
