import { LessonSection } from "@/lib/types/course";

export const dataAcquisitionContent = {
  overview: "In industrial Machine Learning, the most significant challenge is rarely the algorithm; it is the data acquisition process. In an academic environment, you are typically provided with a complete dataset. In a professional setting, you often start with no data at all. This module covers the practical strategies used to gather and build a dataset for NLP systems.",

  objectives: [
    "Identify reliable data sources for NLP projects",
    "Implement data collection pipelines",
    "Handle common data acquisition challenges"
  ],

  sections: [
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
  ]
};

export type DataAcquisitionContent = typeof dataAcquisitionContent;
