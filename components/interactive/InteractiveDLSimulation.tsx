"use client";

import { useState } from "react";

type DLScenario = {
  id: string;
  title: string;
  input: string;
  output: string;
  explanation: string;
};

const SCENARIOS: Record<string, DLScenario> = {
  catdog: {
    id: "catdog",
    title: "Cat vs Dog Identification",
    input: "Image pixels of an animal",
    output: "Dog",
    explanation:
      "The deep learning model analyzes patterns like ears, face shape, and fur texture to decide whether the image is a cat or a dog."
  },
  digits: {
    id: "digits",
    title: "Handwritten Digit Recognition",
    input: "Pixel values of a handwritten number",
    output: "7",
    explanation:
      "The model learns curves, edges, and shapes from the pixels and identifies which digit the image represents."
  }
};

export default function InteractiveDLSimulation({
  scenarioId
}: {
  scenarioId: "catdog" | "digits";
}) {
  const scenario = SCENARIOS[scenarioId];
  const [step, setStep] = useState(0);

  const isActive = (layerStep: number) =>
    step >= layerStep ? "opacity-100" : "opacity-30";

  return (
    <div className="flex flex-col items-center gap-6 text-white">
      <h3 className="text-xl font-bold">{scenario.title}</h3>

      {/* Network Visualization */}
      <div className="flex items-center gap-10">
        {/* Input */}
        <Layer
          title="Input"
          nodes={3}
          active={isActive(0)}
        />

        {/* Hidden Layer 1 */}
        <Layer
          title="Hidden Layer 1"
          nodes={4}
          active={isActive(1)}
        />

        {/* Hidden Layer 2 */}
        <Layer
          title="Hidden Layer 2"
          nodes={4}
          active={isActive(2)}
        />

        {/* Output */}
        <Layer
          title="Output"
          nodes={1}
          active={isActive(3)}
          label={step >= 3 ? scenario.output : "?"}
        />
      </div>

      {/* Step Explanation */}
      <div className="max-w-md text-center text-sm text-white/80">
        {step === 0 && `Input enters the neural network as ${scenario.input}.`}
        {step === 1 &&
          "Hidden Layer 1 detects simple patterns like edges and shapes."}
        {step === 2 &&
          "Hidden Layer 2 combines patterns to understand complex features."}
        {step === 3 && scenario.explanation}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, 3))}
          className="px-4 py-2 rounded bg-orange-500 text-black font-semibold"
        >
          Next
        </button>
        <button
          onClick={() => setStep(0)}
          className="px-4 py-2 rounded border border-white/20"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---------------- Helper Components ---------------- */

function Layer({
  title,
  nodes,
  active,
  label
}: {
  title: string;
  nodes: number;
  active: string;
  label?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-2 ${active}`}>
      <div className="text-xs uppercase tracking-widest text-white/60">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: nodes }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-blue-500/60 border border-white/30"
          />
        ))}
      </div>
      {label && (
        <div className="mt-1 text-sm font-bold text-green-400">{label}</div>
      )}
    </div>
  );
}
