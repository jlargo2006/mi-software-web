// app/app/six-sigma/studies/ht/moodsmedian/compute.ts
import type { ColumnSnapshot } from "../../types";
import { moodsMedian } from "../../../lib/moodsMedian";
import type { HTMoodsMedianParams, HTMoodsMedianResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

export function computeHTMoodsMedian(
  data: ColumnSnapshot,
  params: HTMoodsMedianParams
): HTMoodsMedianResult {
  const cr = params.responseColumn;
  const cf = params.factorColumn;
  const resp = cr ? data[cr] : undefined;
  const fact = cf ? data[cf] : undefined;

  if (!cr || !cf || !resp || !fact) {
    return moodsMedian({
      responseColumn: cr ?? "",
      factorColumn: cf ?? "",
      rawResponse: [],
      rawFactor: [],
      confLevel: NaN,
    });
  }

  return moodsMedian({
    responseColumn: cr,
    factorColumn: cf,
    rawResponse: resp.values,
    rawFactor: fact.values,
    confLevel: num(params.confidenceLevel),
  });
}
