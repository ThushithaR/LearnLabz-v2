import { QuizQuestion } from "@/lib/types/course";

// Organize quizzes by lesson ID
// Example structure: lessonId -> QuizQuestion[]

export const lessonQuizzesData: Record<string, QuizQuestion[]> = {
  // NLP Unit I - Lesson 601 (What is NLP?)
  "601": [
    {
      id: "1.1.1",
      question: "What is the primary goal of Natural Language Processing?",
      options: [
        "To enable computers to understand and process human language",
        "To replace human language with machine language",
        "To improve internet speed",
        "To create new programming languages"
      ],
      correctAnswer: 0,
      explanation: "NLP aims to enable computers to understand, interpret, and generate human language in a meaningful way."
    },
    {
      id: "1.1.2",
      question: "Which of the following is NOT a common NLP task?",
      options: [
        "Sentiment Analysis",
        "Named Entity Recognition",
        "Machine Vision",
        "Text Classification"
      ],
      correctAnswer: 2,
      explanation: "Machine Vision is a computer vision task, not an NLP task. NLP focuses on text and language processing."
    },
    {
      id: "1.1.3",
      question: "What does tokenization do in NLP?",
      options: [
        "Encrypts text for security",
        "Breaks text into smaller units like words or sentences",
        "Translates text to another language",
        "Removes all punctuation from text"
      ],
      correctAnswer: 1,
      explanation: "Tokenization is the process of splitting text into smaller units (tokens) like words, sentences, or subwords for processing."
    }
  ],

  // NLP Unit II - Lesson 701 (Accessing Text Corpora)
  "701": [
    {
      id: "2.1.1",
      question: "The Gutenberg Corpus is especially valuable for NLP education because its texts are modern, standardized, and representative of contemporary English usage.",
      options: [
        "True",
        "False"
      ],
      correctAnswer: 1,
      explanation: "Gutenberg texts are historical and literary, not modern or standardized. Their value lies in linguistic richness, stylistic variation, and exposure to older spellings and sentence structures—ideal for learning analysis techniques, not modeling modern language use."
    },
    {
      id: "2.1.2",
      question: "Calling gutenberg.words() preserves the original formatting of the text, including line breaks and punctuation placement.",
      options: [
        "True",
        "False"
      ],
      correctAnswer: 1,
      explanation: "words() tokenizes the text into word tokens, stripping away original formatting. To preserve the text exactly as written (including spacing and punctuation), gutenberg.raw() must be used."
    },
    {
      id: "2.1.3",
      question: "Wrapping corpus words in an nltk.Text object is optional for computing statistics like word counts, but required for contextual analysis such as concordance.",
      options: [
        "True",
        "False"
      ],
      correctAnswer: 0,
      explanation: "Simple statistics can be computed directly from lists. However, features like concordance() rely on the additional structure and methods provided by the Text object."
    },
    {
      id: "2.1.4",
      question: "If two texts have similar average word lengths, they will likely have similar sentence complexity and writing style.",
      options: [
        "True",
        "False"
      ],
      correctAnswer: 1,
      explanation: "Average word length tends to be stable across English texts. Sentence complexity is better revealed by sentence length, structure, and lexical diversity, not word length alone."
    },
    {
      id: "2.1.5",
      question: "Using gutenberg.sents() returns sentences as strings, making them easier to print but harder to analyze computationally.",
      options: [
        "True",
        "False"
      ],
      correctAnswer: 1,
      explanation: "sents() returns lists of word tokens, not strings. This structure makes computational analysis (like sentence length, patterns, or POS tagging) easier, even if it looks less readable."
    }
  ],

  // NLP Unit II - Lesson 702 (Brown Corpus)
  "702": [
    {
      id: "2.2.1",
      question: "What is the Brown Corpus?",
      options: [
        "First electronic corpus of modern English",
        "A collection of medical texts",
        "A dictionary of synonyms",
        "A set of programming language manuals"
      ],
      correctAnswer: 0,
      explanation: "The Brown Corpus was the first million-word electronic corpus of English, created in 1961."
    },
    {
      id: "2.2.2",
      question: "Approximately how many words does the Brown Corpus contain?",
      options: [
        "10,000",
        "100,000",
        "1 million",
        "100 million"
      ],
      correctAnswer: 2,
      explanation: "The Brown Corpus contains approximately 1 million words from a variety of sources including books, newspapers, and magazines."
    },
    {
      id: "2.2.3",
      question: "What makes the Brown Corpus unique compared to modern corpora?",
      options: [
        "It is larger in size",
        "It represents a specific point in time (1961) with balanced genre distribution",
        "It is completely free",
        "It includes multiple languages"
      ],
      correctAnswer: 1,
      explanation: "The Brown Corpus is valuable as a snapshot of American English from a specific era with balanced representation across different text genres."
    }
  ],

  // NLP Unit II - Lesson 703 (Gutenberg Corpus Explorer)
  "703": [
    {
      id: "2.3.1",
      question: "Which NLTK method is used to explore a specific file's content in the Gutenberg corpus?",
      options: [
        "gutenberg.open()",
        "gutenberg.raw()",
        "gutenberg.read()",
        "gutenberg.load()"
      ],
      correctAnswer: 1,
      explanation: "The raw() method is used to get the original text content of a file."
    },
    {
      id: "2.3.2",
      question: "The Gutenberg corpus contains approximately how many electronic books?",
      options: [
        "18",
        "1,000",
        "50,000",
        "100"
      ],
      correctAnswer: 0,
      explanation: "NLTK includes a selection of 18 texts from the Project Gutenberg collection."
    }
  ],
};

export default lessonQuizzesData;
