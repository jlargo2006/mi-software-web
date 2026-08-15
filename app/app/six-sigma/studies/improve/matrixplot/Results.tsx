// app/app/six-sigma/studies/improve/matrixplot/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import type { ImpMatrixResult } from "./types";

const PALETTE = [
  "#1d4ed8",
  "#b91c1c",
  "#00674d",
  "#a21caf",
  "#c2410c",
  "#0369a1",
  "#4d7c0f",
  "#7c3aed",
  "#be123c",
  "#0f766e",
  "#a16207",
  "#475569",
];
const SMOOTH = "#111827";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

export default function ImpMatrixResults({
  result,
}: {
  result: ImpMatrixResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona las variables del grafico."}
      </div>
    );
  }

  const r = result;
  const { nRows, nCols } = r;

  // Rejilla manual: Plotly no reparte dominios solo cuando hay 36 paneles.
  const gapX = nCols > 4 ? 0.012 : 0.03;
  const gapY = nRows > 4 ? 0.02 : 0.04;
  const w = (1 - (nCols - 1) * gapX) / nCols;
  const h = (1 - (nRows - 1) * gapY) / nRows;
  const xDom = (c: number): [number, number] => [
    c * (w + gapX),
    c * (w + gapX) + w,
  ];
  // La fila 0 va arriba, como en la hoja.
  const yDom = (rw: number): [number, number] => [
    1 - (rw * (h + gapY) + h),
    1 - rw * (h + gapY),
  ];

  const axId = (rw: number, c: number) => rw * nCols + c + 1;
  const sfx = (k: number) => (k === 1 ? "" : String(k));

  const traces: Data[] = [];
  const seen = new Set<string>();

  for (const p of r.panels) {
    if (p.diagonal) continue;
    const k = axId(p.row, p.col);

    p.series.forEach((s, si) => {
      // La leyenda se rellena con el primer panel que trae cada grupo.
      const first = s.label !== "" && !seen.has(s.label);
      if (first) seen.add(s.label);
      traces.push({
        type: "scattergl",
        mode: "markers",
        x: s.x,
        y: s.y,
        xaxis: `x${sfx(k)}`,
        yaxis: `y${sfx(k)}`,
        marker: {
          color: s.label === "" ? PALETTE[0] : PALETTE[si % PALETTE.length],
          size: nCols > 4 ? 4 : 6,
        },
        name: s.label || "Data",
        legendgroup: s.label || undefined,
        showlegend: first,
        hovertemplate:
          `${p.xName}: %{x}<br>${p.yName}: %{y}<extra></extra>`,
      } as unknown as Data);
    });

    if (p.smooth) {
      traces.push({
        type: "scatter",
        mode: "lines",
        x: p.smooth.x,
        y: p.smooth.y,
        xaxis: `x${sfx(k)}`,
        yaxis: `y${sfx(k)}`,
        line: { color: SMOOTH, width: 1.8 },
        showlegend: false,
        hoverinfo: "skip",
      } as unknown as Data);
    }
  }

  // Los ejes se montan a mano por el numero variable de paneles.
  const layout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 70, r: 20, t: 20, b: 55 },
    hovermode: "closest",
    showlegend: r.groupLabels.length > 0,
    legend: r.groupLabels.length
      ? { orientation: "h", y: -0.06, x: 0, font: { size: 11 } }
      : undefined,
    plot_bgcolor: "#ffffff",
  };

  const annotations: Partial<Layout>["annotations"] = [];

  for (const p of r.panels) {
    const k = axId(p.row, p.col);
    const bottom = p.row === nRows - 1;
    const left = p.col === 0;

    layout[`xaxis${sfx(k)}`] = {
      domain: xDom(p.col),
      anchor: `y${sfx(k)}`,
      range: r.ranges[p.xName],
      nticks: 3,
      showticklabels: bottom,
      tickfont: { size: 9 },
      title: bottom && r.kind === "eachYX" ? { text: p.xName } : undefined,
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
    layout[`yaxis${sfx(k)}`] = {
      domain: yDom(p.row),
      anchor: `x${sfx(k)}`,
      range: r.ranges[p.yName],
      nticks: 3,
      showticklabels: left,
      tickfont: { size: 9 },
      title: left && r.kind === "eachYX" ? { text: p.yName } : undefined,
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };

    // El nombre de la variable ocupa la celda diagonal, como en Minitab.
    if (p.diagonal) {
      const [x0, x1] = xDom(p.col);
      const [y0, y1] = yDom(p.row);
      annotations.push({
        xref: "paper",
        yref: "paper",
        x: (x0 + x1) / 2,
        y: (y0 + y1) / 2,
        text: `<b>${p.yName}</b>`,
        showarrow: false,
        xanchor: "center",
        yanchor: "middle",
        font: { size: nCols > 4 ? 10 : 12 },
      });
    }
  }

  // En modo cada-Y-frente-a-cada-X los nombres van en los ejes exteriores.
  layout.annotations = annotations;

  const height = Math.max(380, Math.min(180 * nRows + 110, 900));

  const th = "py-1 pr-6 text-left font-medium text-gray-600";
  const td = "py-1 pr-6";

  // Tabla de correlaciones: solo los pares distintos, sin repetir simetricos.
  const pairs = r.panels
    .filter((p) => !p.diagonal && Number.isFinite(p.r))
    .filter((p) => (r.kind === "matrix" ? p.row < p.col : true))
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Matrix Plot of {r.colVars.join("; ")}
            {r.kind === "eachYX" ? ` versus ${r.rowVars.join("; ")}` : ""}
          </h3>

          <section className="mb-6">
            <div
              className="border border-gray-200 rounded"
              style={{ height }}
            >
              <ResultChart
                data={traces}
                layout={{ autosize: true, ...layout }}
              />
            </div>
          </section>

          {pairs.length > 0 && (
            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Pairwise correlation
              </h4>
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className={th}>Pair</th>
                    <th className={th}>N</th>
                    <th className="py-1 text-left font-medium text-gray-600">
                      Pearson r
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pairs.map((p) => (
                    <tr
                      key={`${p.row}-${p.col}`}
                      className="border-b border-gray-200"
                    >
                      <td className={td}>
                        {p.yName} {"\u2013"} {p.xName}
                      </td>
                      <td className={td}>{p.n}</td>
                      <td
                        className={`py-1 ${
                          Math.abs(p.r) >= 0.7 ? "font-semibold" : ""
                        }`}
                      >
                        {fx(p.r, 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-600">
                Ordered by strength. The coefficient only measures the straight
                line part: read it against the panel, never on its own.
              </p>
            </section>
          )}

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.nRows} {"\u00d7"} {r.nCols} panels, up to {r.nUsed} complete
              pair(s) each.
              {r.groupColumn
                ? ` Grouped by ${r.groupColumn} (${r.groupLabels.length}).`
                : ""}
            </p>
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} cell(s) missing or non-numeric. Each panel uses its
                own complete pairs.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
