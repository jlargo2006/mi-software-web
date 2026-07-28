// app/app/six-sigma/studies/pss/onesamplet/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import PssFields from "../_shared/PssFields";
import type { Pss1SampleTParams } from "./types";

export default function Pss1SampleTControls({
  params,
  onChange,
}: {
  params: Pss1SampleTParams;
  onChange: (p: Pss1SampleTParams) => void;
  columns: ColumnInfo[];
}) {
  return <PssFields params={params} onChange={onChange} diffHint="mean − null" />;
}
