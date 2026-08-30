// app/app/six-sigma/studies/control/mrchart/constants.ts

/**
 * Constantes del rango para muestras de tamano w.
 *
 *   d2  esperanza del rango relativo, R / sigma
 *   d3  desviacion tipica del rango relativo
 *
 * En una carta de rangos moviles w es la longitud de la ventana, no un tamano
 * de subgrupo real: las ventanas se solapan. Las constantes son las mismas,
 * pero conviene recordar que su justificacion (muestras independientes) solo
 * se cumple de forma aproximada aqui, y peor cuanto mayor es w.
 */
export interface RangeConstants {
  d2: number;
  d3: number;
  /** D3 = max(0, 1 - 3 d3/d2). */
  D3: number;
  /** D4 = 1 + 3 d3/d2. */
  D4: number;
}

const D2: Record<number, number> = {
  2: 1.128,
  3: 1.693,
  4: 2.059,
  5: 2.326,
  6: 2.534,
  7: 2.704,
  8: 2.847,
  9: 2.97,
  10: 3.078,
};

const D3: Record<number, number> = {
  2: 0.8525,
  3: 0.8884,
  4: 0.8798,
  5: 0.8641,
  6: 0.848,
  7: 0.8332,
  8: 0.8198,
  9: 0.8078,
  10: 0.7971,
};

export const MAX_SPAN = 10;

export function rangeConstants(w: number): RangeConstants | null {
  const d2 = D2[w];
  const d3 = D3[w];
  if (d2 === undefined || d3 === undefined) return null;
  const r = (3 * d3) / d2;
  return { d2, d3, D3: Math.max(0, 1 - r), D4: 1 + r };
}
