// app/app/six-sigma/studies/control/npchart/types.ts

/** De donde sale el tamano de subgrupo. */
export type SizeMode = "number" | "column";

/** Que hacer con los limites cuando los tamanos son desiguales. */
export type UnequalMode = "actual" | "assume";

export type TestMode = "all" | "one" | "custom";

export interface NPChartParams {
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

  /** Limits, en unidades de conteo. */
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

export const NPCHART_DEFAULT: NPChartParams = {
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
  totalN: number;
  totalD: number;
}

export interface NPChartModel {
  colName: string;
  k: number;
  commonN: number | null;
  minN: number;
  maxN: number;

  /** Conteo de cada subgrupo: es lo que se dibuja. */
  d: number[];
  n: number[];
  /** Proporcion, solo para el hover y los diagnosticos. */
  p: number[];

  cl: number[];
  ucl: number[];
  lcl: number[];
  clippedLow: boolean[];
  clippedHigh: boolean[];

  stages: Stage[];
  stageOf: number[];

  violations: Violation[];
  flagged: number[];

  dispersion: number;
  minNP: number;
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type NPChartResult =
  | ({ ok: true; error?: undefined } & NPChartModel)
  | { ok: false; error: string };
