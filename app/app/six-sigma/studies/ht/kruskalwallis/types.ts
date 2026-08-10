// app/app/six-sigma/studies/ht/kruskalwallis/types.ts

export interface HTKruskalWallisParams {
  /** Columna numerica con la respuesta. */
  responseColumn: string;
  /** Columna con el factor de agrupacion. Puede ser texto. */
  factorColumn: string;
  showBoxplot: boolean;
  showIndividualValue: boolean;
}

export const HTKRUSKALWALLIS_DEFAULT: HTKruskalWallisParams = {
  responseColumn: "",
  factorColumn: "",
  showBoxplot: false,
  showIndividualValue: false,
};

/** Cinco numeros del boxplot al estilo Minitab, mas atipicos. */
export interface KWBox {
  q1: number;
  median: number;
  q3: number;
  lowerFence: number;
  upperFence: number;
  outliers: number[];
}

/** Una fila de la tabla descriptiva: un nivel del factor. */
export interface KWGroup {
  level: string;
  n: number;
  median: number;
  /** Rango medio del grupo sobre la muestra combinada. */
  meanRank: number;
  /** Desviacion estandarizada del rango medio respecto al global. */
  zValue: number;
  /** Valores ordenados del grupo, para los graficos. */
  values: number[];
  box: KWBox;
}

export interface KWModel {
  responseColumn: string;
  factorColumn: string;
  /** Filas descartadas: respuesta vacia o no numerica, o factor vacio. */
  nMissing: number;
  nTotal: number;
  /** Rango medio global: (N+1)/2. */
  overallMeanRank: number;
  groups: KWGroup[];

  df: number;
  /** H sin corregir empates. */
  hNotAdj: number;
  pNotAdj: number;
  /** H con la correccion por empates. */
  hAdj: number;
  pAdj: number;
  /** Suma de (t^3 - t) sobre los grupos empatados. Cero si no hay empates. */
  tieTerm: number;
  /** true si hubo empates: el informe muestra entonces las dos filas. */
  tiesCorrected: boolean;
  /** true si algun grupo tiene menos de 5 observaciones. */
  smallGroups: boolean;
}

export type HTKruskalWallisResult =
  | ({ ok: true; error?: undefined } & KWModel)
  | { ok: false; error: string };
