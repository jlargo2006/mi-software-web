// app/app/six-sigma/studies/doe/factorial/optimizer/types.ts
import type { Goal, GoalSpec } from "../../../../lib/desirability";
import type { MultiRegFit } from "../../../../lib/multiregression";
import type { Term } from "../../../../lib/factorialmodel";

export const MAX_RESPONSES = 8;
export const MAX_FACTORS = 8;

/** Fila de configuracion de una respuesta. */
export interface ResponseSetup {
  column: string;
  goal: Goal;
  lower: string;
  target: string;
  upper: string;
  weight: string;
  importance: string;
}

export const EMPTY_SETUP = (column: string): ResponseSetup => ({
  column,
  goal: "maximize",
  lower: "",
  target: "",
  upper: "",
  weight: "1",
  importance: "1",
});

export interface DoeOptParams {
  responses: string[];
  setups: ResponseSetup[];
  factors: string[];
  maxOrder: string;
  excluded: string[];
  /** Factor fijado a un nivel concreto: su nombre y el valor exigido. */
  holds: { factor: string; value: string }[];
  confidenceLevel: string;
  showOptPlot: boolean;
  showDesirCurves: boolean;
}

export const DOEOPT_DEFAULT: DoeOptParams = {
  responses: [],
  setups: [],
  factors: [],
  maxOrder: "2",
  excluded: [],
  holds: [],
  confidenceLevel: "95",
  showOptPlot: true,
  showDesirCurves: true,
};

/** Un modelo ajustado por respuesta. */
export interface ResponseModel {
  column: string;
  spec: GoalSpec;
  fit: MultiRegFit;
  terms: Term[];
  /** Coeficientes en el orden constante, terminos. */
  coefs: number[];
  s: number;
  errDF: number;
  r2: number;
  /** Terminos no significativos, para avisar. */
  weakTerms: string[];
}

export interface FactorSetting {
  name: string;
  /** Nivel codificado optimo, en [-1, 1]. */
  coded: number;
  /** Etiqueta en unidades reales, o el nivel de texto. */
  label: string;
  text: boolean;
  levels: string[];
  center: number;
  half: number;
  /** true si el usuario lo ha fijado. */
  held: boolean;
}

export interface ResponsePrediction {
  column: string;
  fit: number;
  seFit: number;
  ciLow: number;
  ciHigh: number;
  piLow: number;
  piHigh: number;
  d: number;
}

/** Un punto de un panel del grafico de optimizacion. */
export interface OptPanelPoint {
  coded: number;
  label: string;
  /** Valor ajustado de cada respuesta y la deseabilidad compuesta. */
  fits: number[];
  composite: number;
}

export interface OptPanel {
  factor: string;
  text: boolean;
  points: OptPanelPoint[];
  /** Posicion del optimo dentro del panel. */
  optCoded: number;
}

export interface DoeOptModel {
  models: ResponseModel[];
  settings: FactorSetting[];
  predictions: ResponsePrediction[];
  composite: number;
  panels: OptPanel[];
  /** Curvas de deseabilidad de cada respuesta. */
  curves: { column: string; points: { y: number; d: number }[]; lo: number; hi: number }[];
  confLevel: number;
  n: number;
  nMissing: number;
  /** true si el optimo cae en un vertice del dominio. */
  atVertex: boolean;
  /** Cuantas soluciones distintas alcanzan la misma deseabilidad. */
  ties: number;
  showOptPlot: boolean;
  showDesirCurves: boolean;
}

export type DoeOptResult =
  | ({ ok: true; error?: undefined } & DoeOptModel)
  | { ok: false; error: string };
