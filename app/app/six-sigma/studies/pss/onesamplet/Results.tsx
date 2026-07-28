// app/app/six-sigma/studies/pss/onesamplet/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../../types";
import PssReport from "../_shared/PssReport";
import { ALT_TEXT } from "../_shared/types";
import type { Pss1SampleTParams, Pss1SampleTResult } from "./types";

export default function Pss1SampleTResults({
  result,
}: {
  data: ColumnSnapshot;
  params: Pss1SampleTParams;
  result: Pss1SampleTResult;
}) {
  return (
    <PssReport
      result={result}
      testName="1-Sample t Test"
      hypothesisLine={`Testing mean = null (versus ${
        ALT_TEXT[result?.alternative ?? "two-sided"]
      })`}
      calcLine="Calculating power for mean = null + difference"
    />
  );
}
