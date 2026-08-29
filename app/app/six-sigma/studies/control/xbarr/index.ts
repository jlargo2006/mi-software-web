// app/app/six-sigma/studies/control/xbarr/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeXbarR } from "./compute";
import { XBARR_DEFAULT, type XbarRParams, type XbarRResult } from "./types";

const xbarr: AnalysisDefinition<XbarRParams, XbarRResult> = {
  id: "xbarr",
  kind: "analysis",
  phase: "control",
  label: "Xbar-R Chart",
  defaultParams: XBARR_DEFAULT,
  compute: computeXbarR,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) => {
    const out: string[] = p.layout === "rows" ? [...p.cols] : [];
    if (p.layout === "column" && p.col) out.push(p.col);
    if (p.layout === "column" && p.sizeMode === "id" && p.idCol) out.push(p.idCol);
    if (p.stageCol) out.push(p.stageCol);
    return out.filter((c) => c && c.trim() !== "");
  },
};

export default xbarr;
