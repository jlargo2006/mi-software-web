// app/app/six-sigma/studies/control/pchart/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computePChart } from "./compute";
import { PCHART_DEFAULT, type PChartParams, type PChartResult } from "./types";

const pchart: AnalysisDefinition<PChartParams, PChartResult> = {
  id: "pchart",
  kind: "analysis",
  phase: "control",
  label: "P Chart",
  defaultParams: PCHART_DEFAULT,
  compute: computePChart,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [
      p.col,
      p.sizeMode === "column" ? p.sizeCol : null,
      p.stageCol,
    ].filter((c): c is string => !!c && c.trim() !== ""),
};

export default pchart;
