// app/app/six-sigma/lib/eqvar.ts
// Motor de calculo del Test for Equal Variances.
// Reproduce la salida de Minitab: Bonferroni CIs (metodo de Bonett),
// test de Levene (Brown-Forsythe, desviaciones respecto a la mediana) y
// test de comparaciones multiples de Bonett.
//
// ---------------------------------------------------------------------------
// DETALLES CALIBRADOS CONTRA MINITAB
// ---------------------------------------------------------------------------
// 1) Los IC NO son chi-cuadrado. El metodo clasico sqrt((n-1)s2/chi2) da
//    (2,4065; 4,0273) para Damper 1, frente al (2,25901; 4,27664) real.
//    Minitab usa BONETT, robusto frente a no normalidad:
//
//      sigma en sqrt( exp( ln(c*s2) +- z * c * sqrt( (g4 - (n-3)/n)/(n-1) ) ) )
//      con c = n / (n - z)
//
//    El factor c multiplica TAMBIEN al error estandar, no solo al centro.
//
// 2) La curtosis g4 de los IC usa la MEDIA RECORTADA en el numerador y la
//    MEDIA ORDINARIA en el denominador. El recorte es fraccionario e
//    interpolado, con proporcion 1/(2*sqrt(n-4)), pero SOLO si esa proporcion
//    es <= 0,25 (es decir n >= 8); por debajo degenera hacia la mediana.
//    OJO: el tope es <= y no <, porque con n = 8 la proporcion vale
//    exactamente 0,25 y SI debe aplicarse (calibrado con ppm VOC vs Shift).
//
// 3) El p-valor de comparaciones multiples tiene DOS RAMAS segun k:
//
//    k = 2  -> inversion de la ecuacion de Bonett para dos varianzas. Se
//              busca la raiz positiva z* de
//                L(z) = ln(n1/n2) + ln((n2-z)/(n1-z)) - z*SE + ln(s1Â²/s2Â²)
//              con SE basado en la curtosis AGRUPADA del par, y
//                p = 2 * P(Z > z*)
//              Los grupos se ordenan por varianza DESCENDENTE; sin ese orden
//              el resultado no es simetrico y falla.
//
//    k > 2  -> varianzas V_i por grupo a partir de las b_ij por pares y
//              p_ij = P(R_k >= sqrt(2)|Z_ij|) con R_k el rango de k normales
//              estandar. El p global es el minimo. La formula de V_i divide
//              por (k-1)(k-2), que es 0 si k = 2: la rama k = 2 es
//              obligatoria, no una optimizacion.
//
//    En AMBAS ramas g_i = (n_i - 3)/n_i  (NO n_i/(n_i - 3)).
//
// ---------------------------------------------------------------------------
// RESULTADOS VERIFICADOS (exactos a 3 decimales frente a Minitab)
// ---------------------------------------------------------------------------
//   BTU.In vs Damper (k=2, n=40/50)
//     StDev      3,0198680 / 2,7670195      (Minitab 3,01987 / 2,76702)
//     IC Bonf.   (2,25901; 4,27664) / (2,27551; 3,52261)   exactos
//     g4 IC      3,74279 / 2,63932
//     Levene     0,0000231 -> p = 0,996178  (Minitab 0,00 / 0,996)
//     Comp.mult. g4 par = 3,246392, SE = 0,326484, z* = 0,544096
//                p = 0,586375               (Minitab 0,586)
//   Clor.Lev_Post vs Distributor (k=2, n=40/50)
//     z* = 1,321620 -> p = 0,186295         (Minitab 0,186)
//     Levene p = 0,304
//   Data vs Supplier (k=3, n=5)
//     IC (0,120375; 3,08781) / (0,082028; 0,98401) / (0,132427; 2,52819)
//     Comp.mult. p = 0,392730               (Minitab 0,393)
//     Levene 0,5928 -> p = 0,568174         (Minitab 0,59 / 0,568)
//   ppm VOC vs Shift (k=3, n=8)
//     Comp.mult. p = 0,747717               (Minitab 0,748)
//     Levene p = 0,44
//   ppm defective (k=3, n=17/20/25) y Temp x Oxygen (k=6, n=3): IC exactos.
//
// NOTA de validez: Minitab advierte que el p-valor de comparaciones multiples
// puede no ser fiable si algun grupo tiene n < 20. Se expone la bandera
// `mcSmallSample` para que la UI muestre el aviso.

import { fPValue } from "./fdist";

export interface EqVarGroupResult {
  name: string;
  n: number;
  stdev: number;
  variance: number;
  /** IC de Bonferroni (Bonett) para la desviacion tipica. */
  ciLo: number;
  ciHi: number;
  /** Intervalo de comparacion multiple, para el grafico. */
  mcLo: number;
  mcHi: number;
  /** Curtosis usada por Bonett en el IC (diagnostico). */
  kurtosis: number;
  values: number[];
}

export interface EqVarModel {
  ok: boolean;
  error?: string;

  responseName: string;
  factorName: string;
  alpha: number;
  /** Nivel individual de cada IC de Bonferroni: 1 - alpha/k. */
  individualLevel: number;

  groups: EqVarGroupResult[];

  /** Comparaciones multiples (Bonett). Solo p-valor, como Minitab. */
  mcPValue: number;
  /**
   * Diagnostico: con k = 2 es la raiz z* de la ecuacion de Bonett; con k > 2
   * es el |Z_ij| del par mas extremo. Minitab no lo imprime.
   */
  mcStatistic: number;
  /** true si algun grupo tiene n < 20 (p-valor de MC posiblemente no valido). */
  mcSmallSample: boolean;

  leveneStatistic: number;
  levenePValue: number;
  leveneDf1: number;
  leveneDf2: number;

  allValues: number[];
}

export const EMPTY_EQVAR: EqVarModel = {
  ok: false,
  error: "Select the data columns.",
  responseName: "",
  factorName: "",
  alpha: 0.05,
  individualLevel: 0.975,
  groups: [],
  mcPValue: NaN,
  mcStatistic: NaN,
  mcSmallSample: false,
  leveneStatistic: NaN,
  levenePValue: NaN,
  leveneDf1: 0,
  leveneDf2: 0,
  allValues: [],
};

// --------------------------------------------------------------------------
// Utilidades estadisticas
// --------------------------------------------------------------------------

function mean(v: number[]): number {
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return NaN;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function variance(v: number[]): number {
  const n = v.length;
  if (n < 2) return NaN;
  const m = mean(v);
  return v.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1);
}

/**
 * Cuantil de la normal estandar (Acklam + refinado de Halley).
 * Duplicado a proposito respecto a anova1way.ts para no tocar un estudio
 * ya calibrado; unificar en lib/normal.ts cuando convenga.
 */
export function normQuantile(p: number): number {
  if (!(p > 0 && p < 1)) return NaN;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pl = 0.02425;
  let x: number;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pl) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  // Refinado de Halley
  const e = 0.5 * erfc(-x / Math.SQRT2) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + z / 2);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t *
                                  (1.48851587 +
                                    t * (-0.82215223 + t * 0.17087277))))))))
    );
  return x >= 0 ? r : 2 - r;
}

/** Cola superior de la normal: P(Z > z). */
function normSF(z: number): number {
  return 0.5 * erfc(z / Math.SQRT2);
}

/** Funcion de distribucion de la normal estandar. */
function normCDF(z: number): number {
  return 0.5 * erfc(-z / Math.SQRT2);
}

/** Densidad de la normal estandar. */
function normPDF(z: number): number {
  return Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * Cola superior del RANGO de k normales estandar independientes (df = inf),
 * es decir P(R_k >= q). Se integra
 *   P(R_k < q) = k * integral phi(z) * [Phi(z) - Phi(z - q)]^(k-1) dz
 * por Simpson sobre [-9, 9]. Verificado contra scipy a 3e-16.
 */
function studentizedRangeSF(q: number, k: number): number {
  if (!(q > 0) || k < 2) return 1;
  const lo = -9;
  const hi = 9;
  const m = 2000; // par
  const h = (hi - lo) / m;
  const f = (z: number) => normPDF(z) * (normCDF(z) - normCDF(z - q)) ** (k - 1);
  let sum = f(lo) + f(hi);
  for (let i = 1; i < m; i++) {
    sum += f(lo + i * h) * (i % 2 ? 4 : 2);
  }
  const cdf = (k * sum * h) / 3;
  return Math.min(1, Math.max(0, 1 - cdf));
}

/**
 * Media recortada con proporcion FRACCIONARIA e interpolada.
 * Recorta k = prop*n observaciones por cola; la parte fraccionaria se aplica
 * como peso parcial a las observaciones de los extremos del nucleo.
 * Este detalle es imprescindible: con recorte entero los IC no cuadran.
 */
function trimmedMean(values: number[], prop: number): number {
  const x = [...values].sort((a, b) => a - b);
  const n = x.length;
  const k = prop * n;
  const kf = Math.floor(k);
  const frac = k - kf;
  if (2 * kf >= n) return median(x);

  const core = x.slice(kf, n - kf);
  const w = new Array(core.length).fill(1);
  if (core.length >= 2) {
    w[0] -= frac;
    w[core.length - 1] -= frac;
  } else if (core.length === 1) {
    w[0] = 1;
  }
  let num = 0;
  let den = 0;
  for (let i = 0; i < core.length; i++) {
    num += core[i] * w[i];
    den += w[i];
  }
  return den > 0 ? num / den : median(x);
}

/**
 * Proporcion de recorte de Bonett. La formula 1/(2*sqrt(n-4)) degenera en
 * muestras pequenas (n = 5 -> 0,5, que recorta hasta la mediana). VERIFICADO
 * contra Minitab: con n = 5 NO hay recorte. Se aplica solo si prop <= 0,25,
 * es decir a partir de n = 8.
 *
 * El tope es <= y NO <: con n = 8 la proporcion vale exactamente 0,25 y debe
 * aplicarse. Con < estricto, ppm VOC vs Shift daba 0,663 en vez de 0,748.
 *
 * Valores: n=3 -> 0 | n=5 -> 0 | n=8 -> 0,250 | n=17 -> 0,139 | n=20 -> 0,125
 *          n=25 -> 0,109 | n=40 -> 0,083 | n=50 -> 0,074
 */
function trimProportion(n: number): number {
  if (n <= 4) return 0;
  const p = 1 / (2 * Math.sqrt(n - 4));
  return p <= 0.25 ? p : 0;
}

/**
 * Curtosis de Bonett para UN grupo (la que usan los IC). VERIFICADO contra
 * Minitab en 4 datasets: media RECORTADA en el numerador y media ORDINARIA
 * en el denominador. Usar la recortada en ambos falla en grupos con
 * atipicos (Damper 1: 3,5139 en vez de 3,7428).
 */
function bonettKurtosis(values: number[]): number {
  const n = values.length;
  const m = mean(values);
  const tm = trimmedMean(values, trimProportion(n));
  let num = 0;
  let den = 0;
  for (const x of values) {
    num += (x - tm) ** 4;
    den += (x - m) ** 2;
  }
  return den > 0 ? (n * num) / (den * den) : NaN;
}

/**
 * Curtosis AGRUPADA de un PAR de grupos, la que usa el test de comparaciones
 * multiples (distinta de la de los IC):
 *
 *   g4_ij = (ni+nj) * [ sum(y_il - m_i)^4 + sum(y_jl - m_j)^4 ]
 *           / [ (ni-1)siÂ² + (nj-1)sjÂ² ]Â²
 *
 * con m_i la media recortada de cada grupo.
 */
function pooledKurtosis(a: number[], b: number[]): number {
  const na = a.length;
  const nb = b.length;
  const ma = trimmedMean(a, trimProportion(na));
  const mb = trimmedMean(b, trimProportion(nb));
  let num = 0;
  for (const x of a) num += (x - ma) ** 4;
  for (const x of b) num += (x - mb) ** 4;
  const den = (na - 1) * variance(a) + (nb - 1) * variance(b);
  return den > 0 ? ((na + nb) * num) / (den * den) : NaN;
}

/** Varianza asintotica del log de la varianza (parte sin el factor c). */
function bonettVar(n: number, g4: number): number {
  return (g4 - (n - 3) / n) / (n - 1);
}

/**
 * IC de Bonett para la desviacion tipica, a nivel de confianza `conf`.
 * En el estudio, conf es el nivel INDIVIDUAL de Bonferroni (1 - alpha/k).
 */
export function bonettCI(
  values: number[],
  conf: number
): { lo: number; hi: number; kurtosis: number } {
  const n = values.length;
  const s2 = variance(values);
  const g4 = bonettKurtosis(values);
  const z = normQuantile(1 - (1 - conf) / 2);
  const c = n / (n - z);
  const se = c * Math.sqrt(bonettVar(n, g4));
  const center = Math.log(c * s2);
  return {
    lo: Math.sqrt(Math.exp(center - z * se)),
    hi: Math.sqrt(Math.exp(center + z * se)),
    kurtosis: g4,
  };
}

// --------------------------------------------------------------------------
// Test de Levene (Brown-Forsythe: desviaciones respecto a la MEDIANA)
// --------------------------------------------------------------------------

function leveneTest(groups: number[][]): {
  statistic: number;
  pValue: number;
  df1: number;
  df2: number;
} {
  const k = groups.length;
  const N = groups.reduce((a, g) => a + g.length, 0);
  if (k < 2 || N - k <= 0) {
    return { statistic: NaN, pValue: NaN, df1: 0, df2: 0 };
  }

  const dev = groups.map((g) => {
    const md = median(g);
    return g.map((x) => Math.abs(x - md));
  });

  const grand = mean(dev.flat());
  let ssB = 0;
  let ssW = 0;
  for (const d of dev) {
    const m = mean(d);
    ssB += d.length * (m - grand) ** 2;
    for (const x of d) ssW += (x - m) ** 2;
  }

  const df1 = k - 1;
  const df2 = N - k;
  const statistic = ssW > 0 ? ssB / df1 / (ssW / df2) : NaN;
  const pValue = Number.isFinite(statistic) ? fPValue(statistic, df1, df2) : NaN;
  return { statistic, pValue, df1, df2 };
}

// --------------------------------------------------------------------------
// Comparaciones multiples de Bonett
// --------------------------------------------------------------------------

/**
 * Rama k = 2. Invierte la ecuacion de Bonett para dos varianzas.
 *
 * IMPORTANTE: los grupos se ordenan por varianza DESCENDENTE antes de
 * resolver. La ecuacion no es simetrica al orden; con Damper invertido el
 * resultado pasaba de 0,586 a 1,000.
 *
 * L(z) tiene un polo en z = min(n1, n2), donde vuelve a +infinito. Por eso el
 * bracket se expande desde 0,5 y se detiene en el primer cambio de signo, en
 * lugar de usar min(n1,n2) como extremo superior.
 */
function bonettMCTwoGroups(
  ga: number[],
  gb: number[]
): { p: number; stat: number } {
  let a = ga;
  let b = gb;
  if (variance(a) < variance(b)) {
    a = gb;
    b = ga;
  }
  const n1 = a.length;
  const n2 = b.length;
  const s1 = variance(a);
  const s2 = variance(b);
  const g4 = pooledKurtosis(a, b);
  const se = Math.sqrt(
    (g4 - (n1 - 3) / n1) / (n1 - 1) + (g4 - (n2 - 3) / n2) / (n2 - 1)
  );
  if (!Number.isFinite(se) || se <= 0) return { p: NaN, stat: NaN };

  const L = (z: number) =>
    Math.log(n1 / n2) + Math.log((n2 - z) / (n1 - z)) - z * se + Math.log(s1 / s2);

  const eps = 1e-12;
  if (L(eps) <= 0) return { p: 1, stat: 0 }; // varianzas practicamente iguales

  const cap = Math.min(n1, n2) * 0.999;
  let hi = 0.5;
  while (hi < cap && L(hi) > 0) hi *= 1.6;
  if (L(hi) > 0) return { p: 0, stat: Infinity };

  let lo = eps;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (L(mid) > 0) lo = mid;
    else hi = mid;
  }
  const zStar = (lo + hi) / 2;
  return { p: 2 * normSF(zStar), stat: zStar };
}

/**
 * Rama k > 2. Varianzas V_i por grupo a partir de las b_ij por pares, y
 * p_ij por el rango de k normales estandar. El p global es el minimo.
 *
 *   b_ij = (g4_ij - g_i)/(n_i - 1) + (g4_ij - g_j)/(n_j - 1)
 *   V_i  = [ (k-1) * sum_{j!=i} b_ij - sum_{j<l} b_jl ] / ((k-1)(k-2))
 *   Z_ij = (ln s_iÂ² - ln s_jÂ²) / sqrt(V_i + V_j)
 *   p_ij = P(R_k >= sqrt(2) * |Z_ij|)
 */
function bonettMCMultiGroups(groups: number[][]): { p: number; stat: number } {
  const k = groups.length;
  const n = groups.map((g) => g.length);
  const s2 = groups.map((g) => variance(g));

  // b_ij simetrica
  const b: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  let total = 0;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const g4 = pooledKurtosis(groups[i], groups[j]);
      const v =
        (g4 - (n[i] - 3) / n[i]) / (n[i] - 1) +
        (g4 - (n[j] - 3) / n[j]) / (n[j] - 1);
      b[i][j] = v;
      b[j][i] = v;
      total += v;
    }
  }

  const V = new Array(k).fill(0);
  for (let i = 0; i < k; i++) {
    let rowSum = 0;
    for (let j = 0; j < k; j++) if (j !== i) rowSum += b[i][j];
    V[i] = ((k - 1) * rowSum - total) / ((k - 1) * (k - 2));
  }

  let best = 1;
  let bestStat = NaN;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const den = V[i] + V[j];
      if (!(den > 0)) continue;
      const z = (Math.log(s2[i]) - Math.log(s2[j])) / Math.sqrt(den);
      const p = studentizedRangeSF(Math.SQRT2 * Math.abs(z), k);
      if (p < best) {
        best = p;
        bestStat = Math.abs(z);
      }
    }
  }
  return { p: best, stat: bestStat };
}

function multipleComparisons(groups: number[][]): { p: number; stat: number } {
  const k = groups.length;
  if (k < 2) return { p: NaN, stat: NaN };
  // La formula de V_i divide por (k-1)(k-2) = 0 si k = 2: rama obligatoria.
  if (k === 2) return bonettMCTwoGroups(groups[0], groups[1]);
  return bonettMCMultiGroups(groups);
}

// --------------------------------------------------------------------------
// Calculo principal
// --------------------------------------------------------------------------

export function computeEqVar(
  rawGroups: { name: string; values: number[] }[],
  opts: { responseName: string; factorName: string; alpha: number }
): EqVarModel {
  const base = {
    ...EMPTY_EQVAR,
    responseName: opts.responseName,
    factorName: opts.factorName,
    alpha: opts.alpha,
  };

  const groups = rawGroups
    .map((g) => ({ name: g.name, values: g.values.filter((x) => Number.isFinite(x)) }))
    .filter((g) => g.values.length > 0);

  if (groups.length < 2) {
    return { ...base, error: "At least two levels with data are required." };
  }
  const small = groups.find((g) => g.values.length < 3);
  if (small) {
    return {
      ...base,
      error:
        `Level "${small.name}" has ${small.values.length} observations. ` +
        "At least 3 per level are required.",
    };
  }

  const k = groups.length;
  // Bonferroni: cada IC se construye al nivel 1 - alpha/k.
  const individualLevel = 1 - opts.alpha / k;

  const parts = groups.map((g) => ({
    n: g.values.length,
    s2: variance(g.values),
    g4: bonettKurtosis(g.values),
  }));

  const mc = multipleComparisons(groups.map((g) => g.values));
  const lev = leveneTest(groups.map((g) => g.values));

  // --- Intervalos de comparacion multiple, para el grafico ---
  // Construidos por EQUIVALENCIA con el test: las semianchuras h_i en escala
  // log-varianza cumplen sum(h_i) = z * sqrt(sum a_iÂ²), con a_i = c_i*sqrt(v_i),
  // de modo que dos intervalos se solapan si y solo si el par no es
  // significativo a alpha. Es la propiedad que anuncia el pie de la grafica.
  // El reparto interno es proporcional a a_i (recalibrado con k = 3, ppm
  // defective); solo afecta al aspecto visual, no al criterio.
  const zMC = normQuantile(1 - opts.alpha / 2);
  const vAll = parts.map((p) => bonettVar(p.n, p.g4));
  const cAll = parts.map((p) => p.n / (p.n - zMC));

  const aAll = parts.map((_, i) => cAll[i] * Math.sqrt(vAll[i]));
  const hTotal = zMC * Math.sqrt(aAll.reduce((s, v) => s + v * v, 0));
  const wAll = aAll;
  const wSum = wAll.reduce((s, v) => s + v, 0);

  const out: EqVarGroupResult[] = groups.map((g, i) => {
    const p = parts[i];
    const ci = bonettCI(g.values, individualLevel);
    const center = Math.log(cAll[i] * p.s2);
    const h = wSum > 0 ? (hTotal * wAll[i]) / wSum : 0;
    return {
      name: g.name,
      n: p.n,
      stdev: Math.sqrt(p.s2),
      variance: p.s2,
      ciLo: ci.lo,
      ciHi: ci.hi,
      mcLo: Math.sqrt(Math.exp(center - h)),
      mcHi: Math.sqrt(Math.exp(center + h)),
      kurtosis: ci.kurtosis,
      values: g.values,
    };
  });

  return {
    ...base,
    ok: true,
    error: undefined,
    individualLevel,
    groups: out,
    mcPValue: mc.p,
    mcStatistic: mc.stat,
    mcSmallSample: parts.some((p) => p.n < 20),
    leveneStatistic: lev.statistic,
    levenePValue: lev.pValue,
    leveneDf1: lev.df1,
    leveneDf2: lev.df2,
    allValues: groups.flatMap((g) => g.values),
  };
}
