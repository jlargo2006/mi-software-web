// app/app/six-sigma/lib/lowess.ts

/**
 * Suavizador lowess: regresion lineal local ponderada, con pasos de
 * robustez que rebajan el peso de los puntos peor ajustados. Es lo que
 * dibuja la variante "With Smoother" del matrix plot.
 *
 * f    fraccion de puntos que entra en cada ajuste local (0 a 1).
 * pasos numero de iteraciones de robustez; 0 la desactiva.
 */
export function lowess(
  xs: number[],
  ys: number[],
  f = 0.5,
  steps = 2
): { x: number[]; y: number[] } | null {
  const n = xs.length;
  if (n < 3) return null;

  // Se trabaja ordenado por x: la curva se dibuja de izquierda a derecha.
  const ord = xs.map((v, i) => i).sort((a, b) => xs[a] - xs[b]);
  const x = ord.map((i) => xs[i]);
  const y = ord.map((i) => ys[i]);

  const r = Math.max(2, Math.min(n, Math.ceil(f * n)));
  const yest = new Array<number>(n).fill(0);
  let delta = new Array<number>(n).fill(1);

  for (let it = 0; it <= steps; it++) {
    for (let i = 0; i < n; i++) {
      // Anchura de la ventana: distancia al r-esimo vecino mas cercano.
      const d = x.map((v) => Math.abs(v - x[i]));
      const h = [...d].sort((a, b) => a - b)[r - 1];
      const hh = h > 0 ? h : 1e-12;

      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let a0 = 0;
      let a1 = 0;
      for (let k = 0; k < n; k++) {
        const u = Math.min(1, d[k] / hh);
        const t = 1 - u * u * u;
        const w = t * t * t * delta[k];
        if (w <= 0) continue;
        b0 += w;
        b1 += w * x[k];
        b2 += w * x[k] * x[k];
        a0 += w * y[k];
        a1 += w * x[k] * y[k];
      }

      const det = b0 * b2 - b1 * b1;
      if (Math.abs(det) < 1e-12) {
        // Ventana degenerada: se cae a la media ponderada.
        yest[i] = b0 > 0 ? a0 / b0 : y[i];
      } else {
        const inter = (b2 * a0 - b1 * a1) / det;
        const slope = (b0 * a1 - b1 * a0) / det;
        yest[i] = inter + slope * x[i];
      }
    }

    if (it === steps) break;

    // Pesos de robustez: bicuadrados sobre el residuo relativo a su mediana.
    const res = y.map((v, i) => Math.abs(v - yest[i]));
    const srt = [...res].sort((a, b) => a - b);
    const mad = srt[Math.floor(n / 2)];
    if (!(mad > 1e-12)) break;
    delta = res.map((e) => {
      const u = Math.min(1, e / (6 * mad));
      const t = 1 - u * u;
      return t * t;
    });
  }

  return { x, y: yest };
}
