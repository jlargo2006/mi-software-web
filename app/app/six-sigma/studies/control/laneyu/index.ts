// app/app/six-sigma/studies/control/laneyu/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeLaneyU } from "./compute";
import {
  LANEYU_DEFAULT,
  type LaneyUParams,
  type LaneyUResult,
} from "./types";

const laneyu: AnalysisDefinition<LaneyUParams, LaneyUResult> = {
  id: "laneyu",
  kind: "analysis",
  phase: "control",
  label: "Laney U\u2032 Chart",
  defaultParams: LANEYU_DEFAULT,
  compute: computeLaneyU,
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

export default laneyu;
