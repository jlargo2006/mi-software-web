// app/app/six-sigma/studies/control/npchart/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeNPChart } from "./compute";
import {
  NPCHART_DEFAULT,
  type NPChartParams,
  type NPChartResult,
} from "./types";

const npchart: AnalysisDefinition<NPChartParams, NPChartResult> = {
  id: "npchart",
  kind: "analysis",
  phase: "control",
  label: "NP Chart",
  defaultParams: NPCHART_DEFAULT,
  compute: computeNPChart,
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

export default npchart;
