// app/app/six-sigma/studies/ht/wilcoxon/compute.ts
import type { ColumnSnapshot } from "../../types";
import { wilcoxonSignedRank } from "../../../lib/wilcoxon";
import type { HTWilcoxonParams, HTWilcoxonResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHTWilcoxon(
  data: ColumnSnapshot,
  params: HTWilcoxonParams
): HTWilcoxonResult {
  const c = params.column;
  const col = c ? data[c] : undefined;

  if (!c || !col) {
    return wilcoxonSignedRank({
      column: c ?? "",
      raw: [],
      eta0: NaN,
      alternative: params.alternative,
      confLevel: NaN,
      performTest: false,
      performCI: false,
    });
  }

  return wilcoxonSignedRank({
    column: c,
    raw: col.values,
    eta0: num(params.hypothesizedMedian),
    alternative: params.alternative,
    confLevel: num(params.confidenceLevel),
    performTest: params.performTest,
    performCI: params.performCI,
  });
}
