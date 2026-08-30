// app/app/six-sigma/studies/control/mrchart/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeMR } from "./compute";
import { MR_DEFAULT, type MRParams, type MRResult } from "./types";

// id "mr" y carpeta mrchart/ para no colisionar con el modulo imr/.
const mrchart: AnalysisDefinition<MRParams, MRResult> = {
  id: "mr",
  kind: "analysis",
  phase: "control",
  label: "Moving Range Chart",
  defaultParams: MR_DEFAULT,
  compute: computeMR,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.col, p.stageCol].filter(
      (c): c is string => !!c && c.trim() !== ""
    ),
};

export default mrchart;
