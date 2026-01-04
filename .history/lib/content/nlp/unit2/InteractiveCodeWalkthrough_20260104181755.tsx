"use client";

import React, { useState, useRef, useEffect } from "react";

export type Token = { text: string; note?: string; cls?: string };

const defaultLines: Token[][] = [
  [
    { text: "a", note: "variable: stores a value", cls: "text-accent" },
    { text: "=", note: "assignment operator", cls: "text-amber-400" },
    { text: "10", note: "integer literal", cls: "text-green-500" }
  ],
  [
    { text: "b", note: "variable: stores a value", cls: "text-accent" },
    { text: "=", note: "assignment operator", cls: "text-amber-400" },
    { text: "5", note: "integer literal", cls: "text-green-500" }
  ],
  [
    { text: "c", note: "variable: result of addition", cls: "text-accent" },
    { text: "=", note: "assignment operator", cls: "text-amber-400" },
    { text: "a", note: "referencing variable a", cls: "text-accent" },
    { text: "+", note: "addition operator", cls: "text-amber-400" },
    { text: "b", note: "referencing variable b", cls: "text-accent" }
  ],
  [
    { text: "print", note: "prints output to console", cls: "text-purple-400" },
    { text: "(", note: undefined },
    { text: "c", note: "value of c", cls: "text-accent" },
    { text: ")", note: undefined }
  ]
];

const defaultOutputs: string[] = ["", "", "", "15"]; // only last line prints

interface InteractiveProps {
  lines?: Token[][];
  outputs?: string[];
  summary?: string;
  enablePrevHover?: boolean;
}

export default function InteractiveCodeWalkthrough({ lines, outputs, summary, enablePrevHover = false }: InteractiveProps) {
  const tokenLines = lines && lines.length ? lines : defaultLines;
  const tokenOutputs = outputs && outputs.length ? outputs : defaultOutputs;

  const [index, setIndex] = useState<number>(1); // visible lines count (1..lines.length)
  const [finished, setFinished] = useState(false);
  const [hover, setHover] = useState<{ text: string; note?: string; x: number; y: number } | null>(null);
  const [codeMinimized, setCodeMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // reset hover on step change
    setHover(null);
  }, [index]);

  function next() {
    if (index < tokenLines.length) {
      setIndex(i => i + 1);
    }
  }

  function prev() {
    if (index > 1) {
      setIndex(i => i - 1);
      setFinished(false);
    }
  }

  function handleFinish() {
    setIndex(tokenLines.length);
    setFinished(true);
  }

  function onTokenEnter(e: React.MouseEvent, token: Token) {
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0) + 8;
    const y = e.clientY - (rect?.top ?? 0) + 12;
    setHover({ text: token.text, note: token.note, x, y });
  }

  function onTokenLeave() {
    setHover(null);
  }

  const visibleOutputs = tokenOutputs.slice(0, index).filter(Boolean);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto bg-transparent relative">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setCodeMinimized(!codeMinimized)} className="px-3 py-1 rounded bg-white/5 text-sm">
          {codeMinimized ? 'Show Code' : 'Hide Code'}
        </button>
      </div>
      {!codeMinimized && (
        <div className="flex gap-6">
        {/* Left: Code */}
        {!codeMinimized && (
          <div className="w-3/5 bg-surface p-4 rounded-lg border border-white/10 font-mono text-sm">
          <div className="space-y-2">
            {tokenLines.slice(0, index).map((ln, li) => (
              <div key={li} className="flex items-start gap-3">
                <div className="w-8 text-right text-textSecondary pr-2 select-none">{li + 1}</div>
                <div className="flex flex-wrap gap-2">
                  {ln.map((tok, ti) => {
                    // only enable hover for the active line (index-1) or optionally the previous line (index-2)
                    const isActiveLine = li === index - 1;
                    const isPrevLine = li === index - 2;
                    const hoverEnabled = isActiveLine || (enablePrevHover && isPrevLine);
                    return (
                      <span
                        key={ti}
                        onMouseEnter={hoverEnabled ? (e) => onTokenEnter(e, tok) : undefined}
                        onMouseLeave={hoverEnabled ? onTokenLeave : undefined}
                        className={`px-1 py-0.5 rounded ${tok.cls ?? "text-textPrimary"} ${hoverEnabled ? "hover:bg-white/5 cursor-help" : "opacity-70"}`}
                      >
                        {tok.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Buttons */}
            <div className="mt-4 flex items-center gap-3">
              <button onClick={prev} disabled={index === 1} className="px-3 py-1 rounded bg-white/5 disabled:opacity-40">Prev</button>
              <button onClick={next} disabled={index === tokenLines.length} className="px-3 py-1 rounded bg-accent">Next</button>
              <button onClick={handleFinish} className="ml-auto px-3 py-1 rounded bg-emerald-600 text-white">Finish</button>
            </div>
          </div>
        </div>
        )}

        {/* Right: Output */}
        <div className="w-2/5 bg-black/80 p-4 rounded-lg border border-white/10 text-sm text-white flex flex-col overflow-hidden">
          <div className="mb-2 text-textSecondary">Output</div>
          <div className="h-64 overflow-auto rounded bg-black/70 p-3 flex-shrink-0">
            {visibleOutputs.length === 0 ? (
              <div className="text-textSecondary italic">(no output yet)</div>
            ) : (
              visibleOutputs.map((o, i) => (
                <div key={i} className="whitespace-pre">{o}</div>
              ))
            )}
          </div>

          {finished && (
            <div className="mt-4 p-3 bg-white/5 rounded flex-grow overflow-auto min-h-0">
              <div className="font-semibold mb-2">Summary</div>
              <div className="text-sm text-textSecondary break-words overflow-hidden">
                {summary ? (
                  <span>{summary}</span>
                ) : (
                  <span>This code declares two integers `a` and `b`, computes `c` as their sum, and prints the result to standard output. The final printed value is <strong className="text-white">15</strong>.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {codeMinimized && (
        <div className="w-full bg-black/80 p-4 rounded-lg border border-white/10 text-sm text-white flex flex-col overflow-hidden">
          <div className="mb-2 text-textSecondary">Output</div>
          <div className="h-64 overflow-auto rounded bg-black/70 p-3 flex-shrink-0">
            {visibleOutputs.length === 0 ? (
              <div className="text-textSecondary italic">(no output yet)</div>
            ) : (
              visibleOutputs.map((o, i) => (
                <div key={i} className="whitespace-pre">{o}</div>
              ))
            )}
          </div>

          {finished && (
            <div className="mt-4 p-3 bg-white/5 rounded flex-grow overflow-auto min-h-0">
              <div className="font-semibold mb-2">Summary</div>
              <div className="text-sm text-textSecondary break-words overflow-hidden">
                {summary ? (
                  <span>{summary}</span>
                ) : (
                  <span>This code declares two integers `a` and `b`, computes `c` as their sum, and prints the result to standard output. The final printed value is <strong className="text-white">15</strong>.</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hover Tooltip */}
      {hover && (
       <div
            style={{
                left: hover.x,
                top: hover.y,
                backgroundColor: "black",
                opacity: 1,
            }}
            className="pointer-events-none absolute z-50
            text-white
            border border-white/40
            text-sm font-semibold
            p-3 rounded-lg
            shadow-2xl
            max-w-sm"
            >
          <div className="font-medium">{hover.text}</div>
          {hover.note && <div className="text-white text-sm mt-1">{hover.note}</div>}
        </div>
      )}
    </div>
  );
}
