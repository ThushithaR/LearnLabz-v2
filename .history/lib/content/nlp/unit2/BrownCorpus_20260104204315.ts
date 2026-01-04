import { LessonSection } from "@/lib/types/course";

export const BrownCorpus = {
  quoteOfTheDay: "The most effective way to learn is by doing.",
  quoteAttribution: "Unknown",

  objectives: [
    "Understand the Brown Corpus and its significance in NLP.",
    "Explore genres in the Brown Corpus and how they differ.",
    "Learn how to access the Brown Corpus using NLTK.",
    "Analyze frequency distributions of modal verbs across genres.",
    "Use NLTK to compare genre-specific linguistic patterns."
  ],

  sections: [
    {
      type: 'text' as const,
      title: 'What is the Brown Corpus?',
      content: `The Brown Corpus is the first million-word electronic corpus of English, created in 1961 at Brown University. It contains text from 500 different sources, categorized by genre. These genres include news, editorial, fiction, humor, and more. The Brown Corpus is a crucial tool for studying linguistic differences across genres, known as stylistics.`
    },
    {
      type: 'text' as const,
      title: 'Genres in the Brown Corpus',
      content: `The Brown Corpus is categorized into genres such as news, fiction, romance, and science fiction. Each genre contains texts that share common features, allowing us to compare linguistic patterns across genres. For example, the 'news' genre might show frequent use of modal verbs like "will" and "must," while 'romance' might show different trends in word choice.`
    },
    {
      type: 'text' as const,
      title: 'Accessing the Brown Corpus with NLTK',
      content: `The Brown Corpus can be accessed using NLTK, a Python library for natural language processing. `
    },
    {
  type: 'interactive' as const,
  title: 'Listing Available Categories in the Brown Corpus',
  content: {
    lines: [
      [
        {
          text: 'from',
          note: 'Imports the NLTK library.',
          cls: 'text-purple-400'
        },
        {
          text: 'nltk.corpus',
          note: 'Accesses the corpus submodule in NLTK.',
          cls: 'text-accent'
        },
        {
          text: 'import',
          note: 'Imports a specific module or function.',
          cls: 'text-purple-400'
        },
        {
          text: 'brown',
          note: 'Refers to the Brown Corpus in NLTK.',
          cls: 'text-accent'
        }
      ],
      [
        {
          text: 'brown.categories()',
          note: 'Retrieves the list of available categories in the Brown Corpus.',
          cls: 'text-accent'
        }
      ]
    ],
    outputs: [
      "['adventure', 'belles_lettres', 'editorial', 'fiction', 'government', 'hobbies', 'humor', 'learned', 'lore', 'mystery', 'news', 'religion', 'reviews', 'romance', 'science_fiction']"
    ],
    summary:
      'This code imports the Brown Corpus from NLTK and retrieves the list of available categories, such as adventure, belles_lettres, and news.'
  }
},

    {
      type: 'interactive' as const,
      title: 'Frequency of Modal Verbs in the News Genre',
      content: {
        lines: [
          [
            {
              text: 'from ',
              note: 'Imports the NLTK library.',
              cls: 'text-purple-400'
            },
            {
              text: 'nltk.corpus ',
              note: 'Accesses the corpus submodule in NLTK.',
              cls: 'text-accent'
            },
            {
              text: 'import ',
              note: 'Imports a specific module or function.',
              cls: 'text-purple-400'
            },
            {
              text: 'brown',
              note: 'Refers to the Brown Corpus in NLTK.',
              cls: 'text-accent'
            }
          ],
          [
            {
              text: 'news_text',
              note: 'Stores words from the news genre.',
              cls: 'text-accent'
            },
            {
              text: '=',
              note: 'Assignment operator.',
              cls: 'text-amber-400'
            },
            {
              text: 'brown.words',
              note: 'Accesses the words from the Brown Corpus.',
              cls: 'text-accent'
            },
            {
              text: '(',
              note: 'Start of function call.',
            },
            {
              text: "'news'",
              note: 'Specifies the category for the news genre.',
              cls: 'text-green-500'
            },
            {
              text: ')',
              note: 'Ends the function call.',
            }
          ],
          [
            {
              text: 'fdist',
              note: 'Stores the frequency distribution of words.',
              cls: 'text-accent'
            },
            {
              text: '=',
              note: 'Assignment operator.',
              cls: 'text-amber-400'
            },
            {
              text: 'nltk.FreqDist',
              note: 'Creates a frequency distribution of words.',
              cls: 'text-purple-400'
            },
            {
              text: '[',
              note: 'Start of list comprehension.',
            },
            {
              text: 'w.lower() for w in news_text',
              note: 'Converts words to lowercase and counts their frequency.',
              cls: 'text-green-500'
            },
            {
              text: ']',
              note: 'Ends the list comprehension.',
            }
          ],
          [
            {
              text: 'modals',
              note: 'List of modal verbs to track in the text.',
              cls: 'text-accent'
            },
            {
              text: '=',
              note: 'Assignment operator.',
              cls: 'text-amber-400'
            },
            {
              text: "['can', 'could', 'may', 'might', 'must', 'will']",
              note: 'List of modal verbs.',
              cls: 'text-green-500'
            }
          ],
          [
            {
              text: 'for m in modals:',
              note: 'Starts a loop to count each modal verb.',
              cls: 'text-purple-400'
            },
            {
              text: 'print',
              note: 'Outputs the result.',
              cls: 'text-purple-400'
            },
            {
              text: 'm + ": " + str(fdist[m])',
              note: 'Prints the frequency of each modal verb.',
              cls: 'text-green-500'
            }
          ]
        ],
        outputs: [
          "can: 94",
          "could: 87",
          "may: 93",
          "might: 38",
          "must: 53",
          "will: 389"
        ],
        summary:
          'This code calculates the frequency of modal verbs (can, could, may, etc.) in the news genre of the Brown Corpus, providing insights into how modal verbs are used in different genres.'
      }
    },
    {
      type: 'text' as const,
      title: 'Comparing Modal Verbs Across Genres',
      content: `You can compare the frequency of modal verbs across multiple genres using NLTK's Conditional Frequency Distribution (CFD). Here's an example:\n\n\`\`\`\ncfd = nltk.ConditionalFreqDist(\n    (genre, word)\n    for genre in brown.categories()\n    for word in brown.words(categories=genre)\n)\n\ngenres = ['news', 'religion', 'hobbies', 'science_fiction', 'romance', 'humor']\nmodals = ['can', 'could', 'may', 'might', 'must', 'will']\ncfd.tabulate(conditions=genres, samples=modals)\n\`\`\`\nThis will create a table comparing the frequency of modal verbs in different genres, revealing differences in language use across genres.`
    },
    {
      type: 'interactive' as const,
      title: 'Exploring Conditional Frequency Distributions',
      content: {
        lines: [
          [
            {
              text: 'cfd',
              note: 'Conditional Frequency Distribution to store word counts per genre.',
              cls: 'text-accent'
            },
            {
              text: '=',
              note: 'Assignment operator.',
              cls: 'text-amber-400'
            },
            {
              text: 'nltk.ConditionalFreqDist',
              note: 'Creates a conditional frequency distribution.',
              cls: 'text-purple-400'
            },
            {
              text: '(',
              note: 'Start of function call.',
            },
            {
              text: '(genre, word)',
              note: 'Pair of genre and word for the distribution.',
              cls: 'text-green-500'
            },
            {
              text: ')',
              note: 'Ends the function call.',
            }
          ],
          [
            {
              text: 'cfd.tabulate',
              note: 'Tabulates the results of the CFD.',
              cls: 'text-accent'
            },
            {
              text: '(',
              note: 'Start of function call.',
            },
            {
              text: 'conditions=genres',
              note: 'Specifies the genres to include.',
              cls: 'text-purple-400'
            },
            {
              text: 'samples=modals',
              note: 'Specifies the modal verbs to analyze.',
              cls: 'text-purple-400'
            },
            {
              text: ')',
              note: 'Ends the function call.',
            }
          ]
        ],
        outputs: [
          "can could may might must will",
          "news 93 86 66 38 50 389",
          "religion 82 59 78 12 54 71",
          "hobbies 268 58 131 22 83 264",
          "science_fiction 16 49 4 12 8 16",
          "romance 74 193 11 51 45 43",
          "humor 16 30 8 8 9 13"
        ],
        summary:
          'This code compares the frequency of modal verbs across multiple genres in the Brown Corpus using a Conditional Frequency Distribution (CFD), revealing stylistic differences between genres.'
      }
    },
    {
      type: 'text' as const,
      title: '',
      content: `The frequencies of modal verbs across different genres show interesting patterns. For example, the most frequent modal in the news genre is "will," while "could" is the most frequent in the romance genre. This helps us understand how language use varies across different types of text.`
    }
  ]
};

export type BrownCorpus = typeof BrownCorpus;
