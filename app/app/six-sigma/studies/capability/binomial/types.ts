// app/app/six-sigma/studies/capability/binomial/types.ts

/** Tests para causas especiales de Nelson (1984), en la numeracion habitual. */
export interface BinomialTests {
  test1: boolean; // 1 punto a mas de 3 sigmas de la linea central
  test2: boolean; // 9 puntos seguidos al mismo lado de la linea central
  test3: boolean; // 6 puntos seguidos, todos crecientes o todos decrecientes
  test4: boolean; // 14 puntos seguidos alternando arriba y abajo
}

export interface CapBinomialParams {
  /** Columna con el numero de defectuosos por subgrupo. */
  defectives: string | null;
  /** Modo de tamano de muestra. */
  sizeMode: "constant" | "column";
  constantSize: string;
  sizeColumn: string | null;
  /** p historico opcional: centra los limites en el en lugar de en p barra. */
  historicalP: string;
  /** %Defectivo objetivo, opcional. */
  target: string;
  /** Nivel de confianza en porcentaje. */
  confidence: string;
  tests: BinomialTests;
}

export const CAPBINOMIAL_DEFAULT: CapBinomialParams = {
  defectives: null,
  sizeMode: "column",
  constantSize: "",
  sizeColumn: null,
  historicalP: "",
  target: "",
  confidence: "95",
  tests: { test1: true, test2: false, test3: false, test4: false },
};

export interface BinomialPoint {
  /** Indice de subgrupo, empezando en 1. */
  sample: number;
  n: number;
  defectives: number;
  /** Proporcion del subgrupo. */
  p: number;
  ucl: number;
  lcl: number;
  /** Numeros de test que este punto incumple. */
  violations: number[];
}

export interface CumulativePoint {
  sample: number;
  /** %Defectivo acumulado hasta este subgrupo. */
  pct: number;
}

export interface CapBinomialModel {
  colName: string;
  /** Numero de subgrupos utilizados. */
  k: number;
  /** Total de unidades inspeccionadas. */
  totalN: number;
  /** Total de defectuosos. */
  totalD: number;
  /** p barra, o el p historico si se ha dado. */
  pBar: number;
  /** p observado en el conjunto, siempre el de los datos. */
  pObserved: number;
  historicalP: number | null;
  target: number | null;
  confidence: number;

  points: BinomialPoint[];
  cumulative: CumulativePoint[];

  /** Limites rotulados: los del ULTIMO subgrupo, como hace Minitab. */
  labelUcl: number;
  labelLcl: number;
  labelN: number;
  /** true si los tamanos de subgrupo no son todos iguales. */
  unequal: boolean;

  /** %Defectivo y su intervalo exacto de Clopper-Pearson. */
  pctDefective: number;
  pctLower: number;
  pctUpper: number;
  ppm: number;
  ppmLower: number;
  ppmUpper: number;
  /** Z del proceso: cuantiles normales de 1 menos p. */
  processZ: number;
  zLower: number;
  zUpper: number;

  /** Subgrupos fuera de control, por numero de muestra. */
  outOfControl: number[];
  nMissing: number;
  minN: number;
  maxN: number;
}

export type CapBinomialResult =
  | ({ ok: true; error?: undefined } & CapBinomialModel)
  | { ok: false; error: string };
