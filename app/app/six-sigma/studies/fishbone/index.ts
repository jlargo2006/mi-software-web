// studies/fishbone/index.ts
import type { AnalysisDefinition } from "../types";
import type { FishboneParams, FishboneResult } from "./types";
import { FISHBONE_DEFAULT } from "./types";
import { computeFishbone } from "./compute";
import FishboneControls from "./Controls";
import FishboneResults from "./Results";

export const fishbone: AnalysisDefinition<FishboneParams, FishboneResult> = {
  id: "fishbone",
  label: "Fishbone (Cause & Effect)",
  phase: "measure",
  kind: "analysis",
  defaultParams: FISHBONE_DEFAULT,
  referencedColumns: (p) =>
    p.rows.map((r) => r.colName).filter((n): n is string => !!n),
  Controls: FishboneControls,
  compute: computeFishbone,
  Results: FishboneResults,
};
