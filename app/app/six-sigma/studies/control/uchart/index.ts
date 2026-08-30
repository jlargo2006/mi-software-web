// app/app/six-sigma/studies/control/uchart/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeUChart } from "./compute";
import { UCHART_DEFAULT, type UChartParams, type UChartResult } from "./types";

const uchart: AnalysisDefinition<UChartParams, UChartResult> = {
  id: "uchart",
  kind: "analysis",
  phase: "control",
  label: "U Chart",
  defaultParams: UCHART_DEFAULT,
  compute: computeUChart,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [
      p.col,
      p.sizeMode === "column" ? p.sizeCol : null,
      p.stageCol,
    ].filter((x): x is string => !!x && x.trim() !== ""),
};

export default uchart;
