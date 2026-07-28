// app/app/six-sigma/studies/pss/_shared/engine.ts
import { parseRange, parsePositive } from "./rangeParser";
import type {
  Alternative,
  PssBaseParams,
  PssCore,
  PssCurve,
  PssRow,
  SolveFor,
} from "./types";

/** Lo unico que cada estudio debe aportar. */
export interface PssSpec {
  powerOf: (n: number, diff: number, sd: number, alpha: number, alt: Alternative) => number;
  minN: number;
  sizeLabel?: string;
  /** Los tests basados en proporciones no usan desviacion tipica. */
  requiresSd?: boolean;
  /** Cota superior de |diferencia|; por defecto 10 desviaciones tipicas. */
  maxAbsDiff?: number;
  /**
   * false para tests exactos: su potencia es dentada en n y la biseccion
   * no es valida. Fuerza un barrido ascendente.
   */
  monotoneInN?: boolean;
  /**
   * Rejilla de la curva en unidades de "diferencia". Si se omite, se usa
   * el span derivado de las diferencias solicitadas.
   */
  curveDomain?: (diffs: number[]) => [number, number];
}

export type PssRun =
  | { ok: false; error: string }
  | ({ ok: true } & PssCore);

const MAX_N = 100000;
const SD_MULT = 10; // cota de biseccion, en desviaciones tipicas
const CURVE_STEPS = 80;

/** Diferencia que alcanza una potencia dada, por biseccion. */
function solveDifference(
  spec: PssSpec,
  n: number,
  target: number,
  sd: number,
  alpha: number,
  alt: Alternative
): number | null {
  const sign = alt === "less" ? -1 : 1;
  let lo = 0;
  let hi = spec.maxAbsDiff ?? sd * SD_MULT;
  if (spec.powerOf(n, sign * hi, sd, alpha, alt) < target) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (spec.powerOf(n, sign * mid, sd, alpha, alt) < target) lo = mid;
    else hi = mid;
  }
  return sign * ((lo + hi) / 2);
}

/** Menor n entero que alcanza la potencia objetivo. */
function solveSize(
  spec: PssSpec,
  diff: number,
  target: number,
  sd: number,
  alpha: number,
  alt: Alternative
): number | null {
  // Test exacto: potencia dentada, hay que barrer.
  if (spec.monotoneInN === false) {
    for (let n = spec.minN; n <= MAX_N; n++)
      if (spec.powerOf(n, diff, sd, alpha, alt) >= target) return n;
    return null;
  }

  let lo = spec.minN;
  let hi = spec.minN;
  while (spec.powerOf(hi, diff, sd, alpha, alt) < target) {
    hi *= 2;
    if (hi > MAX_N) return null;
  }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (spec.powerOf(mid, diff, sd, alpha, alt) < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}


/**
 * Ejecuta el estudio: valida los parametros comunes, deduce cual de los tres
 * campos es la incognita y la resuelve usando la potencia del spec.
 */
export function runPss(spec: PssSpec, params: PssBaseParams): PssRun {
  const sizeLabel = spec.sizeLabel ?? "Sample sizes";

  const sd = parsePositive(params.sd);
  if (spec.requiresSd !== false && (!Number.isFinite(sd) || sd <= 0))
    return { ok: false, error: "Standard deviation must be a positive number." };

  const alpha = params.alpha;
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 1)
    return { ok: false, error: "Significance level must be between 0 and 1." };

  const alt = params.alternative;

  const pn = parseRange(params.sampleSizes);
  const pd = parseRange(params.differences);
  const pp = parseRange(params.powerValues);

  const perr = pn.error ?? pd.error ?? pp.error;
  if (perr) return { ok: false, error: perr };

  const filled = [pn.values.length > 0, pd.values.length > 0, pp.values.length > 0];
  const nFilled = filled.filter(Boolean).length;
 
  if (nFilled < 2)
    return {
      ok: false,
      error: "Fill in exactly two of: sample sizes, differences, power values.",
    };
  if (nFilled === 3)
    return {
      ok: false,
      error:
        "Leave one of the three fields blank. That is the quantity to be calculated.",
    };

  const solveFor: SolveFor = !filled[0] ? "size" : !filled[1] ? "difference" : "power";

  if (pn.values.some((v) => v < spec.minN || !Number.isInteger(v)))
    return {
      ok: false,
      error: `${sizeLabel} must be integers of ${spec.minN} or more.`,
    };
  if (pp.values.some((v) => v <= 0 || v >= 1))
    return { ok: false, error: "Power values must be strictly between 0 and 1." };
  if (pd.values.some((v) => v === 0))
    return { ok: false, error: "Differences must be non-zero." };
  if (alt === "greater" && pd.values.some((v) => v < 0))
    return {
      ok: false,
      error: "With a 'greater than' alternative, differences must be positive.",
    };
  if (alt === "less" && pd.values.some((v) => v > 0))
    return {
      ok: false,
      error: "With a 'less than' alternative, differences must be negative.",
    };

  const rows: PssRow[] = [];
  const notes: string[] = [];

  if (solveFor === "difference") {
    for (const n of pn.values)
      for (const pw of pp.values) {
        const d = solveDifference(spec, n, pw, sd, alpha, alt);
        if (d === null) {
          notes.push(
            `No difference below ${SD_MULT} standard deviations reaches power ${pw} with n = ${n}.`
          );
          continue;
        }
        rows.push({ n, difference: d, targetPower: null, power: pw });
      }
  } else if (solveFor === "power") {
    for (const n of pn.values)
      for (const d of pd.values)
        rows.push({
          n,
          difference: d,
          targetPower: null,
          power: spec.powerOf(n, d, sd, alpha, alt),
        });
  } else {
    for (const d of pd.values)
      for (const pw of pp.values) {
        const n = solveSize(spec, d, pw, sd, alpha, alt);
        if (n === null) {
          notes.push(
            `Required sample size for difference ${d} at power ${pw} exceeds ${MAX_N}.`
          );
          continue;
        }
        rows.push({
          n,
          difference: d,
          targetPower: pw,
          power: spec.powerOf(n, d, sd, alpha, alt),
        });
      }
  }

  if (rows.length === 0)
    return { ok: false, error: "No results could be computed with these inputs." };

  /* --- curvas de potencia --- */
  const sizes = [...new Set(rows.map((r) => r.n))].sort((a, b) => a - b);
  const rawSpan = Math.max(...rows.map((r) => Math.abs(r.difference))) * 1.6;
  const clamped = spec.maxAbsDiff ? Math.min(rawSpan, spec.maxAbsDiff) : rawSpan;

  /* Por defecto la curva va de 0 hacia el lado de la alternativa, como antes.
     Un estudio puede declarar otro dominio (proporciones: todo (0,1)). */
  const sign = alt === "less" ? -1 : 1;
  const [xLo, xHi] = spec.curveDomain
    ? spec.curveDomain(rows.map((r) => r.difference))
    : sign < 0
      ? [-clamped, 0]
      : [0, clamped];

  const curves: PssCurve[] = sizes.map((n) => {
    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i <= CURVE_STEPS; i++) {
      const d = xLo + ((xHi - xLo) * i) / CURVE_STEPS;
      x.push(d);
      y.push(spec.powerOf(n, d, sd, alpha, alt));
    }
    return { n, x, y };
  });


  const markers = rows.map((r) => ({ x: r.difference, y: r.power }));

  rows.sort((a, b) => a.n - b.n || Math.abs(a.difference) - Math.abs(b.difference));

  return { ok: true, solveFor, alpha, sd, alternative: alt, rows, curves, markers, notes };
}

/** Resultado vacio con el error, para el camino de fallo de cada estudio. */
export function emptyCore(params: PssBaseParams): PssCore {
  return {
    solveFor: "difference",
    alpha: params.alpha,
    sd: NaN,
    alternative: params.alternative,
    rows: [],
    curves: [],
    markers: [],
    notes: [],
  };
}
