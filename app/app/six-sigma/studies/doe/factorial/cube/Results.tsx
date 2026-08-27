// app/app/six-sigma/studies/doe/factorial/cube/Results.tsx
"use client";
import React from "react";
import type { Data, Layout } from "plotly.js";
import ReportLayout from "../../../../components/ReportLayout";
import ResultChart from "../../../../components/ResultChart";
import type { DoeCubeResult } from "./types";

const fx = (v: number, dec: number): string =>
  Number.isFinite(v) ? v.toFixed(dec).replace(".", ",") : "*";

const signed = (v: number, dec: number): string => {
  if (!Number.isFinite(v)) return "\u2014";
  return `${v < 0 ? "\u2212" : "+"}${Math.abs(v).toFixed(dec).replace(".", ",")}`;
};

/**
 * Proyeccion isometrica: el tercer factor se dibuja como un desplazamiento en
 * diagonal. No es una vista 3D real y no debe serlo, porque un cubo giratorio
 * esconde vertices detras de otros y el numero de cada esquina es lo que hay
 * que leer.
 */
const DX = 0.42;
const DY = 0.34;

export default function DoeCubeResults({
  result,
}: {
  result: DoeCubeResult;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {result.error ?? "Selecciona la respuesta y dos o tres factores."}
      </div>
    );
  }

  const r = result;
  const k = r.factors.length;
  const has3 = k === 3;

  const px = (c: number[]) => c[0] + (has3 ? DX * c[2] : 0);
  const py = (c: number[]) => c[1] + (has3 ? DY * c[2] : 0);

  // --- Aristas --------------------------------------------------------------
  // Discontinuas, como en Minitab: la arista no es una trayectoria observada,
  // solo indica que dos esquinas difieren en un unico factor.
  const ex: (number | null)[] = [];
  const ey: (number | null)[] = [];
  for (const v of r.vertices) {
    for (let j = 0; j < k; j++) {
      if (v.code[j] === 1) continue;
      const to = v.code.map((b, i) => (i === j ? 1 : b));
      ex.push(px(v.code), px(to), null);
      ey.push(py(v.code), py(to), null);
    }
  }

  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines",
      x: ex,
      y: ey,
      line: { color: "#6b7280", width: 1, dash: "dash" },
      hoverinfo: "skip",
      showlegend: false,
    } as unknown as Data,
    {
      type: "scatter",
      mode: "markers",
      x: r.vertices.filter((v) => Number.isFinite(v.value)).map((v) => px(v.code)),
      y: r.vertices.filter((v) => Number.isFinite(v.value)).map((v) => py(v.code)),
      marker: { color: "#111827", size: 9, symbol: "diamond" },
      name: "Factorial Point",
      customdata: r.vertices
        .filter((v) => Number.isFinite(v.value))
        .map((v) => [
          v.levels.map((lv, j) => `${r.factors[j]} = ${lv}`).join("<br>"),
          v.n,
        ]),
      hovertemplate:
        `%{customdata[0]}<br>Mean: %{y:.4f}<br>n = %{customdata[1]}<extra></extra>`,
      showlegend: true,
    } as unknown as Data,
  ];

  if (r.centerMean !== null) {
    const cx = (1 + (has3 ? DX : 0)) / 2;
    const cy = (1 + (has3 ? DY : 0)) / 2;
    traces.push({
      type: "scatter",
      mode: "markers",
      x: [cx],
      y: [cy],
      marker: { color: "#b91c1c", size: 12, symbol: "cross-thin", line: { color: "#b91c1c", width: 2 } },
      name: "Centerpoint",
      hovertemplate: `Centre<br>Mean: ${fx(r.centerMean, 4)}<br>n = ${r.centerN}<extra></extra>`,
      showlegend: true,
    } as unknown as Data);
  }

  // --- Cajas con el valor de cada vertice -----------------------------------
  const annotations: NonNullable<Partial<Layout>["annotations"]> = [];
  for (const v of r.vertices) {
    if (!Number.isFinite(v.value)) continue;
    // La caja se aparta del centro del cubo para no taparse con las aristas.
    const outX = v.code[0] === 0 ? -1 : 1;
    const outY = v.code[1] === 0 ? -1 : 1;
    annotations.push({
      x: px(v.code),
      y: py(v.code),
      text: fx(v.value, 4),
      showarrow: false,
      xanchor: outX < 0 ? "right" : "left",
      yanchor: outY < 0 ? "top" : "bottom",
      xshift: outX * 8,
      yshift: outY * 8,
      font: { size: 11, color: "#111827" },
      bgcolor: "#ffffff",
      bordercolor: "#9ca3af",
      borderwidth: 1,
      borderpad: 3,
    });
  }
  if (r.centerMean !== null) {
    annotations.push({
      x: (1 + (has3 ? DX : 0)) / 2,
      y: (1 + (has3 ? DY : 0)) / 2,
      text: fx(r.centerMean, 4),
      showarrow: false,
      xanchor: "left",
      yanchor: "bottom",
      xshift: 8,
      yshift: 6,
      font: { size: 11, color: "#b91c1c" },
      bgcolor: "#ffffff",
      bordercolor: "#fca5a5",
      borderwidth: 1,
      borderpad: 3,
    });
  }

  // Los niveles van sobre su propia arista, no en el vertice: en el origen
  // coinciden los tres niveles bajos y apilados alli no se lee ninguno.
  const tick = (
    text: string,
    x: number,
    y: number,
    xa: "left" | "center" | "right",
    ya: "top" | "middle" | "bottom",
    dx = 0,
    dy = 0
  ) =>
    annotations.push({
      x,
      y,
      text,
      showarrow: false,
      xanchor: xa,
      yanchor: ya,
      xshift: dx,
      yshift: dy,
      font: { size: 11, color: "#374151" },
    });

  // Factor 1: bajo el borde inferior del cubo.
  tick(r.levels[0][0], 0, 0, "center", "top", 0, -16);
  tick(r.levels[0][1], 1, 0, "center", "top", 0, -16);
  // Factor 2: a la izquierda del borde vertical.
  tick(r.levels[1][0], 0, 0, "right", "middle", -14, 0);
  tick(r.levels[1][1], 0, 1, "right", "middle", -14, 0);

  if (has3) {
    // Factor 3: a lo largo de la diagonal de la cara derecha, mas el nombre
    // del factor, que en los otros dos ejes lo pone el titulo del eje.
    tick(r.levels[2][0], 1, 0, "left", "top", 10, -6);
    tick(r.levels[2][1], 1 + DX, DY, "left", "top", 10, -6);
    annotations.push({
      x: 1 + DX / 2,
      y: DY / 2,
      text: `<b>${r.factors[2]}</b>`,
      showarrow: false,
      xanchor: "left",
      yanchor: "middle",
      xshift: 34,
      textangle: -Math.round((Math.atan2(DY, DX) * 180) / Math.PI),
      font: { size: 12, color: "#374151" },
    });
  }

  const layout: Partial<Layout> = {
    margin: { l: 90, r: 90, t: 20, b: 70 },
    plot_bgcolor: "#ffffff",
    hovermode: "closest",
    annotations,
    legend: {
      x: 1,
      y: 1,
      xanchor: "right",
      yanchor: "bottom",
      orientation: "v",
      font: { size: 10 },
      bgcolor: "rgba(255,255,255,0.85)",
      bordercolor: "#e5e7eb",
      borderwidth: 1,
    },
    xaxis: {
      range: [-0.45, 1 + (has3 ? DX : 0) + 0.45],
      showticklabels: false,
      showgrid: false,
      zeroline: false,
      title: { text: r.factors[0], font: { size: 12 } },
    },
    yaxis: {
      range: [-0.42, 1 + (has3 ? DY : 0) + 0.42],
      showticklabels: false,
      showgrid: false,
      zeroline: false,
      scaleanchor: "x",
      title: { text: r.factors[1], font: { size: 12 } },
    },
  };

  const th = "px-3 py-1 text-right font-medium text-gray-600 whitespace-nowrap";
  const thL = "px-3 py-1 text-left font-medium text-gray-600 whitespace-nowrap";
  const td = "px-3 py-1 text-right whitespace-nowrap";
  const tdL = "px-3 py-1 text-left whitespace-nowrap";

  const dropped = r.terms.filter((t) => !t.included);

  return (
    <ReportLayout
      template="chart-text"
      center={
        <div className="w-full space-y-6">
          <h3 className="text-sm font-semibold text-gray-800">
            Cube Plot ({r.fittedMeans ? "fitted means" : "data means"}) for{" "}
            {r.response}
          </h3>

          <section className="mb-6">
            <div className="border border-gray-200 rounded" style={{ height: 460 }}>
              <ResultChart data={traces} layout={{ autosize: true, ...layout }} />
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Each corner is one combination of the low and high levels. Read the
              cube by walking an edge: the change along it is the effect of that
              factor, held at the levels of the others. Edges that change by
              different amounts on opposite faces are an interaction.
            </p>
          </section>

          {r.emptyVertices > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">
                {r.emptyVertices} corner{r.emptyVertices === 1 ? "" : "s"} were
                never run
              </p>
              <p className="mt-1">
                {r.fittedMeans
                  ? "The model still predicts a value there, and it is printed: that number is an extrapolation, not an observation."
                  : "There is no data mean to print at those corners, so they are left blank. Switch to fitted means to see what the model predicts."}
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
                {dropped.length === 1 ? "is" : "are"} not in the fit, so the
                corners no longer reproduce the cell means. The gap between the
                two is in the table below: it is the part of the response those
                terms were carrying.
              </p>
            </div>
          )}

          {/* Vertices */}
          <section className="overflow-x-auto">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Corners</h4>
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-400">
                  {r.factors.map((f) => (
                    <th key={f} className={thL}>
                      {f}
                    </th>
                  ))}
                  <th className={th}>N</th>
                  <th className={th}>
                    {r.fittedMeans ? "Fitted mean" : "Data mean"}
                  </th>
                  {r.reduced && <th className={th}>Data mean</th>}
                  {r.reduced && <th className={th}>Difference</th>}
                </tr>
              </thead>
              <tbody>
                {r.vertices.map((v, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    {v.levels.map((lv, j) => (
                      <td key={j} className={tdL}>
                        {lv}
                      </td>
                    ))}
                    <td className={td}>{v.n}</td>
                    <td className={td}>{fx(v.value, 4)}</td>
                    {r.reduced && (
                      <td className={td}>
                        {v.dataMean === null ? "\u2014" : fx(v.dataMean, 4)}
                      </td>
                    )}
                    {r.reduced && (
                      <td className={td}>
                        {v.dataMean === null
                          ? "\u2014"
                          : signed(v.value - v.dataMean, 4)}
                      </td>
                    )}
                  </tr>
                ))}
                {r.centerMean !== null && (
                  <tr className="border-b border-gray-200 bg-red-50">
                    <td className={tdL} colSpan={r.factors.length}>
                      Centre point
                    </td>
                    <td className={td}>{r.centerN}</td>
                    <td className={td}>{fx(r.centerMean, 4)}</td>
                    {r.reduced && <td className={td}>{fx(r.centerMean, 4)}</td>}
                    {r.reduced && <td className={td}>{"\u2014"}</td>}
                  </tr>
                )}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600">
              {r.centerMean !== null
                ? "The centre is always the raw mean of the centre runs: it sits at no corner, and no term of the model reaches it. Compare it with the average of the corners — a large gap is curvature, and a plane cannot describe the response."
                : "This design has no centre runs, so nothing tests whether the response is a plane between the levels."}
            </p>
          </section>

          {/* Coeficientes */}
          {r.fittedMeans && (
            <section className="overflow-x-auto">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Model behind the corners
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
                      <td className={td}>
                        {t.included ? fx(t.coef, 4) : "out"}
                      </td>
                      <td className={td}>
                        {t.included ? signed(2 * t.coef, 4) : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-600">
                Every corner in the plot is the constant plus each coefficient
                with the sign of that corner. This is the whole arithmetic of the
                cube: nothing else goes into it.
              </p>
            </section>
          )}

          <p className="text-xs text-gray-500">
            {r.n} corner run{r.n === 1 ? "" : "s"}
            {r.centerN > 0 ? `, ${r.centerN} centre runs` : ""}
            {r.nMissing > 0
              ? `, ${r.nMissing} row(s) skipped for a missing response or level`
              : ""}
            .
          </p>
        </div>
      }
    />
  );
}
