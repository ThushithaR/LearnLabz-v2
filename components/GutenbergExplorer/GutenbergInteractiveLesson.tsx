/**
 * GutenbergInteractiveLesson.tsx
 * Inline version of the Gutenberg Corpus Explorer for lesson integration.
 */

"use client";

import React, { useState } from "react";
import GutenbergExplorer from "./GutenbergExplorer";
import GutenbergFileViewer from "./GutenbergFileViewer";
import { NltkCodeRunner } from "./NltkCodeRunner";

export const GutenbergInteractiveLesson: React.FC = () => {
    const [isExplorerExpanded, setIsExplorerExpanded] = useState(true);

    return (
        <div className="flex flex-col h-[700px] bg-surface rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Explorer Sidebar */}
                <div className={`border-r border-white/5 bg-surface/30 transition-all duration-300 ${isExplorerExpanded ? 'w-64' : 'w-0 overflow-hidden'}`}>
                    <GutenbergExplorer
                        isExpanded={isExplorerExpanded}
                        onToggleExpand={() => setIsExplorerExpanded(!isExplorerExpanded)}
                    />
                </div>

                {/* Right: Explorer Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {!isExplorerExpanded && (
                        <button
                            onClick={() => setIsExplorerExpanded(true)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-accent text-background rounded-r-md shadow-lg"
                        >
                            ❱
                        </button>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <GutenbergFileViewer />
                    </div>

                    <div className="border-t border-white/5 bg-surface/50">
                        <NltkCodeRunner />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GutenbergInteractiveLesson;
