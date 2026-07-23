// studies/descriptive/types.ts
import type { StatKey } from "../../lib/descriptiveStats";
import { DEFAULT_KEYS } from "../../lib/descriptiveStats";

export interface DescriptiveParams {
  selectedColNames: string[];
  selectedStats: StatKey[];
}

export const DESCRIPTIVE_DEFAULT: DescriptiveParams = {
  selectedColNames: [],
  selectedStats: DEFAULT_KEYS,
};

export interface DescriptiveRow {
  colName: string;
  values: Record<string, string>; // key StatKey -> valor ya formateado
  modeCount?: string;             // "N for Mode", solo si mode activa
}

export interface DescriptiveResult {
  rows: DescriptiveRow[];
  activeKeys: StatKey[];   // en orden de STAT_DEFS, solo las seleccionadas
  showModeCount: boolean;  // si "mode" esta entre las activas
}
