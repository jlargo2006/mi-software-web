// app/app/six-sigma/studies/pss/onesamplet/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import { computePss1SampleT } from "./compute";
import {
  PSS1SAMPLET_DEFAULT,
  type Pss1SampleTParams,
  type Pss1SampleTResult,
} from "./types";

const pss1SampleT: AnalysisDefinition<Pss1SampleTParams, Pss1SampleTResult> = {
  id: "pss1SampleT",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: 1-Sample t",
  defaultParams: PSS1SAMPLET_DEFAULT,
  compute: computePss1SampleT,
  Controls,
  Results,
  referencedColumns: () => [],
};

export default pss1SampleT;
