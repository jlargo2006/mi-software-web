// app/app/six-sigma/studies/pss1samplet/compute.ts
import type { ColumnSnapshot } from "../types";
import { nctCdf, tQuantile } from "./mathutil";
import type {
  Alternative,
  Pss1SampleTParams,
  Pss1SampleTResult,
  PssCurve,
  PssRow,
  SolveFor,
} from "./types";

/* ---------- parser de rangos ---------- */

/**
 * Acepta:
 *   "20"          -> [20]
 *   "10 20 30"    -> [10,20,30]   (espacios, comas o punto y coma)
 *   "10:40/5"     -> [10,15,...,40]
 *   "10:40"       -> paso 1
 * Coma decimal admitida en valores sueltos ("0,5") salvo que actue de separador.
 */
export function parseRange(raw: string): { values: number[]; error?: string } {
  const s = (raw ?? "").trim();
  if (s === "") return { values: [] };

  const out: number[] = [];
  // Si hay ":" tratamos cada token como posible rango.
  const tokens = s.split(/[\s;]+/).filter((t) => t !== "");

  for (const tok0 of tokens) {
    // Una coma que separa dos numeros enteros/decimales -> separador de lista.
    const subTokens = tok0.includes(":") ? [tok0] : tok0.split(",").filter((t) => t !== "");
    // Caso "0,5" (decimal): dos trozos que juntos forman un decimal valido.
    const rejoined = subTokens.join(",");
    const asDecimal = Number(rejoined.replace(",", "."));
    const useDecimal = subTokens.length === 2 && Number.isFinite(asDecimal);

    const parts = useDecimal ? [rejoined] : subTokens;

    for (const tok of parts) {
      if (tok.includes(":")) {
        const [rangePart, stepPart] = tok.split("/");
        const [aS, bS] = rangePart.split(":");
        const a = Number(aS.replace(",", "."));
        const b = Number(bS.replace(",", "."));
        const step =
          stepPart === undefined ? 1 : Number(stepPart.replace(",", "."));
        if (!Number.isFinite(a) || !Number.isFinite(b))
          return { values: [], error: `Invalid range "${tok}".` };
        if (!Number.isFinite(step) || step <= 0)
          return { values: [], error: `Invalid step in "${tok}".` };
        if (b < a) return { values: [], error: `Range "${tok}" is decreasing.` };
        const k = Math.floor((b - a) / step + 1e-9);
        for (let i = 0; i <= k; i++) out.push(a + i * step);
      } else {
        const v = Number(tok.replace(",", "."));
        if (!Number.isFinite(v)) return { values: [], error: `Invalid value "${tok}".` };
        out.push(v);
      }
    }
  }

  const uniq = [...new Set(out.map((v) => Number(v.toFixed(10))))];
  uniq.sort((a, b) => a - b);
  return { values: uniq };
}

/* ---------- potencia ---------- */

/** Potencia del test t de una muestra. */
export function powerOf(
  n: number,
  diff: number,
  sd: number,
  alpha: number,
  alt: Alternative
): number {
  if (n < 2 || sd <= 0) return NaN;
  const df = n - 1;
  const ncp = (diff / sd) * Math.sqrt(n);

  if (alt === "two-sided") {
    const tc = tQuantile(1 - alpha / 2, df);
    const upper = 1 - nctCdf(tc, df, ncp);
    const lower = nctCdf(-tc, df, ncp);
    return Math.min(1, Math.max(0, upper + lower));
  }
  if (alt === "greater") {
    const tc = tQuantile(1 - alpha, df);
    return Math.min(1, Math.max(0, 1 - nctCdf(tc, df, ncp)));
  }
  const tc = tQuantile(alpha, df);
  return Math.min(1, Math.max(0, nctCdf(tc, df, ncp)));
}

/** Diferencia que alcanza una potencia dada, por biseccion. */
function solveDifference(
  n: number,
  target: number,
  sd: number,
  alpha: number,
  alt: Alternative
): number | null {
  const sign = alt === "less" ? -1 : 1;
  let lo = 0;
  let hi = sd * 10;
  if (powerOf(n, sign * hi, sd, alpha, alt) < target) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (powerOf(n, sign * mid, sd, alpha, alt) < target) lo = mid;
    else hi = mid;
  }
  return sign * ((lo + hi) / 2);
}

/** Menor n entero que alcanza la potencia objetivo. */
function solveSize(
  diff: number,
  target: number,
  sd: number,
  alpha: number,
  alt: Alternative
): number | null {
  const MAX = 100000;
  let lo = 2;
  let hi = 2;
  while (powerOf(hi, diff, sd, alpha, alt) < target) {
    hi *= 2;
    if (hi > MAX) return null;
  }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (powerOf(mid, diff, sd, alpha, alt) < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/* ---------- estudio ---------- */

export function computePss1SampleT(
  _data: ColumnSnapshot,
  params: Pss1SampleTParams
): Pss1SampleTResult {
  const empty = (error: string): Pss1SampleTResult => ({
    ok: false,
    error,
    solveFor: "difference",
    alpha: params.alpha,
    sd: NaN,
    alternative: params.alternative,
    rows: [],
    curves: [],
    markers: [],
    notes: [],
  });

  const sd = Number((params.sd ?? "").trim().replace(",", "."));
  if (!Number.isFinite(sd) || sd <= 0)
    return empty("Standard deviation must be a positive number.");

  const alpha = params.alpha;
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 1)
    return empty("Significance level must be between 0 and 1.");

  const alt = params.alternative;

  const pn = parseRange(params.sampleSizes);
  const pd = parseRange(params.differences);
  const pp = parseRange(params.powerValues);

  const perr = pn.error ?? pd.error ?? pp.error;
  if (perr) return empty(perr);

  const filled = [pn.values.length > 0, pd.values.length > 0, pp.values.length > 0];
  const nFilled = filled.filter(Boolean).length;

  if (nFilled < 2)
    return empty("Fill in exactly two of: sample sizes, differences, power values.");
  if (nFilled === 3)
    return empty(
      "Leave one of the three fields blank. That is the quantity to be calculated."
    );

  const solveFor: SolveFor = !filled[0] ? "size" : !filled[1] ? "difference" : "power";

  if (pn.values.some((v) => v < 2 || !Number.isInteger(v)))
    return empty("Sample sizes must be integers of 2 or more.");
  if (pp.values.some((v) => v <= 0 || v >= 1))
    return empty("Power values must be strictly between 0 and 1.");
  if (pd.values.some((v) => v === 0))
    return empty("Differences must be non-zero.");
  if (alt === "greater" && pd.values.some((v) => v < 0))
    return empty("With a 'greater than' alternative, differences must be positive.");
  if (alt === "less" && pd.values.some((v) => v > 0))
    return empty("With a 'less than' alternative, differences must be negative.");

  const rows: PssRow[] = [];
  const notes: string[] = [];

  if (solveFor === "difference") {
    for (const n of pn.values)
      for (const pw of pp.values) {
        const d = solveDifference(n, pw, sd, alpha, alt);
        if (d === null) {
          notes.push(`No difference below 10 standard deviations reaches power ${pw} with n = ${n}.`);
          continue;
        }
        rows.push({ n, difference: d, targetPower: null, power: pw });
      }
  } else if (solveFor === "power") {
    for (const n of pn.values)
      for (const d of pd.values)
        rows.push({ n, difference: d, targetPower: null, power: powerOf(n, d, sd, alpha, alt) });
  } else {
    for (const d of pd.values)
      for (const pw of pp.values) {
        const n = solveSize(d, pw, sd, alpha, alt);
        if (n === null) {
          notes.push(`Required sample size for difference ${d} at power ${pw} exceeds 100000.`);
          continue;
        }
        rows.push({ n, difference: d, targetPower: pw, power: powerOf(n, d, sd, alpha, alt) });
      }
  }

  if (rows.length === 0) return empty("No results could be computed with these inputs.");

  /* --- curvas de potencia --- */
  const sizes = [...new Set(rows.map((r) => r.n))].sort((a, b) => a - b);
  const absMax = Math.max(...rows.map((r) => Math.abs(r.difference)));
  const span = absMax * 1.6;
  const sign = alt === "less" ? -1 : 1;

  const STEPS = 80;
  const curves: PssCurve[] = sizes.map((n) => {
    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const d = sign * (span * i) / STEPS;
      x.push(d);
      y.push(powerOf(n, d, sd, alpha, alt));
    }
    return { n, x, y };
  });

  const markers = rows.map((r) => ({ x: r.difference, y: r.power }));

  rows.sort((a, b) => a.n - b.n || Math.abs(a.difference) - Math.abs(b.difference));

  return {
    ok: true,
    solveFor,
    alpha,
    sd,
    alternative: alt,
    rows,
    curves,
    markers,
    notes,
  };
}
