// studies/_registry.ts
import type { ArtifactDefinition } from "./types";
import { fishbone } from "./fishbone";
import { pareto } from "./pareto";

const ALL: ArtifactDefinition[] = [
  fishbone,
  pareto,
  // ...aqui iran capability, descriptive, anova, doe, sipoc, etc.
];

export const REGISTRY: Record<string, ArtifactDefinition> = Object.fromEntries(
  ALL.map((a) => [a.id, a])
);

export const getArtifact = (id: string) => REGISTRY[id];
export const artifactsByPhase = (phase: string) =>
  ALL.filter((a) => a.phase === phase);
