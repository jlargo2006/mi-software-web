// app/app/six-sigma/studies/pss/factorial/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import { SOLVE_LABEL, type FactSolveFor, type PssFactParams } from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const small =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";
const disabled = "bg-gray-100 text-gray-400";

export default function PssFactControls({
  params,
  onChange,
}: {
  params: PssFactParams;
  onChange: (p: PssFactParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof PssFactParams>(k: K, v: PssFactParams[K]) =>
    onChange({ ...params, [k]: v });

  const k = Number(params.numFactors);
  const full = Number.isInteger(k) && k >= 2 && k <= 15 ? Math.pow(2, k) : 0;
  // Solo potencias de dos hasta el factorial completo.
  const cornerOpts: number[] = [];
  for (let c = 4; c <= full; c *= 2) cornerOpts.push(c);

  const corner = Number(params.cornerPoints);
  const blockOpts = ["none"];
  for (let b = 2; b <= corner / 2; b *= 2) blockOpts.push(String(b));

  /** Al cambiar los factores, el diseno completo pasa a ser el predeterminado. */
  const changeFactors = (txt: string) => {
    const nk = Number(txt);
    if (!Number.isInteger(nk) || nk < 2 || nk > 15) {
      set("numFactors", txt);
      return;
    }
    onChange({
      ...params,
      numFactors: txt,
      cornerPoints: String(Math.pow(2, nk)),
      blocks: "none",
    });
  };

  /** Al elegir la incognita, se vacia su campo para que quede claro. */
  const changeSolve = (s: FactSolveFor) => {
    const next = { ...params, solveFor: s };
    if (s === "reps") next.replicates = "";
    if (s === "effect") next.effects = "";
    if (s === "power") next.powerValues = "";
    onChange(next);
  };

  const isUnknown = (s: FactSolveFor) => params.solveFor === s;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Number of factors</label>
          <input
            className={small}
            value={params.numFactors}
            onChange={(e) => changeFactors(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={label}>Number of corner points</label>
          <select
            className={small}
            value={params.cornerPoints}
            onChange={(e) => set("cornerPoints", e.target.value)}
          >
            {cornerOpts.length === 0 && (
              <option value={params.cornerPoints}>{params.cornerPoints}</option>
            )}
            {cornerOpts.map((c) => (
              <option key={c} value={String(c)}>
                {c}
                {c === full ? " (full)" : ` (1/${full / c} fraction)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Solve for</label>
        <div className="space-y-2">
          {(Object.keys(SOLVE_LABEL) as FactSolveFor[]).map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="pssfact-solve"
                className="h-4 w-4 border-gray-300 text-[#00674d] focus:ring-[#00674d]"
                checked={params.solveFor === s}
                onChange={() => changeSolve(s)}
              />
              {SOLVE_LABEL[s]}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Give values for the other two. Each field takes a list: 1 2 4.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div>
          <label className={label}>
            Replicates
            {isUnknown("reps") && (
              <span className="ml-1 font-normal text-[#00674d]">
                (solved for)
              </span>
            )}
          </label>
          <input
            className={`${small} ${isUnknown("reps") ? disabled : ""}`}
            value={params.replicates}
            onChange={(e) => set("replicates", e.target.value)}
            disabled={isUnknown("reps")}
            placeholder={isUnknown("reps") ? "\u2014" : "2"}
          />
        </div>
        <div>
          <label className={label}>
            Effects
            {isUnknown("effect") && (
              <span className="ml-1 font-normal text-[#00674d]">
                (solved for)
              </span>
            )}
          </label>
          <input
            className={`${small} ${isUnknown("effect") ? disabled : ""}`}
            value={params.effects}
            onChange={(e) => set("effects", e.target.value)}
            disabled={isUnknown("effect")}
            placeholder={isUnknown("effect") ? "\u2014" : "2"}
          />
        </div>
        <div>
          <label className={label}>
            Power values
            {isUnknown("power") && (
              <span className="ml-1 font-normal text-[#00674d]">
                (solved for)
              </span>
            )}
          </label>
          <input
            className={`${small} ${isUnknown("power") ? disabled : ""}`}
            value={params.powerValues}
            onChange={(e) => set("powerValues", e.target.value)}
            disabled={isUnknown("power")}
            placeholder={isUnknown("power") ? "\u2014" : "0,9"}
          />
        </div>
        <div>
          <label className={label}>Number of center points per block</label>
          <input
            className={small}
            value={params.centerPoints}
            onChange={(e) => set("centerPoints", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-2">
        <div>
          <label className={label}>Standard deviation</label>
          <input
            className={small}
            value={params.sd}
            onChange={(e) => set("sd", e.target.value)}
            inputMode="decimal"
          />
        </div>
        <div>
          <label className={label}>Alpha</label>
          <input
            className={small}
            value={params.alpha}
            onChange={(e) => set("alpha", e.target.value)}
            inputMode="decimal"
          />
        </div>
        <div>
          <label className={label}>Blocks</label>
          <select
            className={small}
            value={params.blocks}
            onChange={(e) => set("blocks", e.target.value)}
          >
            {blockOpts.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Number of terms omitted from model</label>
        <input
          className={field}
          value={params.termsOmitted}
          onChange={(e) => set("termsOmitted", e.target.value)}
          inputMode="numeric"
        />
        <p className="mt-1 text-xs text-gray-500">
          High-order interactions you do not intend to fit. Each one omitted
          returns a degree of freedom to the error and raises the power.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showCurve}
            onChange={(e) => set("showCurve", e.target.checked)}
          />
          Power curve
        </label>
      </div>
    </div>
  );
}
