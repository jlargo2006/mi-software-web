// app/app/six-sigma/studies/ht/twosamplet/compute.ts
import type { ColumnSnapshot } from "../../types";
import { computeTwoSampleT, EMPTY_TWOSAMPLET } from "../../../lib/twosamplet";
// Reutilizamos los agrupadores ya calibrados de One-way ANOVA:
// mismo tratamiento de comas decimales, celdas vacias y orden natural.
import { groupsFromStacked, groupsFromUnstacked } from "../../../lib/anova1way";
import type { TwoSampleTParams, TwoSampleTResult } from "./types";

function parseAlpha(text: string): number {
  const n = Number(String(text).trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.05;
}

function parseNum(text: string, fallback: number): number {
  const n = Number(String(text).trim().replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export function computeTwoSampleTStudy(
  data: ColumnSnapshot,
  params: TwoSampleTParams
): TwoSampleTResult {
  const alpha = parseAlpha(params.alpha);
  const hypDiff = parseNum(params.hypDiff, 0);
  const common = {
    alpha,
    hypDiff,
    alternative: params.alternative,
    pooled: params.assumeEqualVariances,
  };
  const base = {
    ...EMPTY_TWOSAMPLET,
    alpha,
    hypDiff,
    alternative: params.alternative,
    pooled: params.assumeEqualVariances,
  };

  if (params.format === "stacked") {
    const { responseCol, factorCol } = params;
    if (!responseCol || !factorCol) return base;
    if (responseCol === factorCol) {
      return { ...base, error: "Response and factor must be different columns." };
    }

    const resp = data[responseCol];
    const fact = data[factorCol];
    if (!resp || !fact) return base;

    const groups = groupsFromStacked(resp.values, fact.values);
    if (groups.length < 2) {
      return { ...base, error: "The factor must have two levels with data." };
    }
    if (groups.length > 2) {
      return {
        ...base,
        error:
          `The factor has ${groups.length} levels (${groups
            .map((g) => g.name)
            .join("; ")}). ` +
          "A 2-Sample t test requires exactly two. Use One-Way ANOVA instead.",
      };
    }

    return computeTwoSampleT(groups[0], groups[1], {
      responseName: responseCol,
      factorName: factorCol,
      ...common,
    });
  }

  // --- unstacked: una columna por muestra ---
  const { sample1Col, sample2Col } = params;
  if (!sample1Col || !sample2Col) return base;
  if (sample1Col === sample2Col) {
    return { ...base, error: "Each sample must use a different column." };
  }

  const cols = [sample1Col, sample2Col].map((n) => ({
    name: n,
    raw: data[n]?.values ?? [],
  }));
  const groups = groupsFromUnstacked(cols);

  return computeTwoSampleT(groups[0], groups[1], {
    responseName: "Sample",
    factorName: "",
    ...common,
  });
}
