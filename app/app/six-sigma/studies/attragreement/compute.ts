// app/app/six-sigma/studies/attragreement/compute.ts
import type { ColumnSnapshot } from "../types";
import { computeAttributeAgreement } from "../../lib/attributeAgreement";
import type { AttrAgreementParams, AttrAgreementResult } from "./types";

export function computeAttrAgreementStudy(
  data: ColumnSnapshot,
  params: AttrAgreementParams
): AttrAgreementResult {
  const empty: AttrAgreementResult = {
    ok: false,
    error: "Select the Appraiser, Sample and Rating columns.",
    appraisers: [], samples: [], levels: [], trials: 0,
    hasStandard: false, singleTrial: true, conf: params.confidence / 100,
    withinAppraiser: [], withinKappa: [],
    eachVsStandard: [], eachVsStandardKappa: [],
    betweenAppraisers: null, betweenKappa: [],
    allVsStandard: null, allVsStandardKappa: [],
    notes: [],
  };

  const { appraiserCol, sampleCol, ratingCol, standardCol } = params;
  if (!appraiserCol || !sampleCol || !ratingCol) return empty;

  const a = data[appraiserCol], s = data[sampleCol], r = data[ratingCol];
  if (!a || !s || !r) return empty;
  const st = standardCol ? data[standardCol] : null;

  const conf = Math.min(0.999, Math.max(0.5, params.confidence / 100));

  return computeAttributeAgreement(
    a.values, s.values, r.values, st ? st.values : null, conf
  );
}
