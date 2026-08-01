// app/app/six-sigma/studies/ht/twosamplet/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeTwoSampleTStudy } from "./compute";
import {
  TWOSAMPLET_DEFAULT,
  twoSampleTColumns,
  type TwoSampleTParams,
  type TwoSampleTResult,
} from "./types";

const htTwoSampleT: AnalysisDefinition<TwoSampleTParams, TwoSampleTResult> = {
  id: "htTwoSampleT",
  kind: "analysis",
  phase: "analyze",
  label: "2-Sample t",
  defaultParams: TWOSAMPLET_DEFAULT,
  compute: computeTwoSampleTStudy,
  Controls,
  Results,
  Theory,
  referencedColumns: twoSampleTColumns,
};

export default htTwoSampleT;
