/**
 * NltkCodeRunner.tsx
 * Displays NLTK code snippets and simulates their execution
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useGutenbergExplorer } from "@/lib/context/GutenbergExplorerContext";
import { gutenbergTexts, fileIds } from "@/lib/data/gutenberg/texts";
import {
  tokenizeWords,
  tokenizeSentences,
  calculateStats,
  findConcordance,
} from "@/lib/utils/gutenbergUtils";
import { Play, Copy, Code } from "lucide-react";

interface CodeSnippet {
  id: number;
  title: string;
  code: string;
  description: string;
}

export const NltkCodeRunner: React.FC = () => {
  const {
    selectedFileId,
    setViewMode,
    setHighlightedTokenIndices,
    setConcordanceWord,
    setActiveCodeSnippet,
    activeCodeSnippet,
  } = useGutenbergExplorer();

  const [output, setOutput] = useState<React.ReactNode>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Define code snippets with dynamic substitution
  const snippets: CodeSnippet[] = [
    {
      id: 0,
      title: "List available files",
      code: "nltk.corpus.gutenberg.fileids()",
      description: "Returns list of all available text files",
    },
    {
      id: 1,
      title: "Get word tokens",
      code: `emma = nltk.corpus.gutenberg.words('${selectedFileId || "austen-emma.txt"}')
len(emma)`,
      description: "Load words from a file and count them",
    },
    {
      id: 2,
      title: "Create Text object",
      code: `emma = nltk.Text(nltk.corpus.gutenberg.words('${selectedFileId || "austen-emma.txt"}'))
emma.concordance("surprize")`,
      description: "Create a Text object for advanced analysis",
    },
    {
      id: 3,
      title: "Import and access",
      code: `from nltk.corpus import gutenberg
gutenberg.fileids()
emma = gutenberg.words('${selectedFileId || "austen-emma.txt"}')`,
      description: "Alternative import pattern",
    },
    {
      id: 4,
      title: "Calculate statistics",
      code: `for fileid in gutenberg.fileids():
    num_chars = len(gutenberg.raw(fileid))
    num_words = len(gutenberg.words(fileid))
    num_sents = len(gutenberg.sents(fileid))
    num_vocab = len(set(w.lower() for w in gutenberg.words(fileid)))`,
      description: "Compute corpus statistics for all files",
    },
    {
      id: 5,
      title: "Get sentences",
      code: `macbeth_sentences = gutenberg.sents('${selectedFileId || "shakespeare-macbeth.txt"}')`,
      description: "Retrieve sentence-tokenized text",
    },
  ];

  const handleExecuteSnippet = (snippetId: number) => {
    const snippet = snippets[snippetId];
    setActiveCodeSnippet(snippetId);

    // Simulate execution based on snippet
    if (snippetId === 0) {
      // gutenberg.fileids()
      setOutput(
        <div className="text-xs text-textSecondary">
          <div className="font-mono text-green-400 mb-2">["</div>
          {fileIds.map((fileId, i) => (
            <div key={i} className="font-mono text-green-400 ml-2">
              "{fileId}"{i < fileIds.length - 1 ? "," : ""}
            </div>
          ))}
          <div className="font-mono text-green-400">]</div>
        </div>
      );
    } else if (snippetId === 1 && selectedFileId) {
      // Get word count
      const words = tokenizeWords(gutenbergTexts[selectedFileId]);
      setViewMode("words");
      setHighlightedTokenIndices(words.map((_, i) => i).slice(0, 50)); // Highlight first 50
      setOutput(
        <div className="text-xs font-mono">
          <div className="text-green-400">
            emma = ['{words.slice(0, 3).join("', '")}', ...]
          </div>
          <div className="text-yellow-400 mt-2">{words.length}</div>
        </div>
      );
    } else if (snippetId === 2 && selectedFileId) {
      // Concordance
      const words = tokenizeWords(gutenbergTexts[selectedFileId]);
      const concordanceResults = findConcordance(gutenbergTexts[selectedFileId], "surprize");

      setConcordanceWord("surprize");
      const indices = concordanceResults.map(r => r.index);
      setHighlightedTokenIndices(indices);

      setOutput(
        <div className="text-xs space-y-2 max-h-40 overflow-y-auto">
          <div className="text-textSecondary mb-2">
            Displaying {concordanceResults.length} match{concordanceResults.length !== 1 ? "es" : ""}
            :
          </div>
          {concordanceResults.slice(0, 5).map((result, i) => (
            <div key={i} className="font-mono text-green-400 text-[10px]">
              ...{result.left}... <span className="text-yellow-300">{result.match}</span>...
              {result.right}...
            </div>
          ))}
          {concordanceResults.length > 5 && (
            <div className="text-textSecondary text-[10px]">
              ... and {concordanceResults.length - 5} more
            </div>
          )}
        </div>
      );
    } else if (snippetId === 4) {
      // Statistics for all files
      setOutput(
        <div className="text-xs space-y-2 max-h-40 overflow-y-auto">
          {fileIds.slice(0, 3).map(fileId => {
            const stats = calculateStats(gutenbergTexts[fileId]);
            return (
              <div
                key={fileId}
                className="p-2 bg-surface/50 rounded border border-white/10 font-mono"
              >
                <div className="text-green-400">{fileId}:</div>
                <div className="text-textSecondary text-[10px] ml-2">
                  <div>chars: {stats.numChars}</div>
                  <div>words: {stats.numWords}</div>
                  <div>sents: {stats.numSentences}</div>
                  <div>vocab: {stats.vocabSize}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (snippetId === 5 && selectedFileId) {
      // Sentences
      const sentences = tokenizeSentences(gutenbergTexts[selectedFileId]);
      setViewMode("sents");
      setHighlightedTokenIndices(sentences.map((_, i) => i).slice(0, 10)); // Highlight first 10

      setOutput(
        <div className="text-xs font-mono text-green-400">
          <div>macbeth_sentences = [</div>
          {sentences.slice(0, 2).map((sent, i) => (
            <div key={i} className="ml-2">
              ['{sent.slice(0, 50)}...'],
            </div>
          ))}
          <div>... {sentences.length} sentences total</div>
          <div>]</div>
        </div>
      );
    } else {
      // Default output
      setOutput(
        <div className="text-xs text-textSecondary italic">
          (Execution simulated - no external output)
        </div>
      );
    }
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-surface/30 border-t border-white/5 p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="text-sm font-bold text-textPrimary flex items-center gap-2">
        <Code className="w-4 h-4" />
        NLTK Code Snippets
      </div>

      {!selectedFileId && (
        <div className="text-xs text-textSecondary italic p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          Select a file to see available code snippets
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {snippets.map((snippet, index) => (
          <button
            key={snippet.id}
            onClick={() => handleExecuteSnippet(snippet.id)}
            disabled={!selectedFileId && (snippet.id === 1 || snippet.id === 2 || snippet.id === 5)}
            className={cn(
              "p-3 rounded border text-left text-xs transition-all group",
              activeCodeSnippet === snippet.id
                ? "bg-accent/20 border-accent text-accent"
                : "bg-surface border-white/10 text-textSecondary hover:border-accent/50 hover:text-textPrimary",
              !selectedFileId &&
                (snippet.id === 1 || snippet.id === 2 || snippet.id === 5)
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
          >
            <div className="font-medium mb-1">{snippet.title}</div>
            <div className="text-[10px] opacity-70 group-hover:opacity-100">{snippet.description}</div>
          </button>
        ))}
      </div>

      {/* Output Display */}
      {output && (
        <div className="p-3 bg-black/40 rounded border border-white/5">
          <div className="text-[10px] text-textSecondary/60 mb-2">Output:</div>
          <div className="max-h-32 overflow-y-auto">{output}</div>
        </div>
      )}

      {/* Code Display */}
      {activeCodeSnippet !== null && snippets[activeCodeSnippet] && (
        <div className="p-3 bg-black/40 rounded border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-textSecondary/60">Code:</div>
            <button
              onClick={() =>
                handleCopyCode(snippets[activeCodeSnippet]!.code, activeCodeSnippet)
              }
              className="text-[10px] p-1 hover:bg-white/10 rounded transition-colors text-textSecondary"
            >
              {copiedIndex === activeCodeSnippet ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-[10px] font-mono text-green-400 overflow-x-auto">
            {snippets[activeCodeSnippet].code}
          </pre>
        </div>
      )}
    </div>
  );
};

export default NltkCodeRunner;
