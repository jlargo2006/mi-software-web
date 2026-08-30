// app/app/six-sigma/studies/control/mrchart/types.ts

export type TestMode = "all" | "one" | "custom";

export interface MRParams {
  /** Columna con las observaciones individuales. */
  col: string | null;

  /**
   * Longitud del rango movil. Por defecto 2, y es el valor recomendado: con
   * w > 2 los rangos comparten w-1 observaciones, la autocorrelacion inducida
   * crece mucho y los tests de racha pierden sentido.
   */
  span: string;

  /** Parameters: sigma historica, si se conoce. */
  histSigma: string;

  /** Estimate: observaciones a omitir de la estimacion. */
  omit: string;

  /** Limits. */
  lowerBound: string;
  upperBound: string;
  /** Multiplos de sigma con linea propia, ademas de los tres sigma. */
  extraSigma: string;

  /** Tests: solo existen los cuatro primeros en una carta de rangos. */
  testMode: TestMode;
  testsOn: boolean[];
  testK: string[];

  stageCol: string | null;
}

export const MR_DEFAULT: MRParams = {
  col: null,
  span: "2",
  histSigma: "",
  omit: "",
  lowerBound: "",
  upperBound: "",
  extraSigma: "",
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
  /** Indices dentro del vector de rangos, no de observaciones. */
  from: number;
  to: number;
  /** Rango movil medio de la etapa. */
  mrBar: number;
  /** Sigma implicada, MRbar / d2. */
  sigma: number;
  ucl: number;
  lcl: number;
  /** Rangos usados en la estimacion. */
  nUsed: number;
}

export interface MRModel {
  colName: string;
  /** Numero de observaciones leidas. */
  m: number;
  /** Numero de rangos moviles, m - span + 1. */
  k: number;
  span: number;
  d2: number;
  d3: number;
  D3: number;
  D4: number;

  /** Los rangos moviles. El primero corresponde a la observacion span. */
  mr: number[];
  /** Observacion (1-based) en la que se traza cada rango. */
  obsOf: number[];

  cl: number[];
  ucl: number[];
  lcl: number[];
  /** Cero por construccion, no por recorte. */
  lclStructural: boolean;

  stages: Stage[];
  stageOf: number[];

  violations: Violation[];
  flagged: number[];

  /** Mayor rango de la serie y donde cae, para el aviso de acoplamiento. */
  maxMr: number;
  maxMrAt: number;

  usedHistorical: boolean;
  omitted: number[];
  extraSigma: number[];
  notes: string[];
}

export type MRResult =
  | ({ ok: true; error?: undefined } & MRModel)
  | { ok: false; error: string };
