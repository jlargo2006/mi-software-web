// app/app/six-sigma/studies/control/xbars/Controls.tsx
"use client";
import React, { useState } from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type {
  Layout,
  SigmaMethod,
  TestMode,
  XbarSParams,
} from "./types";

const lbl = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

const TEST_LABELS = [
  "1 point > K standard deviations from center line",
  "K points in a row on same side of center line",
  "K points in a row, all increasing or all decreasing",
  "K points in a row, alternating up and down",
  "K out of K+1 points > 2 std devs from center line (same side)",
  "K out of K+1 points > 1 std dev from center line (same side)",
  "K points in a row within 1 std dev of center line (either side)",
  "K points in a row > 1 std dev from center line (either side)",
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

export default function XbarSControls({
  params,
  onChange,
  columns,
}: {
  params: XbarSParams;
  onChange: (p: XbarSParams) => void;
  columns: ColumnInfo[];
}) {
  const [tab, setTab] = useState<Tab>("data");
  const set = (patch: Partial<XbarSParams>) => onChange({ ...params, ...patch });

  const ticked = new Set(params.cols.filter((c): c is string => !!c));
  const toggleCol = (name: string, on: boolean) => {
    const next = new Set(ticked);
    if (on) next.add(name);
    else next.delete(name);
    // Se conserva el orden de la hoja: la posicion dentro del subgrupo no debe
    // depender del orden en que se marcaron las casillas.
    set({ cols: columns.map((c) => c.name).filter((nm) => next.has(nm)) });
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
                ["columns", "Observations for a subgroup are in one row of columns"],
                ["single", "All observations for a chart are in one column"],
              ] as [Layout, string][]
            ).map(([v, t]) => (
              <label
                key={v}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  checked={params.layout === v}
                  onChange={() => set({ layout: v })}
                  className="mt-1 accent-[#00674d]"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>

          {params.layout === "columns" ? (
            <div className="space-y-1 border-t border-gray-200 pt-2">
              <span className={lbl}>
                Columns (one per position in the subgroup)
              </span>
              <div className="max-h-64 space-y-0.5 overflow-y-auto rounded border border-gray-200 p-2">
                {columns.map((c) => (
                  <label
                    key={c.name}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={ticked.has(c.name)}
                      onChange={(e) => toggleCol(c.name, e.target.checked)}
                      className="accent-[#00674d]"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {ticked.size} selected. The subgroup size is the number of columns
                you tick, and at least two are needed: a standard deviation cannot
                be computed from one observation.
              </p>
            </div>
          ) : (
            <div className="space-y-3 border-t border-gray-200 pt-2">
              <ColumnSelect
                label="Observations"
                value={params.col}
                onChange={(v) => set({ col: v })}
                columns={columns}
                minWidth={180}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={!params.useGroupCol}
                  onChange={() => set({ useGroupCol: false })}
                  className="accent-[#00674d]"
                />
                Subgroup size
                <input
                  className={`${inp} w-[80px]`}
                  value={params.size}
                  onChange={(e) => set({ size: e.target.value })}
                  disabled={params.useGroupCol}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={params.useGroupCol}
                  onChange={() => set({ useGroupCol: true })}
                  className="accent-[#00674d]"
                />
                Subgroup label column
              </label>
              {params.useGroupCol && (
                <div className="pl-6">
                  <ColumnSelect
                    label=""
                    value={params.groupCol}
                    onChange={(v) => set({ groupCol: v })}
                    columns={columns}
                    minWidth={160}
                  />
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Xbar-S and Xbar-R answer the same question. The S chart uses every
            observation to measure spread, the R chart only the largest and the
            smallest, so from about n = 9 upwards the R chart starts wasting
            information and the S chart is the better choice.
          </p>
        </div>
      )}

      {tab === "params" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter known values to use instead of estimating them from the data.
            Leave blank to estimate.
          </p>
          <label className="block">
            <span className={lbl}>Mean</span>
            <input
              className={`${inp} w-[150px]`}
              value={params.histMean}
              onChange={(e) => set({ histMean: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>Standard deviation</span>
            <input
              className={`${inp} w-[150px]`}
              value={params.histSigma}
              onChange={(e) => set({ histSigma: e.target.value })}
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            This is the within-subgroup standard deviation, not the overall one.
            Supplying the overall spread would widen the limits and hide exactly
            the shifts the chart exists to find.
          </p>
        </div>
      )}

      {tab === "estimate" && (
        <div className="space-y-3">
          <div>
            <span className={lbl}>Method for estimating sigma</span>
            {(
              [
                ["sbar", "Sbar (average of the subgroup standard deviations)"],
                ["pooled", "Pooled standard deviation"],
              ] as [SigmaMethod, string][]
            ).map(([v, t]) => (
              <label
                key={v}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  checked={params.method === v}
                  onChange={() => set({ method: v })}
                  className="mt-1 accent-[#00674d]"
                />
                <span>{t}</span>
              </label>
            ))}
            <p className="mt-1 text-xs text-gray-500">
              Pooled is more efficient if every subgroup really shares the same
              sigma, and more distorted if they do not: squaring gives extra
              weight to the scattered subgroups. Sbar is the more robust default.
            </p>
          </div>

          <label className="flex items-center gap-2 border-t border-gray-200 pt-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={params.unbias}
              onChange={(e) => set({ unbias: e.target.checked })}
              className="accent-[#00674d]"
            />
            Use unbiasing constant
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            The sample standard deviation underestimates sigma, and badly at small
            n: at n = 2 the expected value is only 79,8 % of the true sigma.
            Dividing by c4 corrects it. Leave this on unless you are reproducing a
            calculation that did not.
          </p>

          <label className="block border-t border-gray-200 pt-2">
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
            contributing to the centre line and the limits.
          </p>
        </div>
      )}

      {tab === "limits" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>Lower bound (Xbar chart)</span>
            <input
              className={`${inp} w-[150px]`}
              value={params.lowerBound}
              onChange={(e) => set({ lowerBound: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>Upper bound (Xbar chart)</span>
            <input
              className={`${inp} w-[150px]`}
              value={params.upperBound}
              onChange={(e) => set({ upperBound: e.target.value })}
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            Bounds apply to the chart of means. The lower limit of the S chart is
            always clipped at zero, since a standard deviation cannot be negative.
          </p>
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
            All eight apply to the chart of means, because a subgroup mean is
            close to normal. On the S chart only the first four are used: tests 5
            to 8 read symmetric sigma zones, and the distribution of s is skewed
            to the right.
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
            centre line and limits on both charts, and no run test carries across
            a boundary.
          </p>
        </div>
      )}
    </div>
  );
}
