// app/app/six-sigma/studies/doe/factorial/contour/index.ts
import type { AnalysisDefinition } from "../../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeDoeContour } from "./compute";
import {
  DOECONTOUR_DEFAULT,
  type DoeContourParams,
  type DoeContourResult,
} from "./types";

const doeContour: AnalysisDefinition<DoeContourParams, DoeContourResult> = {
  id: "doeContour",
  kind: "analysis",
  phase: "improve",
  label: "Contour Plot",
  defaultParams: DOECONTOUR_DEFAULT,
  compute: computeDoeContour,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    Array.from(
      new Set([p.response, ...p.factors].filter((s) => s.trim() !== ""))
    ),
};

export default doeContour;
