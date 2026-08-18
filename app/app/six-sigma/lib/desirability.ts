// app/app/six-sigma/lib/desirability.ts
// Funciones de deseabilidad de Derringer y Suich.

export type Goal = "maximize" | "minimize" | "target" | "none";

export const GOAL_LABEL: Record<Goal, string> = {
  maximize: "Maximum",
  minimize: "Minimum",
  target: "Target",
  none: "Do not optimize",
};

export interface GoalSpec {
  goal: Goal;
  lower: number;
  target: number;
  upper: number;
  /** Curvatura. 1 es lineal; >1 exige acercarse al objetivo; <1 se conforma. */
  weight: number;
  /** Peso relativo de la respuesta en la deseabilidad compuesta. */
  importance: number;
}

/**
 * Deseabilidad individual, en [0, 1].
 *
 * Convierte la respuesta a una escala sin unidades donde 0 es inaceptable y 1
 * es plenamente satisfactorio. Ese cambio de escala es lo que permite sumar
 * peras y manzanas: una resistencia en megapascales y un coste en euros.
 */
export function desirability(y: number, g: GoalSpec): number {
  if (!Number.isFinite(y)) return NaN;
  const w = g.weight > 0 ? g.weight : 1;

  if (g.goal === "none") return 1;

  if (g.goal === "maximize") {
    if (!(g.target > g.lower)) return NaN;
    if (y <= g.lower) return 0;
    if (y >= g.target) return 1;
    return Math.pow((y - g.lower) / (g.target - g.lower), w);
  }

  if (g.goal === "minimize") {
    if (!(g.upper > g.target)) return NaN;
    if (y <= g.target) return 1;
    if (y >= g.upper) return 0;
    return Math.pow((g.upper - y) / (g.upper - g.target), w);
  }

  // Objetivo intermedio: dos ramas que se juntan en el pico.
  if (!(g.target > g.lower) || !(g.upper > g.target)) return NaN;
  if (y <= g.lower || y >= g.upper) return 0;
  if (y <= g.target) {
    return Math.pow((y - g.lower) / (g.target - g.lower), w);
  }
  return Math.pow((g.upper - y) / (g.upper - g.target), w);
}

/**
 * Deseabilidad compuesta: media geometrica ponderada por la importancia.
 *
 * Se usa la media GEOMETRICA y no la aritmetica por una razon de fondo: si una
 * sola respuesta es inaceptable, su d vale 0 y la compuesta se anula. La
 * solucion queda descartada por completo, que es lo que uno quiere. Con una
 * media aritmetica, un cero se compensaria con otros valores altos.
 */
export function compositeDesirability(
  ds: number[],
  importances: number[]
): number {
  if (ds.length === 0) return NaN;
  let sumImp = 0;
  let logSum = 0;
  for (let i = 0; i < ds.length; i++) {
    const imp = importances[i] > 0 ? importances[i] : 1;
    sumImp += imp;
    if (!Number.isFinite(ds[i])) return NaN;
    if (ds[i] <= 0) return 0;
    logSum += imp * Math.log(ds[i]);
  }
  if (!(sumImp > 0)) return NaN;
  return Math.exp(logSum / sumImp);
}

/** Puntos de una funcion de deseabilidad, para dibujarla. */
export function desirabilityCurve(
  g: GoalSpec,
  lo: number,
  hi: number,
  steps = 121
): { y: number; d: number }[] {
  return Array.from({ length: steps }, (_, i) => {
    const y = lo + ((hi - lo) * i) / (steps - 1);
    return { y, d: desirability(y, g) };
  });
}
