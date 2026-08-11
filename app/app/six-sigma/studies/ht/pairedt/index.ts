// app/app/six-sigma/studies/ht/pairedt/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTPairedT } from "./compute";
import { HTPAIREDT_DEFAULT, type HTPairedTParams, type HTPairedTResult } from "./types";

const htPairedT: AnalysisDefinition<HTPairedTParams, HTPairedTResult> = {
  id: "htPairedT",
  kind: "analysis",
  phase: "analyze",
  label: "Paired t Test",
  defaultParams: HTPAIREDT_DEFAULT,
  compute: computeHTPairedT,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.columnX, p.columnY].filter((c): c is string => Boolean(c)),
};

export default htPairedT;
