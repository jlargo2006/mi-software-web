// app/app/six-sigma/studies/ht/twoproportions/compute.ts
import type { ColumnSnapshot } from "../../types";
import { twoProportions } from "../../../lib/twoProportions";
import type { HTTwoProportionsParams, HTTwoProportionsResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

/**
 * Este estudio se alimenta de datos resumidos, no de columnas: el snapshot no
 * se usa. Se mantiene en la firma por coherencia con AnalysisDefinition.
 */
export function computeHTTwoProportions(
  _data: ColumnSnapshot,
  params: HTTwoProportionsParams
): HTTwoProportionsResult {
  return twoProportions({
    label1: params.label1.trim() || "Sample 1",
    label2: params.label2.trim() || "Sample 2",
    x1: num(params.events1),
    n1: num(params.trials1),
    x2: num(params.events2),
    n2: num(params.trials2),
    eta0: num(params.hypothesizedDifference),
    alternative: params.alternative,
    confLevel: num(params.confidenceLevel),
    continuityCorrection: params.continuityCorrection,
    showFisher: params.showFisher,
  });
}
