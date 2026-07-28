// app/app/six-sigma/studies/pss/oneproportion/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import { computePssProportion } from "./compute";
import { PSSPROP_DEFAULT, type PssPropParams, type PssPropResult } from "./types";

const pssOneProportion: AnalysisDefinition<PssPropParams, PssPropResult> = {
  id: "pssOneProportion",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: 1 Proportion",
  defaultParams: PSSPROP_DEFAULT,
  compute: computePssProportion,
  Controls,
  Results,
  referencedColumns: () => [],
};

export default pssOneProportion;
