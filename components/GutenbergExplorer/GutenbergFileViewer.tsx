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
      <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-surface/30 backdrop-blur-sm">
        <Code className="w-4 h-4 text-textSecondary" />
        <div className="flex gap-1">
          {(["raw", "words", "sents"] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-all",
                viewMode === mode
                  ? "bg-accent text-background shadow-sm"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
              )}
            >
              {mode === "raw" ? "Raw" : mode === "words" ? "Words" : "Sentences"}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[10px] text-textSecondary">
          {tokens.length} {viewMode === "raw" ? "chars" : viewMode === "words" ? "words" : "sentences"}
        </div>
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        {viewMode === "raw" && (
          <div className="prose prose-p:text-textSecondary max-w-none">
            <pre className="text-xs leading-relaxed text-textSecondary bg-surface/30 p-4 rounded border border-white/5 overflow-x-auto">
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
