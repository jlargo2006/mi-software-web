// app/app/six-sigma/studies/improve/regression/types.ts

export type RegDegree = "linear" | "quadratic" | "cubic";

export const DEGREE_LABEL: Record<RegDegree, string> = {
  linear: "Linear",
  quadratic: "Quadratic",
  cubic: "Cubic",
};

export const DEGREE_ORDER: Record<RegDegree, number> = {
  linear: 1,
  quadratic: 2,
  cubic: 3,
};

export type ResidualType = "regular" | "standardized" | "deleted";

export const RESIDUAL_LABEL: Record<ResidualType, string> = {
  regular: "Regular",
  standardized: "Standardized",
  deleted: "Deleted",
};

/** Rotulo del eje segun el tipo de residuo elegido. */
export const RESIDUAL_AXIS: Record<ResidualType, string> = {
  regular: "Residual",
  standardized: "Standardized Residual",
  deleted: "Deleted Residual",
};

/** Linea de referencia sobre el grafico ajustado. */
export type RefLineMode = "none" | "vertical" | "horizontal";

export const REFLINE_LABEL: Record<RefLineMode, string> = {
  none: "None",
  vertical: "Vertical (at a value of X)",
  horizontal: "Horizontal (at a value of Y)",
};

/** Un corte de la linea de referencia con una de las curvas dibujadas. */
export interface RefPoint {
  /** Rotulo de la serie cortada: Fitted, CI Lower, PI Upper... */
  series: string;
  x: number;
  y: number;
}

export interface RefLineInfo {
  mode: Exclude<RefLineMode, "none">;
  value: number;
  /**
   * Cortes encontrados. Vacio si la linea no cruza nada visible: una
   * horizontal fuera del recorrido de la curva, o una vertical fuera del
   * rango observado.
   */
  points: RefPoint[];
}

export interface ImpRegParams {
  yColumn: string;
  xColumn: string;
  degree: RegDegree;
  /** Bandas de confianza e prediccion sobre el grafico ajustado. */
  showCI: boolean;
  showPI: boolean;
  confidenceLevel: string;
  /** Prediccion en un valor concreto de X. Vacio: no se calcula. */
  predictX: string;
  /** Linea de referencia sobre el grafico ajustado. */
  refLine: RefLineMode;
  /** Valor de la linea: X si es vertical, Y si es horizontal. */
  refValue: string;
  showResidualPlots: boolean;
  /**
   * Tipo de residuo de los graficos. No altera el ajuste ni las tablas: solo
   * la escala en que se representan los residuos.
   */
  residualType: ResidualType;
}

export const IMPREG_DEFAULT: ImpRegParams = {
  yColumn: "",
  xColumn: "",
  degree: "linear",
  showCI: false,
  showPI: false,
  confidenceLevel: "95",
  predictX: "",
  refLine: "none",
  refValue: "",
  showResidualPlots: true,
  residualType: "regular",
};

/** Una fila de la tabla de analisis de la varianza. */
export interface AnovaRow {
  source: string;
  df: number;
  ss: number;
  /** NaN en las filas que no lo muestran. */
  ms: number;
  fValue: number;
  pValue: number;
}

/** Una fila de la tabla secuencial. */
export interface SeqRow {
  source: string;
  df: number;
  ss: number;
  fValue: number;
  pValue: number;
}

export interface RegPrediction {
  x: number;
  fit: number;
  /** Error tipico del valor medio ajustado. */
  seFit: number;
  ciLow: number;
  ciHigh: number;
  piLow: number;
  piHigh: number;
  /** true si x cae fuera del rango observado: extrapolacion. */
  extrapolated: boolean;
}

/** Punto de la curva ajustada, con sus bandas. */
export interface CurvePoint {
  x: number;
  fit: number;
  ciLow: number;
  ciHigh: number;
  piLow: number;
  piHigh: number;
}

export interface ImpRegModel {
  yTitle: string;
  xTitle: string;
  degree: RegDegree;
  order: number;
  /** Coeficientes en base cruda, de menor a mayor potencia. */
  coefs: number[];
  equation: string;

  n: number;
  nMissing: number;
  confLevel: number;

  s: number;
  r2: number;
  r2adj: number;

  anova: AnovaRow[];
  /** Solo con grado 2 o 3. */
  sequential: SeqRow[];

  /** Datos observados, ordenados por x. */
  x: number[];
  y: number[];
  fitted: number[];
  residuals: number[];
  /** Residuos estandarizados, internamente studentizados. */
  stdResiduals: number[];
  /** Residuos eliminados, externamente studentizados. */
  delResiduals: number[];
  /** Palanca de cada observacion, en el orden de x. */
  leverage: number[];
  /** Orden original en la hoja, para el grafico de secuencia. */
  order_: number[];

  curve: CurvePoint[];
  prediction: RegPrediction | null;
  refLine: RefLineInfo | null;
}

export type ImpRegResult =
  | ({ ok: true; error?: undefined } & ImpRegModel)
  | { ok: false; error: string };
