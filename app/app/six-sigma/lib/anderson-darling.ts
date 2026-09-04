// lib/anderson-darling.ts
import { normCdf } from "./distributions";

export interface AndersonDarling {
  /** A² crudo. Es el estadístico que se REPORTA (Minitab lo llama AD / A-Squared). */
  aSquared: number;
  /** A² con la corrección de muestra pequeña de D'Agostino & Stephens.
   *  Solo sirve para entrar en las fórmulas del p-valor: NO se muestra. */
  aStar: number;
  pValue: number;
}

/**
 * p-valor a partir del AD AJUSTADO (A*).
 * Las cuatro ramas están calibradas contra A*, no contra A² crudo:
 * pasar A² aquí da p-valores optimistas con n pequeño.
 */
function pValueFromAStar(a: number): number {
  if (a >= 10) return 0;
  if (a >= 0.6) return Math.exp(1.2937 - 5.709 * a + 0.0186 * a * a);
  if (a >= 0.34) return Math.exp(0.9177 - 4.279 * a - 1.38 * a * a);
  if (a >= 0.2) return 1 - Math.exp(-8.318 + 42.796 * a - 59.938 * a * a);
  return 1 - Math.exp(-13.436 + 101.14 * a - 223.73 * a * a);
}

/**
 * Test de Anderson-Darling para normalidad.
 *
 * `values` no necesita venir ordenado. `stats` permite reutilizar media y
 * desviación ya calculadas: si se omiten, se calculan aquí. La desviación debe
 * ser la MUESTRAL (n-1), que es la que usa Minitab.
 */
export function andersonDarlingNormal(
  values: number[],
  stats?: { mean: number; sd: number }
): AndersonDarling {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const m = stats ? stats.mean : sorted.reduce((t, v) => t + v, 0) / n;
  const sd = stats
    ? stats.sd
    : Math.sqrt(sorted.reduce((t, v) => t + (v - m) ** 2, 0) / (n - 1));

  if (n < 3 || !(sd > 0) || !Number.isFinite(sd)) {
    return { aSquared: NaN, aStar: NaN, pValue: NaN };
  }

  let acc = 0;
  for (let i = 0; i < n; i++) {
    const lo = Math.min(Math.max(normCdf((sorted[i] - m) / sd), 1e-15), 1 - 1e-15);
    const hi = Math.min(
      Math.max(1 - normCdf((sorted[n - 1 - i] - m) / sd), 1e-15),
      1 - 1e-15
    );
    acc += (2 * (i + 1) - 1) * (Math.log(lo) + Math.log(hi));
  }

  const aSquared = -n - acc / n;
  const aStar = aSquared * (1 + 0.75 / n + 2.25 / (n * n));
  return { aSquared, aStar, pValue: pValueFromAStar(aStar) };
}
