// app/app/six-sigma/studies/control/uchart/types.ts

/** De donde sale el tamano de subgrupo (unidades de inspeccion). */
export type SizeMode = "number" | "column";

/** Que hacer con los limites cuando los tamanos son desiguales. */
export type UnequalMode = "actual" | "assume";

export type TestMode = "all" | "one" | "custom";

export interface UChartParams {
  /** Columna con el numero de defectos por subgrupo. */
  col: string | null;

  sizeMode: SizeMode;
  /** sizeMode "number": tamano constante. */
  size: string;
  /** sizeMode "column": columna con los tamanos. */
  sizeCol: string | null;

  /** Parameters: tasa historica de defectos por unidad, si se conoce. */
  histU: string;

  /** Estimate: subgrupos a omitir de la estimacion. */
  omit: string;

  /** Limits, en defectos por unidad. */
  lowerBound: string;
  upperBound: string;
  unequalMode: UnequalMode;
  assumeSize: string;

  /** Tests: solo existen los cuatro primeros en cartas de atributos. */
  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;
}

export const UCHART_DEFAULT: UChartParams = {
  col: null,
  sizeMode: "column",
  size: "1",
  sizeCol: null,
  histU: "",
  omit: "",
  lowerBound: "",
  upperBound: "",
  unequalMode: "actual",
  assumeSize: "",
  testMode: "one",
  testsOn: [true, false, false, false],
  testK: ["3", "9", "6", "14"],
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
  /** Tasa central de la etapa, defectos por unidad. */
  uBar: number;
  kUsed: number;
  totalN: number;
  totalC: number;
}

export interface UChartModel {
  colName: string;
  k: number;
  /** Tamano comun, null si varian. */
  commonN: number | null;
  minN: number;
  maxN: number;

  /** Defectos por unidad: es lo que se dibuja. */
  u: number[];
  /** Conteo bruto de defectos. */
  c: number[];
  /** Unidades de inspeccion de cada subgrupo. */
  n: number[];

  cl: number[];
  ucl: number[];
  lcl: number[];
  /** true donde el limite inferior se ha recortado a cero. */
  clippedLow: boolean[];

  stages: Stage[];
  stageOf: number[];

  violations: Violation[];
  flagged: number[];

  /** Diagnostico de sobredispersion frente al modelo Poisson. */
  dispersion: number;
  /** Menor numero esperado de defectos, n_i * ubar. */
  minExpected: number;
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type UChartResult =
  | ({ ok: true; error?: undefined } & UChartModel)
  | { ok: false; error: string };
