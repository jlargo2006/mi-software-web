// app/app/six-sigma/studies/ht/twoproportions/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTTwoProportions } from "./compute";
import {
  HTTWOPROPORTIONS_DEFAULT,
  type HTTwoProportionsParams,
  type HTTwoProportionsResult,
} from "./types";

const htTwoProportions: AnalysisDefinition<
  HTTwoProportionsParams,
  HTTwoProportionsResult
> = {
  id: "htTwoProportions",
  kind: "analysis",
  phase: "analyze",
  label: "2 Proportions",
  defaultParams: HTTWOPROPORTIONS_DEFAULT,
  compute: computeHTTwoProportions,
  Controls,
  Results,
  Theory,
  // Datos resumidos: este estudio no lee columnas de la hoja.
  referencedColumns: () => [],
};

export default htTwoProportions;
