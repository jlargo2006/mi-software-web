// app/app/six-sigma/studies/improve/regression/Controls.tsx
"use client";
import React from "react";
import type { ColumnInfo } from "../../../lib/columns";
import {
  DEGREE_LABEL,
  REFLINE_LABEL,
  RESIDUAL_LABEL,
  type ImpRegParams,
  type RefLineMode,
  type RegDegree,
  type ResidualType,
} from "./types";

const label = "block text-sm font-medium text-gray-700 mb-1";
const field =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#00674d] focus:outline-none focus:ring-1 focus:ring-[#00674d]";
const check =
  "h-4 w-4 rounded border-gray-300 text-[#00674d] focus:ring-[#00674d]";
const radio =
  "h-4 w-4 border-gray-300 text-[#00674d] focus:ring-[#00674d]";

export default function ImpRegControls({
  params,
  onChange,
  columns,
}: {
  params: ImpRegParams;
  onChange: (p: ImpRegParams) => void;
  columns: ColumnInfo[];
}) {
  const set = <K extends keyof ImpRegParams>(k: K, v: ImpRegParams[K]) =>
    onChange({ ...params, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Response (Y)</label>
        <select
          className={field}
          value={params.yColumn}
          onChange={(e) => set("yColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Predictor (X)</label>
        <select
          className={field}
          value={params.xColumn}
          onChange={(e) => set("xColumn", e.target.value)}
        >
          <option value="">Select a column...</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Type of Regression Model</span>
        <div className="space-y-2">
          {(Object.keys(DEGREE_LABEL) as RegDegree[]).map((k) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="reg-degree"
                className={radio}
                checked={params.degree === k}
                onChange={() => set("degree", k)}
              />
              {DEGREE_LABEL[k]}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Higher degrees always raise R-sq. Check the sequential table to see
          whether the extra term is worth keeping.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className={label}>Confidence level (%)</label>
          <input
            className={field}
            value={params.confidenceLevel}
            onChange={(e) => set("confidenceLevel", e.target.value)}
            placeholder="95,0"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showCI}
            onChange={(e) => set("showCI", e.target.checked)}
          />
          Display confidence interval band
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showPI}
            onChange={(e) => set("showPI", e.target.checked)}
          />
          Display prediction interval band
        </label>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className={label}>Predict at X (optional)</label>
        <input
          className={field}
          value={params.predictX}
          onChange={(e) => set("predictX", e.target.value)}
          placeholder="e.g. 250"
          inputMode="decimal"
        />
        <p className="mt-1 text-xs text-gray-500">
          Evaluates the fitted equation at one value of X, with its confidence
          and prediction intervals.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <span className={label}>Reference line (optional)</span>
        <div className="space-y-2">
          {(Object.keys(REFLINE_LABEL) as RefLineMode[]).map((k) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="reg-refline"
                className={radio}
                checked={params.refLine === k}
                onChange={() => set("refLine", k)}
              />
              {REFLINE_LABEL[k]}
            </label>
          ))}
        </div>

        {params.refLine !== "none" && (
          <div className="mt-3">
            <label className={label}>
              {params.refLine === "vertical" ? "X value" : "Y value"}
            </label>
            <input
              className={field}
              value={params.refValue}
              onChange={(e) => set("refValue", e.target.value)}
              placeholder="e.g. 250"
              inputMode="decimal"
            />
            <p className="mt-1 text-xs text-gray-500">
              Marks where the line crosses the fitted curve and any interval
              band you are displaying. Hover a marker to read its coordinates.
            </p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className={check}
            checked={params.showResidualPlots}
            onChange={(e) => set("showResidualPlots", e.target.checked)}
          />
          Four-in-one residual plots
        </label>

        {params.showResidualPlots && (
          <div>
            <span className={label}>Residuals for Plots</span>
            <div className="space-y-2">
              {(Object.keys(RESIDUAL_LABEL) as ResidualType[]).map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="reg-restype"
                    className={radio}
                    checked={params.residualType === k}
                    onChange={() => set("residualType", k)}
                  />
                  {RESIDUAL_LABEL[k]} Residual
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Only rescales the plots; the fit and the tables do not change.
              Standardized residuals are comparable across observations;
              deleted ones re-estimate the error without each point, which
              exposes influential values.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
