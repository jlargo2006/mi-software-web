// app/app/six-sigma/studies/pss/_shared/PssFields.tsx
"use client";
import React from "react";
import { parseRange } from "./rangeParser";
import { ALT_LABEL, type Alternative, type PssBaseParams } from "./types";

const Text = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium">
      {label}
      {hint && <span className="ml-1 font-normal text-gray-500">({hint})</span>}
    </span>
    <input
      type="text"
      className="border border-gray-300 rounded px-2 py-1 text-sm"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

/**
 * Bloque de campos comun a los estudios PSS: los tres huecos, la desviacion
 * tipica, la hipotesis alternativa y alfa, mas los avisos de validacion.
 */
export default function PssFields<P extends PssBaseParams>({
  params,
  onChange,
  sizeLabel = "Sample sizes",
  sizeHint = "e.g. 10:40/5",
  diffLabel = "Differences",
  diffHint = "mean − null",
  sdLabel = "Standard deviation",
  showAlternative = true,
  extra,
}: {
  params: P;
  onChange: (p: P) => void;
  sizeLabel?: string;
  sizeHint?: string;
  diffLabel?: string;
  diffHint?: string;
  sdLabel?: string;
  /** Campos adicionales propios del estudio, en una fila aparte. */
  /** ANOVA y otros tests omnibus no tienen hipotesis alternativa. */
  showAlternative?: boolean;
  extra?: React.ReactNode;
}) {
  const set = <K extends keyof P>(k: K, v: P[K]) => onChange({ ...params, [k]: v });

  const n = parseRange(params.sampleSizes);
  const d = parseRange(params.differences);
  const p = parseRange(params.powerValues);

  const filled = [n.values.length > 0, d.values.length > 0, p.values.length > 0];
  const count = filled.filter(Boolean).length;
  const solving = !filled[0] ? "sample size" : !filled[1] ? "difference" : "power";

  const parseError = n.error ?? d.error ?? p.error;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Text
          label={sizeLabel}
          hint={sizeHint}
          value={params.sampleSizes}
          onChange={(v) => set("sampleSizes" as keyof P, v as P[keyof P])}
          placeholder="leave blank to calculate"
        />
        <Text
          label={diffLabel}
          hint={diffHint}
          value={params.differences}
          onChange={(v) => set("differences" as keyof P, v as P[keyof P])}
          placeholder="leave blank to calculate"
        />
        <Text
          label="Power values"
          hint="0 to 1"
          value={params.powerValues}
          onChange={(v) => set("powerValues" as keyof P, v as P[keyof P])}
          placeholder="leave blank to calculate"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Text
          label={sdLabel}
          hint="assumed"
          value={params.sd}
          onChange={(v) => set("sd" as keyof P, v as P[keyof P])}
        />
        {showAlternative && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Alternative hypothesis</span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={params.alternative}
              onChange={(e) =>
                set("alternative" as keyof P, e.target.value as Alternative as P[keyof P])
              }
            >
              <option value="less">{ALT_LABEL.less}</option>
              <option value="two-sided">{ALT_LABEL["two-sided"]}</option>
              <option value="greater">{ALT_LABEL.greater}</option>
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Significance level (α)</span>
          <input
            type="number"
            step="0.01"
            min="0.001"
            max="0.999"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={params.alpha}
            onChange={(e) =>
              set("alpha" as keyof P, Number(e.target.value) as P[keyof P])
            }
          />
        </label>
      </div>

      {extra}

      <p className="text-xs text-gray-500">
        Enter values in exactly two of the first three fields. The blank one is
        calculated. Ranges use <code>start:end/step</code>; a single value is also
        accepted.
      </p>

      {parseError && <p className="text-xs text-red-600">{parseError}</p>}

      {!parseError && count === 2 && (
        <p className="text-xs text-gray-600">
          Calculating <b>{solving}</b>.
        </p>
      )}
      {!parseError && count === 3 && (
        <p className="text-xs text-amber-700">
          All three fields are filled. Clear one of them.
        </p>
      )}
      {!parseError && count < 2 && (
        <p className="text-xs text-amber-700">
          Two of the three fields must be filled in.
        </p>
      )}
    </div>
  );
}
