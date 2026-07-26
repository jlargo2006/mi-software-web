// app/app/six-sigma/lib/binning.ts

export interface BinResult {
  start: number;   // inicio del primer bin
  end: number;     // fin del último bin
  size: number;    // ancho de bin
  nbins: number;
}

/** "nice number" redondeado (1, 2, 2.5, 5, 10 · 10^k) — estilo ejes Minitab */
function niceNum(x: number, round: boolean): number {
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  let nf: number;
  if (round) {
    if (f < 1.5) nf = 1;
    else if (f < 3) nf = 2;
    else if (f < 7) nf = 5;
    else nf = 10;
  } else {
    if (f <= 1) nf = 1;
    else if (f <= 2) nf = 2;
    else if (f <= 5) nf = 5;
    else nf = 10;
  }
  return nf * Math.pow(10, exp);
}

/**
 * Bins automáticos estilo Minitab:
 * nº objetivo de barras ~ sqrt(n), con límites y ancho "nice".
 */
export function niceBins(values: number[]): BinResult {
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return { start: min - 0.5, end: max + 0.5, size: 1, nbins: 1 };
  }
  const target = Math.max(1, Math.round(Math.sqrt(n)));
  const rawRange = niceNum(max - min, false);
  const size = niceNum(rawRange / target, true);
  const start = Math.floor(min / size) * size;
  const end = Math.ceil(max / size) * size;
  const nbins = Math.round((end - start) / size);
  return { start, end, size, nbins };
}

/** Bins con nº fijo elegido por el usuario. */
export function fixedBins(values: number[], nbins: number): BinResult {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return { start: min - 0.5, end: max + 0.5, size: 1, nbins: 1 };
  }
  const size = (max - min) / nbins;
  return { start: min, end: max, size, nbins };
}

/**
 * Binning específico para dotplot.
 * Si los datos son discretos (pocos valores distintos o todos enteros),
 * usa un bin por valor (size = paso mínimo entre valores distintos),
 * de modo que cada valor tiene su propia columna de puntos.
 * Si son continuos, cae al binning "nice" normal.
 */
export function dotBins(values: number[]): BinResult {
  const distinct = Array.from(new Set(values)).sort((a, b) => a - b);
  const n = distinct.length;

  if (n === 1) {
    return { start: distinct[0] - 0.5, end: distinct[0] + 0.5, size: 1, nbins: 1 };
  }

  const allInts = distinct.every((v) => Number.isInteger(v));

  // paso mínimo entre valores distintos
  let step = Infinity;
  for (let i = 1; i < n; i++) {
    step = Math.min(step, distinct[i] - distinct[i - 1]);
  }

  // Discreto: enteros, o pocos valores distintos (≤ 30) → un bin por valor
  if (allInts || n <= 30) {
    const size = allInts ? 1 : step;
    const start = distinct[0] - size / 2;
    const end = distinct[n - 1] + size / 2;
    const nbins = Math.round((end - start) / size);
    return { start, end, size, nbins };
  }

  // Continuo → binning nice normal
  return niceBins(values);
}

