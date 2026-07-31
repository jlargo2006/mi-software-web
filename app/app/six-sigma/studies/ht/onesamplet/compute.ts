// app/app/six-sigma/studies/ht/onesamplet/compute.ts
import type { ColumnSnapshot } from "../../types";
import { tTest1 } from "../../../lib/tTest1";
import type { HT1SampleTParams, HT1SampleTResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHT1SampleT(
  data: ColumnSnapshot,
  params: HT1SampleTParams
): HT1SampleTResult {
  const col = params.column;
  const c = col ? data[col] : undefined;

  if (!col || !c) {
    return tTest1({
      column: "",
      raw: [],
      confLevel: NaN,
      performTest: false,
      mu0: NaN,
      alternative: params.alternative,
    });
  }

  return tTest1({
    column: col,
    raw: c.values,
    confLevel: num(params.confidenceLevel),
    performTest: params.performTest,
    mu0: num(params.hypothesizedMean),
    alternative: params.alternative,
  });
}
