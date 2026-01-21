/**
 * GutenbergFileViewer.tsx
 * Displays file content in multiple modes: raw, words (tokens), sentences
 */

"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { gutenbergTexts } from "@/lib/data/gutenberg/texts";
import { tokenizeWords, tokenizeSentences } from "@/lib/utils/gutenbergUtils";
import { useGutenbergExplorer } from "@/lib/context/GutenbergExplorerContext";
import { Eye, Code } from "lucide-react";

type ViewMode = "raw" | "words" | "sents";

export const GutenbergFileViewer: React.FC = () => {
  const {
    selectedFileId,
    viewMode,
    setViewMode,
    highlightedTokenIndices,
    concordanceWord,
  } = useGutenbergExplorer();

  const fileContent = selectedFileId ? gutenbergTexts[selectedFileId] : null;

  // Tokenize based on view mode
  const tokens = useMemo(() => {
    if (!fileContent) return [];

    if (viewMode === "raw") {
      return [fileContent];
    } else if (viewMode === "words") {
      return tokenizeWords(fileContent);
    } else {
      // sents
      return tokenizeSentences(fileContent).map(sent => sent.join(" "));
    }
  }, [fileContent, viewMode]);

  if (!selectedFileId || !fileContent) {
    return (
      <div className="flex-1 flex items-center justify-center text-textSecondary p-8">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a file to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* View Mode Selector */}
      <div className="flex items-center gap-4 p-5 border-b border-white/5 bg-surface/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">Analysis Mode</span>
        </div>

        <div className="h-6 w-px bg-white/10 mx-2" />

        <div className="flex gap-2">
          {(["raw", "words", "sents"] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                viewMode === mode
                  ? "bg-accent text-background shadow-[0_0_15px_rgba(var(--accent),0.4)] scale-105"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/5 border border-white/5"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                viewMode === mode ? "bg-background" : "bg-white/20"
              )} />
              {mode === "raw" ? "Raw Archive" : mode === "words" ? "Word Tokens" : "Sentence Structures"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-col items-end">
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-tighter">Total Units</span>
          <span className="text-sm font-mono font-bold text-accent">
            {tokens.length.toLocaleString()} {viewMode === "raw" ? "chars" : viewMode === "words" ? "words" : "sentences"}
          </span>
        </div>
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-y-auto p-8 bg-background/50">
        {viewMode === "raw" && (
          <div className="prose prose-p:text-textSecondary max-w-none">
            <pre className="text-sm leading-relaxed text-textSecondary bg-surface/30 p-6 rounded-xl border border-white/5 overflow-x-auto shadow-inner font-mono">
              {fileContent}
            </pre>
          </div>
        )}

        {viewMode === "words" && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tokens.map((token, index) => {
              const isHighlighted = highlightedTokenIndices.includes(index);
              const isConcordance =
                concordanceWord &&
                token.toLowerCase() === concordanceWord.toLowerCase();

              return (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-1 rounded border transition-all",
                    isHighlighted || isConcordance
                      ? "bg-yellow-500/20 border-yellow-500 text-yellow-200 font-medium"
                      : "bg-surface border-white/10 text-textSecondary"
                  )}
                  title={`Index: ${index}`}
                >
                  {token}
                </span>
              );
            })}
          </div>
        )}

        {viewMode === "sents" && (
          <div className="space-y-3 text-sm">
            {tokens.map((sentence, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded border transition-all",
                  highlightedTokenIndices.includes(index)
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-200"
                    : "bg-surface border-white/10 text-textSecondary"
                )}
              >
                <div className="text-[10px] text-textSecondary/60 mb-1">Sentence {index}</div>
                <p className="leading-relaxed">{sentence}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GutenbergFileViewer;
