// app/app/six-sigma/studies/control/xbars/types.ts

/** Como estan dispuestos los datos en la hoja. */
export type Layout = "columns" | "single";

/** Como se estima sigma dentro de los subgrupos. */
export type SigmaMethod = "sbar" | "pooled";

export type TestMode = "all" | "one" | "custom";

export interface XbarSParams {
  layout: Layout;

  /** layout "columns": una columna por posicion del subgrupo. */
  cols: (string | null)[];

  /** layout "single": todas las observaciones en una columna. */
  col: string | null;
  /** layout "single": tamano constante de subgrupo. */
  size: string;
  /** layout "single": columna de etiquetas de subgrupo, alternativa al tamano. */
  groupCol: string | null;
  /** true para agrupar por la columna de etiquetas en vez de por tamano. */
  useGroupCol: boolean;

  /** Parameters: media y sigma historicas, si se conocen. */
  histMean: string;
  histSigma: string;

  /** Estimate. */
  method: SigmaMethod;
  /** Aplicar la constante de correccion del sesgo. */
  unbias: boolean;
  omit: string;

  /** Limits. */
  lowerBound: string;
  upperBound: string;

  /** Tests. */
  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;
}

export const XBARS_DEFAULT: XbarSParams = {
  layout: "columns",
  cols: [],
  col: null,
  size: "5",
  groupCol: null,
  useGroupCol: false,
  histMean: "",
  histSigma: "",
  method: "sbar",
  unbias: true,
  omit: "",
  lowerBound: "",
  upperBound: "",
  testMode: "one",
  testsOn: [true, false, false, false, false, false, false, false],
  testK: ["3", "9", "6", "14", "2", "4", "15", "8"],
  stageCol: null,
};

export interface Violation {
  test: number;
  description: string;
  points: number[];
}

export interface Stage {
  label: string;
  from: number;
  to: number;
  /** Gran media de la etapa. */
  xBar: number;
  /** Media de las desviaciones de los subgrupos. */
  sBar: number;
  /** Sigma dentro de subgrupo estimada. */
  sigma: number;
  kUsed: number;
}

export interface XbarSModel {
  title: string;
  k: number;
  /** Tamano comun, null si varian. */
  commonN: number | null;
  minN: number;
  maxN: number;

  /** Tamano de cada subgrupo. */
  n: number[];
  /** Media de cada subgrupo. */
  mean: number[];
  /** Desviacion tipica muestral de cada subgrupo, con n-1. */
  sd: number[];

  xCl: number[];
  xUcl: number[];
  xLcl: number[];
  sCl: number[];
  sUcl: number[];
  sLcl: number[];

  stages: Stage[];
  stageOf: number[];

  xViolations: Violation[];
  sViolations: Violation[];
  xFlagged: number[];
  sFlagged: number[];

  method: SigmaMethod;
  unbias: boolean;
  usedHistMean: boolean;
  usedHistSigma: boolean;
  omitted: number[];
  notes: string[];
}

export type XbarSResult =
  | ({ ok: true; error?: undefined } & XbarSModel)
  | { ok: false; error: string };
