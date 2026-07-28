// studies/_registry.ts
import type { ArtifactDefinition } from "./types";
import { fishbone } from "./fishbone";
import { pareto } from "./pareto";
import { normality } from "./normality";
import { capability } from "./capability";
import { descriptive } from "./descriptive";
import graphicalSummary from "./graphicalSummary";
import histogram from "./histogram";
import dotplot from "./dotplot";
import boxplot from "./boxplot";
import timeseries from "./timeseries";
import gagerr from "./gagerr";
import attragreement from "./attragreement";
import multivari from "./multivari";
import pss1SampleT from "./pss1samplet";
import pss2SampleT from "./pss/twosamplet";
import pssAnova from "./pss/anova";
import pssOneProportion from "./pss/oneproportion";
import pssTwoProportion from "./pss/twoproportions";

const ALL: ArtifactDefinition[] = [
  fishbone,
  pareto,
  normality,
  capability,
  descriptive,
  graphicalSummary,
  histogram,
  dotplot,
  boxplot,
  timeseries,
  gagerr,
  attragreement,
  multivari,
  pss1SampleT,
  pss2SampleT,
  pssAnova,
  pssOneProportion,
  pssTwoProportions,
];

export const REGISTRY: Record<string, ArtifactDefinition> = Object.fromEntries(
  ALL.map((a) => [a.id, a])
);

export const getArtifact = (id: string) => REGISTRY[id];
export const artifactsByPhase = (phase: string) =>
  ALL.filter((a) => a.phase === phase);
