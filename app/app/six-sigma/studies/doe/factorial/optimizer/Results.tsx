// app/app/six-sigma/studies/doe/factorial/optimizer/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape } from "plotly.js";
import ReportLayout from "../../../../components/ReportLayout";
import ResultChart from "../../../../components/ResultChart";
import { GOAL_LABEL } from "../../../../lib/desirability";
import type { DoeOptResult } from "./types";

const BLUE = "#1d4ed8";
const RED = "#b91c1c";
const GREEN = "#00674d";
const GREY = "#9ca3af";
const PALETTE = [BLUE, RED, GREEN, "#a21caf", "#c2410c", "#0369a1"];

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const short = (v: number): string =>
  Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6))).replace(".", ",");

export default function DoeOptResults({
  result,
}: {
  result: DoeOptResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Configura las respuestas y los factores."}
      </div>
    );
  }

  const r = result;
  const respTitle = r.models.map((m) => m.column).join("; ");
  const k = r.panels.length;

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  /* ---------- Grafico de optimizacion ---------- */
  // Un panel por factor. Cada panel recorre ese factor con los demas en el
  // optimo, con una linea por respuesta y la vertical roja en el ajuste.
  const gap = 0.04;
  const w = (1 - (k - 1) * gap) / k;
  const optData: Data[] = [];
  const optShapes: Partial<Shape>[] = [];
  const optAnn: NonNullable<Partial<Layout>["annotations"]> = [];

  const allFits = r.panels.flatMap((p) => p.points.flatMap((q) => q.fits));
  const fLo = Math.min(...allFits);
  const fHi = Math.max(...allFits);
  const fPad = (fHi - fLo) * 0.1 || 1;

  r.panels.forEach((p, i) => {
    const id = i + 1;
    const sfx = id === 1 ? "" : String(id);
    r.models.forEach((m, j) => {
      optData.push({
        type: "scatter",
        mode: p.text ? "lines+markers" : "lines",
        x: p.points.map((q) => q.coded),
        y: p.points.map((q) => q.fits[j]),
        xaxis: `x${sfx}`,
        yaxis: `y${sfx}`,
        line: { color: PALETTE[j % PALETTE.length], width: 2 },
        marker: { color: PALETTE[j % PALETTE.length], size: 7 },
        showlegend: i === 0,
        legendgroup: m.column,
        name: m.column,
        text: p.points.map((q) => q.label),
        hovertemplate: `${p.factor} = %{text}<br>${m.column} = %{y:.4f}<extra></extra>`,
      } as unknown as Data);
    });

    // Vertical en el nivel optimo y horizontal en el valor ajustado.
    optShapes.push({
      type: "line",
      xref: `x${sfx}` as never,
      x0: p.optCoded,
      x1: p.optCoded,
      yref: `y${sfx} domain` as never,
      y0: 0,
      y1: 1,
      line: { color: RED, width: 1.5 },
    });
    r.predictions.forEach((pr) => {
      optShapes.push({
        type: "line",
        xref: `x${sfx} domain` as never,
        x0: 0,
        x1: 1,
        yref: `y${sfx}` as never,
        y0: pr.fit,
        y1: pr.fit,
        line: { color: GREY, width: 1, dash: "dot" },
      });
    });

    const setting = r.settings[i];
    optAnn.push({
      xref: "paper",
      yref: "paper",
      x: i * (w + gap) + w / 2,
      y: 1.02,
      text: `<b>${p.factor}</b><br><span style="color:${RED}">[${setting.label}]</span>`,
      showarrow: false,
      xanchor: "center",
      yanchor: "bottom",
      font: { size: 10 },
    });
  });

  const optLayout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 70, r: 20, t: 60, b: 45 },
    plot_bgcolor: "#ffffff",
    shapes: optShapes,
    annotations: optAnn,
    legend: { orientation: "h", y: -0.16, x: 0, font: { size: 11 } },
    hovermode: "closest",
  };

  r.panels.forEach((p, i) => {
    const id = i + 1;
    const sfx = id === 1 ? "" : String(id);
    const ticks = p.text
      ? [-1, 1]
      : [-1, -0.5, 0, 0.5, 1];
    optLayout[`xaxis${sfx}`] = {
      domain: [i * (w + gap), i * (w + gap) + w],
      anchor: `y${sfx}`,
      range: [-1.12, 1.12],
      tickmode: "array",
      tickvals: ticks,
      ticktext: ticks.map((c) => {
        const f = r.settings[i];
        if (f.text) return c < 0 ? f.levels[0] : f.levels[1];
        return short(f.center + c * f.half);
      }),
      tickfont: { size: 9 },
      showgrid: false,
      zeroline: false,
      linecolor: GREY,
      showline: true,
      mirror: true,
    };
    optLayout[`yaxis${sfx}`] = {
      domain: [0, 1],
      anchor: `x${sfx}`,
      range: [fLo - fPad, fHi + fPad],
      showticklabels: i === 0,
      title: i === 0 ? { text: "Fitted response", font: { size: 11 } } : undefined,
      tickfont: { size: 10 },
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: GREY,
      showline: true,
      mirror: true,
    };
  });

  /* ---------- Curvas de deseabilidad ---------- */
  const dGap = 0.06;
  const dw = (1 - (r.curves.length - 1) * dGap) / r.curves.length;
  const dData: Data[] = [];
  const dShapes: Partial<Shape>[] = [];
  const dLayout: Partial<Layout> & Record<string, unknown> = {
    margin: { l: 60, r: 20, t: 40, b: 45 },
    plot_bgcolor: "#ffffff",
    showlegend: false,
  };
  const dAnn: NonNullable<Partial<Layout>["annotations"]> = [];

  r.curves.forEach((c, i) => {
    const id = i + 1;
    const sfx = id === 1 ? "" : String(id);
    dData.push({
      type: "scatter",
      mode: "lines",
      x: c.points.map((q) => q.y),
      y: c.points.map((q) => q.d),
      xaxis: `x${sfx}`,
      yaxis: `y${sfx}`,
      line: { color: GREEN, width: 2 },
      showlegend: false,
      hovertemplate: `${c.column} = %{x:.3f}<br>d = %{y:.4f}<extra></extra>`,
    } as unknown as Data);

    const pr = r.predictions[i];
    dData.push({
      type: "scatter",
      mode: "markers",
      x: [pr.fit],
      y: [pr.d],
      xaxis: `x${sfx}`,
      yaxis: `y${sfx}`,
      marker: { color: RED, size: 11, symbol: "diamond" },
      showlegend: false,
      hovertemplate: `Solution: %{x:.4f}<br>d = %{y:.4f}<extra></extra>`,
    } as unknown as Data);

    dShapes.push({
      type: "line",
      xref: `x${sfx}` as never,
      x0: pr.fit,
      x1: pr.fit,
      yref: `y${sfx}` as never,
      y0: 0,
      y1: pr.d,
      line: { color: RED, width: 1, dash: "dash" },
    });

    dAnn.push({
      xref: "paper",
      yref: "paper",
      x: i * (dw + dGap) + dw / 2,
      y: 1.03,
      text: `<b>${c.column}</b> — ${GOAL_LABEL[r.models[i].spec.goal]}`,
      showarrow: false,
      xanchor: "center",
      yanchor: "bottom",
      font: { size: 10 },
    });

    dLayout[`xaxis${sfx}`] = {
      domain: [i * (dw + dGap), i * (dw + dGap) + dw],
      anchor: `y${sfx}`,
      title: { text: c.column, font: { size: 10 } },
      tickfont: { size: 9 },
      zeroline: false,
      linecolor: GREY,
      showline: true,
      mirror: true,
    };
    dLayout[`yaxis${sfx}`] = {
      domain: [0, 1],
      anchor: `x${sfx}`,
      range: [-0.04, 1.06],
      showticklabels: i === 0,
      title: i === 0 ? { text: "Desirability d", font: { size: 10 } } : undefined,
      tickfont: { size: 9 },
      showgrid: true,
      gridcolor: "#eef2f7",
      zeroline: false,
      linecolor: GREY,
      showline: true,
      mirror: true,
    };
  });
  dLayout.shapes = dShapes;
  dLayout.annotations = dAnn;

  /* ---------- Lectura ---------- */
  const perfect = r.composite >= 0.9995;
  const weak = r.composite < 0.6;
  const tone = perfect
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : weak
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-blue-300 bg-blue-50 text-blue-900";

  const recipe = r.settings
    .map((f) => `${f.name} ${f.label}`)
    .join(", ");

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Response Optimization: {respTitle}
          </h3>

          {/* Parametros */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Parameters
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Response</th>
                  <th className={thL}>Goal</th>
                  <th className={th}>Lower</th>
                  <th className={th}>Target</th>
                  <th className={th}>Upper</th>
                  <th className={th}>Weight</th>
                  <th className={th}>Importance</th>
                </tr>
              </thead>
              <tbody>
                {r.models.map((m) => {
                  const g = m.spec;
                  const showL = g.goal === "maximize" || g.goal === "target";
                  const showU = g.goal === "minimize" || g.goal === "target";
                  return (
                    <tr key={m.column} className="border-b border-gray-200">
                      <td className={tdL}>{m.column}</td>
                      <td className={tdL}>{GOAL_LABEL[g.goal]}</td>
                      <td className={td}>{showL ? short(g.lower) : "\u00a0"}</td>
                      <td className={td}>
                        {g.goal === "none" ? "\u00a0" : short(g.target)}
                      </td>
                      <td className={td}>{showU ? short(g.upper) : "\u00a0"}</td>
                      <td className={td}>{short(g.weight)}</td>
                      <td className={td}>{short(g.importance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Solucion */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Solution</h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400 align-bottom">
                  <th className={thL}>Solution</th>
                  {r.settings.map((f) => (
                    <th key={f.name} className={th}>
                      {f.name}
                    </th>
                  ))}
                  {r.models.map((m) => (
                    <th key={m.column} className={th}>
                      {m.column}
                      <br />
                      <span className="font-normal text-gray-500">Fit</span>
                    </th>
                  ))}
                  <th className={th}>
                    Composite
                    <br />
                    Desirability
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={tdL}>1</td>
                  {r.settings.map((f) => (
                    <td key={f.name} className={td}>
                      {f.label}
                      {f.held && (
                        <span className="ml-1 text-xs text-amber-700">held</span>
                      )}
                    </td>
                  ))}
                  {r.predictions.map((p) => (
                    <td key={p.column} className={td}>
                      {fx(p.fit, 3)}
                    </td>
                  ))}
                  <td className={`${td} font-semibold`}>
                    {fx(r.composite, 4)}
                  </td>
                </tr>
              </tbody>
            </table>
            {r.ties > 1 && (
              <p className="mt-2 text-xs text-amber-700">
                {r.ties} settings reach the same composite desirability. Only one
                is shown; any of them is equally good statistically, so pick on
                cost or convenience.
              </p>
            )}
          </section>

          {/* Prediccion */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Multiple Response Prediction
            </h4>
            <table className="mb-3 border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Variable</th>
                  <th className={thL}>Setting</th>
                </tr>
              </thead>
              <tbody>
                {r.settings.map((f) => (
                  <tr key={f.name} className="border-b border-gray-200">
                    <td className={tdL}>{f.name}</td>
                    <td className={tdL}>{f.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Response</th>
                  <th className={th}>Fit</th>
                  <th className={th}>SE Fit</th>
                  <th className={th}>{short(r.confLevel)}% CI</th>
                  <th className={th}>{short(r.confLevel)}% PI</th>
                </tr>
              </thead>
              <tbody>
                {r.predictions.map((p) => (
                  <tr key={p.column} className="border-b border-gray-200">
                    <td className={tdL}>{p.column}</td>
                    <td className={td}>{fx(p.fit, 3)}</td>
                    <td className={td}>{fx(p.seFit, 3)}</td>
                    <td className={td}>
                      ({fx(p.ciLow, 3)}; {fx(p.ciHigh, 3)})
                    </td>
                    <td className={td}>
                      ({fx(p.piLow, 3)}; {fx(p.piHigh, 3)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              The CI is where the <em>mean</em> response lies; the PI is where a{" "}
              <em>single future run</em> will fall. The PI is always the wider of
              the two, because one run carries its own variability on top of the
              uncertainty about the mean.
            </p>
          </section>

          {/* Lectura */}
          <section className={`rounded-md border px-4 py-3 text-sm ${tone}`}>
            <p className="font-semibold">
              {perfect
                ? `Composite desirability 1,0000: the target is fully met`
                : `Composite desirability ${fx(r.composite, 4)}`}
            </p>
            <p className="mt-1">
              Best setting: <span className="font-mono">{recipe}</span>.
              {perfect
                ? " The predicted response is past the target, so nothing more is gained by pushing further in this design space."
                : weak
                  ? " That is low. Either the goals are more demanding than this process can deliver, or the factors that matter are not in the model."
                  : " Some goals are met only in part, which is what happens when responses pull in opposite directions."}
            </p>
            {r.settings.some((f) => f.held) && (
              <p className="mt-2 text-xs">
                One or more factors were held fixed, so this is the best solution{" "}
                <em>subject to that constraint</em>, not the best overall.
              </p>
            )}
            <p className="mt-2 text-xs">
              The optimum sits {r.atVertex ? "at a corner" : "inside an edge"} of
              the design space.{" "}
              {r.atVertex
                ? "With two-level factors that is the norm: the model is linear along each factor, so the best value is always at one end."
                : "That happens when responses conflict and the compromise falls between the tested levels."}
            </p>
          </section>

          {/* Grafico de optimizacion */}
          {r.showOptPlot && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Optimization Plot
              </h4>
              <p className="-mt-1 mb-2 text-center text-xs text-gray-500">
                D = {fx(r.composite, 4)}
              </p>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 380 }}
              >
                <ResultChart
                  data={optData}
                  layout={{ autosize: true, ...optLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Each panel moves one factor with the others held at the solution.
                The red vertical line marks the chosen level; the dotted
                horizontal one, the fitted response. A steep line means the factor
                matters at this point; a flat one means you can move it freely,
                which is useful when it is the expensive one.
              </p>
            </section>
          )}

          {/* Curvas de deseabilidad */}
          {r.showDesirCurves && (
            <section>
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Desirability Functions
              </h4>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 300 }}
              >
                <ResultChart
                  data={dData}
                  layout={{ autosize: true, ...dLayout }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Each curve turns a response into a score from 0 to 1. The red
                diamond is where the solution lands. A curve that reaches 1 well
                before the edge of the data means the goal was set modestly.
              </p>
            </section>
          )}

          {/* Modelos */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Models used
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className={thL}>Response</th>
                  <th className={thL}>Terms</th>
                  <th className={th}>S</th>
                  <th className={th}>R-sq</th>
                  <th className={th}>Error DF</th>
                </tr>
              </thead>
              <tbody>
                {r.models.map((m) => (
                  <tr key={m.column} className="border-b border-gray-200">
                    <td className={tdL}>{m.column}</td>
                    <td className={`${tdL} font-mono text-xs`}>
                      {m.terms.map((t) => t.key).join(", ")}
                    </td>
                    <td className={td}>{fx(m.s, 4)}</td>
                    <td className={td}>{fx(m.r2, 2)}%</td>
                    <td className={td}>{m.errDF}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {r.models.some((m) => m.weakTerms.length > 0) && (
              <p className="mt-2 text-xs text-amber-700">
                Some terms are not significant at 0,05:{" "}
                {r.models
                  .filter((m) => m.weakTerms.length > 0)
                  .map((m) => `${m.column} (${m.weakTerms.join(", ")})`)
                  .join("; ")}
                . Prune the model in Analyze Factorial Design first: optimizing
                over noise moves the solution for no reason.
              </p>
            )}
          </section>

          <section className="space-y-1 text-xs text-gray-600">
            <p>
              {r.n} run(s), {r.models.length} response(s), {k} factor(s).
              Confidence level {short(r.confLevel)}%.
            </p>
            <p>
              The solution is only valid inside the tested range of every factor.
              The model knows nothing about what happens beyond it.
            </p>
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) skipped: a response or factor value was
                missing.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
