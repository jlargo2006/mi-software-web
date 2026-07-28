// app/app/six-sigma/studies/pss/twoproportions/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import { computePssTwoProportions } from "./compute";
import {
  PSSTWOPROP_DEFAULT,
  type PssTwoPropParams,
  type PssTwoPropResult,
} from "./types";

const pssTwoProportions: AnalysisDefinition<PssTwoPropParams, PssTwoPropResult> = {
  id: "pssTwoProportions",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: 2 Proportions",
  defaultParams: PSSTWOPROP_DEFAULT,
  compute: computePssTwoProportions,
  Controls,
  Results,
  referencedColumns: () => [],
};

export default pssTwoProportions;
