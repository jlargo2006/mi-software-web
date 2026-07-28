// app/app/six-sigma/studies/pss/twoproportions/Results.tsx
"use client";
import React from "react";
import PssReport from "../_shared/PssReport";
import { ALT_TEXT } from "../_shared/types";
import type { PssTwoPropResult } from "./types";

const fmt = (v: number): string =>
  Number.isFinite(v) ? String(v).replace(".", ",") : "*";

export default function Results({ result }: { result: PssTwoPropResult }) {
  const p2 = result.baselineProportion;
  const alt = ALT_TEXT[result.alternative];

  return (
    <PssReport
      result={result}
      testName="Test for Two Proportions"
      hypothesisLine={`Testing comparison p = baseline p (versus ${alt})`}
      calcLine="Calculating power for comparison p = baseline p + difference"
      sizeHeader="Sample Size"
      diffHeader="Comparison p"
      xTitle="Comparison Proportion"
      showSd={false}
      diffTransform={(d) => p2 + d}
      extraHeaderLines={
        <p>Baseline proportion = {fmt(p2)}</p>
      }
    />
  );
}
