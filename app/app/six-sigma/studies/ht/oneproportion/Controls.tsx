// app/app/six-sigma/studies/ht/oneproportion/Controls.tsx
"use client";
import React from "react";
import {
  ALT_LABEL,
  METHOD_LABEL,
  type OPAlternative,
  type OPMethod,
  type HTOneProportionParams,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

export default function HTOneProportionControls({
  params,
  onChange,
}: {
  params: HTOneProportionParams;
  onChange: (p: HTOneProportionParams) => void;
}) {
  const set = <K extends keyof HTOneProportionParams>(
    k: K,
    v: HTOneProportionParams[K]
  ) => onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Number of events</label>
        <input
          className={field}
          value={params.events}
          onChange={(e) => set("events", e.target.value)}
          inputMode="numeric"
        />
      </div>

      <div>
        <label className={label}>Number of trials</label>
        <input
          className={field}
          value={params.trials}
          onChange={(e) => set("trials", e.target.value)}
          inputMode="numeric"
        />
        <p className="mt-1 text-xs text-gray-500">
          Whole numbers. Events cannot exceed trials.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className={label}>Hypothesized proportion</label>
          <input
            className={field}
            value={params.hypothesizedProportion}
            onChange={(e) => set("hypothesizedProportion", e.target.value)}
            placeholder="0,5"
          />
        </div>

        <div>
          <label className={label}>Alternative hypothesis</label>
          <select
            className={field}
            value={params.alternative}
            onChange={(e) => set("alternative", e.target.value as OPAlternative)}
          >
            {(Object.keys(ALT_LABEL) as OPAlternative[]).map((k) => (
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

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Method</label>
        <select
          className={field}
          value={params.method}
          onChange={(e) => set("method", e.target.value as OPMethod)}
        >
          {(Object.keys(METHOD_LABEL) as OPMethod[]).map((k) => (
            <option key={k} value={k}>
              {METHOD_LABEL[k]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          The exact method inverts the binomial distribution and is valid for any
          sample size. The normal approximation adds a Z-value but needs
          np{"\u2080"} and n(1{"\u2212"}p{"\u2080"}) of at least 5.
        </p>
      </div>
    </div>
  );
}
