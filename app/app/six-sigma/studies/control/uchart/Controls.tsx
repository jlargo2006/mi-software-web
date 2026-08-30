// app/app/six-sigma/studies/control/uchart/Controls.tsx
"use client";
import React, { useState } from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type { SizeMode, TestMode, UChartParams, UnequalMode } from "./types";

const lbl = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

// En cartas de atributos solo existen los cuatro primeros tests.
const TEST_LABELS = [
  "1 point > K standard deviations from center line",
  "K points in a row on same side of center line",
  "K points in a row, all increasing or all decreasing",
  "K points in a row, alternating up and down",
];

type Tab = "data" | "params" | "estimate" | "limits" | "tests" | "stages";

const TABS: [Tab, string][] = [
  ["data", "Data"],
  ["params", "Parameters"],
  ["estimate", "Estimate"],
  ["limits", "Limits"],
  ["tests", "Tests"],
  ["stages", "Stages"],
];

export default function UChartControls({
  params,
  onChange,
  columns,
}: {
  params: UChartParams;
  onChange: (p: UChartParams) => void;
  columns: ColumnInfo[];
}) {
  const [tab, setTab] = useState<Tab>("data");
  const set = (patch: Partial<UChartParams>) => onChange({ ...params, ...patch });

  const setTestOn = (i: number, v: boolean) => {
    const next = [...params.testsOn];
    next[i] = v;
    set({ testsOn: next, testMode: "custom" });
  };
  const setTestK = (i: number, v: string) => {
    const next = [...params.testK];
    next[i] = v;
    set({ testK: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-1">
        {TABS.map(([id, text]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-t px-2.5 py-1 text-xs ${
              tab === id
                ? "bg-[#00674d] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ColumnSelect
            label="Defects (count per subgroup)"
            value={params.col}
            onChange={(v) => set({ col: v })}
            columns={columns}
            minWidth={180}
          />

          <div>
            <span className={lbl}>Subgroup sizes (inspection units)</span>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={params.sizeMode === "column"}
                  onChange={() => set({ sizeMode: "column" })}
                  className="accent-[#00674d]"
                />
                From a column
              </label>
              {params.sizeMode === "column" && (
                <div className="pl-6">
                  <ColumnSelect
                    label=""
                    value={params.sizeCol}
                    onChange={(v) => set({ sizeCol: v })}
                    columns={columns}
                    minWidth={160}
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={params.sizeMode === "number"}
                  onChange={() => set({ sizeMode: "number" })}
                  className="accent-[#00674d]"
                />
                Constant size
                <input
                  className={`${inp} w-[80px]`}
                  value={params.size}
                  onChange={(e) => set({ size: e.target.value })}
                  disabled={params.sizeMode !== "number"}
                />
              </label>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            The count is the number of <em>defects</em>, not of defective units,
            so a single unit may contribute several and the count is not capped
            by the sample size. The size is a number of inspection units and may
            be fractional {"\u2014"} 2,5 metres of cable, 0,7 of a shift. If the
            size is always the same, a C chart says the same thing more directly.
          </p>
        </div>
      )}

      {tab === "params" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter a historical rate to use instead of estimating it from the
            data. Leave blank to estimate.
          </p>
          <label className="block">
            <span className={lbl}>Mean (defects per unit)</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.histU}
              onChange={(e) => set({ histU: e.target.value })}
              placeholder="> 0"
            />
          </label>
        </div>
      )}

      {tab === "estimate" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>
              Omit these subgroups when estimating (e.g. 3 12:15)
            </span>
            <input
              className={`${inp} w-full`}
              value={params.omit}
              onChange={(e) => set({ omit: e.target.value })}
              placeholder="3 12:15"
            />
          </label>
          <p className="-mt-2 text-xs text-gray-500">
            Omitted subgroups are still plotted and still tested. They only stop
            contributing to the centre line.
          </p>
        </div>
      )}

      {tab === "limits" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>Lower bound (defects per unit)</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.lowerBound}
              onChange={(e) => set({ lowerBound: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>Upper bound (defects per unit)</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.upperBound}
              onChange={(e) => set({ upperBound: e.target.value })}
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            The lower limit is always clipped at zero. There is no clipping above:
            unlike a proportion, a rate of defects has no ceiling.
          </p>

          <div className="border-t border-gray-200 pt-2">
            <span className={lbl}>
              When subgroup sizes are unequal, calculate limits
            </span>
            {(
              [
                ["actual", "Using actual sizes of the subgroups"],
                ["assume", "Assuming all subgroups have size"],
              ] as [UnequalMode, string][]
            ).map(([v, t]) => (
              <label
                key={v}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  checked={params.unequalMode === v}
                  onChange={() => set({ unequalMode: v })}
                  className="accent-[#00674d]"
                />
                {t}
                {v === "assume" && (
                  <input
                    className={`${inp} w-[80px]`}
                    value={params.assumeSize}
                    onChange={(e) => set({ assumeSize: e.target.value })}
                    disabled={params.unequalMode !== "assume"}
                  />
                )}
              </label>
            ))}
            <p className="mt-1 text-xs text-gray-500">
              Actual sizes give each point the limit it deserves. A single assumed
              size produces a flat, readable chart at the cost of being wrong for
              every subgroup that is not that size.
            </p>
          </div>
        </div>
      )}

      {tab === "tests" && (
        <div className="space-y-3">
          <div className="space-y-1">
            {(
              [
                ["one", "Perform Test 1 only"],
                ["all", "Perform all four tests"],
                ["custom", "Choose tests"],
              ] as [TestMode, string][]
            ).map(([v, t]) => (
              <label
                key={v}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  checked={params.testMode === v}
                  onChange={() => set({ testMode: v })}
                  className="accent-[#00674d]"
                />
                {t}
              </label>
            ))}
          </div>

          <div className="space-y-1 border-t border-gray-200 pt-2">
            <div className="flex justify-end pr-1 text-xs font-medium text-gray-500">
              K
            </div>
            {TEST_LABELS.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    params.testMode === "all"
                      ? true
                      : params.testMode === "one"
                      ? i === 0
                      : params.testsOn[i]
                  }
                  disabled={params.testMode !== "custom"}
                  onChange={(e) => setTestOn(i, e.target.checked)}
                  className="accent-[#00674d]"
                />
                <span className="flex-1 text-xs text-gray-700">{t}</span>
                <input
                  className={`${inp} w-[52px] text-center`}
                  value={params.testK[i]}
                  onChange={(e) => setTestK(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Only these four exist for attribute charts. Tests 5 to 8 read sigma
            zones that assume symmetry about the centre line, which the Poisson
            distribution does not have unless the expected count is large.
          </p>
        </div>
      )}

      {tab === "stages" && (
        <div className="space-y-3">
          <ColumnSelect
            label="Define stages with this variable"
            value={params.stageCol}
            onChange={(v) => set({ stageCol: v })}
            columns={columns}
            minWidth={180}
          />
          {params.stageCol && (
            <button
              onClick={() => set({ stageCol: null })}
              className="text-xs text-[#00674d] underline"
            >
              Clear stages
            </button>
          )}
          <p className="text-xs text-gray-500">
            A new stage starts whenever the value changes. Each stage gets its own
            centre line, and no run test carries across a boundary.
          </p>
        </div>
      )}
    </div>
  );
}
