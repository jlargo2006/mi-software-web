// app/app/six-sigma/studies/improve/regression/Results.tsx
"use client";
import React from "react";
import type { Data, Layout, Shape } from "plotly.js";
import ReportLayout from "../../../components/ReportLayout";
import ResultChart from "../../../components/ResultChart";
import { blomScores } from "./compute";
import { normalInv } from "../../../lib/regression";
import type { ImpRegParams, ImpRegResult } from "./types";

const GREEN = "#00674d";
const RED = "#b91c1c";
const BLUE = "#1d4ed8";

/** Formato con coma decimal y numero fijo de decimales. */
const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "";

/** Formato con un numero dado de cifras significativas. */
const fsig = (v: number, sig: number): string => {
  if (!Number.isFinite(v)) return "";
  if (v === 0) return "0";
  const mag = Math.floor(Math.log10(Math.abs(v)));
  const dec = Math.max(0, sig - 1 - mag);
  return v.toFixed(dec).replace(".", ",");
};

/** Enteros para las sumas de cuadrados grandes, un decimal para el resto. */
const fss = (v: number): string => {
  if (!Number.isFinite(v)) return "";
  return Math.abs(v) >= 100000 ? Math.round(v).toString() : fx(v, 1);
};

export default function ImpRegResults({
  result,
  params,
}: {
  result: ImpRegResult;
  params: ImpRegParams;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ??
          "Selecciona la respuesta y el predictor para ajustar el modelo."}
      </div>
    );
  }

  const r = result;
  const cl = fsig(r.confLevel, 4);
  const isPoly = r.order > 1;

  // --- Grafico ajustado ---------------------------------------------------
  const cx = r.curve.map((c) => c.x);
  const fitTraces: Data[] = [];

  if (params.showPI) {
    fitTraces.push(
      {
        type: "scatter",
        mode: "lines",
        x: cx,
        y: r.curve.map((c) => c.piHigh),
        line: { color: "#a21caf", width: 1.5, dash: "dash" },
        name: `${cl}% PI`,
        hoverinfo: "skip",
      } as unknown as Data,
      {
        type: "scatter",
        mode: "lines",
        x: cx,
        y: r.curve.map((c) => c.piLow),
        line: { color: "#a21caf", width: 1.5, dash: "dash" },
        showlegend: false,
        hoverinfo: "skip",
      } as unknown as Data
    );
  }
  if (params.showCI) {
    fitTraces.push(
      {
        type: "scatter",
        mode: "lines",
        x: cx,
        y: r.curve.map((c) => c.ciHigh),
        line: { color: GREEN, width: 1.5, dash: "dot" },
        name: `${cl}% CI`,
        hoverinfo: "skip",
      } as unknown as Data,
      {
        type: "scatter",
        mode: "lines",
        x: cx,
        y: r.curve.map((c) => c.ciLow),
        line: { color: GREEN, width: 1.5, dash: "dot" },
        showlegend: false,
        hoverinfo: "skip",
      } as unknown as Data
    );
  }

  fitTraces.push(
    {
      type: "scatter",
      mode: "markers",
      x: r.x,
      y: r.y,
      marker: { color: BLUE, size: 8 },
      name: "Observed",
      showlegend: false,
      hovertemplate: `${r.xTitle}: %{x}<br>${r.yTitle}: %{y}<extra></extra>`,
    } as unknown as Data,
    {
      type: "scatter",
      mode: "lines",
      x: cx,
      y: r.curve.map((c) => c.fit),
      line: { color: RED, width: 2 },
      name: "Fitted",
      showlegend: false,
      hoverinfo: "skip",
    } as unknown as Data
  );

  if (r.prediction) {
    const p = r.prediction;
    fitTraces.push({
      type: "scatter",
      mode: "markers",
      x: [p.x],
      y: [p.fit],
      marker: {
        color: "#f59e0b",
        size: 12,
        symbol: "diamond",
        line: { color: "#78350f", width: 1.5 },
      },
      name: "Prediction",
      showlegend: false,
      hovertemplate: `${r.xTitle}: %{x}<br>Fit: %{y:.4f}<extra></extra>`,
    } as unknown as Data);
  }

  const showLegend = params.showCI || params.showPI;
  const fitLayout: Partial<Layout> = {
    margin: { l: 70, r: 150, t: 10, b: 55 },
    xaxis: { title: { text: r.xTitle }, zeroline: false },
    yaxis: { title: { text: r.yTitle }, zeroline: false },
    hovermode: "closest",
    showlegend: showLegend,
    legend: showLegend
      ? { x: 1.01, y: 1, font: { size: 11 }, bgcolor: "rgba(0,0,0,0)" }
      : undefined,
    // Recuadro de estadisticos, a la derecha, como en el informe original.
    annotations: [
      {
        xref: "paper",
        yref: "paper",
        x: 1.01,
        y: showLegend ? 0.72 : 1,
        xanchor: "left",
        yanchor: "top",
        align: "left",
        showarrow: false,
        bordercolor: "#9ca3af",
        borderwidth: 1,
        borderpad: 6,
        bgcolor: "#ffffff",
        font: { size: 11, family: "monospace" },
        text:
          `S          ${fsig(r.s, 6)}<br>` +
          `R-Sq       ${fx(r.r2, 1)}%<br>` +
          `R-Sq(adj)  ${fx(r.r2adj, 1)}%`,
      },
    ],
    shapes: r.prediction
      ? [
          {
            type: "line",
            x0: r.prediction.x,
            x1: r.prediction.x,
            yref: "paper",
            y0: 0,
            y1: 1,
            line: { color: "#f59e0b", width: 1.5, dash: "dash" },
          },
        ]
      : undefined,
  };

  // --- Cuatro graficos de residuos ---------------------------------------
  const resTraces: Data[] = [];
  let resLayout: Partial<Layout> = {};

  if (params.showResidualPlots) {
    // 1. Normal: residuos ordenados frente a su puntuacion normal.
    const sorted = [...r.residuals].sort((a, b) => a - b);
    const scores = blomScores(r.n);
    const pcts = [1, 5, 10, 25, 50, 75, 90, 95, 99];

    // Recta de referencia: media y desviacion de los residuos.
    const mr = r.residuals.reduce((a, b) => a + b, 0) / r.n;
    const sr = Math.sqrt(
      r.residuals.reduce((a, v) => a + (v - mr) * (v - mr), 0) /
        Math.max(1, r.n - 1)
    );
    const zLo = Math.min(...scores);
    const zHi = Math.max(...scores);

    // Anchura de clase: se apunta a 2*raiz(n) barras y se prueban los pasos
    // 1, 2 y 5 de la decada, quedandose con el que deje el numero de barras
    // mas cerca del objetivo.
    const rMin = Math.min(...r.residuals);
    const rMax = Math.max(...r.residuals);
    const span = rMax - rMin;
    let binSize = 1;
    if (span > 0) {
      const targetBins = Math.max(6, Math.ceil(2 * Math.sqrt(r.n)));
      const raw = span / targetBins;
      const pow = Math.pow(10, Math.floor(Math.log10(raw)));
      let best = pow;
      let bestErr = Infinity;
      for (const step of [1, 2, 5, 10]) {
        const w = step * pow;
        // Se cuenta sobre la rejilla desplazada, la que se usa de verdad.
        const lo = Math.floor(rMin / w + 0.5) - 0.5;
        const hi = Math.ceil(rMax / w - 0.5) + 0.5;
        const bins = Math.round(hi - lo);
        // Se penaliza quedarse corto de barras: perder detalle es peor que
        // tener alguna clase vacia de mas.
        const err = Math.abs(bins - targetBins) + (bins < 5 ? 10 : 0);
        if (err < bestErr) {
          bestErr = err;
          best = w;
        }
      }
      binSize = best;
    }
    // La rejilla se desplaza media clase para que el cero quede en el centro
    // de una barra y no en la frontera entre dos: los residuos son
    // simetricos respecto al cero y el histograma debe reflejarlo.
    const resBins = {
      start: (Math.floor(rMin / binSize + 0.5) - 0.5) * binSize,
      end: (Math.ceil(rMax / binSize - 0.5) + 0.5) * binSize + binSize / 2,
      size: binSize,
    };



    // El modelo trabaja ordenado por x, pero este grafico necesita el orden
    // de la hoja. Se invierte la permutacion una sola vez.
    const bySheet = r.order_
      .map((k, i) => ({ k, i }))
      .sort((a, b) => a.k - b.k);
    const orderX = bySheet.map((e) => e.k);
    const orderY = bySheet.map((e) => r.residuals[e.i]);

    resTraces.push(
      {
        type: "scatter",
        mode: "markers",
        x: sorted,
        y: scores,
        marker: { color: BLUE, size: 6 },
        xaxis: "x",
        yaxis: "y",
        showlegend: false,
        hovertemplate: "Residual: %{x:.3f}<extra></extra>",
      } as unknown as Data,
      {
        type: "scatter",
        mode: "lines",
        x: [mr + sr * zLo, mr + sr * zHi],
        y: [zLo, zHi],
        line: { color: RED, width: 1.5 },
        xaxis: "x",
        yaxis: "y",
        showlegend: false,
        hoverinfo: "skip",
      } as unknown as Data,
      // 2. Residuos frente a valores ajustados.
      {
        type: "scatter",
        mode: "markers",
        x: r.fitted,
        y: r.residuals,
        marker: { color: BLUE, size: 6 },
        xaxis: "x2",
        yaxis: "y2",
        showlegend: false,
        hovertemplate: "Fit: %{x:.2f}<br>Residual: %{y:.3f}<extra></extra>",
      } as unknown as Data,
      // 3. Histograma de residuos, con anchura de clase explicita.
      {
        type: "histogram",
        x: r.residuals,
        xbins: resBins,
        autobinx: false,
        marker: { color: BLUE, line: { color: "#ffffff", width: 1 } },
        xaxis: "x3",
        yaxis: "y3",
        showlegend: false,
        hovertemplate: "Residual: %{x}<br>Frequency: %{y}<extra></extra>",
      } as unknown as Data,
      // 4. Residuos en el orden de la hoja.
      {
        type: "scatter",
        mode: "lines+markers",
        x: orderX,
        y: orderY,
        marker: { color: BLUE, size: 6 },
        line: { color: BLUE, width: 1 },
        xaxis: "x4",
        yaxis: "y4",
        showlegend: false,
        hovertemplate: "Order: %{x}<br>Residual: %{y:.3f}<extra></extra>",
      } as unknown as Data
    );

    // Los ejes se tipan con los literales de Plotly: un string genérico no
    // es asignable a xref/yref.
    const zeroLine = (
      xref: Shape["xref"],
      yref: Shape["yref"],
      x0: number,
      x1: number
    ): Partial<Shape> => ({
      type: "line",
      xref,
      yref,
      x0,
      x1,
      y0: 0,
      y1: 0,
      line: { color: "#9ca3af", width: 1, dash: "dash" },
    });

    resLayout = {
      margin: { l: 60, r: 30, t: 30, b: 50 },
      grid: { rows: 2, columns: 2, pattern: "independent" },
      showlegend: false,
      xaxis: { title: { text: "Residual" }, domain: [0, 0.44], anchor: "y" },
      yaxis: {
        title: { text: "Percent" },
        domain: [0.58, 1],
        anchor: "x",
        tickmode: "array",
        tickvals: pcts.map((p) => normalInv(p / 100)),
        ticktext: pcts.map((p) => String(p)),
      },
      xaxis2: {
        title: { text: "Fitted Value" },
        domain: [0.56, 1],
        anchor: "y2",
      },
      yaxis2: { title: { text: "Residual" }, domain: [0.58, 1], anchor: "x2" },
      xaxis3: { title: { text: "Residual" }, domain: [0, 0.44], anchor: "y3" },
      yaxis3: { title: { text: "Frequency" }, domain: [0, 0.42], anchor: "x3" },
      xaxis4: {
        title: { text: "Observation Order" },
        domain: [0.56, 1],
        anchor: "y4",
        // Con pocas observaciones el automatico rotula medios enteros.
        dtick: Math.max(1, Math.ceil(r.n / 12)),
        tick0: 1,
      },
      yaxis4: { title: { text: "Residual" }, domain: [0, 0.42], anchor: "x4" },
      annotations: [
        ["Normal Probability Plot", 0.22, 1.0],
        ["Versus Fits", 0.78, 1.0],
        ["Histogram", 0.22, 0.44],
        ["Versus Order", 0.78, 0.44],
      ].map(([t, xx, yy]) => ({
        text: `<b>${t}</b>`,
        xref: "paper" as const,
        yref: "paper" as const,
        x: xx as number,
        y: yy as number,
        xanchor: "center" as const,
        yanchor: "bottom" as const,
        showarrow: false,
        font: { size: 11 },
      })),
      shapes: [
        zeroLine("x2", "y2", Math.min(...r.fitted), Math.max(...r.fitted)),
        zeroLine("x4", "y4", 1, r.n),
      ],
    };
  }

  const th = "py-1 pr-6 text-left font-medium text-gray-600";
  const td = "py-1 pr-6";

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            {isPoly ? "Polynomial Regression Analysis" : "Regression Analysis"}:{" "}
            {r.yTitle} versus {r.xTitle}
          </h3>

          <section className="mb-6">
            <p className="text-sm text-gray-700">The regression equation is</p>
            <p className="mt-1 font-mono text-sm">{r.equation}</p>
          </section>

          {/* Model Summary */}
          <section className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Model Summary
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className={th}>S</th>
                  <th className={th}>R-sq</th>
                  <th className="py-1 text-left font-medium text-gray-600">
                    R-sq(adj)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className={td}>{fsig(r.s, 6)}</td>
                  <td className={td}>{fx(r.r2, 2)}%</td>
                  <td className="py-1">{fx(r.r2adj, 2)}%</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ANOVA */}
          <section className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Analysis of Variance
            </h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className={th}>Source</th>
                  <th className={th}>DF</th>
                  <th className={th}>SS</th>
                  <th className={th}>MS</th>
                  <th className={th}>F</th>
                  <th className="py-1 text-left font-medium text-gray-600">
                    P
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.anova.map((row) => (
                  <tr key={row.source} className="border-b border-gray-200">
                    <td className={td}>{row.source}</td>
                    <td className={td}>{row.df}</td>
                    <td className={td}>{fss(row.ss)}</td>
                    <td className={td}>{fss(row.ms)}</td>
                    <td className={td}>{fx(row.fValue, 2)}</td>
                    <td className="py-1">{fx(row.pValue, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Sequential ANOVA */}
          {r.sequential.length > 0 && (
            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Sequential Analysis of Variance
              </h4>
              <table className="border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className={th}>Source</th>
                    <th className={th}>DF</th>
                    <th className={th}>SS</th>
                    <th className={th}>F</th>
                    <th className="py-1 text-left font-medium text-gray-600">
                      P
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.sequential.map((row) => (
                    <tr key={row.source} className="border-b border-gray-200">
                      <td className={td}>{row.source}</td>
                      <td className={td}>{row.df}</td>
                      <td className={td}>{fss(row.ss)}</td>
                      <td className={td}>{fx(row.fValue, 2)}</td>
                      <td className="py-1">{fx(row.pValue, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-600">
                Each row tests what its own term adds to the previous model,
                against the error of the model that contains it.
              </p>
            </section>
          )}

          {/* Prediccion */}
          {r.prediction && (
            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Prediction for {r.yTitle}
              </h4>
              <p className="font-mono text-sm">
                {r.yTitle} at {r.xTitle} = {fsig(r.prediction.x, 6)}
                {"\u00a0\u2192\u00a0"}
                <strong>{fx(r.prediction.fit, 4)}</strong>
              </p>
              <table className="mt-2 border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className={th}>Fit</th>
                    <th className={th}>SE Fit</th>
                    <th className={th}>{cl}% CI</th>
                    <th className="py-1 text-left font-medium text-gray-600">
                      {cl}% PI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className={td}>{fx(r.prediction.fit, 4)}</td>
                    <td className={td}>{fx(r.prediction.seFit, 4)}</td>
                    <td className={td}>
                      ({fx(r.prediction.ciLow, 3)}; {fx(r.prediction.ciHigh, 3)}
                      )
                    </td>
                    <td className="py-1">
                      ({fx(r.prediction.piLow, 3)}; {fx(r.prediction.piHigh, 3)}
                      )
                    </td>
                  </tr>
                </tbody>
              </table>
              {r.prediction.extrapolated && (
                <p className="mt-2 text-xs text-amber-700">
                  This value lies outside the observed range of {r.xTitle}: the
                  model is not supported by data there.
                </p>
              )}
            </section>
          )}

          {/* Grafico ajustado */}
          <section className="mb-6">
            <h4 className="text-center text-sm font-semibold text-gray-800">
              Fitted Line Plot
            </h4>
            <p className="mb-2 text-center font-mono text-xs text-gray-700">
              {r.equation}
            </p>
            <div
              className="border border-gray-200 rounded"
              style={{ height: 420 }}
            >
              <ResultChart
                data={fitTraces}
                layout={{ autosize: true, ...fitLayout }}
              />
            </div>
          </section>

          {/* Residuos */}
          {params.showResidualPlots && (
            <section className="mb-6">
              <h4 className="mb-2 text-center text-sm font-semibold text-gray-800">
                Residual Plots for {r.yTitle}
              </h4>
              <div
                className="border border-gray-200 rounded"
                style={{ height: 520 }}
              >
                <ResultChart
                  data={resTraces}
                  layout={{ autosize: true, ...resLayout }}
                />
              </div>
            </section>
          )}

          <section className="space-y-1 text-xs text-gray-600">
            <p>{r.n} observation(s) used.</p>
            {r.nMissing > 0 && (
              <p className="text-amber-700">
                {r.nMissing} row(s) dropped: a value was missing or
                non-numeric.
              </p>
            )}
          </section>
        </div>
      }
    />
  );
}
