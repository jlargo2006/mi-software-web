// app/app/six-sigma/lib/binning.ts

export interface BinResult {
  start: number;   // inicio del primer bin
  end: number;     // fin del Ãºltimo bin
  size: number;    // ancho de bin
  nbins: number;
}

/** "nice number" redondeado (1, 2, 2.5, 5, 10 Â· 10^k) â€” estilo ejes Minitab */
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
 * Bins automÃ¡ticos estilo Minitab:
 * nÂº objetivo de barras ~ sqrt(n), con lÃ­mites y ancho "nice".
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

/** Bins con nÂº fijo elegido por el usuario. */
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
 * Binning especÃ­fico para dotplot.
 * Si los datos son discretos (pocos valores distintos o todos enteros),
 * usa un bin por valor (size = paso mÃ­nimo entre valores distintos),
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

  // paso mÃ­nimo entre valores distintos
  let step = Infinity;
  for (let i = 1; i < n; i++) {
    step = Math.min(step, distinct[i] - distinct[i - 1]);
  }

  // Discreto: enteros, o pocos valores distintos (â‰¤ 30) â†’ un bin por valor
  if (allInts || n <= 30) {
    const size = allInts ? 1 : step;
    const start = distinct[0] - size / 2;
    const end = distinct[n - 1] + size / 2;
    const nbins = Math.round((end - start) / size);
    return { start, end, size, nbins };
  }

  // Continuo â†’ binning nice normal
  return niceBins(values);
}

/** NÂº de decimales significativos de un valor (mÃ¡x. 10, para cortar binarios). */
function decimalsOf(v: number): number {
  if (Number.isInteger(v)) return 0;
  const s = v.toPrecision(12).replace(/0+$/, "");
  const dot = s.indexOf(".");
  if (dot < 0) return 0;
  return Math.min(10, s.length - dot - 1);
}

/**
 * Binning por resoluciÃ³n de los datos.
 *
 * Usa como ancho de bin el paso mÃ­nimo entre valores distintos (la "resoluciÃ³n"
 * con la que se midiÃ³), siempre que el nÂº de clases resultante caiga en
 * [minBins, maxBins]. Los bins quedan CENTRADOS en los valores observados, por lo
 * que aparecen barras vacÃ­as en los valores no observados del rango (igual que
 * Minitab con datos de baja resoluciÃ³n).
 *
 * Si la resoluciÃ³n produce demasiadas o demasiado pocas clases (datos continuos
 * finos, o rango muy corto), cae a niceBins().
 *
 * Ejemplo: [4,9 5,1 4,6 5,0 5,1 4,7 4,4 4,7 4,6]
 *   res = 0,1 Â· lo = 4,4 Â· hi = 5,1 â†’ 8 clases
 *   â†’ start 4,35 Â· end 5,15 Â· size 0,1 (vacÃ­as en 4,5 y 4,8)
 */
export function resolutionBins(
  values: number[],
  minBins = 5,
  maxBins = 20,
): BinResult {
  const distinct = Array.from(new Set(values)).sort((a, b) => a - b);
  const n = distinct.length;

  if (n < 2) return niceBins(values);

  // ResoluciÃ³n = paso mÃ­nimo entre valores consecutivos distintos.
  let res = Infinity;
  for (let i = 1; i < n; i++) {
    res = Math.min(res, distinct[i] - distinct[i - 1]);
  }
  if (!Number.isFinite(res) || res <= 0) return niceBins(values);

  // Saneado de coma flotante: 5,1 - 5,0 = 0.09999999999999964 â†’ 0,1
  const dec = Math.max(...distinct.map(decimalsOf));
  if (dec > 0) {
    const rounded = Number(res.toFixed(dec));
    if (rounded > 0) res = rounded;
  }

  const lo = distinct[0];
  const hi = distinct[n - 1];
  const nbins = Math.round((hi - lo) / res) + 1;

  if (nbins < minBins || nbins > maxBins) return niceBins(values);

  // Bordes desplazados media clase para centrar las barras en los valores.
  const half = res / 2;
  const start = Number((lo - half).toFixed(dec + 2));
  const end = Number((hi + half).toFixed(dec + 2));

  return { start, end, size: res, nbins };
}
