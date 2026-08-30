// app/app/six-sigma/studies/control/xbars/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeXbarS } from "./compute";
import { XBARS_DEFAULT, type XbarSParams, type XbarSResult } from "./types";

const xbars: AnalysisDefinition<XbarSParams, XbarSResult> = {
  id: "xbars",
  kind: "analysis",
  phase: "control",
  label: "Xbar-S Chart",
  defaultParams: XBARS_DEFAULT,
  compute: computeXbarS,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => {
    const out: (string | null)[] =
      p.layout === "columns"
        ? [...p.cols]
        : [p.col, p.useGroupCol ? p.groupCol : null];
    out.push(p.stageCol);
    return out.filter((c): c is string => !!c && c.trim() !== "");
  },
};

export default xbars;
