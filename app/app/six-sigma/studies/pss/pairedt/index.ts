// app/app/six-sigma/studies/pss/pairedt/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import { computePssPairedT } from "./compute";
import {
  PSSPAIREDT_DEFAULT,
  type PssPairedTParams,
  type PssPairedTResult,
} from "./types";

const pssPairedT: AnalysisDefinition<PssPairedTParams, PssPairedTResult> = {
  id: "pssPairedT",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: Paired t",
  defaultParams: PSSPAIREDT_DEFAULT,
  compute: computePssPairedT,
  Controls,
  Results,
  referencedColumns: () => [],
};

export default pssPairedT;
