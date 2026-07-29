// app/app/six-sigma/studies/ht/onesamplet/compute.ts
import { tTest1 } from "../../../lib/tTest1";
import type { ColumnData } from "../../types";
import type { HT1SampleTParams, HT1SampleTResult } from "./types";

/** Acepta "4,9" y "4.9". */
const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHT1SampleT(
  params: HT1SampleTParams,
  data: Record<string, ColumnData>
): HT1SampleTResult {
  const col = params.column;
  if (!col || !data[col]) {
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
    raw: data[col].values,
    confLevel: num(params.confidenceLevel),
    performTest: params.performTest,
    mu0: num(params.hypothesizedMean),
    alternative: params.alternative,
  });
}
