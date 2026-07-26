// app/app/six-sigma/studies/multivari/Results.tsx
"use client";
import React from "react";
import type { Data } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { MultiVariParams, MultiVariResult, MVMean, MVPoint } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";

const PALETTE = [
  "#c0392b",
  "#2980b9",
  "#27ae60",
  "#8e44ad",
  "#d35400",
  "#16a085",
  "#7f8c8d",
  "#2c3e50",
];

const f = (v: number | null, dec = 4): string =>
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

/* ---------- trazas de un panel ---------- */

function panelTraces(
  points: MVPoint[],
  means: MVMean[],
  seriesLevels: string[],
  xLevels: string[],
  showPoints: boolean,
  connectMeans: boolean,
  showLegend: boolean
): Data[] {
  const traces: Data[] = [];

  seriesLevels.forEach((s, si) => {
    const color = PALETTE[si % PALETTE.length];

    if (showPoints) {
      const pts = points.filter((p) => p.series === s);
      traces.push({
        type: "scatter",
        mode: "markers",
        x: pts.map((p) => p.x),
        y: pts.map((p) => p.value),
        marker: { color, size: 6, opacity: 0.55, symbol: "circle" },
        name: s === "" ? "data" : s,
        legendgroup: s,
        showlegend: false,
        hovertemplate: "%{y}<extra></extra>",
      });
    }

    if (connectMeans) {
      const ms = xLevels
        .map((x) => means.find((m) => m.series === s && m.x === x))
        .filter((m): m is MVMean => !!m);

      traces.push({
        type: "scatter",
        mode: "lines+markers",
        x: ms.map((m) => m.x),
        y: ms.map((m) => m.mean),
        line: { color, width: 2 },
        marker: { color, size: 9, symbol: "circle" },
        name: s === "" ? "mean" : s,
        legendgroup: s,
        showlegend: showLegend,
        hovertemplate: "mean %{y:.4f}<extra></extra>",
      });
    }
  });

  return traces;
}

/* ---------- un panel ---------- */

function Panel({
  title,
  traces,
  yRange,
  xTitle,
  yTitle,
  grandMean,
  showLegend,
  showYTitle,
}: {
  title: string;
  traces: Data[];
  yRange: [number, number];
  xTitle: string;
  yTitle: string;
  grandMean: number | null;
  showLegend: boolean;
  showYTitle: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded" style={{ height: 360 }}>
      <ResultChart
        data={traces}
        layout={{
          autosize: true,
          title: { text: title, font: { size: 12 } },
          margin: { t: 40, b: 55, l: showYTitle ? 60 : 40, r: showLegend ? 120 : 12 },
          xaxis: {
            title: { text: xTitle },
            type: "category",
            automargin: true,
          },
          yaxis: {
            title: { text: showYTitle ? yTitle : "" },
            range: yRange,
            zeroline: false,
          },
          showlegend: showLegend,
          legend: { x: 1.02, xanchor: "left", y: 1, yanchor: "top" },
          shapes:
            grandMean === null
              ? []
              : [
                  {
                    type: "line",
                    xref: "paper",
                    x0: 0,
                    x1: 1,
                    yref: "y",
                    y0: grandMean,
                    y1: grandMean,
                    line: { color: "#7f8c8d", width: 1, dash: "dash" },
                  },
                ],
        }}
      />
    </div>
  );
}

/* ---------- tabla de resumen ---------- */

function SummaryTable({
  factor,
  levels,
}: {
  factor: string;
  levels: { label: string; n: number; mean: number; sd: number | null }[];
}) {
  return (
    <div>
      <h5 className="font-semibold mb-1">{factor}</h5>
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <Th>Level</Th>
            <Th>N</Th>
            <Th>Mean</Th>
            <Th>StDev</Th>
          </tr>
        </thead>
        <tbody>
          {levels.map((lv) => (
            <tr key={lv.label}>
              <Td>{lv.label}</Td>
              <Td right>{lv.n}</Td>
              <Td right>{f(lv.mean)}</Td>
              <Td right>{f(lv.sd)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- componente principal ---------- */

export default function MultiVariResults({
  params,
  result,
}: {
  data: ColumnSnapshot;
  params: MultiVariParams;
  result: MultiVariResult;
}) {
  const r = result;

  if (!r || !r.ok) {
    return (
      <div className="p-4 text-sm text-gray-600">
        {r?.error ?? "Select the response column and at least one factor."}
      </div>
    );
  }

  const { xLevels, seriesLevels, panelLevels, rowLevels } = r;
  const gm = params.showGrandMean ? r.grandMean : null;

  const panelTitle = (rowLv: string, panLv: string) => {
    const parts: string[] = [];
    if (r.labels.row) parts.push(`${r.labels.row} = ${rowLv}`);
    if (r.labels.panel) parts.push(`${r.labels.panel} = ${panLv}`);
    return parts.join("   |   ");
  };

  const grid: React.ReactNode[] = [];
  let firstPanel = true;

  rowLevels.forEach((rowLv) => {
    panelLevels.forEach((panLv, pi) => {
      const pts = r.points.filter((p) => p.row === rowLv && p.panel === panLv);
      const mns = r.means.filter((m) => m.row === rowLv && m.panel === panLv);

      const traces = panelTraces(
        pts,
        mns,
        seriesLevels,
        xLevels,
        params.showPoints,
        params.connectMeans,
        firstPanel
      );

      grid.push(
        <Panel
          key={`${rowLv}|${panLv}`}
          title={panelTitle(rowLv, panLv)}
          traces={traces}
          yRange={r.yRange}
          xTitle={r.labels.x}
          yTitle={r.labels.response}
          grandMean={gm}
          showLegend={firstPanel}
          showYTitle={pi === 0}
        />
      );
      firstPanel = false;
    });
  });

  const cols = Math.min(Math.max(panelLevels.length, 1), 3);
  const gridClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-6">
      <ReportLayout
        template="chart-text"
        center={
          <div className="space-y-6 w-full text-xs">
            <div>
              <h4 className="font-bold text-sm mb-2">
                Multi-Vari Chart for {r.labels.response}
              </h4>
              <div className={`grid gap-4 ${gridClass}`}>{grid}</div>
            </div>

            <section className="space-y-3">
              <h4 className="font-bold text-sm">Summary by factor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {r.summaries.map((s) => (
                  <SummaryTable key={s.factor} factor={s.factor} levels={s.levels} />
                ))}
              </div>
              <p className="text-xs italic">
                N = {r.n} observations{r.missing > 0 ? `, ${r.missing} discarded` : ""}. Grand
                mean = {f(r.grandMean)}.
              </p>
            </section>

            {r.notes.length > 0 && (
              <div className="space-y-1">
                {r.notes.map((nt, i) => (
                  <p key={i} className="italic">
                    * NOTE * {nt}
                  </p>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
