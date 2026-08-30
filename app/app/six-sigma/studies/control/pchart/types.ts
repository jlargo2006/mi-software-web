// app/app/six-sigma/studies/control/pchart/types.ts

/** De donde sale el tamano de subgrupo. */
export type SizeMode = "number" | "column";

/** Que hacer con los limites cuando los tamanos son desiguales. */
export type UnequalMode = "actual" | "assume";

export type TestMode = "all" | "one" | "custom";

export interface PChartParams {
  /** Columna con el numero de defectuosos por subgrupo. */
  col: string | null;

  sizeMode: SizeMode;
  /** sizeMode "number": tamano constante. */
  size: string;
  /** sizeMode "column": columna con los tamanos. */
  sizeCol: string | null;

  /** Parameters: proporcion historica, si se conoce. */
  histP: string;

  /** Estimate: subgrupos a omitir de la estimacion. */
  omit: string;

  /** Limits. */
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

export const PCHART_DEFAULT: PChartParams = {
  col: null,
  sizeMode: "column",
  size: "100",
  sizeCol: null,
  histP: "",
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
  /** Proporcion central de la etapa. */
  pBar: number;
  kUsed: number;
  /** Total de unidades y de defectuosos usados en la estimacion. */
  totalN: number;
  totalD: number;
}

export interface PChartModel {
  colName: string;
  k: number;
  /** Tamano comun, null si varian. */
  commonN: number | null;
  minN: number;
  maxN: number;

  /** Proporcion observada de cada subgrupo. */
  p: number[];
  /** Tamano de cada subgrupo. */
  n: number[];
  /** Defectuosos de cada subgrupo. */
  d: number[];

  cl: number[];
  ucl: number[];
  lcl: number[];
  /** true donde el limite se ha recortado a 0 o a 1. */
  clippedLow: boolean[];
  clippedHigh: boolean[];

  stages: Stage[];
  stageOf: number[];

  violations: Violation[];
  flagged: number[];

  /** Diagnostico de sobredispersion: sigma de los z frente a 1. */
  dispersion: number;
  /** Menor n*pbar de la serie, para avisar de la aproximacion normal. */
  minNP: number;
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type PChartResult =
  | ({ ok: true; error?: undefined } & PChartModel)
  | { ok: false; error: string };
