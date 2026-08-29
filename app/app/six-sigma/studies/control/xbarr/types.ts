// app/app/six-sigma/studies/control/xbarr/types.ts

/** Como estan dispuestos los subgrupos en la hoja. */
export type Layout = "rows" | "column";

/** Metodo de estimacion de sigma con subgrupos de tamano mayor que uno. */
export type SigmaMethod = "rbar" | "pooled";

export type TestMode = "all" | "one" | "custom";
export type BoxCoxMode = "none" | "ln" | "sqrt" | "optimal" | "other";

export interface XbarRParams {
  layout: Layout;
  /** layout "rows": una columna por posicion dentro del subgrupo. */
  cols: string[];
  /** layout "column": todas las observaciones en una columna. */
  col: string | null;
  /** layout "column": tamano de subgrupo, o columna identificadora. */
  sizeMode: "number" | "id";
  size: string;
  idCol: string | null;

  histMean: string;
  histSigma: string;

  sigmaMethod: SigmaMethod;
  /** Solo aplica a la desviacion combinada; con Rbar el propio d2 ya corrige. */
  unbias: boolean;
  omit: string;

  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;

  boxcox: BoxCoxMode;
  boxcoxLambda: string;

  xLowerBound: string;
  xUpperBound: string;
  rUpperBound: string;
}

export const XBARR_DEFAULT: XbarRParams = {
  layout: "rows",
  cols: [],
  col: null,
  sizeMode: "number",
  size: "5",
  idCol: null,
  histMean: "",
  histSigma: "",
  sigmaMethod: "rbar",
  unbias: true,
  omit: "",
  testMode: "one",
  testsOn: [true, false, false, false, false, false, false, false],
  testK: ["3", "9", "6", "14", "2", "4", "15", "8"],
  stageCol: null,
  boxcox: "none",
  boxcoxLambda: "",
  xLowerBound: "",
  xUpperBound: "",
  rUpperBound: "",
};

export interface Violation {
  test: number;
  description: string;
  points: number[];
}

export interface Subgroup {
  /** Observaciones validas del subgrupo, ya transformadas si hay Box-Cox. */
  values: number[];
  n: number;
  mean: number;
  range: number;
  sd: number;
  /** Etiqueta de la etapa a la que pertenece. */
  stage: number;
}

export interface Stage {
  label: string;
  from: number;
  to: number;
  center: number;
  sigma: number;
  /** Numero de subgrupos usados en la estimacion, tras omitir. */
  kUsed: number;
}

export interface XbarRModel {
  title: string;
  k: number;
  /** Tamano comun, null si los subgrupos no son todos iguales. */
  commonN: number | null;
  nMissing: number;

  subgroups: Subgroup[];
  stages: Stage[];
  stageOf: number[];

  /** Limites punto a punto: varian si el tamano de subgrupo varia. */
  xUCL: number[];
  xLCL: number[];
  xCL: number[];
  rUCL: number[];
  rLCL: number[];
  rCL: number[];

  xbar: number[];
  ranges: number[];

  xViolations: Violation[];
  rViolations: Violation[];
  xFlagged: number[];
  rFlagged: number[];

  rBar: number;
  lambda: number | null;
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type XbarRResult =
  | ({ ok: true; error?: undefined } & XbarRModel)
  | { ok: false; error: string };
