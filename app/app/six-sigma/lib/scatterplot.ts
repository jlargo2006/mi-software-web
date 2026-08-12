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

/**
 * Suavizador lowess de Cleveland: en cada punto ajusta una recta ponderada
 * usando solo sus q vecinos mas cercanos en x, con peso tricubico segun la
 * distancia. Los pasos de robustez repiten el ajuste infraponderando los
 * puntos que quedaron lejos de la curva, de modo que un atipico deja de
 * arrastrarla.
 *
 * Devuelve los puntos ordenados por x. Los empates en x reciben por
 * construccion el mismo valor ajustado.
 */
export function lowess(
  xIn: number[],
  yIn: number[],
  f: number,
  steps: number
): { x: number[]; y: number[] } | null {
  const n = xIn.length;
  if (n < 3) return null;

  // Orden estable: los empates conservan el orden de la hoja.
  const ord = xIn
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v || a.i - b.i)
    .map((e) => e.i);
  const x = ord.map((i) => xIn[i]);
  const y = ord.map((i) => yIn[i]);

  // Tamano del vecindario. Al menos 2 puntos, para que la recta exista.
  const q = Math.max(2, Math.min(n, Math.floor(f * n + 1e-9)));

  const rw = new Array<number>(n).fill(1);
  const fit = new Array<number>(n).fill(0);
  const idx = new Array<number>(n);

  for (let it = 0; it <= steps; it++) {
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) idx[k] = k;
      // Se necesitan los q mas cercanos: basta ordenar por distancia.
      idx.sort((a, b) => Math.abs(x[a] - x[i]) - Math.abs(x[b] - x[i]) || a - b);

      let dMax = 0;
      for (let k = 0; k < q; k++) {
        const d = Math.abs(x[idx[k]] - x[i]);
        if (d > dMax) dMax = d;
      }

      let sw = 0;
      let swx = 0;
      let swy = 0;
      const wj: { j: number; w: number }[] = [];
      for (let k = 0; k < q; k++) {
        const j = idx[k];
        // Con dMax = 0 todo el vecindario comparte x: peso uniforme.
        const u = dMax > 0 ? Math.abs(x[j] - x[i]) / dMax : 0;
        const tri = dMax > 0 ? Math.pow(1 - u * u * u, 3) : 1;
        const w = tri * rw[j];
        if (w <= 0) continue;
        wj.push({ j, w });
        sw += w;
        swx += w * x[j];
        swy += w * y[j];
      }

      if (sw <= 0) {
        fit[i] = y[i];
        continue;
      }
      const mx = swx / sw;
      const my = swy / sw;
      let sxx = 0;
      let sxy = 0;
      for (const { j, w } of wj) {
        const dx = x[j] - mx;
        sxx += w * dx * dx;
        sxy += w * dx * (y[j] - my);
      }
      // Si toda la x del vecindario coincide, se cae a la media ponderada.
      const b = sxx > 1e-12 ? sxy / sxx : 0;
      fit[i] = my + b * (x[i] - mx);
    }

    if (it === steps) break;

    // Reponderacion bicuadrada sobre la mediana del residuo absoluto. La
    // constante 6 es la de Cleveland: anula el peso de los puntos a mas de
    // seis desviaciones medianas de la curva.
    const res = y.map((v, i) => Math.abs(v - fit[i]));
    const sorted = [...res].sort((a, b) => a - b);
    const m = sorted.length;
    const med =
      m % 2 ? sorted[(m - 1) / 2] : (sorted[m / 2 - 1] + sorted[m / 2]) / 2;
    if (!(med > 0)) break;
    for (let i = 0; i < n; i++) {
      const u = Math.min(1, res[i] / (6 * med));
      rw[i] = Math.pow(1 - u * u, 2);
    }
  }

  return { x, y: fit };
}
