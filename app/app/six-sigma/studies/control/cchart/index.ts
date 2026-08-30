// app/app/six-sigma/studies/control/cchart/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeCChart } from "./compute";
import { CCHART_DEFAULT, type CChartParams, type CChartResult } from "./types";

const cchart: AnalysisDefinition<CChartParams, CChartResult> = {
  id: "cchart",
  kind: "analysis",
  phase: "control",
  label: "C Chart",
  defaultParams: CCHART_DEFAULT,
  compute: computeCChart,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.col, p.stageCol].filter((x): x is string => !!x && x.trim() !== ""),
};

export default cchart;
