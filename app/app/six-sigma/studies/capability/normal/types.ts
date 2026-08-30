// studies/capability/types.ts
export interface CapabilityParams {
  col: string | null;
  lsl: string;          // se mantienen como string en el form (como el viejo)
  usl: string;
  target: string;
  subgroupSize: string; // "1", "5", ...
}

export const CAPABILITY_DEFAULT: CapabilityParams = {
  col: null,
  lsl: "",
  usl: "",
  target: "",
  subgroupSize: "1",
};

export interface CapabilityResult {
  colName: string;
  n: number;
  mean: number;
  std: number;
  lsl: number | null;
  usl: number | null;
  target: number | null;
  subgroupSize: number;

  stdOverall: number;
  stdWithin: number;

  ppmObsLSL: number | null;
  ppmObsUSL: number | null;
  ppmObsTotal: number;
  ppmExpOverallLSL: number | null;
  ppmExpOverallUSL: number | null;
  ppmExpOverallTotal: number;
  ppmExpWithinLSL: number | null;
  ppmExpWithinUSL: number | null;
  ppmExpWithinTotal: number;

  pp: number | null;
  ppl: number | null;
  ppu: number | null;
  ppk: number | null;
  cp: number | null;
  cpl: number | null;
  cpu: number | null;
  cpk: number | null;

  zBenchOverall: number | null;
  zLSLOverall: number | null;
  zUSLOverall: number | null;
  zBenchWithin: number | null;
  zLSLWithin: number | null;
  zUSLWithin: number | null;

  // datos numéricos ya limpios, para que Results dibuje histograma + curvas
  nums: number[];
  xRange: [number, number];
}
