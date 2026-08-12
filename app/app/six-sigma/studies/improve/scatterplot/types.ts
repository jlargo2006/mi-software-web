// app/app/six-sigma/studies/improve/scatterplot/types.ts

export type ScatterKind =
  | "simple"
  | "groups"
  | "regression"
  | "regressionGroups"
  | "connect"
  | "connectGroups";

export const KIND_LABEL: Record<ScatterKind, string> = {
  simple: "Simple",
  groups: "With Groups",
  regression: "With Regression",
  regressionGroups: "With Regression and Groups",
  connect: "With Connect Line",
  connectGroups: "With Connect and Groups",
};

/** Variantes que dividen los datos por una columna de grupo. */
export const KIND_HAS_GROUPS: Record<ScatterKind, boolean> = {
  simple: false,
  groups: true,
  regression: false,
  regressionGroups: true,
  connect: false,
  connectGroups: true,
};

/** Variantes que dibujan la recta de minimos cuadrados. */
export const KIND_HAS_REGRESSION: Record<ScatterKind, boolean> = {
  simple: false,
  groups: false,
  regression: true,
  regressionGroups: true,
  connect: false,
  connectGroups: false,
};

/** Variantes que unen los puntos consecutivos. */
export const KIND_HAS_CONNECT: Record<ScatterKind, boolean> = {
  simple: false,
  groups: false,
  regression: false,
  regressionGroups: false,
  connect: true,
  connectGroups: true,
};

/** Valores por defecto del suavizador, los mismos de Minitab. */
export const LOWESS_F_DEFAULT = "0,5";
export const LOWESS_STEPS_DEFAULT = "2";

export interface ImpScatterParams {
  kind: ScatterKind;
  yColumn: string;
  xColumn: string;
  /** Solo en las variantes con grupos. */
  groupColumn: string;
  /** Titulo del grafico. Vacio: se genera automaticamente. */
  title: string;
  showEquation: boolean;

  /**
   * Suavizador lowess. Es independiente del tipo de grafico: se superpone a
   * cualquiera de las seis variantes.
   */
  showLowess: boolean;
  /** Grado de suavizado f, la fraccion de puntos de cada vecindario. */
  lowessF: string;
  /** Pasos de robustez. 0 desactiva la reponderacion. */
  lowessSteps: string;
}

export const IMPSCATTER_DEFAULT: ImpScatterParams = {
  kind: "simple",
  yColumn: "",
  xColumn: "",
  groupColumn: "",
  title: "",
  showEquation: true,
  showLowess: false,
  lowessF: LOWESS_F_DEFAULT,
  lowessSteps: LOWESS_STEPS_DEFAULT,
};

/** Ajuste por minimos cuadrados de una serie. */
export interface ScatterFit {
  /** Interseccion y pendiente. */
  b0: number;
  b1: number;
  /** Coeficiente de correlacion de Pearson. */
  r: number;
  /** Coeficiente de determinacion. */
  r2: number;
  /** Desviacion tipica residual. */
  s: number;
  n: number;
  /** Extremos del segmento a dibujar. */
  xMin: number;
  xMax: number;
}

export interface ScatterSeries {
  /** Nombre del grupo, o cadena vacia si no hay grupos. */
  label: string;
  x: number[];
  y: number[];
  /** Ajuste propio de la serie. Null si no procede o si faltan puntos. */
  fit: ScatterFit | null;
  /** Curva suavizada, ya ordenada por x. Null si no se pidio o no cabe. */
  smooth: { x: number[]; y: number[] } | null;
}

export interface ImpScatterModel {
  title: string;
  xTitle: string;
  yTitle: string;
  kind: ScatterKind;
  series: ScatterSeries[];
  /** Ajuste sobre todos los puntos, para el pie del grafico. */
  overallFit: ScatterFit | null;
  n: number;
  /** Pares descartados por tener algun valor vacio o no numerico. */
  nMissing: number;
  /** Parametros efectivos del suavizador, ya validados. */
  lowess: { on: boolean; f: number; steps: number; q: number } | null;
}

export type ImpScatterResult =
  | ({ ok: true; error?: undefined } & ImpScatterModel)
  | { ok: false; error: string };
