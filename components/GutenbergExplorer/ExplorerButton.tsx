/**
 * ExplorerButton.tsx
 * Button to open the Gutenberg Explorer
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { useGutenbergExplorer } from "@/lib/context/GutenbergExplorerContext";
import { BookOpen } from "lucide-react";

export const ExplorerButton: React.FC = () => {
  const { setIsExplorerOpen } = useGutenbergExplorer();

  return (
    <Button
      variant="outline"
      onClick={() => setIsExplorerOpen(true)}
      className="flex items-center gap-2"
    >
      <BookOpen className="w-4 h-4" />
      Explore Corpus
    </Button>
  );
};

export default ExplorerButton;
