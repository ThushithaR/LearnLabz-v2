"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/* ---------- Types ---------- */

type ProblemStatementProps = {
  problem: string;
  hints?: string[];
  solution?: string | React.ReactNode;
  twist?: string;
};

type ExpandedHintsState = {
  [key: number]: boolean;
};

/* ---------- Component ---------- */

const ProblemStatement: React.FC<ProblemStatementProps> = ({
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
export { ProblemStatement };
