"use client";

import { useState } from "react";

type Scenario = {
  id: string;
  title: string;
  trainingData: { input: string; label: string }[];
  testSample: { input: string; correctLabel: string };
  modelPrediction: string;
};

const SCENARIOS: Record<string, Scenario> = {
  fruits: {
    id: "fruits",
    title: "Apple vs Strawberry Classification",
    trainingData: [
      { input: "Red, round, smooth", label: "Apple" },
      { input: "Red, small, seeds outside", label: "Strawberry" },
      { input: "Green, round", label: "Apple" }
    ],
    testSample: {
      input: "Red, small, seeds outside",
      correctLabel: "Strawberry"
    },
    modelPrediction: "Strawberry"
  },

  clothes: {
    id: "clothes",
    title: "Clothes Classification",
    trainingData: [
      { input: "Soft fabric, sleeves", label: "Shirt" },
      { input: "Denim, long, pockets", label: "Jeans" }
    ],
    testSample: {
      input: "Denim, blue, pockets",
      correctLabel: "Jeans"
    },
    modelPrediction: "Jeans"
  },

  heartrate: {
    id: "heartrate",
    title: "Heart Rate Anomaly Detection",
    trainingData: [
      { input: "72 bpm", label: "Normal" },
      { input: "75 bpm", label: "Normal" },
      { input: "110 bpm", label: "Anomaly" }
    ],
    testSample: {
      input: "120 bpm",
      correctLabel: "Anomaly"
    },
    modelPrediction: "Anomaly"
  }
};

export default function InteractiveMLSimulation({
  scenarioId
}: {
  scenarioId: keyof typeof SCENARIOS;
}) {
  const scenario = SCENARIOS[scenarioId];

  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col gap-6 text-white">
      <h3 className="text-xl font-bold text-center">{scenario.title}</h3>

      {/* Step 1: Training */}
      {step >= 0 && (
        <div className="rounded-lg border border-white/10 p-4 bg-black/40">
          <h4 className="font-semibold mb-2"> Training the Model</h4>
          <ul className="text-sm space-y-1">
            {scenario.trainingData.map((d, i) => (
              <li key={i}>
                Input: <span className="text-orange-300">{d.input}</span> → Label:
                <span className="text-green-300"> {d.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 2: Prediction */}
      {step >= 1 && (
        <div className="rounded-lg border border-white/10 p-4 bg-black/40">
          <h4 className="font-semibold mb-2"> Model Prediction</h4>
          <p className="text-sm">
            Test Input:{" "}
            <span className="text-orange-300">
              {scenario.testSample.input}
            </span>
          </p>
          <p className="text-sm mt-1">
            Model predicts:{" "}
            <span className="text-blue-300">
              {scenario.modelPrediction}
            </span>
          </p>
        </div>
      )}

      {/* Step 3: Evaluation */}
      {step >= 2 && (
        <div className="rounded-lg border border-white/10 p-4 bg-black/40">
          <h4 className="font-semibold mb-2">✅ Evaluation</h4>
          {scenario.modelPrediction ===
          scenario.testSample.correctLabel ? (
            <p className="text-green-400 text-sm">
              ✔ Correct prediction! The model learned well.
            </p>
          ) : (
            <p className="text-red-400 text-sm">
              ✖ Wrong prediction. The model needs more training data.
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, 2))}
          className="px-4 py-2 rounded bg-orange-500 text-black font-semibold"
        >
          Next Step
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
