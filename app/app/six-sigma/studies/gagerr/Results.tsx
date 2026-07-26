// app/app/six-sigma/studies/gagerr/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { GageRRParams, GageRRResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";
import { a2, d3, d4 } from "../../lib/spcConstants";

const PALETTE = [
  "#00674d", "#c0392b", "#2980b9", "#8e44ad", "#d35400",
  "#16a085", "#2c3e50", "#f39c12", "#7f8c8d", "#27ae60",
];

/** formato con coma decimal (estilo Minitab) */
const f = (v: number | null, dec = 4): string => {
  if (v === null || !Number.isFinite(v)) return "";
  return v.toFixed(dec).replace(".", ",");
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border border-gray-300 px-2 py-1 bg-gray-100 text-left font-semibold">
    {children}
  </th>
);
const Td = ({
  children,
  right,
  pad,
}: {
  children?: React.ReactNode;
  right?: boolean;
  pad?: number;
}) => (
  <td
    className={`border border-gray-300 px-2 py-1 ${right ? "text-right" : ""}`}
    style={pad ? { paddingLeft: 8 + pad * 14 } : undefined}
  >
    {children}
  </td>
);

export default function GageRRResults({
  result,
}: {
  data: ColumnSnapshot;
  params: GageRRParams;
  result: GageRRResult;
}) {
  const r = result;

  if (!r || !r.ok) {
    return (
      <div className="p-4 text-sm text-gray-600">
        {r?.error ?? "Select the Part, Operator and Measurement columns."}
      </div>
    );
  }

  const showTol = r.tolerance !== null;
  const n = r.reps;

  // ---------- datos derivados para los gráficos ----------
  const cellMean = (p: string, o: string) => r.cellMeans.get(`${p}||${o}`) ?? NaN;
  const cellVals = (p: string, o: string) =>
    r.cells.find((c) => c.part === p && c.operator === o)?.values ?? [];

  // rangos y medias por subgrupo (parte) dentro de cada operador
  const ranges: { label: string; op: string; value: number }[] = [];
  const means: { label: string; op: string; value: number }[] = [];
  for (const o of r.operators)
    for (const p of r.parts) {
      const v = cellVals(p, o);
      if (v.length === 0) continue;
      ranges.push({ label: `${o}-${p}`, op: o, value: Math.max(...v) - Math.min(...v) });
      means.push({ label: `${o}-${p}`, op: o, value: cellMean(p, o) });
    }

  const rBar = ranges.reduce((a, b) => a + b.value, 0) / (ranges.length || 1);
  const xBarBar = means.reduce((a, b) => a + b.value, 0) / (means.length || 1);
  const rUCL = d4(n) * rBar;
  const rLCL = d3(n) * rBar;
  const xUCL = xBarBar + a2(n) * rBar;
  const xLCL = xBarBar - a2(n) * rBar;

  const ctrlLine = (
    x: string[],
    y: number,
    color: string,
    dash: "dot" | "dash" | "solid",
    name: string
  ): Data => ({
    type: "scatter", mode: "lines",
    x, y: x.map(() => y),
    line: { color, dash, width: 1.5 },
    name, showlegend: false, hoverinfo: "skip",
  });

  // 1) Components of Variation
  const compSources = ["Total Gage R&R", "Repeatability", "Reproducibility", "Part-To-Part"];
  const compRows = compSources
    .map((s) => ({
      s,
      vc: r.varComps.find((v) => v.source === s),
      ev: r.evaluation.find((v) => v.source === s),
    }))
    .filter((x) => x.vc && x.ev);

  const compTraces: Data[] = [
    {
      type: "bar", name: "% Contribution",
      x: compRows.map((c) => c.s),
      y: compRows.map((c) => c.vc!.pctContribution),
      marker: { color: PALETTE[0] },
    },
    {
      type: "bar", name: "% Study Var",
      x: compRows.map((c) => c.s),
      y: compRows.map((c) => c.ev!.pctStudyVar),
      marker: { color: PALETTE[2] },
    },
  ];
  if (showTol) {
    compTraces.push({
      type: "bar", name: "% Tolerance",
      x: compRows.map((c) => c.s),
      y: compRows.map((c) => c.ev!.pctTolerance ?? 0),
      marker: { color: PALETTE[4] },
    });
  }

  // 2) R Chart
  const rLabels = ranges.map((x) => x.label);
  const rTraces: Data[] = [
    {
      type: "scatter", mode: "lines+markers",
      x: rLabels, y: ranges.map((x) => x.value),
      line: { color: PALETTE[0] }, marker: { color: PALETTE[0], size: 6 },
      name: "Range", showlegend: false,
    },
    ctrlLine(rLabels, rUCL, "#c0392b", "dash", "UCL"),
    ctrlLine(rLabels, rBar, "#2c3e50", "solid", "R̄"),
    ctrlLine(rLabels, rLCL, "#c0392b", "dash", "LCL"),
  ];

  // 3) Xbar Chart
  const xTraces: Data[] = [
    {
      type: "scatter", mode: "lines+markers",
      x: rLabels, y: means.map((x) => x.value),
      line: { color: PALETTE[0] }, marker: { color: PALETTE[0], size: 6 },
      name: "Mean", showlegend: false,
    },
    ctrlLine(rLabels, xUCL, "#c0392b", "dash", "UCL"),
    ctrlLine(rLabels, xBarBar, "#2c3e50", "solid", "X̄̄"),
    ctrlLine(rLabels, xLCL, "#c0392b", "dash", "LCL"),
  ];

  // 4) Measurement by Part
  const byPartX: string[] = [];
  const byPartY: number[] = [];
  for (const p of r.parts)
    for (const o of r.operators)
      for (const v of cellVals(p, o)) {
        byPartX.push(p);
        byPartY.push(v);
      }
  const partMeans = r.parts.map((p) => {
    const all = r.operators.flatMap((o) => cellVals(p, o));
    return all.reduce((a, b) => a + b, 0) / (all.length || 1);
  });
  const byPartTraces: Data[] = [
    {
      type: "scatter", mode: "markers",
      x: byPartX, y: byPartY,
      marker: { color: PALETTE[2], size: 6, opacity: 0.65 },
      name: "Data", showlegend: false,
    },
    {
      type: "scatter", mode: "lines+markers",
      x: r.parts, y: partMeans,
      line: { color: PALETTE[1] },
      marker: { color: PALETTE[1], size: 9, symbol: "circle" },
      name: "Mean", showlegend: false,
    },
  ];

  // 5) Measurement by Operator
  const byOpTraces: Data[] = r.operators.map((o, i) => {
    const vals = r.parts.flatMap((p) => cellVals(p, o));
    return {
      type: "box",
      y: vals,
      x: vals.map(() => o),
      name: o,
      boxpoints: "all", jitter: 0.4, pointpos: 0,
      marker: { color: PALETTE[i % PALETTE.length], size: 5 },
      line: { color: PALETTE[i % PALETTE.length] },
      fillcolor: PALETTE[i % PALETTE.length] + "22",
      showlegend: false,
    } as Data;
  });

  // 6) Part × Operator Interaction
  const interTraces: Data[] = r.operators.map((o, i) => ({
    type: "scatter", mode: "lines+markers",
    x: r.parts,
    y: r.parts.map((p) => cellMean(p, o)),
    name: o,
    line: { color: PALETTE[i % PALETTE.length] },
    marker: { color: PALETTE[i % PALETTE.length], size: 7 },
  }));

  const Chart = ({
    traces,
    title,
    xTitle,
    yTitle,
    legend = false,
    tickangle = 0,
  }: {
    traces: Data[];
    title: string;
    xTitle?: string;
    yTitle?: string;
    legend?: boolean;
    tickangle?: number;
  }) => (
    <div className="border border-gray-200 rounded" style={{ height: 300 }}>
      <ResultChart
        data={traces}
        layout={{
          autosize: true,
          title: { text: title, font: { size: 13 } },
          margin: { t: 40, b: tickangle ? 80 : 50, l: 60, r: 20 },
          xaxis: { title: xTitle ? { text: xTitle } : undefined, type: "category", tickangle, automargin: true },
          yaxis: { title: yTitle ? { text: yTitle } : undefined, zeroline: false },
          showlegend: legend,
          legend: { orientation: "h", y: -0.25 },
          barmode: "group",
        }}
      />
    </div>
  );

  const anovaTable = (rows: typeof r.anovaWith, title: string) => (
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <table className="border-collapse text-xs w-full">
        <thead>
          <tr>
            <Th>Source</Th><Th>DF</Th><Th>SS</Th><Th>MS</Th><Th>F</Th><Th>P</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.source}>
              <Td>{row.source}</Td>
              <Td right>{row.df}</Td>
              <Td right>{f(row.ss, 5)}</Td>
              <Td right>{f(row.ms, 6)}</Td>
              <Td right>{row.f !== null ? f(row.f, 3) : ""}</Td>
              <Td right>{row.p !== null ? f(row.p, 3) : ""}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <ReportLayout
        template="chart-text"
        center={
          <div className="space-y-6 w-full">
            {/* ---------- TABLAS ---------- */}
            <div className="space-y-4 text-xs">
              {anovaTable(r.anovaWith, "Two-Way ANOVA Table With Interaction")}

              <p className="italic">
                α to remove interaction term = {f(r.alpha, 2)}
              </p>

              {r.interactionRemoved &&
                anovaTable(r.anovaWithout, "Two-Way ANOVA Table Without Interaction")}

              {/* Variance Components */}
              <div>
                <h4 className="font-semibold mb-1">Gage R&amp;R — Variance Components</h4>
                <table className="border-collapse w-full">
                  <thead>
                    <tr>
                      <Th>Source</Th><Th>VarComp</Th><Th>%Contribution (of VarComp)</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.varComps.map((v) => (
                      <tr key={v.source}>
                        <Td pad={v.indent}>{v.source}</Td>
                        <Td right>{f(v.varComp, 7)}</Td>
                        <Td right>{f(v.pctContribution, 2)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {showTol && (
                  <p className="mt-1">Process tolerance = {f(r.tolerance, 0)}</p>
                )}
              </div>

              {/* Gage Evaluation */}
              <div>
                <h4 className="font-semibold mb-1">Gage Evaluation</h4>
                <table className="border-collapse w-full">
                  <thead>
                    <tr>
                      <Th>Source</Th>
                      <Th>StdDev (SD)</Th>
                      <Th>Study Var (6 × SD)</Th>
                      <Th>%Study Var (%SV)</Th>
                      {showTol && <Th>%Tolerance (SV/Toler)</Th>}
                    </tr>
                  </thead>
                  <tbody>
                    {r.evaluation.map((v) => (
                      <tr key={v.source}>
                        <Td pad={v.indent}>{v.source}</Td>
                        <Td right>{f(v.sd, 6)}</Td>
                        <Td right>{f(v.studyVar, 5)}</Td>
                        <Td right>{f(v.pctStudyVar, 2)}</Td>
                        {showTol && <Td right>{f(v.pctTolerance, 2)}</Td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-1 font-medium">
                  Number of Distinct Categories = {r.ndc}
                </p>
              </div>
            </div>

            {/* ---------- 6 GRÁFICOS (grid 2×3) ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Chart({
                traces: compTraces,
                title: "Components of Variation",
                yTitle: "Percent",
                legend: true,
                tickangle: -20,
              })}
              {Chart({
                traces: byPartTraces,
                title: "Measurement by Part",
                xTitle: "Part",
              })}
              {Chart({
                traces: rTraces,
                title: "R Chart by Operator",
                yTitle: "Sample Range",
                tickangle: -45,
              })}
              {Chart({
                traces: byOpTraces,
                title: "Measurement by Operator",
                xTitle: "Operator",
              })}
              {Chart({
                traces: xTraces,
                title: "Xbar Chart by Operator",
                yTitle: "Sample Mean",
                tickangle: -45,
              })}
              {Chart({
                traces: interTraces,
                title: "Part * Operator Interaction",
                xTitle: "Part",
                legend: true,
              })}
            </div>
          </div>
        }
      />
    </div>
  );
}
