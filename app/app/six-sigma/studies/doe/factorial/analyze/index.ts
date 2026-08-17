// app/app/six-sigma/studies/doe/factorial/analyze/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeAnalyze } from "./compute";
import {
  DOEANALYZE_DEFAULT,
  type DoeAnalyzeParams,
  type DoeAnalyzeResult,
} from "./types";

const doeAnalyzeFactorial: AnalysisDefinition<
  DoeAnalyzeParams,
  DoeAnalyzeResult
> = {
  id: "doeAnalyzeFactorial",
  kind: "analysis",
  phase: "improve",
  label: "Analyze Factorial Design",
  defaultParams: DOEANALYZE_DEFAULT,
  compute: computeDoeAnalyze,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.factors].filter((s) => s.trim() !== ""))
    ),
};

export default doeAnalyzeFactorial;
