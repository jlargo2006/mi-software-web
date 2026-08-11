// app/app/six-sigma/studies/ht/mannwhitney/compute.ts
import type { ColumnSnapshot } from "../../types";
import { mannWhitney } from "../../../lib/mannWhitney";
import type { HTMannWhitneyParams, HTMannWhitneyResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHTMannWhitney(
  data: ColumnSnapshot,
  params: HTMannWhitneyParams
): HTMannWhitneyResult {
  const cx = params.columnX;
  const cy = params.columnY;
  const a = cx ? data[cx] : undefined;
  const b = cy ? data[cy] : undefined;

  if (!cx || !cy || !a || !b) {
    return mannWhitney({
      colX: cx ?? "",
      colY: cy ?? "",
      rawX: [],
      rawY: [],
      eta0: NaN,
      alternative: params.alternative,
      confLevel: NaN,
      performTest: false,
    });
  }

  return mannWhitney({
    colX: cx,
    colY: cy,
    rawX: a.values,
    rawY: b.values,
    eta0: num(params.hypothesizedDifference),
    alternative: params.alternative,
    confLevel: num(params.confidenceLevel),
    performTest: params.performTest,
  });
}
