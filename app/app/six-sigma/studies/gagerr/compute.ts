// app/app/six-sigma/studies/gagerr/compute.ts
import type { ColumnSnapshot } from "../types";
import { computeGageRR } from "../../lib/gagerr";
import type { GageRRParams, GageRRResult } from "./types";

export function computeGageRRStudy(
  data: ColumnSnapshot,
  params: GageRRParams
): GageRRResult {
  const empty: GageRRResult = {
    ok: false,
    error: "Select the Part, Operator and Measurement columns.",
    parts: [], operators: [], reps: 0, cells: [],
    anovaWith: [], anovaWithout: [], interactionRemoved: false,
    alpha: params.alphaInteraction,
    varComps: [], evaluation: [], totalVar: 0, ndc: 0,
    tolerance: null, cellMeans: new Map(),
  };

  const { partCol, operatorCol, measCol } = params;
  if (!partCol || !operatorCol || !measCol) return empty;

  const p = data[partCol], o = data[operatorCol], m = data[measCol];
  if (!p || !o || !m) return empty;

  const tolNum = params.tolerance.trim()
    ? Number(params.tolerance.replace(",", "."))
    : null;
  const tolerance = tolNum !== null && Number.isFinite(tolNum) && tolNum > 0 ? tolNum : null;

  return computeGageRR(
    p.values, o.values, m.values,
    params.alphaInteraction,
    tolerance
  );
}
