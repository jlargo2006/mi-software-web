// app/app/six-sigma/studies/doe/factorial/maineffects/types.ts

export const MAX_FACTORS = 15;
/** Por encima de esto el panel deja de leerse. */
export const MAX_LEVELS = 10;

export interface DoeMainParams {
  response: string;
  factors: string[];
  /** Linea horizontal en la media general. */
  showGrandMean: boolean;
  /** Todos los paneles con el mismo eje vertical. */
  sharedScale: boolean;
}

export const DOEMAIN_DEFAULT: DoeMainParams = {
  response: "",
  factors: [],
  showGrandMean: true,
  sharedScale: true,
};

export interface LevelMean {
  /** Etiqueta del nivel tal como se muestra en el eje. */
  label: string;
  /** Valor numerico del nivel, NaN si es de texto. */
  value: number;
  mean: number;
  n: number;
}

export interface FactorEffect {
  name: string;
  levels: LevelMean[];
  /** Recorrido de las medias: max menos min. Es el tamano del efecto. */
  range: number;
  /**
   * Efecto con signo, solo con dos niveles: media alta menos media baja.
   * NaN cuando hay tres o mas niveles, donde el signo no significa nada.
   */
  signed: number;
  /** true si algun nivel tiene una sola observacion. */
  thin: boolean;
}

export interface DoeMainModel {
  response: string;
  effects: FactorEffect[];
  grandMean: number;
  /** Rango comun del eje vertical, ya con margen. */
  yRange: [number, number];
  sharedScale: boolean;
  showGrandMean: boolean;
  n: number;
  nMissing: number;
  /** Factores ordenados de mayor a menor efecto. */
  ranked: FactorEffect[];
}

export type DoeMainResult =
  | ({ ok: true; error?: undefined } & DoeMainModel)
  | { ok: false; error: string };
