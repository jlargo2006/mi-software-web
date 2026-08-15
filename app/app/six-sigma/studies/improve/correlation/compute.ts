// app/app/six-sigma/studies/improve/correlation/compute.ts
import type { ColumnSnapshot } from "../../types";
import { correlationStats } from "../../../lib/correlation";
import type {
  CorrCIKind,
  CorrPair,
  ImpCorrParams,
  ImpCorrResult,
} from "./types";

const cellNum = (c: number | string | null | undefined): number => {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return NaN;
  const t = c.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const num = (s: string): number => {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
};

const fail = (error: string): ImpCorrResult => ({ ok: false, error });

export function computeImpCorr(
  data: ColumnSnapshot,
  params: ImpCorrParams
): ImpCorrResult {
  const labels = params.columns.filter((n) => Boolean(data[n]));
  if (labels.length < 2) {
    return fail("Select at least two columns to correlate.");
  }

  const confLevel = num(params.confidenceLevel);
  if (!(confLevel > 0 && confLevel < 100)) {
    return fail("The confidence level must be between 0 and 100.");
  }

  const ciKind: CorrCIKind =
    params.alternative === "two-sided"
      ? "two"
      : params.alternative === "greater"
        ? "lower"
        : "upper";

  const cols = labels.map((n) => data[n].values);
  const len = Math.max(...cols.map((c) => c.length));
  const numeric = cols.map((c) =>
    Array.from({ length: len }, (_, i) => cellNum(c[i]))
  );

  // Filas completas en todas las columnas: es el dato que encabeza el
  // informe. Cada par, en cambio, usa su propio borrado por parejas.
  let nCompleteRows = 0;
  for (let i = 0; i < len; i++) {
    if (numeric.every((c) => Number.isFinite(c[i]))) nCompleteRows++;
  }

  // --- Triangulo inferior -------------------------------------------------
  const pairs: CorrPair[] = [];
  for (let i = 1; i < labels.length; i++) {
    for (let j = 0; j < i; j++) {
      const x: number[] = [];
      const y: number[] = [];
      for (let k = 0; k < len; k++) {
        const a = numeric[j][k];
        const b = numeric[i][k];
        if (Number.isFinite(a) && Number.isFinite(b)) {
          x.push(a);
          y.push(b);
        }
      }
      if (x.length < 3) {
        return fail(
          `At least three paired observations are required (${labels[i]} vs ${labels[j]}).`
        );
      }
      const st = correlationStats(
        x,
        y,
        params.corrType,
        params.alternative,
        confLevel,
        ciKind
      );
      pairs.push({
        i,
        j,
        labelI: labels[i],
        labelJ: labels[j],
        x,
        y,
        ...st,
      });
    }
  }

  const ns = pairs.map((p) => p.n);

  return {
    ok: true,
    labels,
    corrType: params.corrType,
    alternative: params.alternative,
    confLevel,
    ciKind,
    pairs,
    nCompleteRows,
    unequalN: Math.min(...ns) !== Math.max(...ns),
  };
}
