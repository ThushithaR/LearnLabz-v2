"use client";

import { useState, useEffect } from "react";

type Props = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function InteractiveTestItYourself({
  question,
  options,
  correctAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (selected) {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
        const resetTimer = setTimeout(() => {
          setSelected(null);
          setIsFading(false);
        }, 1000); // fade duration
        return () => clearTimeout(resetTimer);
      }, 2000); // time before fading starts
      return () => clearTimeout(fadeTimer);
    }
  }, [selected]);

  function handleClick(option: string) {
    if (selected && !isFading) return; // prevent re-clicking only if not fading
    setSelected(option);
    setIsFading(false); // reset fading if clicked again
  }

  function getButtonStyle(option: string) {
    if (!selected) {
      return "bg-white/10 hover:bg-white/20";
    }

    if (isFading) {
      if (option === correctAnswer) {
        return "bg-green-500/50 text-white/50 transition-all duration-1000";
      }
      if (option === selected && option !== correctAnswer) {
        return "bg-red-500/50 text-white/50 transition-all duration-1000";
      }
      return "bg-white/5 opacity-25 transition-all duration-1000";
    }

    if (option === correctAnswer) {
      return "bg-green-500 text-white";
    }

    if (option === selected && option !== correctAnswer) {
      return "bg-red-500 text-white";
    }

    return "bg-white/5 opacity-50";
  }

  return (
    <div className="space-y-6">

      {/* QUESTION */}
      <h3 className="text-lg font-bold text-textPrimary">
        {question}
      </h3>

      {/* OPTIONS */}
      <div className="grid gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleClick(option)}
            className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all
              ${getButtonStyle(option)}
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {/* FEEDBACK */}
      {selected && (
        <div className="text-sm font-semibold">
          {selected === correctAnswer ? (
            <span className="text-green-400">
              ✅ Correct! Well done.
            </span>
          ) : (
            <span className="text-red-400">
              ❌ Incorrect. The correct answer is{" "}
              <b>{correctAnswer}</b>.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
