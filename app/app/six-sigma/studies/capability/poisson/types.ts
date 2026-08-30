// app/app/six-sigma/studies/capability/poisson/types.ts

/** Tests para causas especiales de Nelson (1984), en la numeracion habitual. */
export interface PoissonTests {
  test1: boolean; // 1 punto a mas de 3 sigmas de la linea central
  test2: boolean; // 9 puntos seguidos al mismo lado de la linea central
  test3: boolean; // 6 puntos seguidos, todos crecientes o todos decrecientes
  test4: boolean; // 14 puntos seguidos alternando arriba y abajo
}

export interface CapPoissonParams {
  /** Columna con el numero de defectos por subgrupo. */
  defects: string | null;
  /** Modo de tamano de muestra: unidades inspeccionadas por subgrupo. */
  sizeMode: "constant" | "column";
  constantSize: string;
  sizeColumn: string | null;
  /** mu historico opcional (DPU): centra los limites en el, no en u barra. */
  historicalMu: string;
  /** DPU objetivo, opcional. */
  target: string;
  /** Nivel de confianza en porcentaje. */
  confidence: string;
  tests: PoissonTests;
}

export const CAPPOISSON_DEFAULT: CapPoissonParams = {
  defects: null,
  sizeMode: "column",
  constantSize: "",
  sizeColumn: null,
  historicalMu: "",
  target: "",
  confidence: "95",
  tests: { test1: true, test2: false, test3: false, test4: false },
};

export interface PoissonPoint {
  /** Indice de subgrupo, empezando en 1. */
  sample: number;
  /** Unidades inspeccionadas. Puede no ser entero: son unidades de exposicion. */
  n: number;
  defects: number;
  /** Defectos por unidad del subgrupo. */
  dpu: number;
  ucl: number;
  lcl: number;
  /** Numeros de test que este punto incumple. */
  violations: number[];
}

export interface CumulativePoint {
  sample: number;
  /** DPU acumulado hasta este subgrupo. */
  dpu: number;
}

export interface CapPoissonModel {
  colName: string;
  /** Numero de subgrupos utilizados. */
  k: number;
  /** Total de unidades inspeccionadas. */
  totalN: number;
  /** Total de defectos. */
  totalD: number;
  /** u barra, o el mu historico si se ha dado: es la linea central. */
  uBar: number;
  /** DPU observado en el conjunto, siempre el de los datos. */
  uObserved: number;
  historicalMu: number | null;
  target: number | null;
  confidence: number;

  points: PoissonPoint[];
  cumulative: CumulativePoint[];

  /** Limites rotulados: los del ULTIMO subgrupo, como hace Minitab. */
  labelUcl: number;
  labelLcl: number;
  labelN: number;
  /** true si los tamanos de subgrupo no son todos iguales. */
  unequal: boolean;

  /** DPU medio y su intervalo exacto por la relacion Poisson - chi cuadrado. */
  meanDpu: number;
  dpuLower: number;
  dpuUpper: number;
  minDpu: number;
  maxDpu: number;

  /** Subgrupos fuera de control, por numero de muestra. */
  outOfControl: number[];
  /** Los que se salen por arriba y los que se salen por abajo, separados. */
  aboveUcl: number[];
  belowLcl: number[];

  /** DPU de la primera y la segunda mitad, para detectar deriva. */
  dpuFirstHalf: number;
  dpuSecondHalf: number;

  nMissing: number;
  minN: number;
  maxN: number;
}

export type CapPoissonResult =
  | ({ ok: true; error?: undefined } & CapPoissonModel)
  | { ok: false; error: string };
