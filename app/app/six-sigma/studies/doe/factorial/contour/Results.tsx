// app/app/six-sigma/studies/doe/factorial/contour/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../../components/ReportLayout";
import ResultChart from "../../../../components/ResultChart";
import type { DoeContourResult } from "./types";

const fx = (v: number, dec = 4): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const signed = (v: number, dec = 4): string =>
  Number.isFinite(v)
    ? `${v < 0 ? "\u2212" : "+"}${Math.abs(v).toFixed(dec).replace(".", ",")}`
    : "\u2014";

export default function DoeContourResults({
  result,
}: {
  result: DoeContourResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta, los factores y los dos ejes."}
      </div>
    );
  }

  const r = result;
  const traces: Data[] = [];

  // Superficie. El relleno es una ayuda visual: lo que se lee son las lineas,
  // porque cada una es un valor concreto de la respuesta.
  traces.push({
    type: "contour",
    x: r.xGrid,
    y: r.yGrid,
    z: r.z,
    colorscale: "Viridis",
    reversescale: false,
    showscale: r.filled,
    colorbar: { title: { text: r.response, side: "right" }, thickness: 14 },
    contours: {
      coloring: r.filled ? "heatmap" : "none",
      showlines: true,
      showlabels: true,
      labelfont: { size: 10, color: r.filled ? "#ffffff" : "#111827" },
      start: Math.min(...r.levels),
      end: Math.max(...r.levels),
      size:
        r.levels.length > 1
          ? (Math.max(...r.levels) - Math.min(...r.levels)) / (r.levels.length - 1)
          : 1,
    },
    line: { width: 1.4, color: r.filled ? "#ffffff" : "#1d4ed8" },
    hovertemplate:
      `${r.xFactor}: %{x:.4g}<br>${r.yFactor}: %{y:.4g}<br>` +
      `${r.response}: %{z:.4f}<extra></extra>`,
  } as unknown as Data);

  // Banda de especificacion: se sombrea lo que queda FUERA, como en el
  // overlaid contour plot de Minitab. Lo interesante es la zona limpia.
  if (r.useSpec) {
    const lo = r.specLow;
    const hi = r.specHigh;
    const op = lo !== null && hi !== null ? "][" : lo !== null ? "<" : ">";
    const value =
      lo !== null && hi !== null ? [lo, hi] : lo !== null ? lo : (hi as number);
    traces.push({
      type: "contour",
      x: r.xGrid,
      y: r.yGrid,
      z: r.z,
      showscale: false,
      contours: {
        type: "constraint",
        operation: op,
        value,
        showlabels: false,
      },
      fillcolor: "rgba(107,114,128,0.45)",
      line: { color: "#1d4ed8", width: 2 },
      hoverinfo: "skip",
      name: "Out of spec",
    } as unknown as Data);
  }

  const layout: Partial<Layout> = {
    margin: { l: 70, r: 20, t: 20, b: 60 },
    plot_bgcolor: "#ffffff",
    hovermode: "closest",
    xaxis: {
      title: { text: r.xFactor, font: { size: 12 } },
      range: [r.xGrid[0], r.xGrid[r.xGrid.length - 1]],
      zeroline: false,
    },
    yaxis: {
      title: { text: r.yFactor, font: { size: 12 } },
      range: [r.yGrid[0], r.yGrid[r.yGrid.length - 1]],
      zeroline: false,
    },
    showlegend: false,
  };

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  const dropped = r.terms.filter((t) => !t.included);
  const outsideHolds = r.holds.filter((h) => h.outside);

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Contour Plot of {r.response}
          </h3>

          {r.holds.length > 0 && (
            <p className="-mt-4 text-xs text-gray-500">
              Hold values:{" "}
              {r.holds.map((h) => `${h.factor} = ${fx(h.value, 4)}`).join("; ")}
            </p>
          )}

          <section className="mb-6">
            <div className="border border-gray-200 rounded" style={{ height: 520 }}>
              <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Every line joins the settings that give the same predicted
              response. Lines close together mean a steep surface, where a small
              move in a factor changes the response a lot; lines far apart mean a
              flat region, which is where a process is easy to hold.
            </p>
          </section>

          {r.unreachable.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">
                {r.unreachable.length === 1
                  ? "One requested contour does not exist here"
                  : "Some requested contours do not exist here"}
              </p>
              <p className="mt-1">
                {r.unreachable.map((v) => fx(v, 4)).join("; ")}{" "}
                {r.unreachable.length === 1 ? "is" : "are"} outside the range the
                surface reaches in this slice, which runs from{" "}
                <b>{fx(r.zRange[0], 4)}</b> to <b>{fx(r.zRange[1], 4)}</b>. No
                combination of {r.xFactor} and {r.yFactor} within the design gets
                there at these hold values, so no line is drawn. That is an
                answer, not a failure: widen the factor ranges, or move the held
                factors.
              </p>
            </div>
          )}

          {outsideHolds.length > 0 && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-semibold">Hold value outside the design</p>
              <p className="mt-1">
                {outsideHolds
                  .map((h) => `${h.factor} = ${fx(h.value, 4)}`)
                  .join("; ")}{" "}
                falls outside the levels that were run. The whole surface is then
                an extrapolation, and nothing in the data supports it.
              </p>
            </div>
          )}

          {r.reduced && (
            <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">
                Reduced model: {dropped.length} term
                {dropped.length === 1 ? "" : "s"} left out
              </p>
              <p className="mt-1">
                <span className="font-mono">
                  {dropped.map((t) => t.key).join("; ")}
                </span>{" "}
                {dropped.length === 1 ? "is" : "are"} not in the fit. This is
                usually what you want: the surface should be drawn with the terms
                the analysis found real, not with the noise.
              </p>
            </div>
          )}

          {/* Sondas */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Predicted response at the corners of the plot
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Position</th>
                  <th className={th}>{r.xFactor}</th>
                  <th className={th}>{r.yFactor}</th>
                  <th className={th}>Fit</th>
                </tr>
              </thead>
              <tbody>
                {r.probes.map((p) => (
                  <tr key={p.label} className="border-b border-gray-200">
                    <td className={tdL}>{p.label}</td>
                    <td className={td}>{fx(p.x, 4)}</td>
                    <td className={td}>{fx(p.y, 4)}</td>
                    <td className={td}>{fx(p.z, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              The surface spans {fx(r.zRange[0], 4)} to {fx(r.zRange[1], 4)} in
              this slice.
              {r.centerMean !== null && (
                <>
                  {" "}
                  The centre runs averaged {fx(r.centerMean, 4)} over {r.centerN}{" "}
                  runs, against {fx(r.constant, 4)} predicted with every factor at
                  its centre. A wide gap is curvature, and this surface is a plane
                  — it cannot bend to follow it.
                </>
              )}
            </p>
          </section>

          {/* Modelo */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Model behind the surface
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Term</th>
                  <th className={th}>Coef</th>
                  <th className={th}>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={tdL}>Constant</td>
                  <td className={td}>{fx(r.constant, 4)}</td>
                  <td className={td}>{"\u2014"}</td>
                </tr>
                {r.terms.map((t) => (
                  <tr
                    key={t.key}
                    className={`border-b border-gray-200 ${
                      t.included ? "" : "text-gray-400"
                    }`}
                  >
                    <td className={tdL}>{t.key}</td>
                    <td className={td}>{t.included ? fx(t.coef, 4) : "out"}</td>
                    <td className={td}>
                      {t.included ? signed(2 * t.coef, 4) : "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              Coefficients are in coded units, {"\u2212"}1 at the low level and
              +1 at the high one, so they are directly comparable with each other
              and with the factorial analysis.
            </p>
          </section>

          <p className="text-xs text-gray-500">
            {r.n} corner run{r.n === 1 ? "" : "s"}
            {r.centerN > 0 ? `, ${r.centerN} centre runs` : ""}
            {r.nMissing > 0
              ? `, ${r.nMissing} row(s) skipped for a missing or non-numeric value`
              : ""}
            .
          </p>
        </div>
      }
    />
  );
}
