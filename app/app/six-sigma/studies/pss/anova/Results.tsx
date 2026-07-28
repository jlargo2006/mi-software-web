// app/app/six-sigma/studies/pss/anova/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../../types";
import PssReport from "../_shared/PssReport";
import type { PssAnovaParams, PssAnovaResult } from "./types";

export default function PssAnovaResults({
  result,
}: {
  data: ColumnSnapshot;
  params: PssAnovaParams;
  result: PssAnovaResult;
}) {
  return (
    <PssReport
      result={result}
      testName="One-way ANOVA"
      hypothesisLine={`${result?.levels ?? ""} Levels, Balanced Design`}
      calcLine="Calculating power for maximum difference between means"
      sizeHeader="Sample Size"
      diffHeader="Maximum Difference"
      xTitle="Maximum Difference"
      showAlternative={false}
      extraHeaderLines={
        <p className="text-gray-600">
          Factor levels: {result?.levels ?? "—"}
        </p>
      }
    />
  );
}
