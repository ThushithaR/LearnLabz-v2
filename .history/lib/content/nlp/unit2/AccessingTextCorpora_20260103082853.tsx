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
    },
    {
      type: 'text' as const,
      title: 'Code Walkthrough: Loading Text Data',
      content: `Here's a practical example of how to load and preprocess text from a corpus:

\`\`\`python
import nltk
from nltk.corpus import brown

# Load the Brown corpus
corpus = brown.words()
print(f"Total words in corpus: {len(corpus)}")

# Get sentences from the corpus
sentences = brown.sents()
print(f"Total sentences: {len(sentences)}")

# Access specific categories
news = brown.words(categories='news')
fiction = brown.words(categories='fiction')

# Preprocess: lowercase and remove punctuation
import re
cleaned_words = [word.lower() for word in corpus if re.match(r'^[a-z]+$', word.lower())]
print(f"Cleaned corpus size: {len(cleaned_words)}")

# Create frequency distribution
from nltk import FreqDist
freq_dist = FreqDist(cleaned_words)
print(f"Top 10 most common words: {freq_dist.most_common(10)}")
\`\`\`

This demonstrates the complete workflow: loading data, filtering, preprocessing, and analyzing text corpora for NLP tasks.`
    }
  ]
};

export type AccessingTextCorpora = typeof AccessingTextCorpora;
