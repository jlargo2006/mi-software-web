// app/app/six-sigma/studies/control/laneyp/types.ts

/** De donde sale el tamano de subgrupo. */
export type SizeMode = "number" | "column";

export type TestMode = "all" | "one" | "custom";

export interface LaneyPParams {
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

  /** Limits, en proporcion. */
  lowerBound: string;
  upperBound: string;

  /** Tests: solo existen los cuatro primeros en cartas de atributos. */
  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;
}

export const LANEYP_DEFAULT: LaneyPParams = {
  col: null,
  sizeMode: "column",
  size: "100",
  sizeCol: null,
  histP: "",
  omit: "",
  lowerBound: "",
  upperBound: "",
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
  /** Factor de correccion de Laney para esta etapa. */
  sigmaZ: number;
  kUsed: number;
  totalN: number;
  totalD: number;
}

export interface LaneyPModel {
  colName: string;
  k: number;
  commonN: number | null;
  minN: number;
  maxN: number;

  /** Proporcion de cada subgrupo: es lo que se dibuja. */
  p: number[];
  d: number[];
  n: number[];

  /** Puntuaciones z estandarizadas contra la sigma binomial. */
  z: number[];

  cl: number[];
  ucl: number[];
  lcl: number[];
  clippedLow: boolean[];
  clippedHigh: boolean[];

  stages: Stage[];
  stageOf: number[];

  violations: Violation[];
  flagged: number[];

  /** Sigma Z global, la que se muestra como subtitulo. */
  sigmaZ: number;
  minNP: number;
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type LaneyPResult =
  | ({ ok: true; error?: undefined } & LaneyPModel)
  | { ok: false; error: string };
