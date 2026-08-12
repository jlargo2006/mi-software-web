// app/app/six-sigma/lib/scatterplot.ts
import type { ScatterFit } from "../studies/improve/scatterplot/types";

/**
 * Recta de minimos cuadrados de y sobre x. Devuelve null si no hay al menos
 * dos puntos o si toda la x es constante: en ese caso la pendiente no existe.
 */
export function leastSquares(x: number[], y: number[]): ScatterFit | null {
  const n = x.length;
  if (n < 2) return null;

  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx <= 0) return null;

  const b1 = sxy / sxx;
  const b0 = my - b1 * mx;
  const r = syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
  // SSE = Syy - b1 * Sxy, algebraicamente equivalente a sumar los residuos
  // al cuadrado pero sin recorrer los datos otra vez.
  const sse = Math.max(0, syy - b1 * sxy);
  const s = n > 2 ? Math.sqrt(sse / (n - 2)) : NaN;

  return {
    b0,
    b1,
    r,
    r2: r * r,
    s,
    n,
    xMin: Math.min(...x),
    xMax: Math.max(...x),
  };
}
