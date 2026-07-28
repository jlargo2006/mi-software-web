// app/app/six-sigma/studies/pss/twosamplet/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import PssFields from "../_shared/PssFields";
import type { Pss2SampleTParams } from "./types";

export default function Pss2SampleTControls({
  params,
  onChange,
}: {
  params: Pss2SampleTParams;
  onChange: (p: Pss2SampleTParams) => void;
  columns: ColumnInfo[];
}) {
  return (
    <PssFields
      params={params}
      onChange={onChange}
      sizeLabel="Sample sizes"
      sizeHint="per group, e.g. 10:40/5"
      diffLabel="Differences"
      diffHint="mean 1 − mean 2"
    />
  );
}
