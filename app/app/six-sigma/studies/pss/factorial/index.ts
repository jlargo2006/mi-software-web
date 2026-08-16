// app/app/six-sigma/studies/pss/factorial/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computePssFact } from "./compute";
import {
  PSSFACT_DEFAULT,
  type PssFactParams,
  type PssFactResult,
} from "./types";

const pssFactorial: AnalysisDefinition<PssFactParams, PssFactResult> = {
  id: "pssFactorial",
  kind: "analysis",
  phase: "analyze",
  label: "Power and Sample Size: 2-Level Factorial",
  defaultParams: PSSFACT_DEFAULT,
  compute: computePssFact,
  Controls,
  Results,
  Theory,
  referencedColumns: () => [],
};

export default pssFactorial;
