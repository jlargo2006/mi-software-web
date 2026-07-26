// app/app/six-sigma/studies/boxplot/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type {
  BoxplotParams,
  BoxplotYMode,
  BoxplotOrientation,
} from "./types";

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: BoxplotParams;
  onChange: (next: BoxplotParams) => void;
  columns: ColumnInfo[];
}) {
  const available = columns.filter((c) => !params.cols.includes(c.name));

  const addCol = (name: string) => {
    if (!name) return;
    const cols = params.yMode === "one" ? [name] : [...params.cols, name];
    onChange({ ...params, cols });
  };
  const removeCol = (name: string) =>
    onChange({ ...params, cols: params.cols.filter((x) => x !== name) });

  const setYMode = (yMode: BoxplotYMode) => {
    const cols = yMode === "one" ? params.cols.slice(0, 1) : params.cols;
    onChange({ ...params, yMode, cols });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Y mode */}
      <div>
        <label className="block font-medium mb-1">Response</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={params.yMode}
          onChange={(e) => setYMode(e.target.value as BoxplotYMode)}
        >
          <option value="one">One Y</option>
          <option value="multiple">Multiple Y&apos;s</option>
        </select>
      </div>

      {/* Graph variables */}
      <div>
        <label className="block font-medium mb-1">
          {params.yMode === "one" ? "Graph variable" : "Add graph variable"}
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

      {/* Groups toggle */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={params.groups}
            onChange={(e) =>
              onChange({
                ...params,
                groups: e.target.checked,
                groupBy: e.target.checked ? params.groupBy : null,
              })
            }
          />
          <span className="font-medium">With Groups</span>
        </label>
      </div>

      {/* Categorical grouping */}
      {params.groups && (
        <div>
          <label className="block font-medium mb-1">
            Categorical variable for grouping
          </label>
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

      {/* Orientation */}
      <div>
        <label className="block font-medium mb-1">Orientation</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={params.orientation}
          onChange={(e) =>
            onChange({
              ...params,
              orientation: e.target.value as BoxplotOrientation,
            })
          }
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
      </div>
    </div>
  );
}
