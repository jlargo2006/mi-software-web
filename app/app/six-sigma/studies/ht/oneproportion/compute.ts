// app/app/six-sigma/studies/ht/oneproportion/compute.ts
import type { ColumnSnapshot } from "../../types";
import { oneProportion } from "../../../lib/oneProportion";
import type { HTOneProportionParams, HTOneProportionResult } from "./types";

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

/**
 * Datos resumidos: el snapshot no se usa. Se mantiene en la firma por
 * coherencia con AnalysisDefinition.
 */
export function computeHTOneProportion(
  _data: ColumnSnapshot,
  params: HTOneProportionParams
): HTOneProportionResult {
  return oneProportion({
    x: num(params.events),
    n: num(params.trials),
    p0: num(params.hypothesizedProportion),
    alternative: params.alternative,
    confLevel: num(params.confidenceLevel),
    method: params.method,
  });
}
