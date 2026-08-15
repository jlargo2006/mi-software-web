// app/app/six-sigma/lib/ols.ts

export interface OlsFit {
  /** Numero de parametros, intercepto incluido. */
  p: number;
  sse: number;
  mse: number;
  dfError: number;
  /** Palanca de cada observacion. */
  leverage: number[];
  /** Suma de cuadrados de prediccion, por validacion cruzada dejando uno fuera. */
  press: number;
}

/**
 * Invierte una matriz simetrica por Gauss-Jordan con pivoteo parcial.
 * Devuelve null si esta mal condicionada: es la senal de que los predictores
 * del subconjunto son colineales y el modelo no es estimable.
 */
function invert(a: number[][]): number[][] | null {
  const p = a.length;
  const m: number[][] = a.map((row, i) => [
    ...row,
    ...Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) {
      if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r;
    }
    if (Math.abs(m[piv][c]) < 1e-10) return null;
    if (piv !== c) [m[c], m[piv]] = [m[piv], m[c]];

    const d = m[c][c];
    for (let j = 0; j < 2 * p; j++) m[c][j] /= d;

    for (let r = 0; r < p; r++) {
      if (r === c) continue;
      const f = m[r][c];
      if (f === 0) continue;
      for (let j = 0; j < 2 * p; j++) m[r][j] -= f * m[c][j];
    }
  }
  return m.map((row) => row.slice(p));
}

/**
 * Minimos cuadrados con intercepto. La matriz X llega SIN la columna de unos:
 * se anade aqui.
 *
 * Se calculan tambien las palancas, porque el PRESS sale de ellas sin
 * necesidad de reajustar el modelo n veces:
 *   PRESS = suma de (e_i / (1 - h_i))^2
 */
export function olsFit(X: number[][], y: number[]): OlsFit | null {
  const n = y.length;
  const k = X.length;
  const p = k + 1;
  if (n <= p) return null;

  // Matriz de diseno con la columna de unos delante.
  const A: number[][] = Array.from({ length: n }, (_, i) => [
    1,
    ...X.map((col) => col[i]),
  ]);

  // Normales: X'X y X'y.
  const xtx: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const xty = new Array<number>(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < p; a++) {
      xty[a] += A[i][a] * y[i];
      for (let b = a; b < p; b++) xtx[a][b] += A[i][a] * A[i][b];
    }
  }
  for (let a = 0; a < p; a++) for (let b = 0; b < a; b++) xtx[a][b] = xtx[b][a];

  const inv = invert(xtx);
  if (!inv) return null;

  const coefs = new Array<number>(p).fill(0);
  for (let a = 0; a < p; a++) {
    let s = 0;
    for (let b = 0; b < p; b++) s += inv[a][b] * xty[b];
    coefs[a] = s;
  }

  let sse = 0;
  let press = 0;
  const leverage = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let fitv = 0;
    for (let a = 0; a < p; a++) fitv += coefs[a] * A[i][a];
    const e = y[i] - fitv;
    sse += e * e;

    // h_i = fila_i * (X'X)^-1 * fila_i'
    let h = 0;
    for (let a = 0; a < p; a++) {
      let s = 0;
      for (let b = 0; b < p; b++) s += inv[a][b] * A[i][b];
      h += A[i][a] * s;
    }
    leverage[i] = h;
    const om = 1 - h;
    // Palanca practicamente uno: la observacion determina su propio ajuste y
    // el termino se dispara. Se acota para que el PRESS siga siendo finito.
    press += om > 1e-8 ? (e / om) * (e / om) : (e / 1e-8) * (e / 1e-8);
  }

  const dfError = n - p;
  return { p, sse, mse: sse / dfError, dfError, leverage, press };
}
