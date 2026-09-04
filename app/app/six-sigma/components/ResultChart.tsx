"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

// Plotly only runs in the browser
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="text-gray-400 text-sm p-4">Loading chart…</div>
  ),
});

interface ResultChartProps {
  data: Data[];
  layout?: Partial<Layout>;
}

export default function ResultChart({ data, layout }: ResultChartProps) {
  return (
    <Plot
      data={data}
      layout={{
        autosize: true,
        margin: { l: 50, r: 30, t: 40, b: 40 },
        font: { family: "system-ui, sans-serif", size: 12 },
        // Barra de herramientas en vertical: en horizontal ocupa toda la
        // esquina superior derecha y se solapa con las leyendas ancladas
        // en x≈1, y=1 (p. ej. el Fitted Line Plot de regresion).
        modebar: { orientation: "v" },
        ...layout,
      }}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
      config={{ displayModeBar: true, responsive: true }}
    />
  );
}
