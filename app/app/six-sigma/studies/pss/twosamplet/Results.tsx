// app/app/six-sigma/studies/pss/twosamplet/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../../types";
import PssReport from "../_shared/PssReport";
import { ALT_TEXT } from "../_shared/types";
import type { Pss2SampleTParams, Pss2SampleTResult } from "./types";

export default function Pss2SampleTResults({
  result,
}: {
  data: ColumnSnapshot;
  params: Pss2SampleTParams;
  result: Pss2SampleTResult;
}) {
  const alt = ALT_TEXT[result?.alternative ?? "two-sided"].replace(" null", " 0");

  return (
    <PssReport
      result={result}
      testName="2-Sample t Test"
      hypothesisLine={`Testing mean 1 = mean 2 (versus ${alt})`}
      calcLine="Calculating power for mean 1 = mean 2 + difference"
      diffHeader="Difference"
    />
  );
}
