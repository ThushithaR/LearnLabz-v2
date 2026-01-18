/**
 * GutenbergExplorerPanel.tsx
 * Main container component for the Gutenberg Corpus Explorer
 * Combines file browser, viewer, and code runner
 */

"use client";

import React, { useState } from "react";
import { useGutenbergExplorer } from "@/lib/context/GutenbergExplorerContext";
import GutenbergExplorer from "./GutenbergExplorer";
import  GutenbergFileViewer  from "./GutenbergFileViewer";
import { NltkCodeRunner } from "./NltkCodeRunner";
import { X } from "lucide-react";

const GutenbergExplorerPanel: React.FC = () => {
  const {
    isExplorerOpen,
    setIsExplorerOpen,
    isExplorerMinimized,
    setIsExplorerMinimized,
    selectedFileId,
  } = useGutenbergExplorer();

  // If completely closed, render nothing
  if (!isExplorerOpen && !isExplorerMinimized) return null;

  // Local expansion state for folder list (can be passed down)
  const [isExpanded, setIsExpanded] = useState(true);

  // When open, render as a fixed overlay that covers most of the viewport width
  if (isExplorerOpen) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black"
          onClick={() => {
            setIsExplorerOpen(false);
            setIsExplorerMinimized(false);
          }}
        />

        <aside
          role="dialog"
          aria-modal="true"
          className="relative top-0 left-0 h-full w-[80vw] max-w-4xl bg-surface text-textPrimary overflow-y-auto p-6 shadow-2xl"
        >
          <header className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold flex items-center gap-3 cursor-pointer"
              onClick={() => setIsExpanded(prev => !prev)}
            >
              <span className="text-xl">{isExpanded ? '📂' : '📁'}</span>
              <span>gutenberg</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                aria-label="Minimize explorer"
                onClick={() => { setIsExplorerMinimized(true); setIsExplorerOpen(false); }}
                className="px-2 py-1 hover:bg-white/5 rounded"
              >
                ▭
              </button>
              <button
                aria-label="Close explorer"
                onClick={() => { setIsExplorerOpen(false); setIsExplorerMinimized(false); }}
                className="px-2 py-1 hover:bg-white/5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* File browser + content area */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 border-r border-white/5 pr-4">
              {/* Pass expand state to the explorer so the header icon toggles the folder list */}
              <GutenbergExplorer isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(s => !s)} />
            </div>

            <div className="col-span-7 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <GutenbergFileViewer />
              </div>

              <div className="mt-4">
                <NltkCodeRunner />
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Minimized state: render a small floating restore button
  return (
    <div className="fixed bottom-6 right-6 z-60">
      <button
        title="Restore Explorer"
        onClick={() => { setIsExplorerMinimized(false); setIsExplorerOpen(true); }}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-white/10 rounded-xl shadow-lg hover:scale-105 transition-transform"
      >
        <span className="w-3 h-3 rounded bg-accent inline-block" />
        <div className="text-xs text-textPrimary">Explorer</div>
      </button>
    </div>
  );
};

export default GutenbergExplorerPanel;
