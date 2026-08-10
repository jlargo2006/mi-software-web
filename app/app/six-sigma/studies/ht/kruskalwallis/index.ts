// app/app/six-sigma/studies/ht/kruskalwallis/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTKruskalWallis } from "./compute";
import {
  HTKRUSKALWALLIS_DEFAULT,
  type HTKruskalWallisParams,
  type HTKruskalWallisResult,
} from "./types";

const htKruskalWallis: AnalysisDefinition<
  HTKruskalWallisParams,
  HTKruskalWallisResult
> = {
  id: "htKruskalWallis",
  kind: "analysis",
  phase: "analyze",
  label: "Kruskal-Wallis Test",
  defaultParams: HTKRUSKALWALLIS_DEFAULT,
  compute: computeHTKruskalWallis,
  Controls,
  Results,
  Theory,
  referencedColumns: (p) =>
    [p.responseColumn, p.factorColumn].filter((c): c is string => Boolean(c)),
};

export default htKruskalWallis;
