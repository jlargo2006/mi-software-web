// app/app/six-sigma/studies/control/imr/types.ts

/** Modo de seleccion de los ocho tests de causas especiales. */
export type TestMode = "all" | "one" | "custom";

/** Metodo de estimacion de sigma a partir de los rangos moviles. */
export type SigmaMethod = "average" | "median";

/** Transformacion de Box-Cox. */
export type BoxCoxMode = "none" | "ln" | "sqrt" | "optimal" | "other";

export interface ImrParams {
  col: string | null;

  // --- Parameters: valores historicos, si se conocen ---
  histMean: string;
  histSigma: string;

  // --- Estimate ---
  sigmaMethod: SigmaMethod;
  /** Longitud del rango movil, 2 por defecto. */
  mrLength: string;
  /** Observaciones a omitir de la estimacion, "3 12:15". */
  omit: string;

  // --- Tests ---
  testMode: TestMode;
  /** Ocho banderas, indice 0 = test 1. */
  testsOn: boolean[];
  /** Ocho constantes K, indice 0 = test 1. */
  testK: string[];

  // --- Stages ---
  stageCol: string | null;

  // --- Box-Cox ---
  boxcox: BoxCoxMode;
  boxcoxLambda: string;

  // --- Limits: cotas sobre los limites de control ---
  iLowerBound: string;
  iUpperBound: string;
  mrUpperBound: string;
}

export const IMR_DEFAULT: ImrParams = {
  col: null,
  histMean: "",
  histSigma: "",
  sigmaMethod: "average",
  mrLength: "2",
  omit: "",
  testMode: "one",
  testsOn: [true, false, false, false, false, false, false, false],
  testK: ["3", "9", "6", "14", "2", "4", "15", "8"],
  stageCol: null,
  boxcox: "none",
  boxcoxLambda: "",
  iLowerBound: "",
  iUpperBound: "",
  mrUpperBound: "",
};

/** Una violacion: numero de test y observaciones que lo disparan. */
export interface Violation {
  test: number;
  description: string;
  points: number[];
}

/** Una etapa del grafico, con sus propios limites. */
export interface Stage {
  label: string;
  /** Indices 0-based, inclusive. */
  from: number;
  to: number;

  center: number;
  sigma: number;
  iUCL: number;
  iLCL: number;

  mrCenter: number;
  mrUCL: number;
  mrLCL: number;

  /** Numero de observaciones usadas para estimar, tras omitir. */
  nUsed: number;
}

export interface ImrModel {
  colName: string;
  n: number;
  nMissing: number;

  /** Valores en las unidades del grafico: transformados si hay Box-Cox. */
  values: number[];
  /** Rangos moviles, alineados con values; null donde no existe. */
  mr: (number | null)[];

  stages: Stage[];
  /** Indice de etapa de cada observacion. */
  stageOf: number[];

  iViolations: Violation[];
  mrViolations: Violation[];
  /** Conjunto de observaciones marcadas en cada grafico, 1-based. */
  iFlagged: number[];
  mrFlagged: number[];

  /** Lambda efectiva, null si no hay transformacion. */
  lambda: number | null;
  /** Aviso sobre la forma de los datos, si procede. */
  shapeWarning: string | null;
  usedHistorical: boolean;
  omitted: number[];
}

export type ImrResult =
  | ({ ok: true; error?: undefined } & ImrModel)
  | { ok: false; error: string };
