// app/app/six-sigma/studies/pss/twoproportions/Panel.tsx
"use client";
import React from "react";
import type { PssTwoPropParams } from "./types";
import { ALT_LABEL } from "../_shared/types";
import type { Alternative } from "../_shared/types";

export default function Panel({
  params,
  onChange,
}: {
  params: PssTwoPropParams;
  onChange: (p: PssTwoPropParams) => void;
}) {
  const set = <K extends keyof PssTwoPropParams>(k: K, v: PssTwoPropParams[K]) =>
    onChange({ ...params, [k]: v });

  const field = "border border-gray-300 rounded px-2 py-1 w-full text-sm";
  const label = "block text-xs font-semibold mb-1";

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">
        Fill in exactly two of the three fields. The blank one is calculated.
        Sample sizes are per group.
      </p>

      <div>
        <label className={label}>Sample sizes (per group)</label>
        <input
          className={field}
          value={params.sampleSizes}
          onChange={(e) => set("sampleSizes", e.target.value)}
          placeholder="e.g. 50 100 200"
        />
      </div>

      <div>
        <label className={label}>Comparison proportions</label>
        <input
          className={field}
          value={params.differences}
          onChange={(e) => set("differences", e.target.value)}
          placeholder="e.g. 0.4 0.5"
        />
      </div>

      <div>
        <label className={label}>Power values</label>
        <input
          className={field}
          value={params.powerValues}
          onChange={(e) => set("powerValues", e.target.value)}
          placeholder="e.g. 0.8 0.9"
        />
      </div>

      <div>
        <label className={label}>Baseline proportion</label>
        <input
          className={field}
          value={params.baselineProportion}
          onChange={(e) => set("baselineProportion", e.target.value)}
        />
      </div>

      <div>
        <label className={label}>Alternative hypothesis</label>
        <select
          className={field}
          value={params.alternative}
          onChange={(e) => set("alternative", e.target.value as Alternative)}
        >
          {(Object.keys(ALT_LABEL) as Alternative[]).map((k) => (
            <option key={k} value={k}>
              {ALT_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Significance level (α)</label>
        <input
          className={field}
          type="number"
          step="0.01"
          min="0.001"
          max="0.999"
          value={params.alpha}
          onChange={(e) => set("alpha", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
