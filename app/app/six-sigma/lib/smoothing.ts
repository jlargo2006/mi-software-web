// app/app/six-sigma/lib/smoothing.ts

/**
 * LOWESS (locally weighted scatterplot smoothing) — fiel a Minitab.
 *
 * @param xs           valores X (deben ir alineados con ys)
 * @param ys           valores Y
 * @param degree       "Degree of smoothing" f ∈ (0,1] = fracción de puntos
 *                     usados en cada ventana local. Minitab por defecto 0.5.
 * @param steps        "Number of steps" = iteraciones de robustez. Minitab 2.
 *
 * Devuelve los pares (x, y) suavizados, ordenados por x, listos para dibujar.
 */
export function lowess(
  xs: number[],
  ys: number[],
  degree = 0.5,
  steps = 2
): { x: number[]; y: number[] } {
  const n = xs.length;
  if (n === 0) return { x: [], y: [] };
  if (n < 3) return { x: [...xs], y: [...ys] };

  // Ordenar por x (sin tocar los arrays originales del caller)
  const idx = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => xs[a] - xs[b]
  );
  const x = idx.map((i) => xs[i]);
  const y = idx.map((i) => ys[i]);

  // Tamaño de ventana: r = fracción * n (al menos 2)
  const f = Math.min(1, Math.max(1e-6, degree));
  const r = Math.max(2, Math.floor(f * n));

  const yEst = new Array<number>(n).fill(0);
  const robustW = new Array<number>(n).fill(1);

  const tricube = (u: number) => {
    const a = Math.abs(u);
    if (a >= 1) return 0;
    const t = 1 - a * a * a;
    return t * t * t;
  };

  for (let it = 0; it <= steps; it++) {
    for (let i = 0; i < n; i++) {
      // Ventana de los r puntos más cercanos a x[i]
      let lo = Math.max(0, i - Math.floor(r / 2));
      let hi = Math.min(n - 1, lo + r - 1);
      lo = Math.max(0, hi - r + 1);

      // ampliar hacia el vecino más cercano por ambos lados
      while (hi < n - 1 && x[hi + 1] - x[i] < x[i] - x[lo]) {
        lo++;
        hi++;
      }

      const dMax = Math.max(x[i] - x[lo], x[hi] - x[i]) || 1e-12;

      // Regresión lineal ponderada local
      let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0;
      for (let j = lo; j <= hi; j++) {
        const w = tricube((x[j] - x[i]) / dMax) * robustW[j];
        sw += w;
        swx += w * x[j];
        swy += w * y[j];
        swxx += w * x[j] * x[j];
        swxy += w * x[j] * y[j];
      }

      const denom = sw * swxx - swx * swx;
      if (Math.abs(denom) < 1e-12 || sw < 1e-12) {
        yEst[i] = sw > 0 ? swy / sw : y[i];
      } else {
        const b = (sw * swxy - swx * swy) / denom; // pendiente
        const a = (swy - b * swx) / sw;            // intercepto
        yEst[i] = a + b * x[i];
      }
    }

    // Recalcular pesos de robustez a partir de los residuos
    if (it < steps) {
      const residuals = yEst.map((e, i) => Math.abs(y[i] - e));
      const sorted = [...residuals].sort((a, b) => a - b);
      const mid = Math.floor(n / 2);
      const mad =
        n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      const s = 6 * mad || 1e-12;
      for (let i = 0; i < n; i++) {
        const u = residuals[i] / s;
        const b = 1 - u * u;
        robustW[i] = u >= 1 ? 0 : b * b; // peso bicuadrado
      }
    }
  }

  return { x, y: yEst };
}
