"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const problemStatementContent = {
  problem: "You've been hired by a rising e-commerce startup. You must build a system to route customer chat messages to either Commercial Inquiry or Technical Support.",

  twist: "The product is brand new. There are no historical logs, no labeled examples, and you have a two-week deadline to deploy a working version.",

  hints: [
    'If you have zero examples to train a model, can you use basic logic rules to start?',
    'If you find a similar dataset online, will it work for your specific product names?',
    'If you manually label only ten messages, can you use technology to turn those into a thousand?'
  ],

  solution: "Use a phased approach: Phase 1 - Heuristics with keywords, Phase 2 - Back Translation and Snorkel for silver data, Phase 3 - Train model on silver data, Phase 4 - Product intervention for gold data collection."
};

export type ProblemStatementContent = typeof problemStatementContent;

/* ---------- Component ---------- */

type ExpandedHintsState = {
  [key: number]: boolean;
};

export const ProblemStatement: React.FC<{
  problem: string;
  hints?: string[];
  solution?: string | React.ReactNode;
  twist?: string;
}> = ({
  problem,
  hints = [],
  solution,
  twist,
}) => {
    const [expandedHints, setExpandedHints] = useState<ExpandedHintsState>({});
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const toggleHint = (index: number) => {
      setExpandedHints((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    return (
      <div style={{ marginBottom: "2rem" }}>
        {/* Problem Box */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--border-color)",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              marginBottom: "0.75rem",
              color: "var(--text-primary)",
            }}
          >
            Problem Statement
          </h3>

          <p style={{ color: "var(--text-primary)", lineHeight: "1.6" }}>
            {problem}
          </p>

          {twist && (
            <>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "0.75rem",
                  marginTop: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                The Twist
              </h3>
              <p style={{ color: "var(--text-primary)", lineHeight: "1.6" }}>
                {twist}
              </p>
            </>
          )}
        </div>

        {/* Hints */}
        {hints.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "1rem",
                color: "var(--text-primary)",
              }}
            >
              Hints
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {hints.map((hint, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <button
                    onClick={() => toggleHint(index)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "var(--text-primary)",
                      fontSize: "1rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "var(--hover-bg)")
                    }
                    onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "transparent")
                    }
                  >
                    <span>Hint {index + 1}</span>
                    {expandedHints[index] ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  {expandedHints[index] && (
                    <div
                      style={{
                        padding: "0 1rem 1rem 1rem",
                        borderTop: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        lineHeight: "1.6",
                        backgroundColor: "var(--bg-primary)",
                      }}
                    >
                      {hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution */}
        {solution && (
          <div>
            <button
              onClick={() => setShowSolution(!showSolution)}
              style={{
                width: "100%",
                padding: "1rem",
                background: "var(--accent-primary)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "var(--text-primary)",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--accent-primary)")
              }
            >
              <span>Solution</span>
              {showSolution ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showSolution && (
              <div
                style={{
                  background: "var(--accent-primary)",
                  border: "2px solid var(--accent-primary)",
                  borderRadius: "0 0 8px 8px",
                  padding: "1.5rem",
                  marginTop: 0,
                }}
              >
                <div style={{ color: "var(--text-primary)", lineHeight: "1.6" }}>
                  {typeof solution === "string" ? (
                    <p>{solution}</p>
                  ) : (
                    solution
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
