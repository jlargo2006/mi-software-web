// app/app/six-sigma/studies/ht/twoproportions/Controls.tsx
"use client";
import React from "react";
import {
  ALT_LABEL,
  type TPAlternative,
  type HTTwoProportionsParams,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const cell =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-right focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check = "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function HTTwoProportionsControls({
  params,
  onChange,
}: {
  params: HTTwoProportionsParams;
  onChange: (p: HTTwoProportionsParams) => void;
}) {
  const set = <K extends keyof HTTwoProportionsParams>(
    k: K,
    v: HTTwoProportionsParams[K]
  ) => onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <span className={label}>Summarized data</span>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th />
              <th className="px-1 pb-1">
                <input
                  className={`${cell} text-center font-medium`}
                  value={params.label1}
                  onChange={(e) => set("label1", e.target.value)}
                  placeholder="Sample 1"
                  aria-label="First sample name"
                />
              </th>
              <th className="px-1 pb-1">
                <input
                  className={`${cell} text-center font-medium`}
                  value={params.label2}
                  onChange={(e) => set("label2", e.target.value)}
                  placeholder="Sample 2"
                  aria-label="Second sample name"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-2 py-1 text-sm text-gray-700 whitespace-nowrap">
                Number of events
              </td>
              <td className="px-1 py-1">
                <input
                  className={cell}
                  value={params.events1}
                  onChange={(e) => set("events1", e.target.value)}
                  inputMode="numeric"
                  aria-label="Events in first sample"
                />
              </td>
              <td className="px-1 py-1">
                <input
                  className={cell}
                  value={params.events2}
                  onChange={(e) => set("events2", e.target.value)}
                  inputMode="numeric"
                  aria-label="Events in second sample"
                />
              </td>
            </tr>
            <tr>
              <td className="pr-2 py-1 text-sm text-gray-700 whitespace-nowrap">
                Number of trials
              </td>
              <td className="px-1 py-1">
                <input
                  className={cell}
                  value={params.trials1}
                  onChange={(e) => set("trials1", e.target.value)}
                  inputMode="numeric"
                  aria-label="Trials in first sample"
                />
              </td>
              <td className="px-1 py-1">
                <input
                  className={cell}
                  value={params.trials2}
                  onChange={(e) => set("trials2", e.target.value)}
                  inputMode="numeric"
                  aria-label="Trials in second sample"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1 text-xs text-gray-500">
          Whole numbers. Events cannot exceed trials.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className={label}>Hypothesized difference</label>
          <input
            className={field}
            value={params.hypothesizedDifference}
            onChange={(e) => set("hypothesizedDifference", e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className={label}>Alternative hypothesis</label>
          <select
            className={field}
            value={params.alternative}
            onChange={(e) => set("alternative", e.target.value as TPAlternative)}
          >
            {(Object.keys(ALT_LABEL) as TPAlternative[]).map((k) => (
              <option key={k} value={k}>
                {ALT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Confidence level (%)</label>
          <input
            className={field}
            value={params.confidenceLevel}
            onChange={(e) => set("confidenceLevel", e.target.value)}
            placeholder="95,0"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <span className={label}>Options</span>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.usePooled}
            onChange={(e) => set("usePooled", e.target.checked)}
          />
          Use the pooled estimate of the proportion for the test
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showFisher}
            onChange={(e) => set("showFisher", e.target.checked)}
          />
          Show Fisher&apos;s exact test
        </label>
        <p className="text-xs text-gray-500">
          Pooling applies only when the hypothesized difference is 0.
          Fisher&apos;s exact test likewise.
        </p>
      </div>
    </div>
  );
}
