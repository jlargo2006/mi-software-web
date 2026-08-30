// app/app/six-sigma/studies/control/cchart/types.ts

export type TestMode = "all" | "one" | "custom";

export interface CChartParams {
  /** Columna con el numero de defectos por subgrupo. */
  col: string | null;

  /** Parameters: media historica de defectos por subgrupo, si se conoce. */
  histC: string;

  /** Estimate: subgrupos a omitir de la estimacion. */
  omit: string;

  /** Limits, en conteo de defectos. */
  lowerBound: string;
  upperBound: string;

  /** Tests: solo existen los cuatro primeros en cartas de atributos. */
  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;
}

export const CCHART_DEFAULT: CChartParams = {
  col: null,
  histC: "",
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
  /** Media central de la etapa, defectos por subgrupo. */
  cBar: number;
  /** Sigma de Poisson, raiz de la media. */
  sigma: number;
  kUsed: number;
  totalC: number;
}

export interface CChartModel {
  colName: string;
  k: number;

  /** Conteo de cada subgrupo: es lo que se dibuja. */
  c: number[];

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
  usedHistorical: boolean;
  omitted: number[];
  notes: string[];
}

export type CChartResult =
  | ({ ok: true; error?: undefined } & CChartModel)
  | { ok: false; error: string };
