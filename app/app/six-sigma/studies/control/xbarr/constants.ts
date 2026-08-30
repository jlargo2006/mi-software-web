// app/app/six-sigma/studies/control/xbarr/constants.ts
//
// Constantes de las cartas de control por subgrupos.
//
//   d2(n)  esperanza del rango de n normales estandar
//   d3(n)  desviacion tipica de ese rango
//   c4(m)  factor de insesgado de la desviacion tipica con m observaciones
//
// d2 y d3 estan tabulados para n de 2 a 25, que es el rango util: por encima
// de 25 el rango pierde eficiencia frente a la desviacion tipica y la carta
// deberia ser una Xbar-S.

const D2: number[] = [
  NaN, NaN, 1.128, 1.693, 2.059, 2.326, 2.534, 2.704, 2.847, 2.970, 3.078,
  3.173, 3.258, 3.336, 3.407, 3.472, 3.532, 3.588, 3.640, 3.689, 3.735, 3.778,
  3.819, 3.858, 3.895, 3.931,
];

const D3: number[] = [
  NaN, NaN, 0.8525, 0.8884, 0.8798, 0.8641, 0.8480, 0.8332, 0.8198, 0.8078,
  0.7971, 0.7873, 0.7785, 0.7704, 0.7630, 0.7562, 0.7499, 0.7441, 0.7386,
  0.7335, 0.7287, 0.7242, 0.7199, 0.7159, 0.7121, 0.7084,
];

export const d2 = (n: number): number =>
  n >= 2 && n <= 25 ? D2[n] : NaN;

export const d3 = (n: number): number =>
  n >= 2 && n <= 25 ? D3[n] : NaN;

/**
 * Factor c4. Se calcula con la funcion gamma en vez de tabularlo: para m
 * grande la tabla se queda corta y la aproximacion asintotica basta.
 */
export function c4(m: number): number {
  if (m < 2) return NaN;
  if (m > 200) return 1 - 1 / (4 * m) - 7 / (32 * m * m);
  return Math.sqrt(2 / (m - 1)) * Math.exp(lnGamma(m / 2) - lnGamma((m - 1) / 2));
}

/** Logaritmo de la funcion gamma, aproximacion de Lanczos. */
function lnGamma(z: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }
  const zz = z - 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) x += g[i] / (zz + i + 1);
  const t = zz + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (zz + 0.5) * Math.log(t) - t + Math.log(x);
}
