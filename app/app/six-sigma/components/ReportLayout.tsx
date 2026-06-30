"use client";

import React from "react";

export type ReportTemplate =
  | "chart-only"
  | "text-chart"
  | "chart-text"
  | "text-chart-text";

interface ReportLayoutProps {
  template: ReportTemplate;
  left?: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
}

export default function ReportLayout({
  template,
  left,
  center,
  right,
}: ReportLayoutProps) {
  const showLeft = template === "text-chart" || template === "text-chart-text";
  const showRight = template === "chart-text" || template === "text-chart-text";

  return (
    <div className="flex gap-3 items-stretch w-full">
      {showLeft && (
        <div className="shrink-0 w-56 overflow-auto">{left}</div>
      )}
      <div className="flex-1 min-w-0">{center}</div>
      {showRight && (
        <div className="shrink-0 w-56 overflow-auto">{right}</div>
      )}
    </div>
  );
}
