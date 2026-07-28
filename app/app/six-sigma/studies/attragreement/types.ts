// app/app/six-sigma/studies/attragreement/types.ts
import type { AttrAgreementModel } from "../../lib/attributeAgreement";

export interface AttrAgreementParams {
  appraiserCol: string | null;
  sampleCol: string | null;
  ratingCol: string | null;
  standardCol: string | null;   // opcional
  confidence: number;           // % (def. 95)
}

export const ATTRAGREEMENT_DEFAULT: AttrAgreementParams = {
  appraiserCol: null,
  sampleCol: null,
  ratingCol: null,
  standardCol: null,
  confidence: 95,
};

export type AttrAgreementResult = AttrAgreementModel;
