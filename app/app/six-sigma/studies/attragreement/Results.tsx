// app/app/six-sigma/studies/attragreement/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { AttrAgreementParams, AttrAgreementResult } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";
import type { AgreementRow, KappaRow, KappaBlock } from "../../lib/attributeAgreement";

const f = (v: number | null, dec: number): string =>
  v === null || !Number.isFinite(v) ? "*" : v.toFixed(dec).replace(".", ",");

const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="border border-gray-300 px-2 py-1 bg-gray-100 text-left font-semibold">
    {children}
  </th>
);
const Td = ({ children, right }: { children?: React.ReactNode; right?: boolean }) => (
  <td className={`border border-gray-300 px-2 py-1 ${right ? "text-right" : ""}`}>
    {children}
  </td>
);

export default function AttrAgreementResults({
  result,
}: {
  data: ColumnSnapshot;
  params: AttrAgreementParams;
  result: AttrAgreementResult;
}) {
  const r = result;

  if (!r || !r.ok) {
    return (
      <div className="p-4 text-sm text-gray-600">
        {r?.error ?? "Select the Appraiser, Sample and Rating columns."}
      </div>
    );
  }

  const confLabel = `${(r.conf * 100).toFixed(0)}% CI`;

  const ciTxt = (row: AgreementRow) =>
    `(${f(row.ci.lower, 2)}; ${f(row.ci.upper, 2)})`;

  // ---------- tabla de acuerdo ----------
  const agreementTable = (
    rows: AgreementRow[],
    withLabel: boolean,
    note: string
  ) => (
    <div>
      <h5 className="font-semibold mb-1">Assessment Agreement</h5>
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {withLabel && <Th>Appraiser</Th>}
            <Th># Inspected</Th>
            <Th># Matched</Th>
            <Th>Percent</Th>
            <Th>{confLabel}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label + i}>
              {withLabel && <Td>{row.label}</Td>}
              <Td right>{row.inspected}</Td>
              <Td right>{row.matched}</Td>
              <Td right>{f(row.percent, 2)}</Td>
              <Td right>{ciTxt(row)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic mt-1"># Matched: {note}</p>
    </div>
  );

  // ---------- tabla de kappa (bloques por tasador) ----------
  const kappaBlocks = (blocks: KappaBlock[]) => (
    <div>
      <h5 className="font-semibold mb-1">Fleiss&rsquo; Kappa Statistics</h5>
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <Th>Appraiser</Th><Th>Response</Th><Th>Kappa</Th>
            <Th>SE Kappa</Th><Th>Z</Th><Th>P(vs &gt; 0)</Th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((blk) =>
            blk.rows.map((row, j) => (
              <tr key={blk.label + row.label}>
                <Td>{j === 0 ? blk.label : ""}</Td>
                <Td>{row.label}</Td>
                <Td right>{f(row.kappa, 5)}</Td>
                <Td right>{f(row.se, 6)}</Td>
                <Td right>{f(row.z, 5)}</Td>
                <Td right>{f(row.p, 4)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ---------- tabla de kappa simple ----------
  const kappaTable = (rows: KappaRow[]) => (
    <div>
      <h5 className="font-semibold mb-1">Fleiss&rsquo; Kappa Statistics</h5>
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <Th>Response</Th><Th>Kappa</Th><Th>SE Kappa</Th>
            <Th>Z</Th><Th>P(vs &gt; 0)</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <Td>{row.label}</Td>
              <Td right>{f(row.kappa, 6)}</Td>
              <Td right>{f(row.se, 7)}</Td>
              <Td right>{f(row.z, 4)}</Td>
              <Td right>{f(row.p, 4)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ---------- gráficos ----------
  const ciChart = (rows: AgreementRow[], title: string): Data[] => {
    const x = rows.map((v) => v.label);
    const traces: Data[] = [];
    // barras de error verticales en rojo
    rows.forEach((row, i) => {
      traces.push({
        type: "scatter", mode: "lines",
        x: [row.label, row.label],
        y: [row.ci.lower, row.ci.upper],
        line: { color: "#c0392b", width: 1.5 },
        showlegend: false, hoverinfo: "skip",
      });
    });
    // extremos como "x" azules
    traces.push({
      type: "scatter", mode: "markers",
      x: [...x, ...x],
      y: [...rows.map((v) => v.ci.lower), ...rows.map((v) => v.ci.upper)],
      marker: { color: "#2980b9", symbol: "x", size: 9 },
      name: confLabel,
    });
    // percent como punto azul
    traces.push({
      type: "scatter", mode: "markers",
      x, y: rows.map((v) => v.percent),
      marker: { color: "#2980b9", symbol: "circle", size: 10 },
      name: "Percent",
    });
    return traces;
  };

  const Chart = ({ rows, title }: { rows: AgreementRow[]; title: string }) => (
    <div className="border border-gray-200 rounded" style={{ height: 340 }}>
      <ResultChart
        data={ciChart(rows, title)}
        layout={{
          autosize: true,
          title: { text: title, font: { size: 13 } },
          margin: { t: 45, b: 60, l: 60, r: 20 },
          xaxis: { title: { text: "Appraiser" }, type: "category", automargin: true },
          yaxis: { title: { text: "Percent" } },
          showlegend: true,
          legend: { x: 1, y: 1, xanchor: "right" },
        }}
      />
    </div>
  );

  const charts: React.ReactNode[] = [];
  if (!r.singleTrial && r.withinAppraiser.length > 0)
    charts.push(<Chart key="within" rows={r.withinAppraiser} title="Within Appraiser" />);
  if (r.hasStandard && r.eachVsStandard.length > 0)
    charts.push(<Chart key="vsstd" rows={r.eachVsStandard} title="Appraiser vs Standard" />);

  return (
    <div className="space-y-6">
      <ReportLayout
        template="chart-text"
        center={
          <div className="space-y-6 w-full text-xs">
            {/* ---------- Within Appraiser ---------- */}
            {!r.singleTrial && (
              <section className="space-y-3">
                <h4 className="font-bold text-sm">Within Appraiser</h4>
                {agreementTable(
                  r.withinAppraiser, true,
                  "Appraiser agrees with him/herself across trials."
                )}
                {kappaBlocks(r.withinKappa)}
              </section>
            )}

            {/* ---------- Each Appraiser vs Standard ---------- */}
            {r.hasStandard && (
              <section className="space-y-3">
                <h4 className="font-bold text-sm">Each Appraiser vs Standard</h4>
                {agreementTable(
                  r.eachVsStandard, true,
                  "Appraiser’s assessment across trials agrees with the known standard."
                )}
                {kappaBlocks(r.eachVsStandardKappa)}
              </section>
            )}

            {/* ---------- Between Appraisers ---------- */}
            {r.betweenAppraisers && (
              <section className="space-y-3">
                <h4 className="font-bold text-sm">Between Appraisers</h4>
                {agreementTable(
                  [r.betweenAppraisers], false,
                  "All appraisers’ assessments agree with each other."
                )}
                {kappaTable(r.betweenKappa)}
              </section>
            )}

            {/* ---------- All Appraisers vs Standard ---------- */}
            {r.allVsStandard && (
              <section className="space-y-3">
                <h4 className="font-bold text-sm">All Appraisers vs Standard</h4>
                {agreementTable(
                  [r.allVsStandard], false,
                  "All appraisers’ assessments agree with the known standard."
                )}
                {kappaTable(r.allVsStandardKappa)}
              </section>
            )}

            {/* ---------- Notas ---------- */}
            {r.notes.length > 0 && (
              <div className="space-y-1">
                {r.notes.map((nt, i) => (
                  <p key={i} className="italic">* NOTE * {nt}</p>
                ))}
              </div>
            )}

            {/* ---------- Gráficos ---------- */}
            {charts.length > 0 && (
              <div
                className={`grid gap-4 ${
                  charts.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {charts}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
