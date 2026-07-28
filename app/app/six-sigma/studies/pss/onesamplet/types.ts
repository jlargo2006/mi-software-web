// app/app/six-sigma/studies/pss/onesamplet/types.ts
import { PSS_BASE_DEFAULT, type PssBaseParams, type PssBaseResult } from "../_shared/types";

export type Pss1SampleTParams = PssBaseParams;
export type Pss1SampleTResult = PssBaseResult;

export const PSS1SAMPLET_DEFAULT: Pss1SampleTParams = { ...PSS_BASE_DEFAULT };
