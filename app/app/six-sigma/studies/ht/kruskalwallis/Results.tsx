// app/app/six-sigma/studies/ht/kruskalwallis/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import type {
  HTKruskalWallisParams,
  HTKruskalWallisResult,
  KWBox,
} from "./types";

const GREEN = "#00674d";
const SUB0 = "\u2080";
const SUB1 = "\u2081";

const Chart = ({
  traces,
  layout,
  h,
}: {
  traces: Data[];
  layout: Partial<Layout>;
  h: number;
}) => (
  <div className="border border-gray-200 rounded" style={{ height: h }}>
    <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
  </div>
);

/** Formato con coma decimal y numero fijo de decimales. */
const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "\u2014";

/** Formato con coma decimal, sin ceros finales de relleno. */
const f = (v: number, dec = 4): string => {
  if (!Number.isFinite(v)) return "\u2014";
  const s = v.toFixed(dec).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
};

/** Traza de boxplot con los cinco numeros ya calculados al estilo Minitab. */
const boxTraces = (b: KWBox, y: number, name: string): Data[] => {
  const out: Data[] = [
    {
      type: "box",
      y0: y,
      q1: [b.q1],
      median: [b.median],
      q3: [b.q3],
      lowerfence: [b.lowerFence],
      upperfence: [b.upperFence],
      orientation: "h",
      marker: { color: GREEN },
      line: { color: GREEN },
      fillcolor: "rgba(0,103,77,0.12)",
      hoverinfo: "x",
      name,
      showlegend: false,
    } as unknown as Data,
  ];
  if (b.outliers.length) {
    out.push({
      type: "scatter",
      mode: "markers",
      x: b.outliers,
      y: b.outliers.map(() => y),
      marker: { color: GREEN, symbol: "asterisk-open", size: 8 },
      hovertemplate: "%{x}<extra></extra>",
      showlegend: false,
    });
  }
  return out;
};

export default function HTKruskalWallisResults({
  result,
  params,
}: {
  result: HTKruskalWallisResult;
  params: HTKruskalWallisParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Selecciona una respuesta y un factor para ejecutar el an\u00e1lisis."}
      </div>
    );
  }

  const r = result;
  const g = r.groups;

  // Eje X comun a todos los grupos, con margen.
  const all = g.flatMap((x) => x.values);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = (hi - lo) * 0.08 || 1;
  const xRange: [number, number] = [lo - pad, hi + pad];

  // Los grupos se apilan de abajo arriba en el orden de la tabla.
  const yOf = (i: number) => g.length - 1 - i;
  const tickvals = g.map((_, i) => yOf(i));
  const ticktext = g.map((x) => x.level);

  const boxData: Data[] = g.flatMap((x, i) => boxTraces(x.box, yOf(i), x.level));
  const boxLayout: Partial<Layout> = {
    margin: { l: 110, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.responseColumn }, range: xRange },
    yaxis: {
      range: [-0.7, g.length - 0.3],
      tickvals,
      ticktext,
      fixedrange: true,
    },
  };

  // Jitter reproducible.
  const jit = (n: number, seed: number) =>
    Array.from({ length: n }, (_, i) => {
      const s = Math.sin((i + seed) * 12.9898) * 43758.5453;
      return (s - Math.floor(s) - 0.5) * 0.35;
    });
  const ivpData: Data[] = g.map((x, i) => ({
    type: "scatter",
    mode: "markers",
    x: x.values,
    y: jit(x.n, i * 97 + 1).map((j) => yOf(i) + j),
    marker: { color: GREEN, size: 8, symbol: "circle-open", line: { width: 2 } },
    name: x.level,
    hovertemplate: "%{x}<extra></extra>",
    showlegend: false,
  }));
  const ivpLayout: Partial<Layout> = {
    margin: { l: 110, r: 30, t: 10, b: 40 },
    xaxis: { title: { text: r.responseColumn }, range: xRange },
    yaxis: {
      range: [-0.7, g.length - 0.3],
      tickvals,
      ticktext,
      fixedrange: true,
    },
  };

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          {/* Descriptive Statistics */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Descriptive Statistics
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-1 pr-4">{r.factorColumn}</th>
                  <th className="py-1 pr-4">N</th>
                  <th className="py-1 pr-4">Median</th>
                  <th className="py-1 pr-4">Mean Rank</th>
                  <th className="py-1">Z-Value</th>
                </tr>
              </thead>
              <tbody>
                {g.map((x) => (
                  <tr key={x.level} className="border-b border-gray-200">
                    <td className="py-1 pr-4">{x.level}</td>
                    <td className="py-1 pr-4">{x.n}</td>
                    <td className="py-1 pr-4">{fx(x.median, 3)}</td>
                    <td className="py-1 pr-4">{fx(x.meanRank, 1)}</td>
                    <td className="py-1">{fx(x.zValue, 2)}</td>
                  </tr>
                ))}
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-4">Overall</td>
                  <td className="py-1 pr-4">{r.nTotal}</td>
                  <td className="py-1 pr-4" />
                  <td className="py-1 pr-4">{fx(r.overallMeanRank, 1)}</td>
                  <td className="py-1" />
                </tr>
              </tbody>
            </table>
            {r.nMissing > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {r.nMissing} row(s) dropped: the response was empty or not
                numeric, or the group was blank.
              </p>
            )}
          </section>

          {/* Test */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Test</h3>
            <table className="mb-3 border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">Null hypothesis</td>
                  <td className="py-1">H{SUB0}: All medians are equal</td>
                </tr>
                <tr>
                  <td className="py-1 pr-6 text-gray-600">
                    Alternative hypothesis
                  </td>
                  <td className="py-1">
                    H{SUB1}: At least one median is different
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  {r.tiesCorrected && <th className="py-1 pr-6">Method</th>}
                  <th className="py-1 pr-6">DF</th>
                  <th className="py-1 pr-6">H-Value</th>
                  <th className="py-1">P-Value</th>
                </tr>
              </thead>
              <tbody>
                {r.tiesCorrected ? (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="py-1 pr-6">Not adjusted for ties</td>
                      <td className="py-1 pr-6">{r.df}</td>
                      <td className="py-1 pr-6">{fx(r.hNotAdj, 2)}</td>
                      <td className="py-1">{f(r.pNotAdj, 3)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1 pr-6">Adjusted for ties</td>
                      <td className="py-1 pr-6">{r.df}</td>
                      <td className="py-1 pr-6">{fx(r.hAdj, 2)}</td>
                      <td className="py-1">{f(r.pAdj, 3)}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-6">{r.df}</td>
                    <td className="py-1 pr-6">{fx(r.hAdj, 2)}</td>
                    <td className="py-1">{f(r.pAdj, 3)}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {r.smallGroups && (
              <p className="mt-2 text-xs text-amber-700">
                Some groups have fewer than 5 observations: the chi-square
                approximation may be unreliable.
              </p>
            )}
          </section>

          {params.showBoxplot && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Boxplot of {r.responseColumn} by {r.factorColumn}
              </h3>
              <Chart traces={boxData} layout={boxLayout} h={90 + g.length * 60} />
            </section>
          )}

          {params.showIndividualValue && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Individual Value Plot of {r.responseColumn} by {r.factorColumn}
              </h3>
              <Chart traces={ivpData} layout={ivpLayout} h={90 + g.length * 60} />
            </section>
          )}
        </div>
      }
    />
  );
}
