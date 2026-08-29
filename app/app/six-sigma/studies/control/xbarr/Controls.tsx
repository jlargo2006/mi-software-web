// app/app/six-sigma/studies/control/xbarr/Controls.tsx
"use client";
import React, { useState } from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type {
  BoxCoxMode,
  Layout,
  SigmaMethod,
  TestMode,
  XbarRParams,
} from "./types";

const lbl = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

const TEST_LABELS = [
  "1 point > K standard deviations from center line",
  "K points in a row on same side of center line",
  "K points in a row, all increasing or all decreasing",
  "K points in a row, alternating up and down",
  "K out of K+1 points > 2 standard deviations from CL (same side)",
  "K out of K+1 points > 1 standard deviation from CL (same side)",
  "K points in a row within 1 standard deviation of CL (either side)",
  "K points in a row > 1 standard deviation from CL (either side)",
];

type Tab = "data" | "params" | "estimate" | "limits" | "tests" | "stages" | "boxcox";

const TABS: [Tab, string][] = [
  ["data", "Data"],
  ["params", "Parameters"],
  ["estimate", "Estimate"],
  ["limits", "Limits"],
  ["tests", "Tests"],
  ["stages", "Stages"],
  ["boxcox", "Box-Cox"],
];

export default function XbarRControls({
  params,
  onChange,
  columns,
}: {
  params: XbarRParams;
  onChange: (p: XbarRParams) => void;
  columns: ColumnInfo[];
}) {
  const [tab, setTab] = useState<Tab>("data");
  const set = (patch: Partial<XbarRParams>) => onChange({ ...params, ...patch });

  const toggleCol = (name: string) => {
    const has = params.cols.includes(name);
    set({
      cols: has
        ? params.cols.filter((c) => c !== name)
        : [...params.cols, name],
    });
  };

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
          <div className="space-y-1">
            {(
              [
                ["rows", "Observations for a subgroup are in one row of columns"],
                ["column", "All observations for a chart are in one column"],
              ] as [Layout, string][]
            ).map(([v, t]) => (
              <label key={v} className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={params.layout === v}
                  onChange={() => set({ layout: v })}
                  className="mt-0.5 accent-[#00674d]"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>

          {params.layout === "rows" ? (
            <div>
              <span className={lbl}>Columns (one per position in the subgroup)</span>
              <div className="max-h-52 space-y-1 overflow-y-auto rounded border border-gray-200 p-2">
                {columns.length === 0 && (
                  <p className="text-xs text-gray-500">No columns available.</p>
                )}
                {columns.map((c) => (
                  <label
                    key={c.name}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={params.cols.includes(c.name)}
                      onChange={() => toggleCol(c.name)}
                      className="accent-[#00674d]"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {params.cols.length} selected. The subgroup size is the number of
                columns you tick.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <ColumnSelect
                label="Variable"
                value={params.col}
                onChange={(v) => set({ col: v })}
                columns={columns}
                minWidth={180}
              />
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    checked={params.sizeMode === "number"}
                    onChange={() => set({ sizeMode: "number" })}
                    className="accent-[#00674d]"
                  />
                  Subgroup size
                  <input
                    className={`${inp} w-[64px]`}
                    value={params.size}
                    onChange={(e) => set({ size: e.target.value })}
                    disabled={params.sizeMode !== "number"}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    checked={params.sizeMode === "id"}
                    onChange={() => set({ sizeMode: "id" })}
                    className="accent-[#00674d]"
                  />
                  Subgroup ID column
                </label>
                {params.sizeMode === "id" && (
                  <div className="pl-6">
                    <ColumnSelect
                      label=""
                      value={params.idCol}
                      onChange={(v) => set({ idCol: v })}
                      columns={columns}
                      minWidth={160}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "params" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter historical values to use instead of estimating from the data.
            Leave blank to estimate.
          </p>
          <label className="block">
            <span className={lbl}>Mean</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.histMean}
              onChange={(e) => set({ histMean: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>Standard deviation</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.histSigma}
              onChange={(e) => set({ histSigma: e.target.value })}
            />
          </label>
        </div>
      )}

      {tab === "estimate" && (
        <div className="space-y-3">
          <div>
            <span className={lbl}>Method for estimating standard deviation</span>
            {(
              [
                ["rbar", "R\u0305 (average range)"],
                ["pooled", "Pooled standard deviation"],
              ] as [SigmaMethod, string][]
            ).map(([v, t]) => (
              <label key={v} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={params.sigmaMethod === v}
                  onChange={() => set({ sigmaMethod: v })}
                  className="accent-[#00674d]"
                />
                {t}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={params.sigmaMethod === "rbar" ? true : params.unbias}
              disabled={params.sigmaMethod === "rbar"}
              onChange={(e) => set({ unbias: e.target.checked })}
              className="accent-[#00674d]"
            />
            Use unbiasing constant
          </label>
          <p className="-mt-2 text-xs text-gray-500">
            Fixed on for R\u0305: dividing by d
            <sub>2</sub> already removes the bias. It is a real choice only for
            the pooled standard deviation, where c<sub>4</sub> does the same job.
          </p>

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
            contributing to the limits.
          </p>
        </div>
      )}

      {tab === "limits" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>Xbar chart, lower bound</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.xLowerBound}
              onChange={(e) => set({ xLowerBound: e.target.value })}
              placeholder="e.g. 0"
            />
          </label>
          <label className="block">
            <span className={lbl}>Xbar chart, upper bound</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.xUpperBound}
              onChange={(e) => set({ xUpperBound: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>R chart, upper bound</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.rUpperBound}
              onChange={(e) => set({ rUpperBound: e.target.value })}
            />
          </label>
        </div>
      )}

      {tab === "tests" && (
        <div className="space-y-3">
          <div className="space-y-1">
            {(
              [
                ["one", "Perform Test 1 only"],
                ["all", "Perform all eight tests"],
                ["custom", "Choose tests"],
              ] as [TestMode, string][]
            ).map(([v, t]) => (
              <label key={v} className="flex items-center gap-2 text-sm text-gray-700">
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
            Tests 5 to 8 are applied to the Xbar chart only. They reason in sigma
            zones and assume symmetry about the centre line, which the range does
            not have.
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
            One value per subgroup, in subgroup order. A new stage starts
            whenever the value changes, each stage gets its own centre line and
            limits, and no run test carries across a boundary.
          </p>
        </div>
      )}

      {tab === "boxcox" && (
        <div className="space-y-2">
          {(
            [
              ["none", "No transformation"],
              ["ln", "\u03BB = 0 (ln)"],
              ["sqrt", "\u03BB = 0,5 (square root)"],
              ["optimal", "Optimal \u03BB"],
              ["other", "Other value"],
            ] as [BoxCoxMode, string][]
          ).map(([v, t]) => (
            <label key={v} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={params.boxcox === v}
                onChange={() => set({ boxcox: v })}
                className="accent-[#00674d]"
              />
              {t}
            </label>
          ))}
          {params.boxcox === "other" && (
            <input
              className={`${inp} ml-6 w-[90px]`}
              value={params.boxcoxLambda}
              onChange={(e) => set({ boxcoxLambda: e.target.value })}
              placeholder="-5 to 5"
            />
          )}
          <p className="text-xs text-gray-500">
            The transformation is applied to the individual observations before
            forming subgroups, and the chart is drawn in transformed units.
          </p>
        </div>
      )}
    </div>
  );
}
