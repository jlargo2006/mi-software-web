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
  // ...aqui iran anova, doe, sipoc, etc.
];

export const REGISTRY: Record<string, ArtifactDefinition> = Object.fromEntries(
  ALL.map((a) => [a.id, a])
);

export const getArtifact = (id: string) => REGISTRY[id];
export const artifactsByPhase = (phase: string) =>
  ALL.filter((a) => a.phase === phase);
