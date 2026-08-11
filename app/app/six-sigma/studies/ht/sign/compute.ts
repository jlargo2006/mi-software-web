// app/app/six-sigma/studies/ht/sign/compute.ts
import type { ColumnSnapshot } from "../../types";
import { signTest } from "../../../lib/sign";
import type { HTSignParams, HTSignResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHTSign(
  data: ColumnSnapshot,
  params: HTSignParams
): HTSignResult {
  const c = params.column;
  const col = c ? data[c] : undefined;

  if (!c || !col) {
    return signTest({
      column: c ?? "",
      raw: [],
      eta0: NaN,
      alternative: params.alternative,
      confLevel: NaN,
      performTest: false,
      performCI: false,
    });
  }

  return signTest({
    column: c,
    raw: col.values,
    eta0: num(params.hypothesizedMedian),
    alternative: params.alternative,
    confLevel: num(params.confidenceLevel),
    performTest: params.performTest,
    performCI: params.performCI,
  });
}
