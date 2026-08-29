// app/app/six-sigma/studies/control/imr/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeImr } from "./compute";
import { IMR_DEFAULT, type ImrParams, type ImrResult } from "./types";

const imr: AnalysisDefinition<ImrParams, ImrResult> = {
  id: "imr",
  kind: "analysis",
  phase: "control",
  label: "I-MR Chart",
  defaultParams: IMR_DEFAULT,
  compute: computeImr,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.col, p.stageCol].filter((c): c is string => !!c && c.trim() !== ""),
};

export default imr;
