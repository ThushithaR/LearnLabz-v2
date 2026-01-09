/**
 * Gutenberg Explorer State Context
 * Manages shared state for the interactive Gutenberg Corpus Explorer
 */

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ViewMode = "raw" | "words" | "sents";

export interface GutenbergExplorerState {
  // File selection
  selectedFileId: string | null;
  setSelectedFileId: (fileId: string | null) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // UI state
  isExplorerOpen: boolean;
  setIsExplorerOpen: (open: boolean) => void;
  // Minimized (compact) state
  isExplorerMinimized: boolean;
  setIsExplorerMinimized: (minimized: boolean) => void;

  // Code execution state
  activeCodeSnippet: number | null;
  setActiveCodeSnippet: (index: number | null) => void;

  // Highlighted tokens
  highlightedTokenIndices: number[];
  setHighlightedTokenIndices: (indices: number[]) => void;

  // Concordance results
  concordanceWord: string | null;
  setConcordanceWord: (word: string | null) => void;

  // Animation state
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

const GutenbergExplorerContext = createContext<GutenbergExplorerState | undefined>(undefined);

export const GutenbergExplorerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("raw");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isExplorerMinimized, setIsExplorerMinimized] = useState(false);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<number | null>(null);
  const [highlightedTokenIndices, setHighlightedTokenIndices] = useState<number[]>([]);
  const [concordanceWord, setConcordanceWord] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const value: GutenbergExplorerState = {
    selectedFileId,
    setSelectedFileId,
    viewMode,
    setViewMode,
    isExplorerOpen,
    setIsExplorerOpen,
    isExplorerMinimized,
    setIsExplorerMinimized,
    activeCodeSnippet,
    setActiveCodeSnippet,
    highlightedTokenIndices,
    setHighlightedTokenIndices,
    concordanceWord,
    setConcordanceWord,
    isAnimating,
    setIsAnimating,
  };

  return (
    <GutenbergExplorerContext.Provider value={value}>
      {children}
    </GutenbergExplorerContext.Provider>
  );
};

export const useGutenbergExplorer = () => {
  const context = useContext(GutenbergExplorerContext);
  if (!context) {
    throw new Error("useGutenbergExplorer must be used within GutenbergExplorerProvider");
  }
  return context;
};
