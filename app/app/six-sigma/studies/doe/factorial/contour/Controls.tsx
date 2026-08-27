// app/app/six-sigma/studies/doe/factorial/contour/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../../lib/columns";
import { MAX_CONTOUR_FACTORS, type DoeContourParams } from "./types";
import { contourParents } from "./compute";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const small =
  "w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";

const RESERVED = ["stdorder", "runorder", "centerpt", "blocks"];

function termsOf(names: string[]): { key: string; members: number[] }[] {
  const out: { key: string; members: number[] }[] = [];
  const combos = (start: number, pick: number, acc: number[]) => {
    if (acc.length === pick) {
      out.push({ key: acc.map((i) => names[i]).join("*"), members: [...acc] });
      return;
    }
    for (let i = start; i < names.length; i++) combos(i + 1, pick, [...acc, i]);
  };
  for (let o = 1; o <= Math.min(names.length, 3); o++) combos(0, o, []);
  return out;
}

export default function DoeContourControls({
  params,
  onChange,
  columns,
}: {
  params: DoeContourParams;
  onChange: (p: DoeContourParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof DoeContourParams>(k: K, v: DoeContourParams[K]) =>
    onChange({ ...params, [k]: v });

  const isReserved = (nm: string) => RESERVED.includes(nm.trim().toLowerCase());
  const chosen = params.factors.filter((s) => s !== params.response);
  const k = chosen.length;

  const toggleFactor = (name: string) => {
    const next = params.factors.includes(name)
      ? params.factors.filter((s) => s !== name)
      : [...params.factors, name];
    const live = next.filter((s) => s !== params.response);
    // Las claves de termino y los ejes dependen de esta lista: si cambia, lo
    // que ya no exista se descarta en lugar de arrastrarse en silencio.
    onChange({
      ...params,
      factors: next,
      excluded: [],
      xFactor: live.includes(params.xFactor) ? params.xFactor : live[0] ?? "",
      yFactor: live.includes(params.yFactor) ? params.yFactor : live[1] ?? "",
    });
  };

  const terms = termsOf(chosen);
  const excluded = new Set(params.excluded);

  const toggleTerm = (key: string, members: number[]) => {
    const next = new Set(excluded);
    if (next.has(key)) {
      next.delete(key);
      for (const p of contourParents(members, chosen)) next.delete(p);
    } else {
      next.add(key);
      for (const t of terms) {
        if (contourParents(t.members, chosen).includes(key)) next.add(t.key);
      }
    }
    set("excluded", [...next]);
  };

  const held = chosen.filter((f) => f !== params.xFactor && f !== params.yFactor);
  const inModel = terms.length - excluded.size;

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Response</label>
        <select
          className={field}
          value={params.response}
          onChange={(e) => set("response", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.index} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Factors
            {k > 0 && (
              <span className="ml-1 font-normal text-gray-500">
                ({k} of {MAX_CONTOUR_FACTORS})
              </span>
            )}
          </span>
        </div>
        <div className="max-h-44 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
          {columns
            .filter((c) => c.name !== params.response)
            .map((c) => {
              const on = params.factors.includes(c.name);
              const full = k >= MAX_CONTOUR_FACTORS && !on;
              return (
                <label
                  key={c.index}
                  className={`flex items-center gap-2 text-sm ${
                    full ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    className={check}
                    checked={on}
                    disabled={full}
                    onChange={() => toggleFactor(c.name)}
                  />
                  <span className={isReserved(c.name) ? "text-gray-400" : ""}>
                    {c.name}
                  </span>
                </label>
              );
            })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          All of them go into the model. Two go on the axes; the rest are held
          fixed below.
        </p>
      </div>

      {k >= 2 && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div>
            <label className={label}>X axis</label>
            <select
              className={field}
              value={params.xFactor}
              onChange={(e) => set("xFactor", e.target.value)}
            >
              <option value="">Select...</option>
              {chosen.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Y axis</label>
            <select
              className={field}
              value={params.yFactor}
              onChange={(e) => set("yFactor", e.target.value)}
            >
              <option value="">Select...</option>
              {chosen
                .filter((f) => f !== params.xFactor)
                .map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {held.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <span className={label}>Hold factors at</span>
          <div className="space-y-2">
            {held.map((f) => (
              <div key={f} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700">{f}</span>
                <input
                  type="number"
                  step="any"
                  className={small}
                  value={params.holds[f] ?? ""}
                  placeholder="centre"
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = { ...params.holds };
                    if (v === "") delete next[f];
                    else next[f] = Number(v.replace(",", "."));
                    set("holds", next);
                  }}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Empty means the centre of the range. The plot is a slice of the
            surface at these values: change one and the whole picture moves.
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <span className={label}>Contours</span>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className={check}
            checked={!params.useSpec}
            onChange={() => set("useSpec", false)}
          />
          Automatic levels
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className={check}
            checked={params.useSpec}
            onChange={() => set("useSpec", true)}
          />
          Specification band
        </label>
        {params.useSpec && (
          <div className="mt-2 flex items-center gap-3 pl-6">
            <label className="text-xs text-gray-600">
              Low
              <input
                type="number"
                step="any"
                className={`${small} mt-1 block`}
                value={params.specLow ?? ""}
                onChange={(e) =>
                  set(
                    "specLow",
                    e.target.value === "" ? null : Number(e.target.value.replace(",", "."))
                  )
                }
              />
            </label>
            <label className="text-xs text-gray-600">
              High
              <input
                type="number"
                step="any"
                className={`${small} mt-1 block`}
                value={params.specHigh ?? ""}
                onChange={(e) =>
                  set(
                    "specHigh",
                    e.target.value === "" ? null : Number(e.target.value.replace(",", "."))
                  )
                }
              />
            </label>
          </div>
        )}
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.filled}
            onChange={(e) => set("filled", e.target.checked)}
          />
          Colour the surface
        </label>
      </div>

      {k >= 2 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Terms in the model
              <span className="ml-1 font-normal text-gray-500">
                ({inModel} of {terms.length})
              </span>
            </span>
            {excluded.size > 0 && (
              <button
                type="button"
                onClick={() => set("excluded", [])}
                className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Full model
              </button>
            )}
          </div>
          <div className="max-h-44 overflow-y-auto rounded-md border border-gray-300 p-2 space-y-1">
            {terms.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  className={check}
                  checked={!excluded.has(t.key)}
                  onChange={() => toggleTerm(t.key, t.members)}
                />
                {t.key}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Leave in only the terms the factorial analysis found real. A surface
            drawn with noise terms bends where nothing bends.
          </p>
        </div>
      )}
    </div>
  );
}
