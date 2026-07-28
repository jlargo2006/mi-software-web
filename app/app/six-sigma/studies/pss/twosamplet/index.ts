// app/app/six-sigma/studies/pss/twosamplet/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import { computePss2SampleT } from "./compute";
import {
  PSS2SAMPLET_DEFAULT,
  type Pss2SampleTParams,
  type Pss2SampleTResult,
} from "./types";

const pss2SampleT: AnalysisDefinition<Pss2SampleTParams, Pss2SampleTResult> = {
  id: "pss2SampleT",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: 2-Sample t",
  defaultParams: PSS2SAMPLET_DEFAULT,
  compute: computePss2SampleT,
  Controls,
  Results,
  referencedColumns: () => [],
};

export default pss2SampleT;
