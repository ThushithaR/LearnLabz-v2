"use client";

import React, { useState, useRef } from "react";

type Concept = {
  id: string;
  label: string;
  note?: string;
};

interface ConceptDiagramProps {
  data: {
    concepts: Concept[];
    relations: { from: string; to: string }[];
  };
}

/**
 * Renders nested Venn-style circles for hierarchical concepts
 * (e.g., AI ⊃ ML ⊃ DL)
 */
export default function InteractiveConceptDiagram({
  data,
}: ConceptDiagramProps) {
  const [hovered, setHovered] = useState<Concept | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sort concepts outer → inner (assumes relations define containment)
  const orderedConcepts = [...data.concepts].sort((a, b) => {
    const aContainsB = data.relations.some(
      (r) => r.from === a.id && r.to === b.id
    );
    const bContainsA = data.relations.some(
      (r) => r.from === b.id && r.to === a.id
    );
    if (aContainsB) return -1;
    if (bContainsA) return 1;
    return 0;
  });

  const baseRadius = 175;
  const radiusStep = 60;

  return (
    <div className="w-full flex flex-col items-center gap-6 relative">
      {/* Diagram */}
      <svg
        width={360}
        height={360}
        viewBox="0 0 360 360"
        className="rounded-xl bg-black/40 border border-white/10 shadow-inner"
      >
        <g transform="translate(180,180)">
          {orderedConcepts.map((concept, i) => {
            const radius = baseRadius - i * radiusStep;

            return (
              <g key={concept.id}>
                <circle
                  r={radius}
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={hovered?.id === concept.id ? 3 : 1.5}
                  onMouseEnter={() => setHovered(concept)}
                  onMouseLeave={() => setHovered(null)}
                  className="transition-all duration-300 cursor-pointer"
                />
                <text
                  y={-radius + 26}
                  textAnchor="middle"
                  className="fill-white text-xs uppercase tracking-widest font-bold pointer-events-none select-none"
                >
                  {concept.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover Explanation */}
      {hovered && (
        <div className="max-w-md text-center px-6 py-4 rounded-xl bg-[#1a1a1a] border border-white/20 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="text-xs uppercase tracking-widest text-[#ff8c00] mb-1 font-bold">
            {hovered.label}
          </div>
          <div className="text-sm text-white/80 leading-relaxed text-justify">
            {hovered.note || "No description available."}
          </div>
        </div>
      )}
    </div>
  );
}
