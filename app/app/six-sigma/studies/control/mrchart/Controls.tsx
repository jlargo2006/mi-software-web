// app/app/six-sigma/studies/control/mrchart/Controls.tsx
"use client";
import React, { useState } from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type { MRParams, TestMode } from "./types";

const lbl = "block text-sm font-medium text-gray-700 mb-1";
const inp =
  "rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";

// Solo los cuatro primeros: la distribucion del rango es asimetrica.
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

export default function MRControls({
  params,
  onChange,
  columns,
}: {
  params: MRParams;
  onChange: (p: MRParams) => void;
  columns: ColumnInfo[];
}) {
  const [tab, setTab] = useState<Tab>("data");
  const set = (patch: Partial<MRParams>) => onChange({ ...params, ...patch });

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

  const span = Number(params.span);

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
            label="Individual values"
            value={params.col}
            onChange={(v) => set({ col: v })}
            columns={columns}
            minWidth={180}
          />

          <label className="block">
            <span className={lbl}>Length of moving range</span>
            <input
              className={`${inp} w-[80px]`}
              value={params.span}
              onChange={(e) => set({ span: e.target.value })}
            />
          </label>

          {span > 2 && (
            <p className="-mt-1 rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              With a length of {span} each range shares {span - 1} observations
              with the next, so consecutive points are strongly dependent. The run
              tests become unreliable. A length of 2 is almost always the better
              choice.
            </p>
          )}

          <p className="text-xs text-gray-500">
            This is the lower half of an I-MR chart on its own. It tracks how much
            the process moves between consecutive observations {"\u2014"} the
            short-term variability {"\u2014"} and nothing about the level.
          </p>
          <p className="text-xs text-gray-500">
            <strong>Consider I-MR instead unless you specifically want only the
            spread.</strong> A moving range cannot be read in isolation: because
            consecutive ranges share an observation, one unusual value produces two
            large ranges in a row, which looks exactly like a real change in
            variability. Without the individuals chart beside it you cannot tell
            the two apart.
          </p>
        </div>
      )}

      {tab === "params" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter a historical standard deviation to use instead of estimating it
            from the data. Leave blank to estimate.
          </p>
          <label className="block">
            <span className={lbl}>Standard deviation</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.histSigma}
              onChange={(e) => set({ histSigma: e.target.value })}
              placeholder="> 0"
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            This is the process sigma, not the mean range. The centre line becomes
            d{"\u2082"} {"\u00D7"} sigma, the average range you would expect at that
            sigma.
          </p>
        </div>
      )}

      {tab === "estimate" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>
              Omit these observations when estimating (e.g. 3 12:15)
            </span>
            <input
              className={`${inp} w-full`}
              value={params.omit}
              onChange={(e) => set({ omit: e.target.value })}
              placeholder="3 12:15"
            />
          </label>
          <p className="-mt-2 text-xs text-gray-500">
            Numbered by observation, as they appear on the axis. The range plotted
            at that observation stops contributing to the centre line but is still
            plotted and still tested.
          </p>
          <p className="text-xs text-gray-500">
            Remember that one unusual observation inflates two ranges. If you are
            omitting because of a known upset, the range before the point is
            usually as affected as the range at it.
          </p>
        </div>
      )}

      {tab === "limits" && (
        <div className="space-y-3">
          <label className="block">
            <span className={lbl}>Lower bound</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.lowerBound}
              onChange={(e) => set({ lowerBound: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>Upper bound</span>
            <input
              className={`${inp} w-[130px]`}
              value={params.upperBound}
              onChange={(e) => set({ upperBound: e.target.value })}
            />
          </label>
          <label className="block">
            <span className={lbl}>
              Draw lines at these multiples of sigma (e.g. 1 2)
            </span>
            <input
              className={`${inp} w-full`}
              value={params.extraSigma}
              onChange={(e) => set({ extraSigma: e.target.value })}
              placeholder="1 2"
            />
          </label>
          <p className="-mt-1 text-xs text-gray-500">
            Note the limits are not symmetric about the centre line, and should not
            be: the distribution of a range is skewed to the right. With a length of
            2 to 6 the lower limit is zero because 1 {"\u2212"} 3d{"\u2083"}/d
            {"\u2082"} is negative, not because it was clipped.
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
            Only these four are offered. Tests 5 to 8 read symmetric sigma zones
            above and below the centre line, and the distribution of a range is
            skewed to the right: those zones do not carry the probabilities the
            tests assume.
          </p>
          <p className="text-xs text-gray-500">
            Test 2 deserves care here even so. Consecutive moving ranges overlap, so
            a run on one side of the centre line arises more easily than the test{" "}
            {"\u2019"}s design assumes.
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
            centre line and limits, and no run test carries across a boundary.
          </p>
          <p className="text-xs text-gray-500">
            Any moving range that would span a boundary is dropped rather than
            assigned to a stage: it would combine two different levels of
            variability into a single number.
          </p>
        </div>
      )}
    </div>
  );
}
