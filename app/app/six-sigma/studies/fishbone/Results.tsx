// studies/fishbone/Results.tsx
"use client";
import React from "react";
import type { ColumnSnapshot } from "../types";
import type { FishboneParams, FishboneResult, FishboneNode } from "./types";

function NodeView({ node }: { node: FishboneNode }) {
  return (
    <div className="ml-4 border-l-2 border-gray-300 pl-3">
      {node.label && (
        <div className="font-medium text-[#00674d]">{node.label}</div>
      )}
      <ul className="list-disc pl-5 text-sm text-gray-600">
        {node.causes.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      {node.children.map((child) => (
        <NodeView key={child.branch} node={child} />
      ))}
    </div>
  );
}

export default function FishboneResults({
  result,
}: {
  data: ColumnSnapshot;
  params: FishboneParams;
  result: FishboneResult;
}) {
  return (
    <div className="p-2">
      <h3 className="mb-4 text-center text-base font-semibold text-[#00674d]">
        {result.effect}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {result.spines.map((spine) => (
          <div key={spine.branch} className="rounded border border-gray-200 p-3">
            <NodeView node={spine} />
          </div>
        ))}
      </div>
      {result.spines.length === 0 && (
        <div className="text-sm text-gray-400">
          Assign at least one column to a branch to see the diagram.
        </div>
      )}
    </div>
  );
}
