"use client";

import React, { useState, useRef, useEffect } from "react";

export type Token = { text: string; note?: string; cls?: string };

const defaultLines: Token[][] = [
  [
    { text: "import", note: "Importing Natural Language Toolkit", cls: "text-purple-400" },
    { text: "nltk", note: "Standard library for NLP", cls: "text-accent" }
  ],
  [
    { text: "from", note: "Specify sub-module", cls: "text-purple-400" },
    { text: "nltk.corpus", note: "Collection of text datasets", cls: "text-accent" },
    { text: "import", note: "Keyword", cls: "text-purple-400" },
    { text: "brown", note: "The first million-word electronic corpus of English", cls: "text-green-400" }
  ],
  [
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
    <div ref={containerRef} className="w-full max-w-6xl mx-auto bg-transparent relative my-8">
      {/* HEADER SECTION - Toggle is now part of the title line */}
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            Interactive Code Walkthrough
          </h2>
          <button 
            onClick={() => setIsVisible(!isVisible)} 
            className="px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-xs transition-all uppercase tracking-widest"
          >
            {isVisible ? 'Hide Code' : 'Show Code'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - Only renders if isVisible is true */}
      {isVisible && (
        <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Left: Code Section (60%) */}
          <div className="w-[60%] bg-[#0d1117] p-5 rounded-xl border border-white/10 text-base shadow-2xl">
            <div className="space-y-3">
              {tokenLines.slice(0, index).map((ln, li) => (
                <div key={li} className="flex items-start gap-4 group">
                  <div className="w-6 text-right text-white/30 select-none text-xs pt-1">{li + 1}</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {ln.map((tok, ti) => {
                      const isActiveLine = li === index - 1;
                      const isPrevLine = li === index - 2;
                      const hoverEnabled = isActiveLine || (enablePrevHover && isPrevLine);
                      return (
                        <span
                          key={ti}
                          onMouseEnter={hoverEnabled ? (e) => onTokenEnter(e, tok) : undefined}
                          onMouseLeave={() => setHover(null)}
                          className={`px-1 rounded transition-colors ${tok.cls ?? "text-textPrimary"} ${hoverEnabled ? "hover:bg-white/10 cursor-help" : "opacity-60"}`}
                        >
                          {tok.text}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-3">
                <button onClick={prev} disabled={index === 1} className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs transition-all">PREV</button>
                <button onClick={next} disabled={index === tokenLines.length} className="px-4 py-1.5 rounded bg-accent text-black font-bold text-xs transition-all">NEXT STEP</button>
                <button onClick={handleFinish} className="ml-auto px-4 py-1.5 rounded border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-xs transition-all">FINISH</button>
              </div>
            </div>
          </div>

          {/* Right: Output Section (40%) */}
          <div className="w-[40%] flex flex-col gap-4">
            <div className="bg-black p-5 rounded-xl border border-white/10 text-sm text-white h-[300px] flex flex-col shadow-inner">
              <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Console Output</div>
              <div className="flex-grow overflow-auto font-mono text-green-400/90 custom-scrollbar">
                {visibleOutputs.length === 0 ? (
                  <div className="text-white/20 italic">Waiting for execution...</div>
                ) : (
                  visibleOutputs.map((o, i) => (
                    <div key={i} className="mb-2 break-all leading-relaxed">{`> ${o}`}</div>
                  ))
                )}
              </div>
            </div>

            {finished && (
              <div className="p-5 bg-accent/5 rounded-xl border border-accent/20 animate-in zoom-in-95 duration-300">
                <div className="text-[10px] uppercase tracking-widest text-accent mb-2 font-bold">Summary</div>
                <div className="text-sm text-white/70 leading-relaxed">
                  {summary || "Process complete. System has successfully initialized the corpus interface and verified access to genre-specific linguistic data."}
                </div>
              </div>
            )}
          </div>
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