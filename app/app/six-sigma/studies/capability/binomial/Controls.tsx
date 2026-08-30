// app/app/six-sigma/studies/capability/binomial/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import ColumnSelect from "../../../components/ColumnSelect";
import type { BinomialTests, CapBinomialParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const small =
  "rounded-md border border-gray-300 px-2 py-1 text-sm w-[110px] focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

const TEST_LABELS: { key: keyof BinomialTests; text: string }[] = [
  { key: "test1", text: "One point more than 3 sigmas from centre line" },
  { key: "test2", text: "Nine points in a row on same side of centre line" },
  { key: "test3", text: "Six points in a row, all increasing or all decreasing" },
  { key: "test4", text: "Fourteen points in a row, alternating up and down" },
];

export default function CapBinomialControls({
  params,
  onChange,
  columns,
}: {
  params: CapBinomialParams;
  onChange: (p: CapBinomialParams) => void;
  columns: ColumnInfo[];
}) {
  const set = (patch: Partial<CapBinomialParams>) => onChange({ ...params, ...patch });
  const setTest = (key: keyof BinomialTests, v: boolean) =>
    onChange({ ...params, tests: { ...params.tests, [key]: v } });

  const all = Object.values(params.tests).every(Boolean);
  const none = Object.values(params.tests).every((v) => !v);

  return (
    <div className="space-y-4">
      <ColumnSelect
        label="Defectives"
        value={params.defectives}
        onChange={(v) => set({ defectives: v })}
        columns={columns}
        minWidth={180}
      />

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <span className={label}>Sample size</span>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className={check}
            checked={params.sizeMode === "constant"}
            onChange={() => set({ sizeMode: "constant" })}
          />
          Constant size
          <input
            className={small}
            value={params.constantSize}
            disabled={params.sizeMode !== "constant"}
            onChange={(e) => set({ constantSize: e.target.value })}
            placeholder="e.g. 100"
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className={`${check} mt-1`}
            checked={params.sizeMode === "column"}
            onChange={() => set({ sizeMode: "column" })}
          />
          <span className="flex-1">
            Use sizes in
            <div className={params.sizeMode === "column" ? "" : "opacity-50"}>
              <ColumnSelect
                label=""
                value={params.sizeColumn}
                onChange={(v) => set({ sizeColumn: v })}
                columns={columns.filter((c) => c.name !== params.defectives)}
                minWidth={160}
              />
            </div>
          </span>
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <label className="block">
          <span className={label}>Historical p (optional)</span>
          <input
            className={small}
            value={params.historicalP}
            onChange={(e) => set({ historicalP: e.target.value })}
            placeholder="e.g. 0,1756"
          />
        </label>
        <p className="text-xs text-gray-500">
          A proportion, not a percentage. Leave it empty and the centre line is
          the p of these data.
        </p>

        <label className="block">
          <span className={label}>Target %Defective (optional)</span>
          <input
            className={small}
            value={params.target}
            onChange={(e) => set({ target: e.target.value })}
            placeholder="e.g. 10"
          />
        </label>

        <label className="block">
          <span className={label}>Confidence level (%)</span>
          <input
            className={small}
            value={params.confidence}
            onChange={(e) => set({ confidence: e.target.value })}
            placeholder="95"
          />
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Tests for special causes
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={all}
              onClick={() =>
                set({ tests: { test1: true, test2: true, test3: true, test4: true } })
              }
              className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              All four
            </button>
            <button
              type="button"
              disabled={none}
              onClick={() =>
                set({
                  tests: { test1: false, test2: false, test3: false, test4: false },
                })
              }
              className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              None
            </button>
          </div>
        </div>
        <div className="space-y-1 rounded-md border border-gray-300 p-2">
          {TEST_LABELS.map((t, i) => (
            <label
              key={t.key}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                className={`${check} mt-0.5`}
                checked={params.tests[t.key]}
                onChange={(e) => setTest(t.key, e.target.checked)}
              />
              <span>
                <span className="text-gray-400">{i + 1}.</span> {t.text}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Every test added raises the chance of a false alarm. Test 1 alone is
          the usual choice for a capability study.
        </p>
      </div>
    </div>
  );
}
