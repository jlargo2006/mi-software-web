// studies/descriptive/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../types";
import type { DescriptiveParams, DescriptiveResult } from "./types";
import { STAT_DEFS } from "../../lib/descriptiveStats";

export default function DescriptiveResults({
  result,
}: {
  data: ColumnSnapshot;
  params: DescriptiveParams;
  result: DescriptiveResult;
}) {
  const defByKey = new Map(STAT_DEFS.map((d) => [d.key, d]));
  const activeDefs = result.activeKeys.map((k) => defByKey.get(k)!);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-3 py-2 text-left font-semibold">Variable</th>
            {activeDefs.map((d) => (
              <th key={d.key} className="px-3 py-2 text-right font-semibold">
                {d.label}
              </th>
            ))}
            {result.showModeCount && (
              <th className="px-3 py-2 text-right font-semibold">N for Mode</th>
            )}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => (
            <tr key={row.colName} className="border-b border-gray-100">
              <td className="px-3 py-2 text-left">{row.colName}</td>
              {activeDefs.map((d) => (
                <td key={d.key} className="px-3 py-2 text-right">
                  {row.values[d.key] ?? "*"}
                </td>
              ))}
              {result.showModeCount && (
                <td className="px-3 py-2 text-right">{row.modeCount ?? "*"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
