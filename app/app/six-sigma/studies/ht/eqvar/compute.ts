// app/app/six-sigma/studies/ht/eqvar/compute.ts
import type { ColumnSnapshot } from "../../types";
import { computeEqVar, EMPTY_EQVAR } from "../../../lib/eqvar";
// Reutilizamos los agrupadores ya calibrados de One-way ANOVA:
// mismo tratamiento de comas decimales, celdas vacias y orden natural.
import { groupsFromStacked, groupsFromUnstacked } from "../../../lib/anova1way";
import type { EqVarParams, EqVarResult } from "./types";

function parseAlpha(text: string): number {
  const n = Number(String(text).trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.05;
}

export function computeEqVarStudy(
  data: ColumnSnapshot,
  params: EqVarParams
): EqVarResult {
  const alpha = parseAlpha(params.alpha);
  const base = { ...EMPTY_EQVAR, alpha };

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
      return { ...base, error: "The factor must have at least two levels with data." };
    }

    return computeEqVar(groups, {
      responseName: responseCol,
      factorName: factorCol,
      alpha,
    });
  }

  // --- unstacked: una columna por muestra ---
  const names = params.sampleCols.filter((x): x is string => !!x);
  if (names.length < 2) return base;
  if (new Set(names).size !== names.length) {
    return { ...base, error: "Each sample must use a different column." };
  }

  const cols = names.map((n) => ({ name: n, raw: data[n]?.values ?? [] }));
  const groups = groupsFromUnstacked(cols);

  return computeEqVar(groups, {
    responseName: "Sample",
    factorName: "",
    alpha,
  });
}
