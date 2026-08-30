// app/app/six-sigma/studies/capability/iddist/compute.ts
import type { ColumnSnapshot } from "../../types";
import { toNumericCells } from "../../../lib/stats";
import {
  FAMILY_ORDER,
  boxcoxLambda,
  fitFamily,
  fitJohnson,
  type FamilyFit,
  type FamilyId,
  type FitContext,
} from "./families";
import type { Descriptives, IdDistParams, IdDistResult } from "./types";

const fail = (error: string): IdDistResult => ({ ok: false, error });

const parseNum = (s: string, dflt: number): number => {
  const t = s.trim().replace(",", ".");
  if (t === "") return dflt;
  const v = Number(t);
  return Number.isFinite(v) ? v : dflt;
};

/** Redondeo al valor de lambda "comodo" mas proximo, como el de Minitab. */
const NICE_LAMBDA = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
const roundLambda = (lam: number): number =>
  NICE_LAMBDA.reduce((b, v) => (Math.abs(v - lam) < Math.abs(b - lam) ? v : b), 0);

function describe(x: number[], nMissing: number): Descriptives {
  const n = x.length;
  const s = [...x].sort((a, b) => a - b);
  const mean = x.reduce((t, v) => t + v, 0) / n;
  const m2 = x.reduce((t, v) => t + (v - mean) ** 2, 0);
  const sd = Math.sqrt(m2 / (n - 1));
  const median =
    n % 2 === 1 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;

  // Asimetria y curtosis con la correccion por muestra que usa Minitab.
  const z3 = x.reduce((t, v) => t + ((v - mean) / sd) ** 3, 0);
  const z4 = x.reduce((t, v) => t + ((v - mean) / sd) ** 4, 0);
  const skewness = (n / ((n - 1) * (n - 2))) * z3;
  const kurtosis =
    ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * z4 -
    (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));

  return {
    n,
    nMissing,
    mean,
    sd,
    median,
    min: s[0],
    max: s[n - 1],
    skewness,
    kurtosis,
  };
}

export function computeIdDist(
  data: ColumnSnapshot,
  params: IdDistParams
): IdDistResult {
  const name = params.col?.trim() ?? "";
  if (name === "") return fail("Select the measurement column.");
  const col = data[name];
  if (!col) return fail(`Column "${name}" does not exist.`);

  const rawCells = col.values ?? [];
  const values = toNumericCells(rawCells);
  const nMissing =
    rawCells.filter((c) => String(c ?? "").trim() !== "").length - values.length;

  if (values.length < 20) {
    return fail(
      "At least twenty observations are needed: comparing sixteen models on fewer would rank noise."
    );
  }

  const x = values;
  const n = x.length;
  const sorted = [...x].sort((a, b) => a - b);
  const positive = sorted[0] > 0;

  // --- Transformaciones, que se calculan una sola vez -------------------
  let bcLambda: number | null = null;
  if (positive) {
    const lo = parseNum(params.bcLo, -5);
    const hi = parseNum(params.bcHi, 5);
    const raw = boxcoxLambda(x, Math.min(lo, hi), Math.max(lo, hi));
    bcLambda = params.bcRound ? roundLambda(raw) : raw;
  }
  const johnson = fitJohnson(x);

  const ctx: FitContext = { x, sorted, n, bcLambda, johnson };

  const wanted: FamilyId[] =
    params.families && params.families.length > 0
      ? FAMILY_ORDER.filter((id) => params.families!.includes(id))
      : FAMILY_ORDER;

  const fits: FamilyFit[] = wanted.map((id) => fitFamily(id, ctx));

  // El mejor ajuste se elige por Anderson-Darling entre los que convergieron.
  // Un AD menor no obliga a nada: si la fisica del proceso senala una familia,
  // manda la fisica. Pero conviene ver quien gana.
  const usable = fits.filter((f) => f.ok && Number.isFinite(f.ad));
  const best =
    usable.length > 0
      ? usable.reduce((b, f) => (f.ad < b.ad ? f : b), usable[0])
      : null;

  return {
    ok: true,
    colName: col.name ?? name,
    desc: describe(x, nMissing),
    fits,
    best,
    boxcoxLambda: bcLambda,
    johnsonText: johnson ? johnson.text : null,
    values: x,
  };
}
