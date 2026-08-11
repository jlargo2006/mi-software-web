// app/app/six-sigma/studies/ht/kruskalwallis/compute.ts
import type { ColumnSnapshot } from "../../types";
import { kruskalWallis } from "../../../lib/kruskalWallis";
import type { HTKruskalWallisParams, HTKruskalWallisResult } from "./types";

export function computeHTKruskalWallis(
  data: ColumnSnapshot,
  params: HTKruskalWallisParams
): HTKruskalWallisResult {
  const cr = params.responseColumn;
  const cf = params.factorColumn;
  const resp = cr ? data[cr] : undefined;
  const fact = cf ? data[cf] : undefined;

  if (!cr || !cf || !resp || !fact) {
    return kruskalWallis({
      responseColumn: cr ?? "",
      factorColumn: cf ?? "",
      rawResponse: [],
      rawFactor: [],
    });
  }

  return kruskalWallis({
    responseColumn: cr,
    factorColumn: cf,
    rawResponse: resp.values,
    rawFactor: fact.values,
  });
}
