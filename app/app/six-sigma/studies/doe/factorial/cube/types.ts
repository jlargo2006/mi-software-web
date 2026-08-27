// app/app/six-sigma/studies/doe/factorial/cube/types.ts

/** Un cubo solo se lee con dos o tres factores: mas caras no caben en el plano. */
export const MAX_CUBE_FACTORS = 3;
export const MIN_CUBE_FACTORS = 2;

export interface DoeCubeParams {
  response: string;
  /** Dos o tres factores, en el orden en que se marcaron. */
  factors: string[];
  /** true: medias ajustadas por el modelo. false: medias crudas de celda. */
  fittedMeans: boolean;
  /** Claves de termino desmarcadas; solo cuentan con fittedMeans. */
  excluded: string[];
}

export const DOECUBE_DEFAULT: DoeCubeParams = {
  response: "",
  factors: [],
  fittedMeans: true,
  excluded: [],
};

/** Un vertice del cubo: una combinacion de niveles bajo/alto. */
export interface CubeVertex {
  /** Un bit por factor: 0 nivel bajo, 1 nivel alto. Indice = suma de bits. */
  code: number[];
  /** Etiquetas de nivel, en el orden de los factores. */
  levels: string[];
  /** Valor que se imprime en la caja. */
  value: number;
  /** Media cruda de la celda, para contrastar cuando el modelo esta reducido. */
  dataMean: number | null;
  /** Corridas observadas en ese vertice. */
  n: number;
}

export interface CubeTerm {
  /** Clave y rotulo: "Temp*Na2S2O8". */
  key: string;
  /** Indices de los factores implicados, ascendentes. */
  members: number[];
  order: number;
  /** Coeficiente ajustado; NaN con medias de datos. */
  coef: number;
  /** false si el usuario lo desmarco. */
  included: boolean;
}

export interface DoeCubeModel {
  response: string;
  factors: string[];
  /** [bajo, alto] de cada factor, ya rotulados. */
  levels: string[][];
  vertices: CubeVertex[];
  terms: CubeTerm[];
  /** Constante del ajuste; media global con medias de datos. */
  constant: number;
  fittedMeans: boolean;
  /** true si se desmarco algun termino: entonces ajustadas != datos. */
  reduced: boolean;
  /** Media de las corridas centrales, null si no hay. */
  centerMean: number | null;
  centerN: number;
  /** Corridas de esquina usadas. */
  n: number;
  /** Filas descartadas por respuesta o nivel ausente. */
  nMissing: number;
  /** Vertices sin ninguna corrida: el diseno no los cubre. */
  emptyVertices: number;
  /** Rango de los valores impresos, para escalar las cajas. */
  valueRange: [number, number];
}

export type DoeCubeResult =
  | ({ ok: true; error?: undefined } & DoeCubeModel)
  | { ok: false; error: string };
