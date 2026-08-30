// app/app/six-sigma/studies/control/laneyp/Controls.tsx
"use client";
import React, { useState } from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type { LaneyPParams, SizeMode, TestMode } from "./types";

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

export default function LaneyPControls({
  params,
  onChange,
  columns,
}: {
  params: LaneyPParams;
  onChange: (p: LaneyPParams) => void;
  columns: ColumnInfo[];
}) {
  const [tab, setTab] = useState<Tab>("data");
  const set = (patch: Partial<LaneyPParams>) =>
    onChange({ ...params, ...patch });

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
            label="Defectives (count per subgroup)"
            value={params.col}
            onChange={(v) => set({ col: v })}
            columns={columns}
            minWidth={180}
          />

          <div>
            <span className={lbl}>Subgroup sizes</span>
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
            Same data a P chart takes. The P{"\u2032"} chart differs only in the
            width of its limits: it measures how much the points actually scatter
            and rescales the binomial limits by that amount. Run the ordinary P
            chart too {"\u2014"} if the two agree, the binomial model is fine and
            the simpler chart is the one to keep.
          </p>
        </div>
      )}

      {tab === "params" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter a historical proportion to use instead of estimating it from the
            data. Leave blank to estimate.
          </p>
          <label className="block">
            <span className={lbl}>Proportion</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.histP}
              onChange={(e) => set({ histP: e.target.value })}
              placeholder="0 to 1"
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            Sigma Z is always estimated from the data: it is the whole point of
            this chart and there is nothing historical to supply in its place.
          </p>
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
            Omitted subgroups stop contributing to the centre line, but they still
            take part in the moving ranges that give Sigma Z. A moving range needs
            genuinely adjacent points; skipping one would create an artificial jump
            that inflates the dispersion and widens the limits {"\u2014"} the
            opposite of what omitting an odd point is for.
          </p>
        </div>
      )}

      {tab === "limits" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>Lower bound (proportion)</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.lowerBound}
              onChange={(e) => set({ lowerBound: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>Upper bound (proportion)</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.upperBound}
              onChange={(e) => set({ upperBound: e.target.value })}
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            The limits are always clipped to the interval 0 to 1 regardless of
            these bounds: a proportion cannot fall outside it.
          </p>
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
            Only these four exist for attribute charts. Note that test 2 {"\u2014"}
            nine points on one side {"\u2014"} does not care how wide the limits
            are, so widening them does not silence it. Sigma Z fixes false alarms
            of test 1, not run patterns.
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
            centre line <em>and its own Sigma Z</em>, the moving ranges never cross
            a boundary, and no run test carries across it either.
          </p>
        </div>
      )}
    </div>
  );
}
