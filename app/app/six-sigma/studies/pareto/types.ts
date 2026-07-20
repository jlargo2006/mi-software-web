// studies/pareto/types.ts
export type CombineMode = "combine" | "none";

export interface ParetoParams {
  categoryCol: string | null; // columna con el texto de categorias
  countCol: string | null;    // columna con el numero de casos
  combine: CombineMode;       // "combine" | "none"
  combinePercent: number;     // p.ej. 95 -> agrupa la cola (5%) en "Other"
}

export interface ParetoBar {
  category: string;
  count: number;
  percent: number;    // % del total
  cumPercent: number; // acumulado
  isOther: boolean;   // true si es la barra agrupada
}

export interface ParetoResult {
  countTitle: string; // titulo de la columna de casos (eje Y izq)
  total: number;
  bars: ParetoBar[];
}

export const PARETO_DEFAULT: ParetoParams = {
  categoryCol: null,
  countCol: null,
  combine: "none",
  combinePercent: 95,
};
