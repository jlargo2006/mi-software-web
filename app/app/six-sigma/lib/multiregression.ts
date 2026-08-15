// app/app/six-sigma/lib/multiregression.ts
// Regresion lineal MULTIPLE. Complementa a lib/regression.ts, que resuelve el
// caso polinomico de un solo predictor. Las funciones de distribucion se
// reutilizan de alli para no duplicar implementaciones.
import { fSf, tSf } from "./regression";

/** p-valor bilateral de la t de Student. */
export function tTwoTail(t: number, df: number): number {
  if (!Number.isFinite(t) || !(df > 0)) return NaN;
  return 2 * tSf(Math.abs(t), df);
}

export interface MultiTermStats {
  name: string;
  coef: number;
  se: number;
  t: number;
  p: number;
  /** Factor de inflacion de la varianza. */
  vif: number;
  /** Suma de cuadrados ajustada, tipo III. */
  adjSS: number;
  adjMS: number;
  fValue: number;
  fP: number;
}

export interface MultiRegFit {
  constant: { coef: number; se: number; t: number; p: number };
  terms: MultiTermStats[];
  n: number;
  /** Parametros, constante incluida. */
  p: number;
  s: number;
  r2: number;
  r2adj: number;
  r2pred: number;

  regDF: number;
  regSS: number;
  regMS: number;
  regF: number;
  regP: number;
  errDF: number;
  errSS: number;
  errMS: number;
  totDF: number;
  totSS: number;

  fitted: number[];
  resid: number[];
  /** Residuo estandarizado, internamente studentizado. */
  stdResid: number[];
  leverage: number[];
  press: number;
}

/** Inversa de una matriz simetrica por Gauss-Jordan con pivoteo parcial. */
function invert(src: number[][]): number[][] | null {
  const p = src.length;
  const m: number[][] = src.map((row, i) => [
    ...row,
    ...Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) {
      if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r;
    }
    if (Math.abs(m[piv][c]) < 1e-12) return null;
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

/** Suma de cuadrados residual de y sobre las columnas dadas, con constante. */
function sseOf(cols: number[][], y: number[]): number | null {
  const n = y.length;
  const p = cols.length + 1;
  const A: number[][] = Array.from({ length: n }, (_, i) => [
    1,
    ...cols.map((c) => c[i]),
  ]);
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
  for (let i = 0; i < n; i++) {
    let fit = 0;
    for (let a = 0; a < p; a++) fit += coefs[a] * A[i][a];
    const e = y[i] - fit;
    sse += e * e;
  }
  return sse;
}

/**
 * Minimos cuadrados con constante y varios predictores.
 *
 * Las sumas de cuadrados son de TIPO III: la de cada termino es lo que crece
 * el error al quitar SOLO ese termino, con los demas dentro. Por eso no suman
 * la de la regresion cuando los predictores estan correlacionados: la parte
 * compartida no se atribuye a nadie.
 */
export function multiRegressionFit(
  X: number[][],
  y: number[],
  names: string[]
): MultiRegFit | null {
  const n = y.length;
  const k = X.length;
  const p = k + 1;
  if (n <= p) return null;

  const A: number[][] = Array.from({ length: n }, (_, i) => [
    1,
    ...X.map((c) => c[i]),
  ]);

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

  const fitted = new Array<number>(n).fill(0);
  const resid = new Array<number>(n).fill(0);
  const leverage = new Array<number>(n).fill(0);
  let errSS = 0;
  for (let i = 0; i < n; i++) {
    let f = 0;
    for (let a = 0; a < p; a++) f += coefs[a] * A[i][a];
    fitted[i] = f;
    resid[i] = y[i] - f;
    errSS += resid[i] * resid[i];

    // Palanca: h_i = fila_i * (X'X)^-1 * fila_i'
    let h = 0;
    for (let a = 0; a < p; a++) {
      let s = 0;
      for (let b = 0; b < p; b++) s += inv[a][b] * A[i][b];
      h += A[i][a] * s;
    }
    leverage[i] = h;
  }

  const errDF = n - p;
  const errMS = errSS / errDF;
  const s = Math.sqrt(errMS);

  const my = y.reduce((a, b) => a + b, 0) / n;
  const totSS = y.reduce((a, v) => a + (v - my) * (v - my), 0);
  const totDF = n - 1;
  const regSS = totSS - errSS;
  const regDF = k;
  const regMS = regSS / regDF;
  const regF = regMS / errMS;

  const stdResid = resid.map((e, i) => {
    const om = 1 - leverage[i];
    return om > 1e-10 ? e / (s * Math.sqrt(om)) : NaN;
  });

  // PRESS por palancas: evita reajustar el modelo n veces.
  let press = 0;
  for (let i = 0; i < n; i++) {
    const om = 1 - leverage[i];
    const d = om > 1e-8 ? om : 1e-8;
    press += (resid[i] / d) * (resid[i] / d);
  }

  const terms: MultiTermStats[] = [];
  for (let j = 0; j < k; j++) {
    const se = Math.sqrt(inv[j + 1][j + 1] * errMS);
    const t = coefs[j + 1] / se;

    // VIF: se regresa el predictor j sobre los demas predictores.
    let vif = 1;
    if (k > 1) {
      const others = X.filter((_, i) => i !== j);
      const mj = X[j].reduce((a, b) => a + b, 0) / n;
      const sstj = X[j].reduce((a, v) => a + (v - mj) * (v - mj), 0);
      const ssej = sseOf(others, X[j]);
      if (ssej !== null && sstj > 0) {
        const r2j = 1 - ssej / sstj;
        vif = r2j < 1 - 1e-12 ? 1 / (1 - r2j) : Infinity;
      } else {
        vif = Infinity;
      }
    }

    const reduced = X.filter((_, i) => i !== j);
    const sseRed = reduced.length > 0 ? sseOf(reduced, y) : totSS;
    const adjSS = sseRed === null ? NaN : sseRed - errSS;
    const fValue = adjSS / errMS;

    terms.push({
      name: names[j],
      coef: coefs[j + 1],
      se,
      t,
      p: tTwoTail(t, errDF),
      vif,
      adjSS,
      adjMS: adjSS,
      fValue,
      fP: fSf(fValue, 1, errDF),
    });
  }

  const seC = Math.sqrt(inv[0][0] * errMS);
  const tC = coefs[0] / seC;

  return {
    constant: { coef: coefs[0], se: seC, t: tC, p: tTwoTail(tC, errDF) },
    terms,
    n,
    p,
    s,
    r2: 100 * (1 - errSS / totSS),
    r2adj: 100 * (1 - errMS / (totSS / totDF)),
    r2pred: 100 * (1 - press / totSS),
    regDF,
    regSS,
    regMS,
    regF,
    regP: fSf(regF, regDF, errDF),
    errDF,
    errSS,
    errMS,
    totDF,
    totSS,
    fitted,
    resid,
    stdResid,
    leverage,
    press,
  };
}
