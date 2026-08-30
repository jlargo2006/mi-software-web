// app/app/six-sigma/studies/capability/sixpack/types.ts

export interface CapSixpackParams {
  /** Columna de medidas individuales. */
  col: string | null;
  /** Tamano de subgrupo. 1 -> I-MR en lugar de Xbar-R. */
  subgroupSize: string;
  lsl: string;
  usl: string;
  target: string;
  /** Numero de subgrupos a mostrar en el panel inferior izquierdo. */
  lastN: string;
}

export const CAPSIXPACK_DEFAULT: CapSixpackParams = {
  col: null,
  subgroupSize: "6",
  lsl: "",
  usl: "",
  target: "",
  lastN: "20",
};

export interface SubgroupRow {
  /** Indice de subgrupo, empezando en 1. */
  index: number;
  /** Valores individuales del subgrupo. */
  values: number[];
  mean: number;
  /** Rango del subgrupo, si se usa grafico R. */
  range: number;
  /** Desviacion del subgrupo, si se usa grafico S. */
  sd: number;
}

export interface ProbPoint {
  /** Valor observado, ordenado. */
  x: number;
  /** Probabilidad de trazado (Benard). */
  p: number;
  /** Cuantil normal correspondiente. */
  z: number;
}

export interface CapSixpackModel {
  colName: string;
  n: number;
  subgroupSize: number;
  /** Numero de subgrupos completos. */
  k: number;
  /** Observaciones descartadas por no completar el ultimo subgrupo. */
  nDropped: number;
  nMissing: number;

  mean: number;
  lsl: number | null;
  usl: number | null;
  target: number | null;

  /**
   * Sigma de los GRAFICOS de control: Rbar/d2 o Sbar/c4.
   * NO es el mismo que stdWithin. Minitab usa este para los limites del
   * Xbar chart y el otro para los indices de capacidad.
   */
  sigmaChart: number;
  /** Sigma within de CAPACIDAD: pooled corregido por c4. */
  stdWithin: number;
  stdOverall: number;

  /** true si el grafico de dispersion es S; false si es R. */
  useSChart: boolean;
  /** true si subgrupo = 1: los graficos pasan a ser I y MR. */
  individuals: boolean;

  subgroups: SubgroupRow[];

  xbarCenter: number;
  xbarUcl: number;
  xbarLcl: number;
  /** Subgrupos cuya media sale de los limites. */
  xbarOut: number[];

  /** Etiqueta del grafico de dispersion: "R", "S" o "MR". */
  spreadLabel: string;
  spreadCenter: number;
  spreadUcl: number;
  spreadLcl: number;
  spreadOut: number[];

  probPoints: ProbPoint[];
  adStat: number;
  adPValue: number;

  /** Subgrupos mostrados en el panel de ultimos N. */
  lastSubgroups: SubgroupRow[];
  lastNShown: number;

  cp: number | null;
  cpk: number | null;
  pp: number | null;
  ppk: number | null;
  ppmWithin: number | null;
  ppmOverall: number | null;

  xRange: [number, number];
  allValues: number[];
}

export type CapSixpackResult =
  | ({ ok: true; error?: undefined } & CapSixpackModel)
  | { ok: false; error: string };
