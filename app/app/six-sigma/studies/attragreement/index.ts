// app/app/six-sigma/studies/attragreement/index.ts
import type { AnalysisDefinition } from "../types";
import Controls from "./Controls";
import Results from "./Results";
import Theory from "./Theory";
import { computeAttrAgreementStudy } from "./compute";
import {
  ATTRAGREEMENT_DEFAULT,
  type AttrAgreementParams,
  type AttrAgreementResult,
} from "./types";

const attragreement: AnalysisDefinition<AttrAgreementParams, AttrAgreementResult> = {
  id: "attragreement",
  kind: "analysis",
  phase: "measure",
  label: "Attribute Agreement Analysis",
  defaultParams: ATTRAGREEMENT_DEFAULT,
  compute: computeAttrAgreementStudy,
  Controls,
  Results,
  Theory,
  referencedColumns: (params) =>
    [params.appraiserCol, params.sampleCol, params.ratingCol, params.standardCol]
      .filter((x): x is string => !!x),
};

export default attragreement;
