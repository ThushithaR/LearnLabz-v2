"use client";

import React, { useState, useRef, useEffect } from "react";

export type Token = { text: string; note?: string; cls?: string };

const defaultLines: Token[][] = [
  [
    { text: "import ", note: "Importing Natural Language Toolkit", cls: "text-purple-400" },
    { text: "nltk", note: "Standard library for NLP", cls: "text-accent" }
  ],
  [
    { text: "from ", note: "Specify sub-module", cls: "text-purple-400" },
    { text: "nltk.corpus ", note: "Collection of text datasets", cls: "text-accent" },
    { text: "import ", note: "Keyword", cls: "text-purple-400" },
    { text: "brown", note: "The first million-word electronic corpus of English", cls: "text-green-400" }
  ],
  [
    { text: "    ", note: "Preserved Indentation Example" },
    { text: "print", note: "Accessing corpus metadata", cls: "text-purple-400" },
    { text: "(", note: undefined },
    { text: "brown.categories()", note: "Lists genres: news, editorial, fiction, etc.", cls: "text-accent" },
    { text: ")", note: undefined }
  ]
];

const defaultOutputs: string[] = ["", "", "['adventure', 'belles_lettres', 'editorial', 'fiction', 'government', 'hobbies', 'humor', 'learned', 'lore', 'mystery', 'news', 'religion', 'reviews', 'romance', 'science_fiction']"];

interface InteractiveProps {
  lines?: Token[][];
  outputs?: string[];
  summary?: string;
  enablePrevHover?: boolean;
}

export default function InteractiveCodeWalkthrough({ lines, outputs, summary, enablePrevHover = false }: InteractiveProps) {
  const tokenLines = lines && lines.length ? lines : defaultLines;
  const tokenOutputs = outputs && outputs.length ? outputs : defaultOutputs;

  const [index, setIndex] = useState<number>(1);
  const [finished, setFinished] = useState(false);
  const [hover, setHover] = useState<{ text: string; note?: string; x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHover(null);
  }, [index]);

  const next = () => index < tokenLines.length && setIndex(i => i + 1);
  const prev = () => index > 1 && (setIndex(i => i - 1), setFinished(false));
  const handleFinish = () => { setIndex(tokenLines.length); setFinished(true); };

  function onTokenEnter(e: React.MouseEvent, token: Token) {
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0) + 8;
    const y = e.clientY - (rect?.top ?? 0) + 12;
    setHover({ text: token.text, note: token.note, x, y });
  }

  const visibleOutputs = tokenOutputs.slice(0, index).filter(Boolean);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto bg-transparent relative my-8 font-sans">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            Interactive Code Walkthrough
          </h2>
          <button 
            onClick={() => setIsVisible(!isVisible)} 
            className="px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-xs transition-all uppercase tracking-widest text-white"
          >
            {isVisible ? 'Hide Code' : 'Show Code'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - Strict 60/40 Split */}
      {isVisible && (
        <div className="flex w-full gap-6 animate-in fade-in slide-in-from-top-2 duration-300 items-start">
          
          {/* Left: Code Section (STRICT 60%) */}
          <div className="w-[60%] min-w-[60%] max-w-[60%] bg-[#0d1117] p-5 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="space-y-2 font-mono text-sm leading-relaxed">
              {tokenLines.slice(0, index).map((ln, li) => {
                const isActiveLine = li === index - 1;
                return (
                  <div key={li} className="flex items-start gap-4 w-full">
                    <div className="w-6 min-w-[1.5rem] text-right text-white/20 select-none text-xs pt-0.5">{li + 1}</div>
                    <div className="flex flex-wrap w-full whitespace-pre-wrap break-words">
                      {ln.map((tok, ti) => {
                        const hoverEnabled = isActiveLine; // Strictly current line only
                        return (
                          <span
                            key={ti}
                            onMouseEnter={hoverEnabled ? (e) => onTokenEnter(e, tok) : undefined}
                            onMouseLeave={() => setHover(null)}
                            className={`whitespace-pre transition-colors duration-200 ${
                              isActiveLine 
                                ? (tok.cls ?? "text-white") 
                                : "text-gray-600 opacity-80" // Dull gray for previous lines
                            } ${hoverEnabled ? "hover:bg-white/10 cursor-help rounded px-0.5" : ""}`}
                          >
                            {tok.text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-3">
                <button onClick={prev} disabled={index === 1} className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs transition-all text-white">PREV</button>
                <button onClick={next} disabled={index === tokenLines.length} className="px-4 py-1.5 rounded bg-amber-400 text-black font-bold text-xs transition-all">NEXT STEP</button>
                <button onClick={handleFinish} className="ml-auto px-4 py-1.5 rounded border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-xs transition-all uppercase tracking-widest">Finish</button>
              </div>
            </div>
          </div>

          {/* Right: Output Section (STRICT 40%) */}
          <div className="w-[40%] min-w-[40%] max-w-[40%] flex flex-col gap-4 overflow-hidden">
            <div className="bg-black p-5 rounded-xl border border-white/10 text-sm text-white h-[320px] flex flex-col shadow-inner overflow-hidden">
              <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Console Output</div>
              <div className="flex-grow overflow-y-auto font-mono text-green-400/90 custom-scrollbar pr-2">
                {visibleOutputs.length === 0 ? (
                  <div className="text-white/20 italic">Initializing execution environment...</div>
                ) : (
                  visibleOutputs.map((o, i) => (
                    <div key={i} className="mb-2 break-words leading-relaxed border-l border-green-900/50 pl-2">{`> ${o}`}</div>
                  ))
                )}
              </div>
            </div>

            {finished && (
              <div className="p-5 bg-white/5 rounded-xl border border-white/10 animate-in zoom-in-95 duration-300 max-w-full">
                <div className="text-[10px] uppercase tracking-widest text-amber-400 mb-2 font-bold">Project Summary</div>
                <div className="text-sm text-white/70 leading-relaxed break-words">
                  {summary || "Execution complete. Data successfully extracted and normalized within the defined architectural parameters."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tooltip System */}
      {hover && isVisible && (
        <div
          style={{ left: hover.x, top: hover.y }}
          className="pointer-events-none absolute z-50 bg-[#1a1a1a] text-white border border-white/20 text-xs p-3 rounded-lg shadow-2xl max-w-[280px] animate-in fade-in zoom-in-95 backdrop-blur-md"
        >
          <div className="font-bold text-amber-400 mb-1 border-b border-white/10 pb-1 font-mono">{hover.text.trim() || "Whitespace"}</div>
          {hover.note && <div className="text-white/80 italic leading-snug">{hover.note}</div>}
        </div>
      )}
    </div>
  );
}