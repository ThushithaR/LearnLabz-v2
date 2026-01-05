import { LessonSection } from "@/lib/types/course";

export const AccessingTextCorpora = {
  quoteOfTheDay: "Data! Data! Data! I can't make bricks without clay.",
  quoteAttribution: "Sherlock Holmes",

  objectives: [
    "Identify reliable data sources for NLP projects",
    "Implement data collection pipelines",
    "Handle common data acquisition challenges"
  ],

  sections: [
    {
      type: 'text' as const,
      title: 'Understanding Text Corpora',
      content: `Text corpora are large collections of texts used to train and evaluate NLP models. They form the foundation of any successful NLP project. A corpus can be general (containing all types of text) or domain-specific (specialized for a particular field).

When selecting or building a corpus, consider:
- Size and diversity of the data
- Quality and annotation standards
- Licensing and ethical considerations
- Relevance to your specific NLP task`
    },
    {
      type: 'text' as const,
      title: 'Strategy 1: Public Datasets',
      content: `If you're lucky, someone else has already suffered for you. Before creating your own data, check for existing datasets.

Sources: Use Google Dataset Search or public repositories like the Nicolas Iderhoff collection.

Application: Use these publicly available datasets to train a "base" model that understands general language before fine-tuning it with your own data.

The limitation is that public data rarely matches your specific "domain." For example, a public dataset of general emails will not contain your company's specific product codes or internal terminology.`
    },
    {
      type: 'text' as const,
      title: 'Strategy 2: Web Scraping',
      content: `If no dataset exists, you can collect text from the internet.

Method: Extract text from public forums, Q&A sites (like Stack Overflow), or review platforms

Process: Once scraped, the data usually requires human annotators to categorize it.

The catch is that text from the internet is often "noisy"—it contains slang, irrelevant formatting, and behavior that may not match your actual customers.`
    },
    {
      type: 'text' as const,
      title: 'Strategy 3: Product Intervention',
      content: `This is the most effective long-term strategy. It involves changing the software to collect data while people use it.

Implementation: Add a feature where the user must select a category (e.g., "Billing" or "Technical Issue") before they can send a message.

This provides the highest quality data, but it usually takes 3 to 6 months to collect enough volume for a robust model.`
    },
    {
      type: 'text' as const,
      title: 'Strategy 4: Data Augmentation',
      content: `When you have a very small amount of labeled data, you can use "augmentation" to create synthetic variations of those sentences.

Key techniques include Synonym Replacement, Back Translation, TF-IDF Replacement, Bigram Flipping, Replacing Entities, and Adding Noise.

This helps expand small datasets into larger, more diverse training sets while maintaining the core meaning and patterns.`
    },
    {
      type: 'text' as const,
      title: 'Strategy 5: Advanced Programmatic Labelling',
      content: `Snorkel (Weak Supervision): Instead of a human labeling every row, you write Labeling Functions (LFs). These are scripts based on keywords or patterns.

Active Learning: This method reduces labeling costs by having the model analyze unlabeled text and select only the sentences it finds most "confusing" for human labeling.`
    }
    ,
    {
      type: 'interactive' as const,
      title: 'Interactive Code Walkthrough',
      content: {
        lines: [
          [
            { text: 'a', note: 'variable: stores a value', cls: 'text-accent' },
            { text: '=', note: 'assignment operator', cls: 'text-amber-400' },
            { text: '10', note: 'integer literal', cls: 'text-green-500' }
          ],
          [
            { text: 'b', note: 'variable: stores a value', cls: 'text-accent' },
            { text: '=', note: 'assignment operator', cls: 'text-amber-400' },
            { text: '5', note: 'integer literal', cls: 'text-green-500' }
          ],
          [
            { text: 'c', note: 'variable: result of addition', cls: 'text-accent' },
            { text: '=', note: 'assignment operator', cls: 'text-amber-400' },
            { text: 'a', note: 'referencing variable a', cls: 'text-accent' },
            { text: '+', note: 'addition operator', cls: 'text-amber-400' },
            { text: 'b', note: 'referencing variable b', cls: 'text-accent' }
          ],
          [
            { text: 'print', note: 'prints output to console', cls: 'text-purple-400' },
            { text: '(', note: undefined },
            { text: 'c', note: 'value of c', cls: 'text-accent' },
            { text: ')', note: undefined }
          ]
        ],
        outputs: ['', '', '', '15'],
        summary: 'Declares two integers a and b, computes c = a + b, and prints 15.'
      }
    },

    {
      type: 'interactive' as const,
      title: 'Listing Available Text Files in the NLTK Gutenberg Corpus',
        content: {
            lines: [
            [
                {
                text: 'import',
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
        
      type: 'interactive' as const,
      title: 'Listing Available Text Files in the NLTK Gutenberg Corpus',
        content: {
        lines: [
        [
            {
            text: 'emma',
            note: 'A variable name chosen to store the words from the novel Emma. Variables act as containers for data in memory.',
            cls: 'text-accent'
            },
            {
            text: '=',
            note: 'Assignment operator. Stores the result of the expression on the right-hand side into the variable on the left.',
            cls: 'text-amber-400'
            },
            {
            text: 'nltk',
            note: 'The main NLTK module that provides access to corpora and NLP utilities.',
            cls: 'text-accent'
            },
            {
            text: '.',
            note: 'Attribute access operator. Used to access components inside a module.',
            cls: 'text-amber-400'
            },
            {
            text: 'corpus',
            note: 'NLTK sub-module that provides access to collections of real-world text data.',
            cls: 'text-accent'
            },
            {
            text: '.',
            note: 'Attribute access operator. Used to navigate further into the corpus module.',
            cls: 'text-amber-400'
            },
            {
            text: 'gutenberg',
            note: 'Corpus containing classic literary texts from Project Gutenberg.',
            cls: 'text-accent'
            },
            {
            text: '.',
            note: 'Attribute access operator. Used to access a function of the Gutenberg corpus.',
            cls: 'text-amber-400'
            },
            {
            text: 'words',
            note: 'Returns all the words from the specified text as a list of tokens.',
            cls: 'text-purple-400'
            },
            {
            text: '(',
            note: 'Start of a function call.',
            },
            {
            text: "'austen-emma.txt'",
            note: 'The file identifier for the novel Emma by Jane Austen in the Gutenberg corpus.',
            cls: 'text-green-500'
            },
            {
            text: ')',
            note: 'End of the function call. The list of words is returned and stored in emma.',
            }
      ],
      [
        {
          text: 'len',
          note: 'Built-in Python function that returns the number of items in a sequence.',
          cls: 'text-purple-400'
        },
        {
          text: '(',
          note: 'Start of a function call.',
        },
        {
          text: 'emma',
          note: 'The variable containing all word tokens from the novel Emma.',
          cls: 'text-accent'
        },
        {
          text: ')',
          note: 'End of the function call. The total word count is returned.',
        }
      ]
    ],

    outputs: [
      '',
      '192427'
    ],

    summary:
      'Loads the novel Emma from the Gutenberg corpus as a list of word tokens and computes the total number of words in the text.'
  }
}
  ]
};

export type AccessingTextCorpora = typeof AccessingTextCorpora;
