// app/app/six-sigma/studies/doe/factorial/maineffects/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape } from "plotly.js";
import ReportLayout from "../../../../components/ReportLayout";
import ResultChart from "../../../../components/ResultChart";
import type { DoeMainResult } from "./types";

const BLUE = "#1d4ed8";
const GREY = "#6b7280";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const signed = (v: number, dec: number): string => {
  if (!Number.isFinite(v)) return "\u2014";
  const s = Math.abs(v).toFixed(dec).replace(".", ",");
  return `${v < 0 ? "\u2212" : "+"}${s}`;
};

export default function DoeMainResults({
  result,
}: {
  result: DoeMainResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta y los factores."}
      </div>
    );
  }

  const r = result;
  const k = r.effects.length;

  // Rejilla horizontal: un panel por factor, ejes montados a mano porque el
  // numero de paneles es variable.
  const gap = k > 5 ? 0.015 : 0.03;
  const w = (1 - (k - 1) * gap) / k;
  const dom = (i: number): [number, number] => [
    i * (w + gap),
    i * (w + gap) + w,
  ];
  const sfx = (n: number) => (n === 1 ? "" : String(n));

  const traces: Data[] = [];
  const shapes: Partial<Shape>[] = [];

  r.effects.forEach((e, i) => {
    const n = i + 1;
    traces.push({
      type: "scatter",
      mode: "lines+markers",
      x: e.levels.map((_, j) => j),
      y: e.levels.map((l) => l.mean),
      xaxis: `x${sfx(n)}`,
      yaxis: `y${sfx(n)}`,
      line: { color: BLUE, width: 2 },
      marker: { color: BLUE, size: 9 },
      showlegend: false,
      customdata: e.levels.map((l) => [l.label, l.n]),
      hovertemplate:
        `${e.name} = %{customdata[0]}<br>Mean ${r.response}: %{y:.4f}` +
        `<br>n = %{customdata[1]}<extra></extra>`,
    } as unknown as Data);

    if (r.showGrandMean) {
      shapes.push({
        type: "line",
        xref: `x${sfx(n)} domain` as never,
        x0: 0,
        x1: 1,
        yref: `y${sfx(n)}` as never,
        y0: r.grandMean,
        y1: r.grandMean,
        line: { color: GREY, width: 1, dash: "dash" },
      });
    }
  });

  const layout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 70, r: 20, t: 20, b: 60 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
    shapes,
    hovermode: "closest",
  };

  r.effects.forEach((e, i) => {
    const n = i + 1;
    layout[`xaxis${sfx(n)}`] = {
      domain: dom(i),
      anchor: `y${sfx(n)}`,
      range: [-0.35, e.levels.length - 0.65],
      tickmode: "array",
      tickvals: e.levels.map((_, j) => j),
      ticktext: e.levels.map((l) => l.label),
      tickfont: { size: 10 },
      title: { text: e.name, font: { size: 11 } },
      showgrid: false,
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
    layout[`yaxis${sfx(n)}`] = {
      domain: [0, 1],
      anchor: `x${sfx(n)}`,
      range: r.sharedScale ? r.yRange : undefined,
      showticklabels: i === 0 || !r.sharedScale,
      tickfont: { size: 10 },
      title:
        i === 0
          ? { text: `Mean of ${r.response}`, font: { size: 11 } }
          : undefined,
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: "#9ca3af",
      showline: true,
      mirror: true,
    };
  });

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  const strongest = r.ranked[0];
  const weakest = r.ranked[r.ranked.length - 1];
  const twoLevel = r.effects.every((e) => e.levels.length === 2);

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Main Effects Plot for {r.response}
          </h3>
          <p className="-mt-4 text-xs text-gray-500">Data Means</p>

          <section className="mb-6">
            <div
              className="border border-gray-200 rounded"
              style={{ height: 400 }}
            >
              <ResultChart
                data={traces}
                layout={{ autosize: true, ...layout }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {r.sharedScale
                ? "Every panel shares the vertical scale, so the steeper the line, the bigger the effect."
                : "Each panel is scaled on its own: the slopes are NOT comparable between panels."}
              {r.showGrandMean
                ? ` The dashed line is the overall mean, ${fx(r.grandMean, 4)}.`
                : ""}
            </p>
          </section>

          {/* Medias por nivel */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Means by level
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Factor</th>
                  <th className={thL}>Level</th>
                  <th className={th}>N</th>
                  <th className={th}>Mean</th>
                </tr>
              </thead>
              <tbody>
                {r.effects.map((e) =>
                  e.levels.map((l, j) => (
                    <tr
                      key={`${e.name}-${l.label}`}
                      className={`border-b border-gray-200 ${
                        j === 0 ? "border-t border-t-gray-300" : ""
                      }`}
                    >
                      <td className={tdL}>{j === 0 ? e.name : "\u00a0"}</td>
                      <td className={tdL}>{l.label}</td>
                      <td className={td}>{l.n}</td>
                      <td className={td}>{fx(l.mean, 4)}</td>
                    </tr>
                  ))
                )}
                <tr className="border-t border-gray-400 font-medium">
                  <td className={tdL}>Overall</td>
                  <td className={tdL}>{"\u00a0"}</td>
                  <td className={td}>{r.n}</td>
                  <td className={td}>{fx(r.grandMean, 4)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Ranking de efectos */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Effect size
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Factor</th>
                  <th className={th}>Levels</th>
                  <th className={th}>Range</th>
                  {twoLevel && <th className={th}>Effect</th>}
                </tr>
              </thead>
              <tbody>
                {r.ranked.map((e, i) => (
                  <tr
                    key={e.name}
                    className={`border-b border-gray-200 ${
                      i === 0 ? "bg-emerald-50 font-semibold" : ""
                    }`}
                  >
                    <td className={tdL}>{e.name}</td>
                    <td className={td}>{e.levels.length}</td>
                    <td className={td}>{fx(e.range, 4)}</td>
                    {twoLevel && (
                      <td className={td}>{signed(e.signed, 4)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Range is the largest mean minus the smallest.
              {twoLevel
                ? " Effect is the high level minus the low level, so its sign tells you which way to move the factor."
                : ""}{" "}
              Ordered by size, not by significance: this plot does no testing.
            </p>
          </section>

          {/* Lectura */}
          <section className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold">
              {strongest.name} has the largest effect, {fx(strongest.range, 4)}
            </p>
            <p className="mt-1">
              That is {fx(strongest.range / Math.max(weakest.range, 1e-12), 1)}{" "}
              times the effect of {weakest.name}, the smallest at{" "}
              {fx(weakest.range, 4)}.
              {twoLevel && Number.isFinite(strongest.signed)
                ? ` To raise ${r.response}, move ${strongest.name} to its ${
                    strongest.signed > 0 ? "high" : "low"
                  } level.`
                : ""}
            </p>
            <p className="mt-2 text-xs">
              A flat line means the factor did nothing{" "}
              <em>on average across the other factors</em>. It may still matter
              through an interaction, which only the interaction plot can show.
            </p>
          </section>

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} run(s), {k} factor(s).
            </p>
            {r.effects.some((e) => e.thin) && (
              <p className="text-amber-700">
                Some level is averaged over a single run: that point carries no
                information about noise, so read its position with caution.
              </p>
            )}
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) skipped: the response was missing or not
                numeric.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
