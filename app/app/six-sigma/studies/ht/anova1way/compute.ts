// app/app/six-sigma/studies/ht/anova1way/compute.ts
import type { ColumnSnapshot } from "../../types";
import {
  computeAnova1Way,
  groupsFromStacked,
  groupsFromUnstacked,
  EMPTY_ANOVA,
} from "../../../lib/anova1way";
import type { Anova1WayParams, Anova1WayResult } from "./types";

function parseAlpha(text: string): number {
  const n = Number(String(text).trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.05;
}

export function computeAnova1WayStudy(
  data: ColumnSnapshot,
  params: Anova1WayParams
): Anova1WayResult {
  const alpha = parseAlpha(params.alpha);

  if (params.format === "stacked") {
    const { responseCol, factorCol } = params;
    if (!responseCol || !factorCol) {
      return { ...EMPTY_ANOVA, alpha };
    }
    if (responseCol === factorCol) {
      return {
        ...EMPTY_ANOVA,
        alpha,
        error: "Response and factor must be different columns.",
      };
    }

    const resp = data[responseCol];
    const fact = data[factorCol];
    if (!resp || !fact) return { ...EMPTY_ANOVA, alpha };

    const groups = groupsFromStacked(resp.values, fact.values);
    return computeAnova1Way(groups, {
      responseName: responseCol,
      factorName: factorCol,
      alpha,
    });
  }

  // --- unstacked ---
  const names = params.levelCols.filter((x): x is string => !!x);
  if (names.length < 2) {
    return {
      ...EMPTY_ANOVA,
      alpha,
      error: "Select at least two columns, one per factor level.",
    };
  }
  if (new Set(names).size !== names.length) {
    return {
      ...EMPTY_ANOVA,
      alpha,
      error: "Each factor level must use a different column.",
    };
  }

  const cols = names
    .map((n) => ({ name: n, raw: data[n]?.values ?? [] }))
    .filter((c) => c.raw.length > 0);

  const groups = groupsFromUnstacked(cols);
  return computeAnova1Way(groups, {
    responseName: "Response",
    factorName: "Factor",
    alpha,
  });
}
