"use client";

import React from "react";
import { ChevronRight, ChevronDown, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileIds } from "@/lib/data/gutenberg/texts";
import { useGutenbergExplorer } from "@/lib/context/GutenbergExplorerContext";

export const GutenbergExplorer: React.FC = () => {
  const { selectedFileId, setSelectedFileId, setViewMode } = useGutenbergExplorer();
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set(["gutenberg"]));

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) newExpanded.delete(folderName);
    else newExpanded.add(folderName);
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setViewMode("raw");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-surface/50">
        <Folder className="w-4 h-4 text-accent" />
        <h3 className="font-medium text-textPrimary">gutenberg</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {expandedFolders.has("gutenberg") && (
          <div className="space-y-0">
            {fileIds.map((fileId) => (
              <button
                key={fileId}
                onClick={() => handleFileClick(fileId)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors text-left",
                  selectedFileId === fileId
                    ? "bg-accent/20 text-accent border-l-2 border-accent pl-[10px]"
                    : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
                )}
              >
                <FileText className="w-4 h-4" />
                <span className="truncate font-mono text-xs">{fileId}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-white/5 text-xs text-textSecondary bg-surface/30">
        <div>Click a file to explore its contents</div>
        <div className="mt-1 text-[10px]">{selectedFileId ? `📄 ${selectedFileId}` : "No file selected"}</div>
      </div>
    </div>
  );
};

export default GutenbergExplorer;
