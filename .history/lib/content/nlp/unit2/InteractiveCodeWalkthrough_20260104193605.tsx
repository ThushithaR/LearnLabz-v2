"use client";

import React, { useState, useRef, useEffect } from "react";

export type Token = { text: string; note?: string; cls?: string };

const defaultLines: Token[][] = [
  [
    { text: 'print', note: 'Outputs computed statistics in a compact format.', cls: 'text-purple-400' },
    { text: '    int(num_chars/num_words)', note: 'Average word length (characters per word).', cls: 'text-green-500' }
  ]
];

const defaultOutputs: string[] = ["4 21 26 austen-emma.txt ..."];

interface InteractiveProps {
  lines?: Token[][];
  outputs?: string[];
  summary?: string;
}

export default function InteractiveCodeWalkthrough({ lines, outputs, summary }: InteractiveProps) {
  const tokenLines = lines && lines.length ? lines : defaultLines;
  const tokenOutputs = outputs && outputs.length ? outputs : defaultOutputs;

  const [index, setIndex] = useState<number>(1);
  const [finished, setFinished] = useState(false);
  const [hover, setHover] = useState<{ text: string; note?: string; x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setHover(null); }, [index]);

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
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">Interactive Code Walkthrough</h2>
          <button 
            onClick={() => setIsVisible(!isVisible)} 
            className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white text-xs uppercase tracking-widest"
          >
            {isVisible ? 'Hide Code' : 'Show Code'}
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="flex w-full gap-6 items-start">
          
          {/* Left: Code Section - FIXED 60% */}
          <div className="flex-grow basis-[60%] min-w-[60%] max-w-[60%] bg-[#0d1117] p-6 rounded-xl border border-white/10 shadow-2xl">
            <div className="font-mono text-sm leading-relaxed">
              {tokenLines.slice(0, index).map((ln, li) => {
                const isActive = li === index - 1;
                return (
                  <div key={li} className="flex mb-2 w-full">
                    <div className="w-8 shrink-0 text-white/20 select-none text-xs text-right pr-4 pt-0.5">{li + 1}</div>
                    <div className={`whitespace-pre-wrap break-all w-full ${isActive ? "" : "text-gray-600 opacity-60"}`}>
                      {ln.map((tok, ti) => (
                        <span
                          key={ti}
                          onMouseEnter={isActive ? (e) => onTokenEnter(e, tok) : undefined}
                          onMouseLeave={() => setHover(null)}
                          className={`inline-block whitespace-pre ${isActive ? (tok.cls ?? "text-white") : ""} ${isActive ? "hover:bg-white/10 cursor-help rounded px-0.5" : ""}`}
                        >
                          {tok.text}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-3">
                <button onClick={prev} disabled={index === 1} className="px-4 py-2 rounded bg-white/5 text-white disabled:opacity-30 text-xs font-bold uppercase tracking-widest transition-all">Prev</button>
                <button onClick={next} disabled={index === tokenLines.length} className="px-6 py-2 rounded bg-white/5 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">Next Step</button>
                <button onClick={handleFinish} className="ml-auto px-4 py-2 rounded border border-emerald-500/50 text-emerald-400 text-xs uppercase font-bold tracking-widest hover:bg-emerald-500/10">Finish</button>
              </div>
            </div>
          </div>

          {/* Right: Output & Summary - FIXED 40% */}
          <div className="flex-grow basis-[40%] min-w-[40%] max-w-[40%] flex flex-col gap-4">
            <div className="bg-black p-5 rounded-xl border border-white/10 text-sm text-white h-[320px] flex flex-col shadow-inner overflow-hidden">
              <div className="mb-3 text-[10px] uppercase tracking-widest text-white/40 font-bold">Console Output</div>
              <div className="flex-grow overflow-y-auto font-mono text-green-400/90 custom-scrollbar pr-2">
                {visibleOutputs.length === 0 ? (
                  <div className="text-white/20 italic tracking-wider">Awaiting command...</div>
                ) : (
                  visibleOutputs.map((o, i) => (
                    <div key={i} className="mb-2 break-words leading-relaxed pl-2 border-l border-green-900">{`> ${o}`}</div>
                  ))
                )}
              </div>
            </div>

            {finished && (
              <div className="p-5 bg-white/5 rounded-xl border border-white/10 animate-in fade-in zoom-in-95">
                <div className="text-[10px] uppercase tracking-widest text-[#ff8c00] mb-2 font-bold">Project Summary</div>
                <div className="text-sm text-white/70 leading-relaxed break-words">
                  {summary || "Unit II Analysis: Systematic extraction of corpus statistics successfully executed. Ratios verified."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hover && isVisible && (
        <div
          style={{ left: hover.x, top: hover.y }}
          className="pointer-events-none absolute z-50 bg-[#1a1a1a] text-white border border-white/20 text-xs p-3 rounded-lg shadow-2xl max-w-[280px] animate-in fade-in zoom-in-95 backdrop-blur-md"
        >
          <div className="font-bold text-white mb-1 border-b border-white/10 pb-1 font-mono uppercase tracking-tighter">{hover.text.trim() || "Formatting"}</div>
          {hover.note && <div className="text-white/80 italic leading-snug">{hover.note}</div>}
        </div>
      )}
    </div>
  );
}