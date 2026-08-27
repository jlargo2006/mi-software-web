// app/app/six-sigma/studies/doe/factorial/cube/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeCube } from "./compute";
import {
  DOECUBE_DEFAULT,
  type DoeCubeParams,
  type DoeCubeResult,
} from "./types";

const doeCube: AnalysisDefinition<DoeCubeParams, DoeCubeResult> = {
  id: "doeCube",
  kind: "analysis",
  phase: "improve",
  label: "Cube Plot",
  defaultParams: DOECUBE_DEFAULT,
  compute: computeDoeCube,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.factors].filter((s) => s.trim() !== ""))
    ),
};

export default doeCube;
