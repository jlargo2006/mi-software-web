// app/app/six-sigma/studies/pss/pairedt/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import PssFields from "../_shared/PssFields";
import type { PssPairedTParams } from "./types";

export default function PssPairedTControls({
  params,
  onChange,
}: {
  params: PssPairedTParams;
  onChange: (p: PssPairedTParams) => void;
  columns: ColumnInfo[];
}) {
  return (
    <PssFields
      params={params}
      onChange={onChange}
      diffHint="mean paired difference"
    />
  );
}
