// app/app/six-sigma/studies/doe/factorial/interaction/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeInt } from "./compute";
import {
  DOEINT_DEFAULT,
  type DoeIntParams,
  type DoeIntResult,
} from "./types";

const doeInteraction: AnalysisDefinition<DoeIntParams, DoeIntResult> = {
  id: "doeInteraction",
  kind: "analysis",
  phase: "improve",
  label: "Interaction Plot",
  defaultParams: DOEINT_DEFAULT,
  compute: computeDoeInt,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.factors].filter((s) => s.trim() !== ""))
    ),
};

export default doeInteraction;
