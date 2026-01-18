import React from 'react';

export const nlpQuizzes = [
  {
    id: 101,
    title: 'Introduction to NLP - Easy',
    unit: 'Unit I',
    difficulty: 'Easy',
    time: '15 min',
    questions: 18,
    xp: 50,
    status: 'Completed',
    score: '90%',
    questionData: [
      {
        id: 1,
        question: 'Language modeling aims to predict the ______ in a sentence.',
        options: ['topic', 'next word', 'sentence length', 'document category'],
        correct: 1,
        explanation: 'Language modeling predicts the next word using the history of previous words.',
        topics: ['NLP Tasks']
      },
      {
        id: 2,
        question: 'Google Search is a common application of ______.',
        options: ['text summarization', 'information retrieval', 'topic modeling', 'conversational agents'],
        correct: 1,
        explanation: 'Information retrieval finds relevant documents for a user query, which is the core function of Google Search.',
        topics: ['NLP Tasks']
      },
      {
        id: 3,
        question: 'Language is best described as a ______ system of communication.',
        options: ['random', 'structured', 'symbolic only', 'mathematical'],
        correct: 1,
        explanation: 'Language is a structured system of communication.',
        topics: ['what is Language']
      },
      {
        id: 4,
        question: 'Which of the following is the smallest unit of sound in a language?',
        options: ['Morpheme', 'Lexeme', 'Phoneme', 'Word'],
        correct: 2,
        explanation: 'Phonemes are the smallest sound units in a language and may not carry meaning by themselves.',
        topics: ['what is Language']
      },
      {
        id: 5,
        question: 'Which of the following is the smallest unit of sound in a language?',
        options: ['Morpheme', 'Lexeme', 'Phoneme', 'Word'],
        correct: 2,
        explanation: 'Phonemes are the smallest sound units in a language and may not carry meaning by themselves.',
        topics: ['what is Language']
      },
      {
        id: 6,
        question: 'Ambiguity in language refers to ______.',
        options: ['grammatical errors',
                  'uncertainty of meaning',
                  'spelling variation',
                  'language translation'],
        correct: 1,
        explanation: 'The passage defines ambiguity as uncertainty of meaning, where a sentence can have multiple interpretations.',
        topics: ['Why NLP is Challenging']
      },
      {
        id: 7,
        question: 'The sentence “I made her duck” is ambiguous because of the word ______.',
        options: ['her',
                  'duck',
                  'made',
                  'I'],
        correct: 2,
        explanation: 'The word “made” can imply cooking or forcing someone to bend, creating multiple meanings.',
        topics: ['Why NLP is Challenging']
      },
      {
        id: 8,
        question: 'Determining whether a user is asking a question or giving a command is handled by ______.',
        options: ['speech synthesis',
                  'dialog management',
                  'information retrieval',
                  'response generation'],
        correct: 1,
        explanation: 'Dialog management is responsible for understanding user intent and deciding the next action.',
        topics: ['An NLP Walkthrough: Conversational Agents']
      },
      {
        id: 9,
        question: 'Which is the first step in a generic NLP pipeline?',
        options: ['Feature engineering',
                  'Data acquisition',
                  'Modeling',
                  'Evaluation'],
        correct: 1,
        explanation: 'The NLP pipeline begins with data acquisition, as data is required before any further processing.',
        topics: ['NLP Pipeline']
      },
      {
        id: 10,
        question: 'Which step comes immediately after feature engineering in the NLP pipeline?',
        options: ['Pre-processing',
                  'Modeling',
                  'Deployment',
                  'Monitoring'],
        correct: 1,
        explanation: 'Once features are created, they are fed into modeling algorithms.',
        topics: ['NLP Pipeline']
      },
      {
        id: 11,
        question: 'Using a machine translation library to translate a sentence into another language and then back to the original language to create new data is called ______.',
        options: ['Synonym replacement',
                  'Back translation',
                  'TF-IDF replacement',
                  'Active learning'],
        correct: 1,
        explanation: 'Back translation creates syntactic variations of sentences while preserving meaning, useful for data augmentation.',
        topics: ['Data Acquisition']
      },
      {
        id: 12,
        question: 'Which of the following is a method of data augmentation?',
        options: ['Product intervention',
                  'Adding noise to data',
                  'Scraping websites',
                  'Collecting public datasets'],
        correct: 1,
        explanation: 'Adding noise simulates spelling errors or typos, creating more robust training data.',
        topics: ['Data Acquisition']
      },
      {
        id: 13,
        question: 'Text extraction primarily involves:',
        options: ['Training deep learning models',
                  'Removing non-textual information and extracting content',
                  'Translating text into another language',
                  'Performing sentiment analysis'],
        correct: 1,
        explanation: 'Text extraction is the process of removing markup, metadata, and other non-textual elements to get usable textual data.',
        topics: ['Text Extraction']
      },
      {
        id: 14,
        question: 'When extracting text from HTML, libraries like ______ or Scrapy can be used.',
        options: ['PyTorch',
                  'Beautiful Soup',
                  'OpenCV',
                  'TensorFlow'],
        correct: 1,
        explanation: 'Beautiful Soup and Scrapy are popular Python libraries for parsing HTML pages and extracting content.',
        topics: ['Text Extraction']
      },
      {
        id: 15,
        question: 'The "fat-finger problem" refers to:',
        options: ['Incorrect translation between languages',
                  'Unintentional typing mistakes due to mobile keyboards',
                  'OCR errors in scanned text',
                  'Encoding issues in Unicode'],
        correct: 1,
        explanation: 'The fat-finger problem occurs when users type incorrectly, often on mobile devices, affecting text quality.',
        topics: ['Text Extraction']
      },
      {
        id: 16,
        question: 'Words like "a," "the," and "of" that are usually removed during text pre-processing are called ________.',
        options: ['Stop words',
                  'Noise words',
                  'Punctuation marks',
                  'Special characters'],
        correct: 0,
        explanation: 'Stop words are common words like "a," "the," and "of" that are typically removed during text pre-processing.',
        topics: ['Pre-processing']
      },
      {
        id: 17,
        question: 'Stemming is different from lemmatization because:',
        options: ['Stemming is linguistically accurate, lemmatization is not',
                  'Stemming uses rules to reduce words, lemmatization considers the context',
                  'Stemming only works for verbs, lemmatization only for nouns',
                  'Stemming expands words, lemmatization shortens words'],
        correct: 1,
        explanation: '',
        topics: ['Pre-processing']
      },
      {
        id: 18,
        question: 'Text normalization involves converting variations of words into a ________ representation.',
        options: ['Canonical',
                  'Random',
                  'Numeric',
                  'Graphical'],
        correct: 0,
        explanation: 'Definition of text normalization converting different forms of words into a standard canonical form.',
        topics: ['Pre-processing']
      },

      
      // Add more questions...
    ]
  },
  {
    id: 102,
    title: 'Introduction to NLP - Medium',
    unit: 'Unit I',
    difficulty: 'Medium',
    time: '20 min',
    questions: 8,
    xp: 75,
    status: 'New',
    score: '-',
    questionData: [{
        id: 1,
        question: 'Assertion: Language modeling is useful in speech and handwriting recognition.\nReason: It learns the probability of word sequences in a language.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 0,
        explanation: 'By modeling word sequence probabilities, language models help resolve ambiguity in recognition systems.',
        topics: ['NLP Tasks']
      },
      {
        id: 2,
        question: 'Assertion: Information retrieval extracts names and dates from text.\nReason: Information retrieval focuses on finding relevant documents for a query.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 3,
        explanation: 'Extracting names and dates is information extraction, not information retrieval.',
        topics: ['NLP Tasks']
      },
      {
        id: 3,
        question: 'Assertion: Phonemes do not have meaning on their own.\nReason: Meaning is created when phonemes are combined with other phonemes.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 0,
        explanation: 'Phonemes are sound units that gain meaning only when combined into morphemes or words.',
        topics: ['Building Blocks of Language']
      },
      {
        id: 4,
        question: 'Assertion: All morphemes are complete words.\nReason: Prefixes and suffixes can change meaning but may not be standalone words.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 3,
        explanation: 'Not all morphemes are words; prefixes like “multi-” are morphemes but not standalone words.',
        topics: ['Building Blocks of Language']
      },
      {
        id: 5,
        question: 'Assertion: All morphemes are complete words.\nReason: Prefixes and suffixes can change meaning but may not be standalone words.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 3,
        explanation: 'Not all morphemes are words; prefixes like “multi-” are morphemes but not standalone words.',
        topics: ['Building Blocks of Language']
      },
      {
        id: 6,
        question: 'Assertion: Unicode normalization ensures emojis and symbols are machine-readable.\nReason: Unicode encoding converts characters into a binary representation suitable for computers.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 0,
        explanation: 'Unicode normalization makes all special characters compatible with NLP pipelines, avoiding processing errors.',
        topics: ['Text Extraction']
      },
      {
        id: 7,
        question: 'Assertion: PDF text extraction is always reliable with libraries like PyPDF or PDFMiner.\nReason: Different PDF encodings may result in missing or scrambled text.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 3,
        explanation: 'PDF extraction can be inconsistent due to encoding differences or PDF structure issues.',
        topics: ['Text Extraction']
      },
      {
        id: 8,
        question: 'Assertion (A): Stop word removal is mandatory in all NLP tasks.\nReason (R): Stop words usually have low information content for certain NLP tasks.',
        options: ['Both Assertion and Reason are true, and Reason correctly explains Assertion',
                  'Both Assertion and Reason are true, but Reason does not explain Assertion',
                  'Assertion is true, Reason is false',
                  'Assertion is false, Reason is true'],
        correct: 3,
        explanation: 'Stop word removal is not mandatory; it depends on the NLP task.',
        topics: ['Pre-processing']
      },
      //
      // Medium level questions for Unit I
    ]
  },
  {
    id: 103,
    title: 'Introduction to NLP - Hard',
    unit: 'Unit I',
    difficulty: 'Hard',
    time: '25 min',
    questions: 10,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
      {
        id: 1,
        question: 'A company wants to automatically analyze customer opinions from thousands of social media posts to understand public sentiment about its brand.\n Which NLP application is most suitable for this task?',
        options: ['Machine translation', 'Feed analysis', 'Grammar correction', 'Knowledge graph construction'],
        correct: 1,
        explanation: 'The content states that organizations analyze their social media feeds using NLP to gain a better understanding of customer opinions and sentiment. This makes social media feed analysis the most appropriate NLP application for this scenario.',
        topics: ['NLP in Real World']
      },   
      {
        id: 2,
        question: 'A speech-to-text system must accurately recognize spoken sounds and convert them into written words.\nWhich building block of language is most crucial for this task?',
        options: ['Syntax', 'Context', 'Phonemes', 'Lexemes'],
        correct: 2,
        explanation: 'Speech-to-text systems rely on phonemes, the smallest units of sound, to correctly interpret spoken language.',
        topics: ['Building Blocks of Language']
      },
      {
        id: 3,
        question: 'A system must detect sarcasm in user reviews by considering world knowledge and implied meaning.\nWhich building block of language is most essential?',
        options: ['Syntax', 'Phonemes', 'Context', 'Morphemes'],
        correct: 2,
        explanation: 'Sarcasm detection depends heavily on context, including pragmatics and real-world knowledge.',
        topics: ['Building Blocks of Language']
      },
      {
        id: 4,
        question: 'A poetry analysis system struggles to understand metaphors and stylistic expressions.\nWhich NLP challenge is the main cause?',
        options: ['Common knowledge', 'Creativity', 'Ambiguity', 'Syntax'],
        correct: 1,
        explanation: 'Poetry relies on creative language use, which is hard for machines to interpret.',
        topics: ['Why NLP is Challenging']
      },
      {
        id: 5,
        question: 'A poetry analysis system struggles to understand metaphors and stylistic expressions.\nWhich NLP challenge is the main cause?',
        options: ['Common knowledge', 'Creativity', 'Ambiguity', 'Syntax'],
        correct: 1,
        explanation: 'Poetry relies on creative language use, which is hard for machines to interpret.',
        topics: ['Why NLP is Challenging']
      },
      {
        id: 6,
        question: 'You find that back translation sometimes drops key product names from sentences.\nWhich technique can help retain important words while augmenting text?',
        options: ['Bigram flipping',
                  'TF-IDF-based word replacement',
                  'Synonym replacement',
                  'Active learning'],
        correct: 1,
        explanation: 'TF-IDF identifies important words that must be preserved or replaced carefully to maintain meaning.',
        topics: ['Data Acquisition']
      },
      {
        id: 7,
        question: 'An industrial NLP system must handle spelling mistakes from mobile users.\nWhich technique should be applied during data preparation?',
        options: ['Entity replacement',
                  'Adding noise to data',
                  'Snorkel',
                  'Bigram flipping'],
        correct: 1,
        explanation: 'Adding noise simulates real-world errors (typos, QWERTY keyboard mistakes) to improve model robustness.',
        topics: ['Data Acquisition']
      },
      {
        id: 8,
        question: 'You need to build a search engine for a forum with lots of HTML and script content.',
        options: ['Strip all HTML tags and use raw text',  'Use Beautiful Soup to extract only content between relevant tags',
                  'Convert HTML to PDF first',
                  'Manually copy content'],
        correct: 1,
        explanation: 'Extracting text between known tags reduces noise and focuses on relevant content. Stripping all tags may include JavaScript or ads.',
        topics: ['Text Extraction']
      },
      {
        id: 9,
        question: 'You are designing a sentiment analysis tool for social media posts. The posts contain emojis, misspellings, hashtags, and code-mixed text (English + Hindi in Roman script). Which pre-processing combination is MOST appropriate?',
        options: ['Sentence segmentation, lowercasing, stop word removal', 'Sentence segmentation, word tokenization, spell correction, text normalization, emoji handling, transliteration',
                  'Stemming and lemmatization only',
                  'Removing digits and punctuation'],
        correct: 1,
        explanation: 'Social media text requires handling informal text, emojis, misspellings, and code-mixing. Standard tokenization alone is insufficient. Spell correction and text normalization improve quality, while emoji handling captures sentiment. Transliteration converts non-English words written in Roman script to a standard representation.',
        topics: ['Pre-processing']
      },
      {
        id: 10,
        question: 'You have scraped 10,000 Wikipedia pages for biographical data. Many pages contain references, links, and tables. To extract meaningful sentences for NLP, which preprocessing strategy is most effective?',
        options: ['Keep all HTML content, remove punctuation only',
                  'HTML cleanup → Sentence segmentation → Word tokenization → Lowercasing → Stop word removal',
                  'Sentence segmentation → Emoji handling → Spell correction',
                  'Stemming → Lemmatization → Language detection'],
        correct: 1,
        explanation: '',
        topics: ['Pre-processing']
      },
      // Hard level questions for Unit I
    ]
  },
  {
    id: 201,
    title: 'Text Corpora & Text Preprocessing - Easy',
    unit: 'Unit II',
    difficulty: 'Easy',
    time: '18 min',
    questions: 11,
    xp: 55,
    status: 'Available',
    score: '-',
    questionData: [
      {
        id: 1,
        question: 'A text corpus is best described as:',
        options: ['A single sentence used for testing', 'A small collection of words', 'A large structured body of text', 'A dictionary of meanings'],
        correct: 2,
        explanation: 'A corpus is a large body of text, often organized by genre, topic, or time.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 2,
        question: 'Which NLTK function returns the list of file identifiers in a corpus?',
        options: ['raw()', 'words()', 'fileids()', 'categories()'],
        correct: 2,
        explanation: 'fileids() lists all available files in a corpus.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 3,
        question: 'The Gutenberg Corpus in NLTK is derived from which source?',
        options: ['Wikipedia', 'Brown University', 'Project Gutenberg', 'Reuters'],
        correct: 2,
        explanation: 'The Gutenberg Corpus contains texts from Project Gutenberg, which hosts thousands of free electronic books.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 4,
        question: 'What does gutenberg.raw(fileid) return?',
        options: ['Tokenized words', 'Parsed syntax trees', 'Raw text including spaces', 'Lemmatized text'],
        correct: 2,
        explanation: 'raw() returns the original text without tokenization, including spaces and punctuation.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 5,
        question: 'Regular expressions are primarily used in NLP for:',
        options: ['Statistical modeling',
                  'Pattern matching in text',
                  'Semantic role labeling',
                  'Machine translation'],
        correct: 1,
        explanation: 'Regular expressions provide a flexible way to describe and match character patterns, which is essential for many linguistic processing tasks.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      },
      {
        id: 6,
        question: 'Which Python library must be imported to use regular expressions?',
        options: ['re',
                  'regex',
                  'nltk',
                  'pandas'],
        correct: 0,
        explanation: 'Python’s built-in re library provides functions such as re.search() for working with regular expressions.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      },
      {
        id: 7,
        question: 'The regular expression symbol $ is used to match the ______ of a string.',
        options: ['end',
                  'beginning',
                  'middle',
                  'all'],
        correct: 0,
        explanation: 'The $ metacharacter matches the end of a word or string, e.g., ed$ matches words ending with ed.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      }, 
      {
        id: 8,
        question: 'The wildcard symbol . in regular expressions matches:',
        options: ['A punctuation mark',
                  'Any digit',
                  'Any single character',
                  'Only alphabetic characters'],
        correct: 2,
        explanation: 'The . metacharacter matches any single character except newline.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      }, 
      {
        id: 9,
        question: 'In the regex [ghi], what does it represent?',
        options: ['The exact string "ghi"',
                  'Any one of g, h, or i',
                  'A range from g to i',
                  'Zero or more characters'],
        correct: 1,
        explanation: 'The [ghi] character class matches any one of the characters g, h, or i.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      },  
      {
        id: 10,
        question: 'Which regular expression will match both email and e-mail?',
        options: ['^email$',
                  '^e-mail$',
                  '^e?mail$',
                  '^e-?mail$'],
        correct: 3,
        explanation: 'The ? symbol makes the preceding character optional, so -? matches zero or one hyphen.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      }, 
      {
        id: 11,
        question: 'The regular expression ^[0-9]{4}$ will match:',
        options: ['Any number',
                  'Exactly four digits',
                  'At least four digits',
                  'A year followed by text'],
        correct: 1,
        explanation: '{4} specifies exactly four repetitions of the preceding item ([0-9]).',
        topics: ['Regular Expressions for Detecting Word Patterns']
      }, 
      {
        id: 12,
        question: 'Why are raw strings (r\'...\') recommended for regular expressions in Python?',
        options: ['They improve execution speed',
                  'They allow Unicode processing',
                  'They prevent Python from interpreting backslashes',
                  'They remove punctuation'],
        correct: 2,
        explanation: 'Raw strings prevent Python from interpreting backslashes, which is essential for regular expressions.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      }, 
      // Easy questions for Unit II
    ]
  },
  {
    id: 202,
    title: 'Text Corpora & Text Preprocessing - Medium',
    unit: 'Unit II',
    difficulty: 'Medium',
    time: '18 min',
    questions: 11,
    xp: 55,
    status: 'Available',
    score: '-',
    questionData: [
      {
        id: 1,
        question: 'Assertion (A): Categories in the Reuters Corpus do not overlap.\nReason (R): News articles usually discuss only one topic.',
        options: ['Both A and R are true, and R explains A', 'Both A and R are true, but R does not explain A', 'A is true, R is false', 'A is false, R is true'],
        correct: 3,
        explanation: 'Reuters articles are often multi-topic (e.g., barley + wheat), hence overlapping categories.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 2,
        question: 'Assertion (A): The Brown Corpus is useful for stylistic analysis.\nReason (R): It allows comparison of linguistic features across genres.',
        options: ['Both A and R are true, and R explains A', 'Both A and R are true, but R does not explain A', 'A is true, R is false', 'A is false, R is true'],
        correct: 0,
        explanation: 'Stylistics studies genre-based language variation, which the Brown Corpus directly supports.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 3,
        question: 'Assertion (A): The regex ^[^aeiouAEIOU]+$ matches only consonant-based tokens.\nReason (R): The caret inside square brackets negates the character set.',
        options: ['Both A and R are true, and R explains A', 'Both A and R are true, but R does not explain A', 'A is true, R is false', 'A is false, R is true'],
        correct: 0,
        explanation: 'The negation ensures any character except vowels, including digits and symbols.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      },
      {
        id: 4,
        question: 'Assertion (A): [A-Z]+\$ matches words with uppercase letters.\nReason (R): The backslash removes the special meaning of $',
        options: ['Both A and R are true, and R explains A', 'Both A and R are true, but R does not explain A', 'A is true, R is false', 'A is false, R is true'],
        correct: 3,
        explanation: '\$ forces $ to be treated as a literal character, not an end-of-string marker.',
        topics: ['Regular Expressions for Detecting Word Patterns']
      },
      // Medium questions for Unit II
    ]
  },
  {
    id: 203,
    title: 'Text Corpora & Text Preprocessing - Hard',
    unit: 'Unit II',
    difficulty: 'Hard',
    time: '18 min',
    questions: 11,
    xp: 55,
    status: 'Available',
    score: '-',
    questionData: [
      {
        id: 1,
        question: 'A researcher wants a dataset for training and testing an automatic topic classifier.Which corpus is most appropriate?',
        options: ['Gutenberg', 'Brown', 'Reuters', 'Inaugural'],
        correct: 2,
        explanation: 'The Reuters Corpus provides predefined training and test splits and labeled topics.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 2,
        question: 'You want to analyze changes in the use of the word “citizen” over centuries.\nWhich corpus should be selected?',
        options: ['Gutenberg', 'Brown', 'Reuters', 'Inaugural'],
        correct: 3,
        explanation: 'The Inaugural Corpus has a time dimension, ideal for diachronic linguistic analysis.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 3,
        question: 'Why do raw(), words(), and sents() return different outputs for the same file?',
        options: ['They use different files', 'They apply different levels of linguistic processing', 'They use different encodings', 'They remove stop words differently'],
        correct: 1,
        explanation: 'Each method represents a different abstraction level: raw text, word tokens, or sentence tokens.',
        topics: ['Accessing Text Corpora']
      },
      {
        id: 4,
        question: 'You have a directory of your own .txt files and want to apply NLTK corpus methods.Which reader should you use?',
        options: ['GutenbergCorpusReader', 'ReutersCorpusReader', 'PlaintextCorpusReader', 'BracketParseCorpusReader'],
        correct: 2,
        explanation: 'PlaintextCorpusReader allows loading custom text collections with standard corpus functions.',
        topics: ['Accessing Text Corpora']
      }, 
      
      // Hard questions for Unit II
    ]
  },
  // Add more quizzes for other units...
];

export default nlpQuizzes;
