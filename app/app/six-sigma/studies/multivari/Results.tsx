// app/app/six-sigma/studies/multivari/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import type { ColumnSnapshot } from "../types";
import type { MultiVariParams, MultiVariResult, MVGroupMean } from "./types";
import ResultChart from "../../components/ResultChart";
import ReportLayout from "../../components/ReportLayout";

/* Estilo por profundidad: el nivel externo domina visualmente. */
const DEPTH_STYLE = [
  { color: "#111827", width: 3, size: 11, symbol: "circle" },
  { color: "#c0392b", width: 2, size: 8, symbol: "circle" },
  { color: "#2980b9", width: 1.2, size: 5, symbol: "circle" },
  { color: "#27ae60", width: 1, size: 4, symbol: "circle" },
] as const;

const styleAt = (d: number) => DEPTH_STYLE[Math.min(d, DEPTH_STYLE.length - 1)];

const f = (v: number | null, dec = 4): string =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "*"
    : v.toFixed(dec).replace(".", ",");

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
        {r?.error ?? "Select the response column and at least Factor 1."}
      </div>
    );
  }

  const L = r.factorNames.length;
  const traces: Data[] = [];

  /* --- puntos individuales --- */
  if (params.showPoints) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: r.points.map((p) => p.x),
      y: r.points.map((p) => p.value),
      marker: { color: "#9ca3af", size: 5, opacity: 0.7, symbol: "circle-open" },
      name: "Observations",
      hovertemplate: "%{y:.4f}<extra></extra>",
      showlegend: true,
    });
  }

  /* --- una traza por nivel, uniendo medias dentro de su grupo padre --- */
  for (let d = L - 1; d >= 0; d--) {
    const st = styleAt(d);
    const atDepth = r.groupMeans.filter((g) => g.depth === d);

    // Agrupar por padre e insertar null para cortar la linea entre grupos.
    const byParent = new Map<string, MVGroupMean[]>();
    for (const g of atDepth) {
      const arr = byParent.get(g.parent);
      if (arr) arr.push(g);
      else byParent.set(g.parent, [g]);
    }

    const xs: (number | null)[] = [];
    const ys: (number | null)[] = [];
    const txt: string[] = [];

    let first = true;
    for (const grp of byParent.values()) {
      if (!first) {
        xs.push(null);
        ys.push(null);
        txt.push("");
      }
      first = false;
      grp
        .slice()
        .sort((a, b) => a.x - b.x)
        .forEach((g) => {
          xs.push(g.x);
          ys.push(g.mean);
          txt.push(`${r.factorNames[d]} = ${g.path[d]}<br>mean ${g.mean.toFixed(4)} (n=${g.n})`);
        });
    }

    traces.push({
      type: "scatter",
      mode: "lines+markers",
      x: xs,
      y: ys,
      line: { color: st.color, width: st.width },
      marker: { color: st.color, size: st.size, symbol: st.symbol },
      name: r.factorNames[d],
      text: txt,
      hovertemplate: "%{text}<extra></extra>",
      connectgaps: false,
      showlegend: true,
    });
  }

  /* --- separadores verticales --- */
  const shapes: Partial<Layout>["shapes"] = r.separators.map((x) => ({
    type: "line" as const,
    xref: "x" as const,
    yref: "paper" as const,
    x0: x,
    x1: x,
    y0: 0,
    y1: 1,
    line: { color: "#9ca3af", width: 1 },
  }));

  if (params.showGrandMean) {
    shapes.push({
      type: "line",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: r.grandMean,
      y1: r.grandMean,
      line: { color: "#6b7280", width: 1, dash: "dot" },
    });
  }

  /* --- etiquetas de los niveles superiores, en filas bajo el eje --- */
  const ROW_H = 0.075;
  const rowY = (depth: number) => -0.10 - ROW_H * (L - 2 - depth);

  const annotations: Partial<Layout>["annotations"] = r.axisLabels.map((lb) => ({
    x: lb.x,
    y: rowY(lb.depth),
    xref: "x" as const,
    yref: "paper" as const,
    text: lb.text,
    showarrow: false,
    font: { size: lb.depth === 0 ? 12 : 11, color: "#374151" },
    xanchor: "center" as const,
    yanchor: "top" as const,
  }));

  // Nombre de cada factor a la izquierda de su fila.
  r.factorNames.forEach((name, d) => {
    annotations.push({
      x: 0,
      y: d === L - 1 ? -0.035 : rowY(d),
      xref: "paper",
      yref: "paper",
      text: `<b>${name}</b>`,
      showarrow: false,
      font: { size: 10, color: "#6b7280" },
      xanchor: "right",
      yanchor: "top",
      xshift: -8,
    });
  });

  const bottomMargin = 70 + (L - 1) * 26;

  return (
    <div className="space-y-6">
      <ReportLayout
        template="chart-text"
        center={
          <div className="space-y-6 w-full text-xs">
            <div style={{ height: 480 }} className="border border-gray-200 rounded">
              <ResultChart
                data={traces}
                layout={{
                  autosize: true,
                  title: {
                    text: `Multi-Vari Chart for ${r.responseName}`,
                    font: { size: 14 },
                  },
                  margin: { t: 50, b: bottomMargin, l: 130, r: 140 },
                  xaxis: {
                    range: r.xRange,
                    tickmode: "array",
                    tickvals: r.tickVals,
                    ticktext: r.tickText,
                    tickangle: 0,
                    showgrid: false,
                    zeroline: false,
                  },
                  yaxis: {
                    title: { text: r.responseName },
                    range: r.yRange,
                    zeroline: false,
                  },
                  shapes,
                  annotations,
                  legend: { x: 1.02, xanchor: "left", y: 1, yanchor: "top" },
                  hovermode: "closest",
                }}
              />
            </div>

            <section className="space-y-3">
              <h4 className="font-bold text-sm">Summary by factor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {r.summaries.map((s) => (
                  <div key={s.factor}>
                    <h5 className="font-semibold mb-1">{s.factor}</h5>
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
                        {s.levels.map((lv) => (
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
                ))}
              </div>
              <p className="text-xs italic">
                N = {r.n} observations
                {r.missing > 0 ? `, ${r.missing} discarded` : ""}. Grand mean ={" "}
                {f(r.grandMean)}.
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
