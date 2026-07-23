// ============================================================================
//  ribbon.ts — DMAIC menu definition for Six Sigma Analyzer
// ----------------------------------------------------------------------------
//  Legend for the reference comments on each tool:
//    p.<n>          → page in the Lean Six Sigma manual
//    mpj:<file>     → Minitab project file the example comes from
//    mtw:<file>     → Minitab worksheet the example comes from
//    (—)            → not applicable / no reference dataset
//
//  enabled:false    → button is shown but greyed-out (placeholder, not built yet)
//  tool:null        → no real analysis wired up yet
// ============================================================================

// All tool ids that are actually implemented today.
// Los literales documentan el motor viejo; (string & {}) admite ids del REGISTRY
// (p.ej. "fishbone") sin colapsar los literales a `string`.
export type ToolId =
  | "capability"
  | "normality"
  | "descriptive"
  | (string & {})
  | null;

export interface RibbonTool {
  id: string;              // unique id
  label: string;
  tool: ToolId;            // which real analysis it triggers (null = not implemented)
  enabled: boolean;        // false = greyed-out placeholder
  children?: RibbonTool[]; // for grouped items (Capability, Graphs, Regression...)
}

export interface RibbonPhase {
  name: string;
  tools: RibbonTool[];
}

export const PHASES: RibbonPhase[] = [
  // ==========================================================================
  //  DEFINE
  // ==========================================================================
  {
    name: "Define",
    tools: [
      // p.54  | mtw: Call Center.mtw      
      { id: "pareto", label: "Pareto Chart", tool: "pareto", enabled: true },

      // (—) proposed – Define phase project tools
      { id: "sipoc", label: "SIPOC Diagram", tool: null, enabled: false },
      { id: "charter", label: "Project Charter", tool: null, enabled: false },
      { id: "ctqTree", label: "CTQ Tree", tool: null, enabled: false },
    ],
  },

  // ==========================================================================
  //  MEASURE
  // ==========================================================================
  {
    name: "Measure",
    tools: [
      // p.93  | mpj: Measure Data Sets.mpj | mtw: Surfaceflaws.mtw
      { id: "causeEffect", label: "Cause and Effect", tool: "fishbone", enabled: true },

      // p.144 | mpj: Measure Data Sets.mpj | mtw: basicstatistics.mtw
      { id: "descriptive", label: "Descriptive Statistics", tool: "descriptive", enabled: true },

      // p.257 / 260 / 261 / 262 | mtw: Distrb1.MTW
      // Consolidated: Histogram-with-Fit + Skewness + Kurtosis (platykurtic/leptocurtic)
      // are all OUTPUTS of a single Graphical Summary study.
      { id: "graphicalSummary", label: "Graphical Summary", tool: "graphicalSummary", enabled: true },
      
      // p.153 | mpj: Measure Data Sets.mpj | mtw: Descriptive Statistics.MTW
      { id: "normality", label: "Normality Test", tool: "normality", enabled: true },

      // ---- Capability Analysis (dropdown) --------------------------------
      {
        id: "capability",
        label: "Capability Analysis",
        tool: null,
        enabled: true,
        children: [
          // p.215-216 | mtw: Camshaft.mtw
          { id: "capNormal", label: "Normal", tool: "capability", enabled: true },
          // p.590 | mtw: Cycletime_bankers.mtw  (Individual Distribution ID / Non-Normal)
          { id: "capNonnormal", label: "Non-Normal", tool: null, enabled: false },
        ],
      },

      // ---- Graphs (dropdown) ---------------------------------------------
      {
        id: "graphs",
        label: "Graphs",
        tool: null,
        enabled: true,
        children: [
          // p.158-159 | mtw: Graphing Data.MTW  (4-in-1 + granular consolidated)
          { id: "histogram", label: "Histogram", tool: "histogram", enabled: true},
          // p.160 | mtw: Graphing Data.mtw
          { id: "dotplot", label: "Dotplot", tool: "dotplot", enabled: true },
          // p.161-162 | mtw: Glucose Level / Graphing Data.mtw
          { id: "boxPlot", label: "Box Plot", tool: null, enabled: false },
          // p.163-165 | mpj: Measure Data Sets.mpj | mtw: Graphing Data.mtw (jitter/ANOVA options)
          { id: "ivp", label: "Individual Value Plot", tool: null, enabled: false },
          // p.166-167 | mtw: Graphing Data.mtw  (Lowess smoother is an option)
          { id: "timeSeries", label: "Time Series Plot", tool: null, enabled: false },
        ],
      },

      // (—) proposed – core MSA tool for the Measure phase
      { id: "gageRR", label: "Gage R&R (MSA)", tool: null, enabled: false },
      // (—) proposed
      { id: "runChart", label: "Run Chart", tool: null, enabled: false },
    ],
  },

  // ==========================================================================
  //  ANALYSE
  // ==========================================================================
  {
    name: "Analyse",
    tools: [
      // p.247 / p.249 | mpj: Analyze Data Sets.mpj | mtw: MVInjectionMold.mtw / CallCenter.mtw
      { id: "multiVari", label: "Multi-Vari Chart", tool: null, enabled: false },

      // p.272 | mtw: Die Example
      { id: "clt", label: "Sampling Distributions / CLT", tool: null, enabled: false },

      // ---- Hypothesis Tests (dropdown) -----------------------------------
      {
        id: "hypothesisTests",
        label: "Hypothesis Tests",
        tool: null,
        enabled: true,
        children: [
          // p.302 | mtw: Exh_Stat.MTW
          { id: "t1Sample", label: "1-Sample t-test", tool: null, enabled: false },
          // p.313-314 / 327 | mtw: Furnace.MTW / 2 sample unequal variance
          // Single test; Equal vs Unequal variance is an option inside the study.
          { id: "t2Sample", label: "2-Sample t-test", tool: null, enabled: false },
          // p.332 | mtw: EXH_STAT Delta.MTW
          { id: "tPaired", label: "Paired t-test", tool: null, enabled: false },
          // p.346 / 375 | mtw: EXH_AOV.MTW
          // Test for Equal Variance. The correct statistic depends on the data:
          //   - 2 samples,  Normal      → F-test
          //   - >2 samples, Normal      → Bartlett's test
          //   - 2+ samples, Non-normal  → Levene's test
          { id: "equalVar", label: "Test for Equal Variance", tool: null, enabled: false },
          // p.356 | mtw: ANOVA.MTW
          { id: "anova", label: "One-Way ANOVA", tool: null, enabled: false },
          // p.382 | mtw: DISTRIB1.MTW
          { id: "sign", label: "1-Sample Sign / Wilcoxon (Median)", tool: null, enabled: false },
          // p.396 | mtw: Var_Comp.mtw
          { id: "varComp", label: "Variance Comparison", tool: null, enabled: false },
          // (—) proposed – attribute data hypothesis test
          { id: "chiSquare", label: "Chi-Square Test", tool: null, enabled: false },
        ],
      },

      // ---- Power and Sample Size (dropdown) ------------------------------
      {
        id: "powerSampleSize",
        label: "Power and Sample Size",
        tool: null,
        enabled: true,
        children: [
          { id: "pssT1", label: "1-Sample t", tool: null, enabled: false },
          { id: "pssT2", label: "2-Sample t", tool: null, enabled: false },
          { id: "pssAnova", label: "One-Way ANOVA", tool: null, enabled: false },
          { id: "pssProp1", label: "1 Proportion", tool: null, enabled: false },
          { id: "pssProp2", label: "2 Proportions", tool: null, enabled: false },
        ],
      },
    ],
  },

  // ==========================================================================
  //  IMPROVE
  // ==========================================================================
  {
    name: "Improve",
    tools: [
      // p.433 | mtw: RB Stats Correlation.mtw
      { id: "correlation", label: "Correlation / Scatterplot", tool: null, enabled: false },

      // ---- Regression (dropdown) -----------------------------------------
      {
        id: "regression",
        label: "Regression",
        tool: null,
        enabled: true,
        children: [
          // p.452 | mtw: Concentrator.MTW
          { id: "regSimple", label: "Simple Linear", tool: null, enabled: false },
          // p.457 | mtw: Mailing Response vs. Discount.mtw
          { id: "regNonlinear", label: "Non-Linear", tool: null, enabled: false },
          // p.467 | mtw: Flight Regression MLR.mtw
          { id: "regMultiple", label: "Multiple Linear", tool: null, enabled: false },
        ],
      },

      // p.465 | mtw: Transform.MTW
      { id: "boxCox", label: "Box-Cox Transformation", tool: null, enabled: false },

      // ---- Design of Experiments (dropdown) ------------------------------
      {
        id: "doe",
        label: "Design of Experiments (DOE)",
        tool: null,
        enabled: true,
        children: [
          // p.482 | mtw: Catapult.mtw
          { id: "doeFull", label: "Full Factorial", tool: null, enabled: false },
          // p.522 | mtw: Panel Cleaning.MTW
          { id: "doeCenter", label: "Full Factorial + Center Points", tool: null, enabled: false },
          // (—) proposed
          { id: "doeRSM", label: "Response Surface / Contour Plot", tool: null, enabled: false },
        ],
      },
    ],
  },

  // ==========================================================================
  //  CONTROL
  // ==========================================================================
  {
    name: "Control",
    tools: [
      // ---- Control Charts / SPC (dropdown) -------------------------------
      {
        id: "controlCharts",
        label: "Control Charts (SPC)",
        tool: null,
        enabled: true,
        children: [
          // p.652 | mtw: Individual Chart
          { id: "imr", label: "I-MR Chart", tool: null, enabled: false },
          // p.656 | mtw: hole diameter.mtw
          { id: "xbarR", label: "Xbar-R Chart", tool: null, enabled: false },
          // (—) proposed – attribute control charts
          { id: "pnpChart", label: "P / NP Chart", tool: null, enabled: false },
          { id: "cuChart", label: "C / U Chart", tool: null, enabled: false },
        ],
      },

      // (—) proposed
      { id: "controlPlan", label: "Control Plan", tool: null, enabled: false },
    ],
  },
];
