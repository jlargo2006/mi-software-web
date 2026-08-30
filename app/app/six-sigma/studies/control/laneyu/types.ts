// app/app/six-sigma/studies/control/laneyu/types.ts

/** De donde sale el tamano de subgrupo (unidades de inspeccion). */
export type SizeMode = "number" | "column";

export type TestMode = "all" | "one" | "custom";

export interface LaneyUParams {
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

  /** Tests: solo existen los cuatro primeros en cartas de atributos. */
  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;
}

export const LANEYU_DEFAULT: LaneyUParams = {
  col: null,
  sizeMode: "column",
  size: "1",
  sizeCol: null,
  histU: "",
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
  /** Tasa central de la etapa, defectos por unidad. */
  uBar: number;
  /** Factor de correccion de Laney para esta etapa. */
  sigmaZ: number;
  kUsed: number;
  totalN: number;
  totalC: number;
}

export interface LaneyUModel {
  colName: string;
  k: number;
  commonN: number | null;
  minN: number;
  maxN: number;

  /** Defectos por unidad: es lo que se dibuja. */
  u: number[];
  c: number[];
  n: number[];

  /** Puntuaciones z estandarizadas contra la sigma de Poisson. */
  z: number[];

  cl: number[];
  ucl: number[];
  lcl: number[];
  clippedLow: boolean[];

  stages: Stage[];
  stageOf: number[];

  violations: Violation[];
  flagged: number[];

  /** Sigma Z global, la que se muestra como subtitulo. */
  sigmaZ: number;
  /** Menor numero esperado de defectos, n_i * ubar. */
  minExpected: number;
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type LaneyUResult =
  | ({ ok: true; error?: undefined } & LaneyUModel)
  | { ok: false; error: string };
