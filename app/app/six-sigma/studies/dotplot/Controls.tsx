// app/app/six-sigma/studies/dotplot/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type {
  DotplotParams,
  DotplotArrangement,
  DotplotYMode,
} from "./types";

const ARRANGEMENTS: Record<DotplotYMode, { value: DotplotArrangement; label: string }[]> = {
  one: [
    { value: "simple", label: "Simple" },
    { value: "withGroups", label: "With Groups" },
    { value: "stackGroups", label: "Stack Groups" },
  ],
  multiple: [
    { value: "simple", label: "Simple" },
    { value: "stack", label: "Stack Y's" },
    { value: "withGroups", label: "With Groups" },
    { value: "stackGroups", label: "Stack Groups" },
  ],
};

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: DotplotParams;
  onChange: (next: DotplotParams) => void;
  columns: ColumnInfo[];
}) {
  const available = columns.filter((c) => !params.cols.includes(c.name));
  const needsGroup =
    params.arrangement === "withGroups" || params.arrangement === "stackGroups";

  const addCol = (name: string) => {
    if (!name) return;
    // One Y: solo una columna
    const cols =
      params.yMode === "one" ? [name] : [...params.cols, name];
    onChange({ ...params, cols });
  };
  const removeCol = (name: string) =>
    onChange({ ...params, cols: params.cols.filter((x) => x !== name) });

  const setYMode = (yMode: DotplotYMode) => {
    // Al cambiar de modo, reajusta arrangement y cols si hace falta
    const valid = ARRANGEMENTS[yMode].map((a) => a.value);
    const arrangement = valid.includes(params.arrangement)
      ? params.arrangement
      : "simple";
    const cols = yMode === "one" ? params.cols.slice(0, 1) : params.cols;
    onChange({ ...params, yMode, arrangement, cols });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Y mode */}
      <div>
        <label className="block font-medium mb-1">Response</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={params.yMode}
          onChange={(e) => setYMode(e.target.value as DotplotYMode)}
        >
          <option value="one">One Y</option>
          <option value="multiple">Multiple Y&apos;s</option>
        </select>
      </div>

      {/* Añadir columnas */}
      <div>
        <label className="block font-medium mb-1">
          {params.yMode === "one" ? "Y column" : "Add Y column"}
        </label>
        <select
          className="border rounded px-2 py-1 w-full"
          value=""
          onChange={(e) => addCol(e.target.value)}
        >
          <option value="" disabled>
            Select a column…
          </option>
          {available.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {params.cols.length > 0 && (
        <div>
          <label className="block font-medium mb-1">Selected</label>
          <ul className="space-y-1">
            {params.cols.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between border rounded px-2 py-1"
              >
                <span>{name}</span>
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => removeCol(name)}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Arrangement */}
      <div>
        <label className="block font-medium mb-1">Type</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={params.arrangement}
          onChange={(e) =>
            onChange({
              ...params,
              arrangement: e.target.value as DotplotArrangement,
            })
          }
        >
          {ARRANGEMENTS[params.yMode].map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grouping column */}
      {needsGroup && (
        <div>
          <label className="block font-medium mb-1">Group variable</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={params.groupBy ?? ""}
            onChange={(e) =>
              onChange({ ...params, groupBy: e.target.value || null })
            }
          >
            <option value="">Select a column…</option>
            {columns
              .filter((c) => !params.cols.includes(c.name))
              .map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Binning */}
      <div>
        <label className="block font-medium mb-1">Bins</label>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1"
            value={params.binMode}
            onChange={(e) =>
              onChange({
                ...params,
                binMode: e.target.value as DotplotParams["binMode"],
              })
            }
          >
            <option value="nice">Automatic (nice)</option>
            <option value="fixed">Fixed number</option>
          </select>
          {params.binMode === "fixed" && (
            <input
              type="number"
              min={1}
              className="border rounded px-2 py-1 w-20"
              value={params.nBins}
              onChange={(e) =>
                onChange({ ...params, nBins: Number(e.target.value) })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
