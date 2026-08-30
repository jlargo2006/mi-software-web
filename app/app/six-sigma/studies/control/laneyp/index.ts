// app/app/six-sigma/studies/control/laneyp/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeLaneyP } from "./compute";
import {
  LANEYP_DEFAULT,
  type LaneyPParams,
  type LaneyPResult,
} from "./types";

const laneyp: AnalysisDefinition<LaneyPParams, LaneyPResult> = {
  id: "laneyp",
  kind: "analysis",
  phase: "control",
  label: "Laney P\u2032 Chart",
  defaultParams: LANEYP_DEFAULT,
  compute: computeLaneyP,
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

export default laneyp;
