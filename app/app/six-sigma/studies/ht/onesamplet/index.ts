// app/app/six-sigma/studies/ht/onesamplet/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHT1SampleT } from "./compute";
import { HT1SAMPLET_DEFAULT, type HT1SampleTParams, type HT1SampleTResult } from "./types";

const ht1SampleT: AnalysisDefinition<HT1SampleTParams, HT1SampleTResult> = {
  id: "ht1SampleT",
  kind: "analysis",
  phase: "analyze",
  label: "1-Sample t Test",
  defaultParams: HT1SAMPLET_DEFAULT,
  compute: computeHT1SampleT,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => (p.column ? [p.column] : []),
};

export default ht1SampleT;
