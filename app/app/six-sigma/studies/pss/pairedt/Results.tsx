// app/app/six-sigma/studies/pss/pairedt/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../../types";
import PssReport from "../_shared/PssReport";
import { ALT_TEXT } from "../_shared/types";
import type { PssPairedTParams, PssPairedTResult } from "./types";

export default function PssPairedTResults({
  result,
}: {
  data: ColumnSnapshot;
  params: PssPairedTParams;
  result: PssPairedTResult;
}) {
  return (
    <PssReport
      result={result}
      testName="Paired t Test"
      hypothesisLine={`Testing mean paired difference = 0 (versus ${
        ALT_TEXT[result?.alternative ?? "two-sided"]
      })`}
      calcLine="Calculating power for mean paired difference = difference"
    />
  );
}
