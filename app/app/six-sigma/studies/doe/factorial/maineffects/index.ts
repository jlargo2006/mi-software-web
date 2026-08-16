// app/app/six-sigma/studies/doe/factorial/maineffects/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeMain } from "./compute";
import {
  DOEMAIN_DEFAULT,
  type DoeMainParams,
  type DoeMainResult,
} from "./types";

const doeMainEffects: AnalysisDefinition<DoeMainParams, DoeMainResult> = {
  id: "doeMainEffects",
  kind: "analysis",
  phase: "improve",
  label: "Main Effects Plot",
  defaultParams: DOEMAIN_DEFAULT,
  compute: computeDoeMain,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.factors].filter((s) => s.trim() !== ""))
    ),
};

export default doeMainEffects;
