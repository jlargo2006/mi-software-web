// app/app/six-sigma/studies/ht/chisqassociation/types.ts

/**
 * summarized: cada columna seleccionada es una columna de la tabla de
 * contingencia, y cada fila de la hoja una fila.
 * raw: dos columnas categoricas, una por dimension, con una fila por
 * observacion.
 */
export type CSDataMode = "summarized" | "raw";

export const MODE_LABEL: Record<CSDataMode, string> = {
  summarized: "Summarized data in a two-way table",
  raw: "Raw data (categorical variables)",
};

export interface HTChiSqAssocParams {
  mode: CSDataMode;
  /** Modo summarized: columnas que forman la tabla, en orden. */
  tableColumns: string[];
  /** Modo summarized: columna opcional con las etiquetas de fila. */
  rowLabelColumn: string;
  /** Modo raw: columna que define las filas. */
  rowFactorColumn: string;
  /** Modo raw: columna que define las columnas. */
  colFactorColumn: string;
  /** Titulos de las dos dimensiones para el encabezado del informe. */
  rowTitle: string;
  colTitle: string;

  showExpected: boolean;
  showResiduals: boolean;
  showStdResiduals: boolean;
  showContribution: boolean;
}

export const HTCHISQASSOC_DEFAULT: HTChiSqAssocParams = {
  mode: "summarized",
  tableColumns: [],
  rowLabelColumn: "",
  rowFactorColumn: "",
  colFactorColumn: "",
  rowTitle: "Worksheet rows",
  colTitle: "Worksheet columns",
  showExpected: true,
  showResiduals: false,
  showStdResiduals: false,
  showContribution: false,
};

export interface CSCell {
  observed: number;
  expected: number;
  /** Residuo bruto O - E. */
  residual: number;
  /** Residuo estandarizado (O - E) / sqrt(E). */
  stdResidual: number;
  /** Aportacion de la celda al estadistico de Pearson. */
  contribution: number;
}

export interface CSModel {
  rowTitle: string;
  colTitle: string;
  rowLabels: string[];
  colLabels: string[];
  cells: CSCell[][];
  rowTotals: number[];
  colTotals: number[];
  total: number;

  df: number;
  chiSqPearson: number;
  pPearson: number;
  chiSqLR: number;
  pLR: number;

  /** Numero de celdas con frecuencia esperada menor que 5. */
  nLowExpected: number;
  /** Menor frecuencia esperada de la tabla. */
  minExpected: number;
  /** true si alguna celda observada es cero: el cociente de LR se omite. */
  hasZeroCell: boolean;
  /** Filas o columnas descartadas por sumar cero. */
  droppedRows: number;
  droppedCols: number;
  /** Modo raw: filas descartadas por tener alguna categoria vacia. */
  nMissing: number;
}

export type HTChiSqAssocResult =
  | ({ ok: true; error?: undefined } & CSModel)
  | { ok: false; error: string };
