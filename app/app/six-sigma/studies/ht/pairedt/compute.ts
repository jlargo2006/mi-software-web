// app/app/six-sigma/studies/ht/pairedt/compute.ts
import type { ColumnSnapshot } from "../../types";
import { tPaired } from "../../../lib/tPaired";
import type { HTPairedTParams, HTPairedTResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHTPairedT(
  data: ColumnSnapshot,
  params: HTPairedTParams
): HTPairedTResult {
  const cx = params.columnX;
  const cy = params.columnY;
  const a = cx ? data[cx] : undefined;
  const b = cy ? data[cy] : undefined;

  if (!cx || !cy || !a || !b) {
    return tPaired({
      colX: cx ?? "",
      colY: cy ?? "",
      rawX: [],
      rawY: [],
      confLevel: NaN,
      performTest: false,
      mu0: NaN,
      alternative: params.alternative,
    });
  }

  return tPaired({
    colX: cx,
    colY: cy,
    rawX: a.values,
    rawY: b.values,
    confLevel: num(params.confidenceLevel),
    performTest: params.performTest,
    mu0: num(params.hypothesizedDifference),
    alternative: params.alternative,
  });
}
