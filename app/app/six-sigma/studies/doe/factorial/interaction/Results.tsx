// app/app/six-sigma/studies/doe/factorial/interaction/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../../components/ReportLayout";
import ResultChart from "../../../../components/ResultChart";
import type { DoeIntResult } from "./types";

/** Un color por nivel del factor de la fila. */
const PALETTE = [
  "#1d4ed8",
  "#b91c1c",
  "#00674d",
  "#a21caf",
  "#c2410c",
  "#0369a1",
  "#4d7c0f",
  "#7c3aed",
];
const DASH = ["solid", "dash", "dot", "dashdot"] as const;
const SYMBOL = ["circle", "square", "diamond", "triangle-up"] as const;

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const signed = (v: number, dec: number): string => {
  if (!Number.isFinite(v)) return "\u2014";
  return `${v < 0 ? "\u2212" : "+"}${Math.abs(v).toFixed(dec).replace(".", ",")}`;
};

export default function DoeIntResults({
  result,
}: {
  result: DoeIntResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta y al menos dos factores."}
      </div>
    );
  }

  const r = result;
  const { nRows, nCols } = r;

  // Rejilla manual: el numero de paneles es variable y Plotly no la reparte.
  const gapX = nCols > 4 ? 0.015 : 0.035;
  const gapY = nRows > 4 ? 0.025 : 0.05;
  const w = (1 - (nCols - 1) * gapX) / nCols;
  const h = (1 - (nRows - 1) * gapY) / nRows;
  const xDom = (c: number): [number, number] => [
    c * (w + gapX),
    c * (w + gapX) + w,
  ];
  // La fila 0 arriba, como en la hoja.
  const yDom = (rw: number): [number, number] => [
    1 - (rw * (h + gapY) + h),
    1 - rw * (h + gapY),
  ];
  const axId = (rw: number, c: number) => rw * nCols + c + 1;
  const sfx = (n: number) => (n === 1 ? "" : String(n));

  const traces: Data[] = [];
  const annotations: NonNullable<Partial<Layout>["annotations"]> = [];

  for (const p of r.panels) {
    const id = axId(p.row, p.col);

    if (p.diagonal) {
      const [x0, x1] = xDom(p.col);
      const [y0, y1] = yDom(p.row);
      // El nombre del factor y, debajo, sus niveles con el color de cada linea.
      annotations.push({
        xref: "paper",
        yref: "paper",
        x: (x0 + x1) / 2,
        y: (y0 + y1) / 2 + 0.02,
        text: `<b>${p.rowFactor}</b>`,
        showarrow: false,
        xanchor: "center",
        yanchor: "bottom",
        font: { size: nCols > 4 ? 10 : 12 },
      });
      const legend = r.levels[p.row]
        .map(
          (lv, i) =>
            `<span style="color:${PALETTE[i % PALETTE.length]}">\u25CF ${lv}</span>`
        )
        .join("  ");
      annotations.push({
        xref: "paper",
        yref: "paper",
        x: (x0 + x1) / 2,
        y: (y0 + y1) / 2 - 0.01,
        text: legend,
        showarrow: false,
        xanchor: "center",
        yanchor: "top",
        font: { size: nCols > 4 ? 8 : 10 },
      });
      continue;
    }

    for (const s of p.series) {
      const color = PALETTE[s.levelIndex % PALETTE.length];
      traces.push({
        type: "scatter",
        mode: "lines+markers",
        x: p.xLabels.map((_, j) => j),
        y: s.means,
        xaxis: `x${sfx(id)}`,
        yaxis: `y${sfx(id)}`,
        line: {
          color,
          width: 2,
          dash: DASH[s.levelIndex % DASH.length],
        },
        marker: {
          color,
          size: nCols > 4 ? 6 : 8,
          symbol: SYMBOL[s.levelIndex % SYMBOL.length],
        },
        connectgaps: true,
        showlegend: false,
        customdata: p.xLabels.map((lb, j) => [lb, s.ns[j]]),
        hovertemplate:
          `${p.rowFactor} = ${s.label}<br>${p.colFactor} = %{customdata[0]}` +
          `<br>Mean: %{y:.4f}<br>n = %{customdata[1]}<extra></extra>`,
      } as unknown as Data);
    }

    // En modo fila hace falta rotular el par y sus colores encima del panel.
    if (!r.fullMatrix) {
      const [x0, x1] = xDom(p.col);
      const [, y1] = yDom(p.row);
      const legend = p.series
        .map(
          (s) =>
            `<span style="color:${
              PALETTE[s.levelIndex % PALETTE.length]
            }">\u25CF ${s.label}</span>`
        )
        .join("  ");
      annotations.push({
        xref: "paper",
        yref: "paper",
        x: (x0 + x1) / 2,
        y: y1 + 0.01,
        text: `<b>${p.rowFactor}</b> ${legend}`,
        showarrow: false,
        xanchor: "center",
        yanchor: "bottom",
        font: { size: 10 },
      });
    }
  }

  const layout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 70, r: 20, t: r.fullMatrix ? 20 : 46, b: 55 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
    hovermode: "closest",
    annotations,
  };

  for (const p of r.panels) {
    const id = axId(p.row, p.col);
    const bottom = p.row === nRows - 1;
    const left = p.col === 0;
    const nx = Math.max(1, p.xLabels.length);

    layout[`xaxis${sfx(id)}`] = {
      domain: xDom(p.col),
      anchor: `y${sfx(id)}`,
      range: [-0.35, nx - 0.65],
      tickmode: "array",
      tickvals: p.xLabels.map((_, j) => j),
      ticktext: p.xLabels,
      tickfont: { size: 9 },
      showticklabels: !p.diagonal,
      title:
        bottom && !p.diagonal
          ? { text: p.colFactor, font: { size: 10 } }
          : undefined,
      showgrid: false,
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
    layout[`yaxis${sfx(id)}`] = {
      domain: yDom(p.row),
      anchor: `x${sfx(id)}`,
      range: r.sharedScale ? r.yRange : undefined,
      showticklabels: left && !p.diagonal,
      tickfont: { size: 9 },
      nticks: 4,
      title:
        left && !p.diagonal
          ? { text: `Mean of ${r.response}`, font: { size: 10 } }
          : undefined,
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
  }

  const height = r.fullMatrix
    ? Math.max(380, Math.min(170 * nRows + 100, 900))
    : 400;

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  const top = r.pairs[0];
  // Se compara con el mayor efecto principal: una interaccion pequena frente a
  // el permite leer los efectos principales tal cual.
  const ratio = r.largestMain > 0 ? (2 * top.maxDeparture) / r.largestMain : NaN;
  const mild = Number.isFinite(ratio) && ratio < 0.3;
  const anyTwoLevel = r.pairs.some((p) => Number.isFinite(p.effect));

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Interaction Plot for {r.response}
          </h3>
          <p className="-mt-4 text-xs text-gray-500">Data Means</p>

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
            <p className="mt-2 text-xs text-gray-600">
              Parallel lines mean no interaction. The more they diverge, or
              cross, the more the effect of one factor depends on the other.
              {r.sharedScale
                ? " Every panel shares the vertical scale, so the panels are comparable."
                : " Each panel is scaled on its own: do NOT compare panels."}
            </p>
          </section>

          {/* Resumen por par */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Interaction size
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Pair</th>
                  {anyTwoLevel && <th className={th}>Effect</th>}
                  <th className={th}>Departure</th>
                  <th className={th}>vs largest main</th>
                </tr>
              </thead>
              <tbody>
                {r.pairs.map((p, i) => {
                  const rel =
                    r.largestMain > 0
                      ? (2 * p.maxDeparture) / r.largestMain
                      : NaN;
                  return (
                    <tr
                      key={`${p.a}-${p.b}`}
                      className={`border-b border-gray-200 ${
                        i === 0 ? "bg-emerald-50 font-semibold" : ""
                      }`}
                    >
                      <td className={tdL}>
                        {p.a} {"\u00d7"} {p.b}
                      </td>
                      {anyTwoLevel && (
                        <td className={td}>{signed(p.effect, 4)}</td>
                      )}
                      <td className={td}>{fx(p.maxDeparture, 4)}</td>
                      <td className={td}>
                        {Number.isFinite(rel) ? `${fx(100 * rel, 0)}%` : "\u2014"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              {anyTwoLevel
                ? "Effect is half the difference between the simple effect of the first factor at the high and at the low level of the second. "
                : ""}
              Departure is the largest deviation from a purely additive model,
              and is exactly zero when the lines are parallel. The last column
              puts it against the biggest main effect, {r.largestMainName} at{" "}
              {fx(r.largestMain, 4)}.
            </p>
          </section>

          {/* Tablas cruzadas */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Cell means
            </h4>
            <div className="flex flex-wrap gap-6">
              {r.panels
                .filter(
                  (p) => !p.diagonal && (!r.fullMatrix || p.row < p.col)
                )
                .map((p) => (
                  <table
                    key={`${p.rowFactor}-${p.colFactor}`}
                    className="border-collapse text-sm"
                  >
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className={thL}>
                          {p.rowFactor} {"\\"} {p.colFactor}
                        </th>
                        {p.xLabels.map((lb) => (
                          <th key={lb} className={th}>
                            {lb}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {p.series.map((s) => (
                        <tr key={s.label} className="border-b border-gray-200">
                          <td className={tdL}>{s.label}</td>
                          {s.means.map((v, j) => (
                            <td key={j} className={td}>
                              {v === null ? "\u2014" : fx(v, 4)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
            </div>
          </section>

          {/* Lectura */}
          <section
            className={`rounded-md border px-4 py-3 text-sm ${
              mild
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-semibold">
              {top.a} {"\u00d7"} {top.b} is the largest interaction
              {Number.isFinite(ratio)
                ? `, about ${fx(100 * ratio, 0)}% of the ${r.largestMainName} main effect`
                : ""}
            </p>
            <p className="mt-1">
              {mild
                ? "Small compared with the main effects, so the lines are close to parallel. The main effects can be read on their own, and each factor can be set independently."
                : "Large enough to matter. Do NOT read the main effects on their own: the best level of one factor depends on the level of the other, so they have to be chosen together."}
            </p>
            <p className="mt-2 text-xs">
              This plot does no testing. To decide whether an interaction is more
              than noise you need replicates and the factorial analysis.
            </p>
          </section>

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} run(s), {r.factors.length} factor(s), {r.pairs.length} pair(s).
              Overall mean {fx(r.grandMean, 4)}.
            </p>
            {r.pairs.some((p) => p.emptyCells > 0) && (
              <p className="text-amber-700">
                Some factor combinations were never run, so those lines are
                broken. A fractional design cannot show every pair.
              </p>
            )}
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) skipped: the response or a factor level was
                missing.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
