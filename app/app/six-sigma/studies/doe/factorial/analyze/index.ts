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
  // La columna de bloques tiene que entrar aqui: lo que no se declare no llega
  // al snapshot que recibe compute, y alli aparece como columna inexistente.
  referencedColumns: (p) =>
    Array.from(
      new Set(
        [p.response, ...p.factors, p.blockColumn].filter((s) => s.trim() !== "")
      )
    ),
};

export default doeAnalyzeFactorial;
