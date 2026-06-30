// All tool ids that are actually implemented today
export type ToolId = "capability" | "normality" | null;

export interface RibbonTool {
  id: string;            // unique id
  label: string;
  tool: ToolId;          // which real analysis it triggers (null = not implemented)
  enabled: boolean;      // false = greyed-out placeholder
  children?: RibbonTool[]; // for grouped items (Capability, Graphs...)
}

export interface RibbonPhase {
  name: string;
  tools: RibbonTool[];
}

export const PHASES: RibbonPhase[] = [
  {
    name: "Define",
    tools: [
      { id: "pareto", label: "Pareto Chart", tool: null, enabled: false },
      { id: "randomSamples", label: "Random Samples", tool: null, enabled: false },
    ],
  },
  {
    name: "Measure",
    tools: [
      { id: "causeEffect", label: "Cause and Effect", tool: null, enabled: false },
      { id: "descriptive", label: "Descriptive Statistics", tool: null, enabled: false },
      { id: "normality", label: "Normality Test", tool: "normality", enabled: true },
      { id: "graphicalSummary", label: "Graphical Summary", tool: null, enabled: false },
      {
        id: "capability",
        label: "Capability",
        tool: null,
        enabled: true,
        children: [
          { id: "capNormal", label: "Normal", tool: "capability", enabled: true },
          { id: "capBW", label: "Between/Within", tool: null, enabled: false },
          { id: "capNonnormal", label: "Nonnormal", tool: null, enabled: false },
          { id: "capNonparam", label: "Nonparametric", tool: null, enabled: false },
        ],
      },
      {
        id: "graphs",
        label: "Graphs",
        tool: null,
        enabled: true,
        children: [
          { id: "boxPlot", label: "Box Plot", tool: null, enabled: false },
          { id: "histogram", label: "Histogram", tool: null, enabled: false },
          { id: "timeSeries", label: "Time Series Plot", tool: null, enabled: false },
          { id: "ivp", label: "Individual Value Plot", tool: null, enabled: false },
        ],
      },
      { id: "gageRR", label: "Gage R&R (Crossed)", tool: null, enabled: false },
      { id: "attrAgree", label: "Attribute Agreement Analysis", tool: null, enabled: false },
    ],
  },
  {
    name: "Analyse",
    tools: [
      { id: "multiVari", label: "Multi-Vari Chart", tool: null, enabled: false },
    ],
  },
  {
    name: "Improve",
    tools: [], // no real tools yet
  },
  {
    name: "Control",
    tools: [
      { id: "imr", label: "I-MR", tool: null, enabled: false },
    ],
  },
];
