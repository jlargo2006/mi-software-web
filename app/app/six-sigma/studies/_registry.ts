// studies/_registry.ts
import type { ArtifactDefinition } from "./types";
import { fishbone } from "./fishbone";
import { pareto } from "./pareto";
import { normality } from "./normality";
import { capability } from "./capability/normal";
import capBinomial from "./capability/binomial";
import capPoisson from "./capability/poisson";
import capSixpack from "./capability/sixpack";
import iddist from "./capability/iddist";
import capNonnormal from "./capability/nonnormal";
import { descriptive } from "./descriptive";
import graphicalSummary from "./graphicalSummary";
import histogram from "./histogram";
import dotplot from "./dotplot";
import boxplot from "./boxplot";
import timeseries from "./timeseries";
import gagerr from "./gagerr";
import attragreement from "./attragreement";
import multivari from "./multivari";
import pss1SampleT from "./pss/onesamplet";
import pss2SampleT from "./pss/twosamplet";
import pssAnova from "./pss/anova";
import pssOneProportion from "./pss/oneproportion";
import pssTwoProportions from "./pss/twoproportions";
import pssPairedT from "./pss/pairedt";
import pssFactorial from "./pss/factorial";
import ht1SampleT from "./ht/onesamplet";
import htAnova1Way from "./ht/anova1way";
import htTwoSampleT from "./ht/twosamplet";
import htEqVar from "./ht/eqvar";
import htPairedT from "./ht/pairedt";
import htWilcoxon from "./ht/wilcoxon";
import htSign from "./ht/sign";
import htMannWhitney from "./ht/mannwhitney";
import htMoodsMedian from "./ht/moodsmedian";
import htKruskalWallis from "./ht/kruskalwallis";
import htTwoProportions from "./ht/twoproportions";
import htOneProportion from "./ht/oneproportion";
import htChiSqAssoc from "./ht/chisqassociation";
import impScatter from "./improve/scatterplot";
import impCorrelation from "./improve/correlation";
import impRegression from "./improve/regression";
import impBoxCox from "./improve/boxcox";
import impMatrixPlot from "./improve/matrixplot";
import impBestSubsets from "./improve/bestsubsets";
import impFitRegression from "./improve/fitregression";
import doeCreateFactorial from "./doe/factorial/create";
import doeMainEffects from "./doe/factorial/maineffects";
import doeInteraction from "./doe/factorial/interaction";
import doeAnalyzeFactorial from "./doe/factorial/analyze";
import doeOptimizer from "./doe/factorial/optimizer";
import doeCube from "./doe/factorial/cube";
import doeContour from "./doe/factorial/contour";
import imr from "./control/imr";
import xbarr from "./control/xbarr";
import pchart from "./control/pchart";

const ALL: ArtifactDefinition[] = [
  fishbone,
  pareto,
  normality,
  capability,
  capBinomial,
  capSixpack,
  capPoisson,
  iddist,
  capNonnormal,
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
  pssPairedT,
  pssFactorial,
  ht1SampleT,
  htAnova1Way,
  htTwoSampleT,
  htEqVar,
  htPairedT,
  htWilcoxon,
  htSign,
  htMannWhitney,
  htMoodsMedian,
  htKruskalWallis,
  htOneProportion,
  htTwoProportions,
  htChiSqAssoc,
  impScatter,
  impCorrelation,
  impRegression,
  impBoxCox,
  impMatrixPlot,
  impBestSubsets,
  impFitRegression,
  doeCreateFactorial,
  doeMainEffects,
  doeInteraction,
  doeAnalyzeFactorial,
  doeOptimizer,
  doeCube,
  doeContour,
  imr,
  xbarr,
  pchart,
];

export const REGISTRY: Record<string, ArtifactDefinition> = Object.fromEntries(
  ALL.map((a) => [a.id, a])
);

export const getArtifact = (id: string) => REGISTRY[id];
export const artifactsByPhase = (phase: string) =>
  ALL.filter((a) => a.phase === phase);
