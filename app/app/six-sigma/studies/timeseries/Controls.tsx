// app/app/six-sigma/studies/timeseries/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../lib/columns";
import type { TimeSeriesParams, TSMode, TSTimeType } from "./types";

export default function Controls({
  params,
  onChange,
  columns,
}: {
  params: TimeSeriesParams;
  onChange: (next: TimeSeriesParams) => void;
  columns: ColumnInfo[];
}) {
  const available = columns.filter(
    (c) => !params.cols.includes(c.name) && c.name !== params.timeCol
  );

  const addCol = (name: string) => {
    if (!name) return;
    const cols = params.yMode === "one" ? [name] : [...params.cols, name];
    onChange({ ...params, cols });
  };
  const removeCol = (name: string) =>
    onChange({ ...params, cols: params.cols.filter((x) => x !== name) });

  const setYMode = (yMode: TSMode) => {
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
          onChange={(e) => setYMode(e.target.value as TSMode)}
        >
          <option value="one">One Y (Simple)</option>
          <option value="multiple">Multiple Y&apos;s</option>
        </select>
      </div>

      {/* Y columns */}
      <div>
        <label className="block font-medium mb-1">
          {params.yMode === "one" ? "Series (Y)" : "Add series (Y)"}
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

      {/* Groups */}
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
              .filter(
                (c) =>
                  !params.cols.includes(c.name) && c.name !== params.timeCol
              )
              .map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Time axis */}
      <div className="border-t pt-3">
        <label className="block font-medium mb-1">Time/Scale column</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={params.timeCol ?? ""}
          onChange={(e) =>
            onChange({ ...params, timeCol: e.target.value || null })
          }
        >
          <option value="">Index (numeric)</option>
          {columns
            .filter((c) => !params.cols.includes(c.name))
            .map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
        {params.timeCol && (
          <div className="mt-2">
            <label className="block font-medium mb-1">Time type</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={params.timeType}
              onChange={(e) =>
                onChange({
                  ...params,
                  timeType: e.target.value as TSTimeType,
                })
              }
            >
              <option value="datetime">Date &amp; Time</option>
              <option value="date">Date</option>
              <option value="time">Time</option>
            </select>
          </div>
        )}
      </div>

      {/* Smoother */}
      <div className="border-t pt-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={params.smoother}
            onChange={(e) =>
              onChange({ ...params, smoother: e.target.checked })
            }
          />
          <span className="font-medium">Smoother (Lowess)</span>
        </label>
        {params.smoother && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="block mb-1">Degree of smoothing</label>
              <input
                type="number"
                step={0.1}
                min={0}
                max={1}
                className="border rounded px-2 py-1 w-24"
                value={params.smoothDegree}
                onChange={(e) =>
                  onChange({
                    ...params,
                    smoothDegree: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block mb-1">Number of steps</label>
              <input
                type="number"
                step={1}
                min={0}
                className="border rounded px-2 py-1 w-24"
                value={params.smoothSteps}
                onChange={(e) =>
                  onChange({
                    ...params,
                    smoothSteps: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
