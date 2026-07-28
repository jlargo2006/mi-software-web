// app/app/six-sigma/studies/pss/oneproportion/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../../types";
import PssReport from "../_shared/PssReport";
import { ALT_TEXT } from "../_shared/types";
import type { PssPropParams, PssPropResult } from "./types";

export default function PssPropResults({
  result,
}: {
  data: ColumnSnapshot;
  params: PssPropParams;
  result: PssPropResult;
}) {
  const p0 = result?.nullProportion;
  const alt = ALT_TEXT[result?.alternative ?? "two-sided"].replace(
    "null",
    String(p0 ?? "p₀")
  );

  return (
    <PssReport
      result={result}
      testName="Test for One Proportion"
      hypothesisLine={`Testing p = ${p0 ?? "—"} (versus ${alt})`}
      calcLine={
        result?.method === "exact"
          ? "Calculating power using the exact binomial distribution"
          : "Calculating power using the normal approximation"
      }
      diffHeader="Comparison p"
      xTitle="Comparison Proportion"
      showSd={false}
      diffTransform={(d) => (p0 ?? 0) + d}
      extraHeaderLines={
        <p className="text-gray-600">
          Method: {result?.method === "exact" ? "Exact" : "Normal approximation"}
        </p>
      }
    />
  );
}
