// app/app/six-sigma/studies/control/xbars/constants.ts

/**
 * Funcion gamma por la aproximacion de Lanczos. Hace falta para c4, que no es
 * una tabla: es una expresion cerrada con gammas y se puede evaluar para
 * cualquier n, tambien para los tamanos grandes que las tablas no recogen.
 */
function gammaFn(z: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5)
    return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
  const t = z + g.length - 0.5;
  return (
    Math.sqrt(2 * Math.PI) *
    Math.pow(t, z + 0.5) *
    Math.exp(-t) *
    x
  );
}

/**
 * c4(n) = raiz(2/(n-1)) * Gamma(n/2) / Gamma((n-1)/2).
 *
 * Es el sesgo de la desviacion tipica muestral: E[s] = c4 * sigma. Siempre
 * menor que 1, asi que s subestima sigma, y tanto mas cuanto menor es n. Para
 * n = 2 vale 0,7979 = raiz(2/pi), un 20 % de sesgo.
 */
export function c4(n: number): number {
  if (n < 2) return NaN;
  if (n === 2) return Math.sqrt(2 / Math.PI);
  return Math.sqrt(2 / (n - 1)) * (gammaFn(n / 2) / gammaFn((n - 1) / 2));
}

/** Desviacion tipica de s cuando sigma = 1: raiz(1 - c4^2). */
export function c5(n: number): number {
  const c = c4(n);
  return Math.sqrt(1 - c * c);
}
