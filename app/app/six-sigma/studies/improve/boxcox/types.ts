// app/app/six-sigma/studies/improve/boxcox/types.ts

export type LambdaMode = "optimal" | "other";

/** Valores "convenientes" a los que se redondea lambda. */
export const ROUND_GRID = [-2, -1, -0.5, 0, 0.5, 1, 2];

export interface ImpBoxCoxParams {
  column: string;
  /** Numero o nombre de columna. Vacio: subgrupos de tamano 1. */
  subgroupSize: string;
  lambdaMode: LambdaMode;
  /** Solo con lambdaMode "other". */
  otherLambda: string;
  confidenceLevel: string;
  /** Columna vacia donde guardar la transformacion. */
  storeColumn: string;
}

export const IMPBOXCOX_DEFAULT: ImpBoxCoxParams = {
  column: "",
  subgroupSize: "1",
  lambdaMode: "optimal",
  otherLambda: "",
  confidenceLevel: "95",
  storeColumn: "",
};

/** Un punto de la curva de desviacion tipica frente a lambda. */
export interface BoxCoxPoint {
  lambda: number;
  sd: number;
}

export interface ImpBoxCoxModel {
  title: string;
  n: number;
  nMissing: number;
  nSubgroups: number;
  subgroupSize: number | null;
  subgroupColumn: string | null;
  confLevel: number;

  /** Lambda que minimiza la desviacion tipica. */
  lambdaHat: number;
  sdMin: number;
  lowerCL: number;
  upperCL: number;
  /** Limite horizontal que define el intervalo. */
  sdLimit: number;
  roundedLambda: number;

  /** Lambda realmente aplicado a los datos guardados. */
  lambdaUsed: number;
  usedRounded: boolean;

  curve: BoxCoxPoint[];
  /** Datos originales y transformados, solo las filas con dato. */
  original: number[];
  transformed: number[];
  storeColumn: string;
  /** Columna a volcar, alineada con las filas de la hoja. */
  storeMatrix: (number | string)[];

  skewBefore: number;
  skewAfter: number;
  sdBefore: number;
  sdAfter: number;
}

export type ImpBoxCoxResult =
  | ({ ok: true; error?: undefined } & ImpBoxCoxModel)
  | { ok: false; error: string };
