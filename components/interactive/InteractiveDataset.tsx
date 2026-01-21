"use client";

import { useState } from "react";

type ViewMode =
  | "data"
  | "features"
  | "labels"
  | "labeled"
  | "unlabeled";

const dataset = [
  { fruit: "Apple", color: "Red", price: "$1.8" },
  { fruit: "Orange", color: "Orange", price: "$2" },
  { fruit: "Banana", color: "Yellow", price: "$1" },
  { fruit: "Grape", color: "Purple", price: "$3" },
];

export default function InteractiveDataset() {
  const [mode, setMode] = useState<ViewMode>("data");
  const [phase, setPhase] = useState<"training" | "testing" | null>(null);

  const isUnlabeled = mode === "unlabeled";

  return (
    <div className="flex gap-6">
      {/* LEFT: Buttons */}
      <div className="flex flex-col gap-3 min-w-[160px]">
        {(
          ["data", "features", "labels", "labeled", "unlabeled"] as ViewMode[]
        ).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition
              ${
                mode === item
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-textPrimary hover:bg-white/20"
              }`}
          >
            {item.toUpperCase()}
          </button>
        ))}

        {/* Training / Testing Toggle */}
        {(["training", "testing"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition
              ${
                phase === p
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-textPrimary hover:bg-white/20"
              }`}
          >
            {p.toUpperCase()} SET
          </button>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 space-y-6">
        {/* Dataset Table */}
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/10 text-center">
                {!isUnlabeled && (
                  <th
                    className={`p-3 ${
                      mode === "labels" || mode === "labeled"
                        ? "bg-yellow-400/30"
                        : ""
                    }`}
                  >
                    Fruit (Label)
                  </th>
                )}
                <th
                  className={`p-3 ${
                    mode === "features" ? "bg-green-400/30" : ""
                  }`}
                >
                  Color
                </th>
                <th
                  className={`p-3 ${
                    mode === "features" ? "bg-green-400/30" : ""
                  }`}
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {dataset.map((row, idx) => {
                let phaseColor = "";
                if (phase === "training") {
                  phaseColor = idx < 3 ? "bg-purple-400/20" : "";
                } else if (phase === "testing") {
                  phaseColor = idx === 3 ? "bg-pink-400/20" : "";
                }
                return (
                  <tr
                    key={idx}
                    className={`text-center ${
                      mode === "data" ? "bg-blue-400/10" : ""
                    } ${phaseColor}`}
                  >
                  {!isUnlabeled && (
                    <td
                      className={`p-2 ${
                        mode === "labels" || mode === "labeled"
                          ? "bg-yellow-400/20 font-semibold"
                          : ""
                      }`}
                    >
                      {row.fruit}
                    </td>
                  )}
                  <td
                    className={`p-2 ${
                      mode === "features" ? "bg-green-400/20" : ""
                    }`}
                  >
                    {row.color}
                  </td>
                  <td
                    className={`p-2 ${
                      mode === "features" ? "bg-green-400/20" : ""
                    }`}
                  >
                    {row.price}
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>



        {/* Explanation Panel */}
        <div className="rounded-lg bg-surface/60 p-4 border border-white/10 space-y-3">
          {mode === "data" && (
            <>
              <h3 className="font-bold text-blue-400">What is Data?</h3>
              <p>
                Data is raw information. The full table is the{" "}
                <b>dataset</b>, and each row is one example the computer can
                learn from.
              </p>
            </>
          )}

          {mode === "features" && (
            <>
              <h3 className="font-bold text-green-400">What are Features?</h3>
              <p>
                Features are the <b>inputs</b>. Here, <b>Color</b> and{" "}
                <b>Price</b> help the model understand each fruit.
              </p>
            </>
          )}

          {mode === "labels" && (
            <>
              <h3 className="font-bold text-yellow-400">What are Labels?</h3>
              <p>
                Labels are the <b>correct answers</b>. If the goal is to predict
                the fruit type, then the <b>Fruit</b> column is the label.
              </p>
            </>
          )}

          {mode === "labeled" && (
            <>
              <h3 className="font-bold text-yellow-400">Labeled Data</h3>
              <p>
                Labeled data includes both <b>features</b> and their{" "}
                <b>correct answers</b>. This is required to train supervised
                machine learning models.
              </p>
            </>
          )}

          {mode === "unlabeled" && (
            <>
              <h3 className="font-bold text-orange-400">Unlabeled Data</h3>
              <p>
                Unlabeled data does not contain answers. The model only sees
                inputs and must discover patterns on its own.
              </p>
            </>
          )}

          {phase && (
            <>
              <hr className="border-white/10" />

              {phase === "training" && (
                <>
                  <h3 className="font-bold text-purple-400">Training Dataset</h3>
                  <p>
                    A training data set is a collection of examples used to teach an AI model. Just like a teacher explains concepts using many examples, a model learns patterns using large amounts of labeled training data.`
                  </p>
                </>
              )}

              {phase === "testing" && (
                <>
                  <h3 className="font-bold text-pink-400">Testing Dataset</h3>
                  <p>
                    A testing data set is used to check how well the model has learned.
                    It works like an exam for students. The model makes predictions without seeing the labels, and its answers are later compared with the actual labels to measure accuracy.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
