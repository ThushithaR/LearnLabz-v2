/**
 * Gutenberg Corpus Utilities - Frontend Simulation
 * These functions simulate NLTK's corpus tokenization
 * NOT linguistically accurate, but deterministic and visual
 */

/**
 * Tokenize text into words (simple regex split)
 * Simulates: nltk.corpus.gutenberg.words(fileid)
 */
export const tokenizeWords = (text: string): string[] => {
  // Remove extra whitespace, split by word boundaries
  // Keep contractions together, separate punctuation
  const words = text
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 0)
    .flatMap(word => {
      // Separate trailing punctuation from words
      const match = word.match(/^(.+?)([.,;:!?"'—]*)$/);
      if (match) {
        const [, core, punct] = match;
        return punct ? [core, punct] : [core];
      }
      return [word];
    });
  return words;
};

/**
 * Tokenize text into sentences (simple regex split)
 * Simulates: nltk.corpus.gutenberg.sents(fileid)
 */
export const tokenizeSentences = (text: string): string[][] => {
  // Split by sentence-ending punctuation
  // This is oversimplified but deterministic
  const sentenceRegex = /[.!?]+(?:\s|$)/;
  const rawSentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);

  // Tokenize each sentence into words
  return rawSentences.map(sent => tokenizeWords(sent.trim()));
};

/**
 * Get raw text (as-is)
 * Simulates: nltk.corpus.gutenberg.raw(fileid)
 */
export const getRawText = (text: string): string => {
  return text;
};

/**
 * Find concordance for a word (simple case-insensitive search)
 * Simulates: nltk.Text().concordance(word)
 */
export interface ConcordanceResult {
  index: number; // Index of the matching word
  left: string; // Context before (5 words)
  match: string; // The matched word
  right: string; // Context after (5 words)
}

export const findConcordance = (text: string, searchWord: string): ConcordanceResult[] => {
  const words = tokenizeWords(text);
  const lowerSearch = searchWord.toLowerCase();
  const contextWindow = 5; // Words on each side

  const results: ConcordanceResult[] = [];

  words.forEach((word, index) => {
    if (word.toLowerCase() === lowerSearch) {
      const leftStart = Math.max(0, index - contextWindow);
      const rightEnd = Math.min(words.length, index + contextWindow + 1);

      const left = words.slice(leftStart, index).join(" ");
      const right = words.slice(index + 1, rightEnd).join(" ");

      results.push({
        index,
        left,
        match: word,
        right,
      });
    }
  });

  return results;
};

/**
 * Calculate statistics about a text
 */
export interface TextStats {
  numChars: number;
  numWords: number;
  numSentences: number;
  vocabSize: number; // Unique lowercase words
}

export const calculateStats = (text: string): TextStats => {
  const words = tokenizeWords(text);
  const sentences = tokenizeSentences(text);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));

  return {
    numChars: text.length,
    numWords: words.length,
    numSentences: sentences.length,
    vocabSize: uniqueWords.size,
  };
};
