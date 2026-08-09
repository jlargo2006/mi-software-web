// app/app/six-sigma/studies/ht/wilcoxon/Controls.tsx
"use client";
import React from "react";
import {
  ALT_LABEL,
  type HTWilcoxonParams,
  type WilcoxonAlternative,
} from "./types";

export default function HTWilcoxonControls({
  params,
  setParams,
  columns,
}: {
  params: HTWilcoxonParams;
  setParams: (p: HTWilcoxonParams) => void;
  columns: { name: string }[];
}) {
  const set = <K extends keyof HTWilcoxonParams>(
    k: K,
    v: HTWilcoxonParams[K]
  ) => setParams({ ...params, [k]: v });

  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="mb-1 block font-medium text-gray-700">Sample</label>
        <select
          className="w-full rounded border border-gray-300 px-2 py-1"
          value={params.column}
          onChange={(e) => set("column", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="wx-test"
          type="checkbox"
          checked={params.performTest}
          onChange={(e) => set("performTest", e.target.checked)}
        />
        <label htmlFor="wx-test" className="font-medium text-gray-700">
          Perform hypothesis test
        </label>
      </div>

      <div className={params.performTest ? "" : "opacity-50"}>
        <label className="mb-1 block font-medium text-gray-700">
          Hypothesized median
        </label>
        <input
          type="text"
          inputMode="decimal"
          className="w-full rounded border border-gray-300 px-2 py-1"
          value={params.hypothesizedMedian}
          disabled={!params.performTest}
          onChange={(e) => set("hypothesizedMedian", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium text-gray-700">
          Alternative hypothesis
        </label>
        <select
          className="w-full rounded border border-gray-300 px-2 py-1"
          value={params.alternative}
          onChange={(e) =>
            set("alternative", e.target.value as WilcoxonAlternative)
          }
        >
          {(Object.keys(ALT_LABEL) as WilcoxonAlternative[]).map((k) => (
            <option key={k} value={k}>
              {ALT_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="wx-ci"
          type="checkbox"
          checked={params.performCI}
          onChange={(e) => set("performCI", e.target.checked)}
        />
        <label htmlFor="wx-ci" className="font-medium text-gray-700">
          Confidence interval for the median
        </label>
      </div>

      <div className={params.performCI ? "" : "opacity-50"}>
        <label className="mb-1 block font-medium text-gray-700">
          Confidence level (%)
        </label>
        <input
          type="text"
          inputMode="decimal"
          className="w-full rounded border border-gray-300 px-2 py-1"
          value={params.confidenceLevel}
          disabled={!params.performCI}
          onChange={(e) => set("confidenceLevel", e.target.value)}
        />
      </div>

      <fieldset className="border-t border-gray-200 pt-3">
        <legend className="mb-1 font-medium text-gray-700">Graphs</legend>
        {[
          ["showHistogram", "Histogram"],
          ["showIndividualValue", "Individual value plot"],
          ["showBoxplot", "Boxplot"],
        ].map(([k, label]) => (
          <div key={k} className="flex items-center gap-2 py-0.5">
            <input
              id={`wx-${k}`}
              type="checkbox"
              checked={params[k as keyof HTWilcoxonParams] as boolean}
              onChange={(e) =>
                set(k as keyof HTWilcoxonParams, e.target.checked as never)
              }
            />
            <label htmlFor={`wx-${k}`} className="text-gray-700">
              {label}
            </label>
          </div>
        ))}
      </fieldset>
    </div>
  );
}
