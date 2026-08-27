// app/app/six-sigma/studies/doe/factorial/cube/Theory.tsx
"use client";
import React from "react";

const h = "mt-6 mb-2 text-sm font-semibold text-gray-800";
const p = "text-sm leading-relaxed text-gray-700";
const li = "text-sm leading-relaxed text-gray-700";

export default function DoeCubeTheory() {
  return (
    <div className="max-w-3xl">
      <h3 className="text-base font-semibold text-gray-900">Cube Plot</h3>

      <p className={`${p} mt-3`}>
        A cube plot puts the response where the runs actually happened. With
        three two-level factors the design has eight combinations, and those
        eight are the corners of a cube: one axis per factor, low at one end and
        high at the other. Every number you see sits at the corner it came from,
        so the geometry of the design and the geometry of the picture are the
        same thing.
      </p>

      <h4 className={h}>How to read it</h4>
      <p className={p}>
        Walk along an edge. The two corners it joins differ in exactly one
        factor, so the change between them is the effect of that factor while
        the others are held fixed. There are four parallel edges for each
        factor, one per combination of the other two.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li className={li}>
          <b>No interaction:</b> the four parallel edges change by roughly the
          same amount. The factor does the same thing wherever you stand.
        </li>
        <li className={li}>
          <b>Interaction:</b> parallel edges change by different amounts, or in
          opposite directions. Then the effect of that factor is not a single
          number, and quoting one is misleading.
        </li>
        <li className={li}>
          <b>Best corner:</b> the extreme value is the best combination among
          those actually run. It is not the optimum of the process, only of the
          eight points tested.
        </li>
      </ul>

      <h4 className={h}>Data means and fitted means</h4>
      <p className={p}>
        <b>Data means</b> are the raw average of the runs at each corner. They
        owe nothing to any model, and a corner with no runs stays blank.
      </p>
      <p className={`${p} mt-2`}>
        <b>Fitted means</b> come from a model. With the full model — every main
        effect and every interaction — the fit reproduces the cell means exactly,
        and the two agree to the last decimal. They separate only when a term is
        taken out: the corners then show what the reduced model predicts, and the
        difference is the part of the response the dropped terms were carrying.
      </p>
      <p className={`${p} mt-2`}>
        That is why the full model is the default here. A cube plot built on a
        model the user did not choose shows numbers that appear nowhere else in
        the project, and there is no way to tell from the picture where they came
        from. The term list is on the panel, in the open.
      </p>

      <h4 className={h}>The centre point</h4>
      <p className={p}>
        If the design has centre runs, their mean is drawn in the middle as a red
        cross. It is a raw average, never a fitted value: the model of the cube
        is a plane through the corners, and it has no term that distinguishes the
        centre from the average of the eight of them.
      </p>
      <p className={`${p} mt-2`}>
        That is exactly what makes it useful. If the centre sits well above or
        below the average of the corners, the response is curved, and a
        two-level design cannot describe it: you would need axial runs and a
        quadratic model. The formal test for that is the Ct Pt term in the
        factorial analysis; here you see it with your eyes.
      </p>

      <h4 className={h}>Limits</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li className={li}>
          Two or three factors. With four the corners fall on top of each other
          and nothing can be read: use the interaction plot instead.
        </li>
        <li className={li}>
          Two levels per factor, plus an optional centre. A factor with three
          real levels is not a cube edge.
        </li>
        <li className={li}>
          A fractional design does not fill every corner. Empty corners are
          blank under data means, and extrapolated under fitted means — which is
          a prediction, not a measurement.
        </li>
        <li className={li}>
          Nothing here is a significance test. A visible difference between two
          corners can still be noise; that question belongs to the factorial
          analysis.
        </li>
      </ul>
    </div>
  );
}
