// app/app/six-sigma/studies/ht/oneproportion/index.ts
import type { AnalysisDefinition } from "../../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeHTOneProportion } from "./compute";
import {
  HTONEPROPORTION_DEFAULT,
  type HTOneProportionParams,
  type HTOneProportionResult,
} from "./types";

const htOneProportion: AnalysisDefinition<
  HTOneProportionParams,
  HTOneProportionResult
> = {
  id: "htOneProportion",
  kind: "analysis",
  phase: "analyze",
  label: "1 Proportion",
  defaultParams: HTONEPROPORTION_DEFAULT,
  compute: computeHTOneProportion,
  Controls,
  Results,
  Theory,
  // Datos resumidos: este estudio no lee columnas de la hoja.
  referencedColumns: () => [],
};

export default htOneProportion;
