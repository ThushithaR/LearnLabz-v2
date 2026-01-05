import { LessonSection } from "@/lib/types/course";

export const AccessingTextCorpora = {
  quoteOfTheDay: "Data! Data! Data! I can't make bricks without clay.",
  quoteAttribution: "Sherlock Holmes",

  objectives: [
    "Understand what a text corpus is and why it is useful in Natural Language Processing (NLP)",
    "Identify and use text corpora that are already available in NLTK, especially the Gutenberg Corpus",
    "Understand the difference between words() and sents() when accessing text data",
    "Calculate simple text statistics like average word length, average sentence length, and lexical diversity."
  ],

  sections: [
    {
      type: 'text' as const,
      title: 'Understanding Text Corpora',
      content: `Text corpora are large collections of texts used to train and evaluate NLP models. They form the foundation of any successful NLP project. A corpus can be general (containing all types of text) or domain-specific (specialized for a particular field).`

    },
    {
        type: 'text' as const,
        title: '',
        content: `When selecting or building a corpus, you should consider the size and diversity of the data, its quality and cleanliness, the balance of different classes or categories, licensing and ethical considerations and relevance to your specific NLP task.`
    },
    {
        type: 'text' as const,
        title: 'The NLTK Gutenberg Corpus',
        content: `Now that we know a corpus is a large and organized collection of text, we can look at an actual example provided by NLTK. Instead of working only with definitions, using a real corpus helps us understand how text data is stored and analyzed.`
    },
    {
        type: 'text' as const,
        title: '',
        content: `The Gutenberg Corpus is a built-in text corpus in NLTK that contains a selection of classic literary works from Project Gutenberg. It includes texts from authors such as Jane Austen, William Shakespeare, and the Bible. This corpus is particularly useful for demonstrating various NLP techniques due to its rich linguistic content and historical significance.`
    },
    {
      type: 'interactive' as const,
      title: 'Listing Available Text Files in the NLTK Gutenberg Corpus',
        content: {
            lines: [
            [
                {
                text: 'import ',
                note: 'Tells Python to load an external library so its functions and data can be used in this program.',
                cls: 'text-purple-400'
                },
                {
                text: 'nltk',
                note: 'The main NLTK module. It acts as the entry point to all NLP tools, datasets, and utilities provided by the Natural Language Toolkit.',
                cls: 'text-accent'
                }
            ],
            [
                {
                text: 'nltk',
                note: 'The NLTK module that was imported. All NLTK features are accessed through this object.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator. It is used to access variables, functions, or sub-modules that belong to an object or module.',
                cls: 'text-amber-400'
                },
                {
                text: 'corpus',
                note: 'A sub-module inside NLTK that provides access to built-in text datasets such as books, speeches, and articles.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator. Used again to navigate deeper into the module hierarchy.',
                cls: 'text-amber-400'
                },
                {
                text: 'gutenberg',
                note: 'A specific corpus within NLTK that contains classic literary texts from Project Gutenberg.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator. Used to access a function belonging to the Gutenberg corpus.',
                cls: 'text-amber-400'
                },
                {
                text: 'fileids',
                note: 'A function that returns the list of file names (identifiers) for all texts available in the Gutenberg corpus.',
                cls: 'text-purple-400'
                },
                {
                text: '(',
                note: 'Indicates the start of a function call.',
                },
                {
                text: ')',
                note: 'Indicates the end of a function call. The function executes and returns a result.',
                }
            ]
            ],

            outputs: [
            '',
            "['austen-emma.txt', 'austen-persuasion.txt', 'austen-sense.txt', 'bible-kjv.txt', 'blake-poems.txt', 'bryant-stories.txt', 'burgess-busterbrown.txt', 'carroll-alice.txt', 'chesterton-ball.txt', 'chesterton-brown.txt', 'chesterton-thursday.txt', 'edgeworth-parents.txt', 'melville-moby_dick.txt', 'milton-paradise.txt', 'shakespeare-caesar.txt', 'shakespeare-hamlet.txt', 'shakespeare-macbeth.txt', 'whitman-leaves.txt']"
            ],

            summary:
            'Loads the NLTK library and queries the Gutenberg corpus to retrieve a list of all available text files included with NLTK.'
        }
    },
    {
        type: 'text' as const,
        title: '',
        content: `The list of file names shows all the books available in the Gutenberg Corpus. Since working with all texts at once can be confusing at first, it is easier to begin with just one book.`
    },
    {
        type: 'text' as const,
        title: '',
        content: `By selecting Emma by Jane Austen, we can clearly see how to load a text and study its contents before moving on to larger comparisons.`
    },
    {
        type: 'interactive' as const,
        title: 'Exploring a Text Corpus with NLTK',
        content: {
            lines: [
            [
                {
                text: 'emma',
                note: 'A variable that will store a processed version of the text so we can perform linguistic analysis on it.',
                cls: 'text-accent'
                },
                {
                text: '=',
                note: 'Assignment operator. Saves the result of the expression on the right into the variable on the left.',
                cls: 'text-amber-400'
                },
                {
                text: 'nltk',
                note: 'The main NLTK module, providing tools and data structures for natural language processing.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator. Used to access submodules or methods inside a module.',
                cls: 'text-amber-400'
                },
                {
                text: 'Text',
                note: 'A special NLTK class that wraps raw tokens and enables advanced text analysis like concordance and frequency analysis.',
                cls: 'text-purple-400'
                },
                {
                text: '(',
                note: 'Start of the Text object constructor.',
                },
                {
                text: 'nltk',
                note: 'Accessing the NLTK module again to fetch the corpus data.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator.',
                cls: 'text-amber-400'
                },
                {
                text: 'corpus',
                note: 'Submodule that provides access to collections of real-world text.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator.',
                cls: 'text-amber-400'
                },
                {
                text: 'gutenberg',
                note: 'Corpus containing classic literary works from Project Gutenberg.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator.',
                cls: 'text-amber-400'
                },
                {
                text: 'words',
                note: 'Loads the text and returns it as a list of individual word tokens.',
                cls: 'text-purple-400'
                },
                {
                text: '(',
                note: 'Start of function call.',
                },
                {
                text: "'austen-emma.txt'",
                note: 'Identifier for the novel Emma by Jane Austen.',
                cls: 'text-green-500'
                },
                {
                text: ')',
                note: 'Ends the words() function call.',
                },
                {
                text: ')',
                note: 'Ends the Text() constructor. The wrapped text is stored in emma.',
                }
            ],
            [
                {
                text: 'len',
                note: 'Built-in Python function that returns the number of elements in a sequence.',
                cls: 'text-purple-400'
                },
                {
                text: '(',
                note: 'Start of function call.',
                },
                {
                text: 'emma',
                note: 'The Text object containing all tokens from the novel.',
                cls: 'text-accent'
                },
                {
                text: ')',
                note: 'Returns the total number of word tokens in the text.',
                }
            ],
            [
                {
                text: 'emma',
                note: 'The Text object we created from the Emma corpus.',
                cls: 'text-accent'
                },
                {
                text: '.',
                note: 'Attribute access operator. Used to call a method on the Text object.',
                cls: 'text-amber-400'
                },
                {
                text: 'concordance',
                note: 'Displays every occurrence of a word along with its surrounding context.',
                cls: 'text-purple-400'
                },
                {
                text: '(',
                note: 'Start of function call.',
                },
                {
                text: '"surprize"',
                note: 'Target word to search for. Note the older British spelling used in the novel.',
                cls: 'text-green-500'
                },
                {
                text: ')',
                note: 'Executes the concordance search.',
                }
            ]
            ],

            outputs: [
            '',
            '192427',
            'Displaying 37 matches:\n... she was quite surprize d at ...'
            ],

            summary:
            'Wraps the novel Emma in an NLTK Text object, measures its size, and uses concordance to examine how a specific word appears in context throughout the text.'
        }
    },
    {
        type:'text' as const,
        title:'',
        content: `Knowing how many words a text contains gives us a basic idea of its size, but it does not tell us how words are used. To understand word usage, we need to see words in their context. This is done using concordance, which shows where a word appears in the text along with nearby words. For corpus texts, this requires converting the text into an NLTK Text object.`
    },

    {
            type: 'interactive' as const,
            title: 'Comparing Text Statistics Across the Gutenberg Corpus',
            content: {
                lines: [
                [
                    {
                    text: 'for ',
                    note: 'Starts a loop that iterates over each text available in the Gutenberg corpus.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: 'fileid ',
                    note: 'Loop variable that will store the filename of the current text being processed.',
                    cls: 'text-accent'
                    },
                    {
                    text: 'in ',
                    note: 'Keyword used to iterate over a sequence.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: 'gutenberg',
                    note: 'Reference to the Gutenberg corpus module inside NLTK.',
                    cls: 'text-accent'
                    },
                    {
                    text: '.',
                    note: 'Attribute access operator.',
                    cls: 'text-amber-400'
                    },
                    {
                    text: 'fileids',
                    note: 'Returns a list of all available text identifiers in the Gutenberg corpus.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '()',
                    note: 'Calls the function to retrieve file identifiers.',
                    },
                    {
                    text: ':',
                    note: 'Marks the beginning of the loop body.',
                    }
                ],

                [
                    {
                    text: 'num_chars',
                    note: 'Stores the total number of characters in the text, including spaces.',
                    cls: 'text-accent'
                    },
                    {
                    text: '=',
                    note: 'Assignment operator.',
                    cls: 'text-amber-400'
                    },
                    {
                    text: 'len',
                    note: 'Built-in Python function that returns the length of a sequence.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'gutenberg.raw',
                    note: 'Returns the entire text as one long string.',
                    cls: 'text-accent'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'fileid',
                    note: 'The current text file being processed.',
                    cls: 'text-accent'
                    },
                    {
                    text: ')',
                    note: 'Ends raw() function call.',
                    },
                    {
                    text: ')',
                    note: 'Computes total character count.',
                    }
                ],

                [
                    {
                    text: 'num_words',
                    note: 'Stores the total number of word tokens in the text.',
                    cls: 'text-accent'
                    },
                    {
                    text: '=',
                    note: 'Assignment operator.',
                    cls: 'text-amber-400'
                    },
                    {
                    text: 'len',
                    note: 'Counts the number of items in a sequence.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'gutenberg.words',
                    note: 'Returns the text tokenized into words.',
                    cls: 'text-accent'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'fileid',
                    note: 'The current text file.',
                    cls: 'text-accent'
                    },
                    {
                    text: ')',
                    note: 'Ends words() call.',
                    },
                    {
                    text: ')',
                    note: 'Computes total word count.',
                    }
                ],

                [
                    {
                    text: 'num_sents',
                    note: 'Stores the number of sentences in the text.',
                    cls: 'text-accent'
                    },
                    {
                    text: '=',
                    note: 'Assignment operator.',
                    cls: 'text-amber-400'
                    },
                    {
                    text: 'len',
                    note: 'Counts elements in a sequence.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'gutenberg.sents',
                    note: 'Returns the text segmented into sentences.',
                    cls: 'text-accent'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'fileid',
                    note: 'The current text file.',
                    cls: 'text-accent'
                    },
                    {
                    text: ')',
                    note: 'Ends sents() call.',
                    },
                    {
                    text: ')',
                    note: 'Computes total sentence count.',
                    }
                ],

                [
                    {
                    text: 'num_vocab',
                    note: 'Stores the number of unique word types in the text.',
                    cls: 'text-accent'
                    },
                    {
                    text: '=',
                    note: 'Assignment operator.',
                    cls: 'text-amber-400'
                    },
                    {
                    text: 'len',
                    note: 'Counts unique elements.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '(',
                    note: 'Start of function call.',
                    },
                    {
                    text: 'set',
                    note: 'Removes duplicate words to compute vocabulary size.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '(',
                    note: 'Start of set constructor.',
                    },
                    {
                    text: '[w.lower() for w in gutenberg.words(fileid)]',
                    note: 'List comprehension that lowercases all words to avoid case-based duplicates.',
                    cls: 'text-green-500'
                    },
                    {
                    text: ')',
                    note: 'Ends set construction.',
                    },
                    {
                    text: ')',
                    note: 'Computes vocabulary size.',
                    }
                ],

                [
                    {
                    text: 'print',
                    note: 'Outputs computed statistics in a compact format.',
                    cls: 'text-purple-400'
                    },
                    {
                    text: '     int(num_chars/num_words)',
                    note: 'Average word length (characters per word).',
                    cls: 'text-green-500'
                    },
                    {
                    text: ',',
                    note: 'Separator.',
                    },
                    {
                    text: ' int(num_words/num_sents)',
                    note: 'Average sentence length (words per sentence).',
                    cls: 'text-green-500'
                    },
                    {
                    text: ',',
                    note: 'Separator.',
                    },
                    {
                    text: 'int(num_words/num_vocab)',
                    note: 'Lexical diversity: average usage frequency of each vocabulary word.',
                    cls: 'text-green-500'
                    },
                    {
                    text: ',',
                    note: 'Separator.',
                    },
                    {
                    text: 'fileid',
                    note: 'Displays the text identifier being analyzed.',
                    cls: 'text-accent'
                    }
                ]
                ],

                outputs: [
                '',
                '',
                '',
                '',
                '',
                '4 21 26 austen-emma.txt, 4 23 16 austen-persuasion.txt, 4 24 22 austen-sense.txt, 4 33 79 bible-kjv.txt...'
                ],

                summary:
                'Computes and compares average word length, average sentence length, and lexical diversity across multiple Gutenberg texts, revealing stylistic differences between authors.'
            }
            },
            {
                type:'text' as const,
                title:'',
                content: `The numbers produced by the program may look simple, but they tell us important things about the text. For example, average word length stays nearly the same across texts, showing a general pattern in English. On the other hand, sentence length and vocabulary usage vary from author to author, helping us identify writing styles.`
            },
            {
                type: 'text' as const,
                title: '',
                content: `So far, we have worked with text that is broken into words and sentences. However, sometimes we need the original text exactly as it appears in the book. The raw() function gives us this unprocessed text, including spaces and punctuation, which is useful for counting characters or performing custom processing.`
            },
            {
  type: 'interactive' as const,
  title: 'From Raw Text to Sentence-Level Analysis',
  content: {
    lines: [
      [
        {
          text: 'macbeth_sentences',
          note: 'Variable that will store all sentences from the play Macbeth.',
          cls: 'text-accent'
        },
        {
          text: '=',
          note: 'Assignment operator.',
          cls: 'text-amber-400'
        },
        {
          text: 'gutenberg',
          note: 'Reference to the Gutenberg corpus provided by NLTK.',
          cls: 'text-accent'
        },
        {
          text: '.',
          note: 'Attribute access operator.',
          cls: 'text-amber-400'
        },
        {
          text: 'sents',
          note: 'Splits the text into sentences, where each sentence is a list of word tokens.',
          cls: 'text-purple-400'
        },
        {
          text: '(',
          note: 'Start of function call.',
        },
        {
          text: "'shakespeare-macbeth.txt'",
          note: 'File identifier for the play Macbeth by William Shakespeare.',
          cls: 'text-green-500'
        },
        {
          text: ')',
          note: 'Returns a list of sentences from the text.',
        }
      ],

      [
        {
          text: 'macbeth_sentences',
          note: 'Displays the entire list of sentences extracted from the text.',
          cls: 'text-accent'
        }
      ],

      [
        {
          text: 'macbeth_sentences',
          note: 'The list of all sentences from Macbeth.',
          cls: 'text-accent'
        },
        {
          text: '[',
          note: 'Indexing operator used to access a specific sentence.',
        },
        {
          text: '1037',
          note: 'Index of the sentence being accessed (zero-based indexing).',
          cls: 'text-green-500'
        },
        {
          text: ']',
          note: 'Returns the sentence at position 1037.',
        }
      ],

      [
        {
          text: 'longest_len',
          note: 'Variable that will store the length of the longest sentence.',
          cls: 'text-accent'
        },
        {
          text: '=',
          note: 'Assignment operator.',
          cls: 'text-amber-400'
        },
        {
          text: 'max',
          note: 'Built-in function that returns the largest value in a sequence.',
          cls: 'text-purple-400'
        },
        {
          text: '(',
          note: 'Start of function call.',
        },
        {
          text: '[len(s) for s in macbeth_sentences]',
          note: 'List comprehension that computes the length of every sentence in the text.',
          cls: 'text-green-500'
        },
        {
          text: ')',
          note: 'Finds the maximum sentence length.',
        }
      ],

      [
        {
          text: '[',
          note: 'Start of list comprehension.',
        },
        {
          text: 's ',
          note: 'Represents one sentence at a time.',
          cls: 'text-accent'
        },
        {
          text: 'for ',
          note: 'Loop keyword in list comprehension.',
          cls: 'text-purple-400'
        },
        {
          text: 's ',
          note: 'Sentence variable.',
          cls: 'text-accent'
        },
        {
          text: 'in ',
          note: 'Iterates over the sentence list.',
          cls: 'text-purple-400'
        },
        {
          text: 'macbeth_sentences ',
          note: 'All sentences from Macbeth.',
          cls: 'text-accent'
        },
        {
          text: 'if ',
          note: 'Conditional filter in list comprehension.',
          cls: 'text-purple-400'
        },
        {
          text: 'len(s) ',
          note: 'Computes the length of the current sentence.',
          cls: 'text-purple-400'
        },
        {
          text: '== ',
          note: 'Equality comparison operator.',
          cls: 'text-amber-400'
        },
        {
          text: 'longest_len',
          note: 'Matches only the longest sentence(s).',
          cls: 'text-accent'
        },
        {
          text: ']',
          note: 'Returns all sentences with maximum length.',
        }
      ]
    ],

    outputs: [
      '',
      "[['[', 'The', 'Tragedie', 'of', 'Macbeth', ...], ['Actus', 'Primus', '.'], ...]",
      "['Double', ',', 'double', ',', 'toile', 'and', 'trouble', ';', 'Fire', 'burne', ',', 'and', 'Cauldron', 'bubble']",
      '62',
      "[['Doubtfull', 'it', 'stood', ',', 'As', 'two', 'spent', 'Swimmers', ...]]"
    ],

    summary:
      'Demonstrates how to access raw sentence structures from a text corpus, inspect individual sentences, and analyze sentence length to identify the longest sentence in a literary work.'
  }
}



  ]
};

export type AccessingTextCorpora = typeof AccessingTextCorpora;
