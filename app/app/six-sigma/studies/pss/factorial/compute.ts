// app/app/six-sigma/studies/pss/factorial/compute.ts
import type { ColumnSnapshot } from "../../types";
import { nctCdf, tQuantile } from "../_shared/mathutil";
import type { PssFactParams, PssFactResult, PssFactRow } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

/** Lista separada por espacios, comas o punto y coma. */
const parseList = (s: string): number[] =>
  s
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t !== "")
    .map((t) => Number(t.replace(",", ".")));

const fail = (error: string): PssFactResult => ({ ok: false, error });

/** Tope de replicas al despejarlas: por encima el diseno es impracticable. */
const MAX_REPS = 200;

/**
 * Grados de libertad del error.
 *
 * Se descuentan los terminos del modelo (uno por punto de esquina del diseno
 * base, constante incluida), los que consumen los bloques, y uno mas por el
 * termino de curvatura que aportan los puntos centrales.
 */
export function errorDf(
  cornerPoints: number,
  reps: number,
  centerPoints: number,
  blocks: number,
  termsOmitted: number
): number {
  const nTotal = cornerPoints * reps + centerPoints * blocks;
  const terms = cornerPoints - termsOmitted;
  return nTotal - terms - (blocks - 1) - (centerPoints > 0 ? 1 : 0);
}

/**
 * Potencia del contraste t bilateral de un efecto.
 *
 * Los puntos centrales NO intervienen en la estimacion del efecto: solo
 * aportan grados de libertad al error. Por eso el parametro de no centralidad
 * usa unicamente las corridas de las esquinas.
 */
export function powerOf(
  cornerPoints: number,
  reps: number,
  centerPoints: number,
  blocks: number,
  termsOmitted: number,
  effect: number,
  sd: number,
  alpha: number
): number {
  const df = errorDf(cornerPoints, reps, centerPoints, blocks, termsOmitted);
  if (df < 1 || sd <= 0) return NaN;
  const cornerRuns = cornerPoints * reps;
  const ncp = (Math.abs(effect) * Math.sqrt(cornerRuns)) / (2 * sd);
  const tc = tQuantile(1 - alpha / 2, df);
  const p = 1 - nctCdf(tc, df, ncp) + nctCdf(-tc, df, ncp);
  return Math.min(1, Math.max(0, p));
}

/** Menor numero de replicas que alcanza la potencia pedida. */
function solveReps(
  cornerPoints: number,
  centerPoints: number,
  blocks: number,
  termsOmitted: number,
  effect: number,
  sd: number,
  alpha: number,
  target: number
): number | null {
  for (let r = 1; r <= MAX_REPS; r++) {
    const p = powerOf(
      cornerPoints,
      r,
      centerPoints,
      blocks,
      termsOmitted,
      effect,
      sd,
      alpha
    );
    if (Number.isFinite(p) && p >= target) return r;
  }
  return null;
}

/** Efecto detectable, por biseccion sobre una funcion monotona. */
function solveEffect(
  cornerPoints: number,
  reps: number,
  centerPoints: number,
  blocks: number,
  termsOmitted: number,
  sd: number,
  alpha: number,
  target: number
): number | null {
  const f = (e: number) =>
    powerOf(cornerPoints, reps, centerPoints, blocks, termsOmitted, e, sd, alpha);
  if (!Number.isFinite(f(1))) return null;

  let lo = 0;
  let hi = Math.max(1, sd) * 10;
  let guard = 0;
  while (f(hi) < target && guard++ < 60) hi *= 2;
  if (f(hi) < target) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < target) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-10) break;
  }
  return (lo + hi) / 2;
}

export function computePssFact(
  _data: ColumnSnapshot,
  params: PssFactParams
): PssFactResult {
  const k = num(params.numFactors);
  if (!Number.isInteger(k) || k < 2 || k > 15) {
    return fail("The number of factors must be a whole number from 2 to 15.");
  }

  const corner = num(params.cornerPoints);
  if (!Number.isInteger(corner) || corner < 4) {
    return fail("The number of corner points must be a whole number of at least 4.");
  }
  if ((corner & (corner - 1)) !== 0) {
    return fail("The number of corner points must be a power of two: 4, 8, 16, 32...");
  }
  if (corner > Math.pow(2, k)) {
    return fail(
      `With ${k} factors the full factorial has ${Math.pow(2, k)} corner points; ` +
        `${corner} is more than that.`
    );
  }

  const blocksTxt = params.blocks.trim().toLowerCase();
  const blocks = blocksTxt === "none" || blocksTxt === "" ? 1 : num(params.blocks);
  if (!Number.isInteger(blocks) || blocks < 1 || (blocks & (blocks - 1)) !== 0) {
    return fail("The number of blocks must be 'none' or a power of two.");
  }
  if (blocks > corner / 2) {
    return fail(`With ${corner} corner points the maximum number of blocks is ${corner / 2}.`);
  }

  const omitted = num(params.termsOmitted);
  if (!Number.isInteger(omitted) || omitted < 0 || omitted >= corner) {
    return fail(`Terms omitted must be a whole number from 0 to ${corner - 1}.`);
  }

  const sd = num(params.sd);
  if (!(sd > 0)) return fail("The standard deviation must be greater than zero.");

  const alpha = num(params.alpha);
  if (!(alpha > 0 && alpha < 1)) return fail("Alpha must be between 0 and 1.");

  const centerList = parseList(params.centerPoints);
  const cps = centerList.length > 0 ? centerList : [0];
  for (const c of cps) {
    if (!Number.isInteger(c) || c < 0 || c > 50) {
      return fail("Center points per block must be whole numbers from 0 to 50.");
    }
  }

  const repsList = parseList(params.replicates);
  const effList = parseList(params.effects);
  const powList = parseList(params.powerValues);

  for (const e of effList) {
    if (!Number.isFinite(e)) return fail("The effects list has a non-numeric value.");
  }
  for (const p of powList) {
    if (!(p > 0 && p < 1)) return fail("Power values must be strictly between 0 and 1.");
  }
  for (const r of repsList) {
    if (!Number.isInteger(r) || r < 1) {
      return fail("Replicates must be whole numbers of at least 1.");
    }
  }

  // --- Filas -----------------------------------------------------------------
  const rows: PssFactRow[] = [];

  const push = (cp: number, effect: number, reps: number, target: number) => {
    const df = errorDf(corner, reps, cp, blocks, omitted);
    const actual = powerOf(corner, reps, cp, blocks, omitted, effect, sd, alpha);
    rows.push({
      centerPoints: cp,
      effect,
      reps,
      totalRuns: corner * reps + cp * blocks,
      targetPower: target,
      actualPower: actual,
      df,
      cornerRuns: corner * reps,
      saturated: df < 1,
    });
  };

  if (params.solveFor === "reps") {
    if (effList.length === 0 || powList.length === 0) {
      return fail("To solve for replicates, give both the effects and the power values.");
    }
    for (const cp of cps) {
      for (const e of effList) {
        for (const target of powList) {
          const r = solveReps(corner, cp, blocks, omitted, e, sd, alpha, target);
          if (r === null) {
            return fail(
              `No number of replicates up to ${MAX_REPS} reaches a power of ` +
                `${target} for an effect of ${e}. Increase the effect, or accept less power.`
            );
          }
          push(cp, e, r, target);
        }
      }
    }
  } else if (params.solveFor === "effect") {
    if (repsList.length === 0 || powList.length === 0) {
      return fail("To solve for effects, give both the replicates and the power values.");
    }
    for (const cp of cps) {
      for (const r of repsList) {
        for (const target of powList) {
          if (errorDf(corner, r, cp, blocks, omitted) < 1) {
            return fail(
              `With ${r} replicate(s) and ${cp} center point(s) the design is saturated: ` +
                `there are no degrees of freedom left for error. Add replicates or center points.`
            );
          }
          const e = solveEffect(corner, r, cp, blocks, omitted, sd, alpha, target);
          if (e === null) {
            return fail(`No detectable effect reaches a power of ${target}.`);
          }
          push(cp, e, r, target);
        }
      }
    }
  } else {
    if (repsList.length === 0 || effList.length === 0) {
      return fail("To solve for power, give both the replicates and the effects.");
    }
    for (const cp of cps) {
      for (const r of repsList) {
        for (const e of effList) {
          push(cp, e, r, NaN);
        }
      }
    }
  }

  if (rows.length === 0) return fail("Nothing to compute with these values.");

  const bad = rows.find((r) => r.saturated);
  if (bad) {
    return fail(
      `With ${bad.reps} replicate(s), ${bad.centerPoints} center point(s) and ` +
        `${corner} corner points the design is saturated: every run is spent estimating ` +
        `terms and none is left for error. Add a replicate, add center points, or omit ` +
        `some high-order terms from the model.`
    );
  }

  // --- Curvas ----------------------------------------------------------------
  // Una por combinacion distinta de replicas y puntos centrales, sobre el
  // recorrido de efectos que interesa, y simetrica porque el contraste lo es.
  const maxEff = Math.max(...rows.map((r) => Math.abs(r.effect)), sd) * 1.25;
  const combos = new Map<string, { reps: number; cp: number }>();
  rows.forEach((r) => combos.set(`${r.reps}|${r.centerPoints}`, {
    reps: r.reps,
    cp: r.centerPoints,
  }));

  const STEPS = 121;
  const curves = [...combos.values()].map(({ reps, cp }) => {
    const points = Array.from({ length: STEPS }, (_, i) => {
      const effect = -maxEff + (2 * maxEff * i) / (STEPS - 1);
      return {
        effect,
        power: powerOf(corner, reps, cp, blocks, omitted, effect, sd, alpha),
      };
    });
    return { label: `${reps}; ${cp}`, reps, cp, points };
  });

  return {
    ok: true,
    numFactors: k,
    cornerPoints: corner,
    blocksLabel: blocks === 1 ? "none" : String(blocks),
    blocks,
    termsOmitted: omitted,
    sd,
    alpha,
    solveFor: params.solveFor,
    rows,
    curves,
    markers: rows.map((r) => ({ effect: r.effect, power: r.actualPower })),
    showCurve: params.showCurve,
  };
}
