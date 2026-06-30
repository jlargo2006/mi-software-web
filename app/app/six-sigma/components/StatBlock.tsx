"use client";

import React from "react";

export interface StatRow {
  label: string;
  value: string;
}

export interface StatSection {
  title: string;
  rows: StatRow[];
}

// Formatea números con coma decimal (estilo Minitab/ES)
export function fmt(
  v: number | null,
  decimals = 4
): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "*";
  return v
    .toFixed(decimals)
    .replace(".", ",");
}

// Formatea PPM con miles y 2 decimales (estilo ES)
export function fmtPPM(v: number | null): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "*";
  return v.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function StatBlock({ sections }: { sections: StatSection[] }) {
  return (
    <div className="font-mono text-xs text-gray-800 space-y-3">
      {sections.map((sec) => (
        <div key={sec.title}>
          <div className="font-semibold text-[#00674d] mb-1">{sec.title}</div>
          <table className="w-full">
            <tbody>
              {sec.rows.map((row) => (
                <tr key={row.label}>
                  <td className="pr-2 whitespace-nowrap text-gray-600">
                    {row.label}
                  </td>
                  <td className="text-right tabular-nums">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
