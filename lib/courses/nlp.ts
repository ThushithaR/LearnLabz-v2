// lib/courses/nlp.ts
import { dataAcquisitionContent } from "@/lib/content/nlp/unit1/dataAcquisition";
import { problemStatementContent } from "@/lib/content/nlp/unit1/problemStatement";
import { nlpQuizzes } from "@/lib/quizzes/nlp/quizzes";
import { AccessingTextCorpora } from "@/lib/content/nlp/unit2/AccessingTextCorpora";
import { BrownCorpus } from "@/lib/content/nlp/unit2/BrownCorpus";
import { lessonQuizzesData } from "@/lib/quizzes/nlp/lessonQuizzes";
import { GutenbergInteractiveLesson } from "@/components/GutenbergExplorer";

export const nlp = {
    id: "nlp",
    name: "Natural Language Processing",
    description: "An introductory course on Natural Language Processing techniques and applications.",

    features: {
        dashboard: true,
        modules: true,
        actualquizzes: true,
        achievements: true,
        numericals: true,
        notes: true,
        calendar: true,
        important: true,
    },

    user: {
        name: "Sophie Lee",
        email: "sophie@learnlabz.com",
        tier: "NLP Novice",
        ep: 800,
        epToNext: 1500,
        streak: 7,
        modulesCompleted: 1,
        quizzesPassed: 5,
        level: 3,
        avatar: "/avatars/sophie.png",
    },
    modules: [
        {
            id: 11,
            title: "Unit I: Introduction to NLP",
            description: "Natural Language Processing basics, history, and data acquisition.",
            progress: 65,
            isLocked: false,
            active: true,
            expectedDuration: "15 min",
            lessons: [
                {
                    id: 601,
                    title: "What is NLP?",
                    duration: "10 min",
                    content: {
                        overview: "Natural Language Processing (NLP) is a field of AI that deals with the interaction between computers and human language. It includes tasks such as text classification, tokenization, and named entity recognition.",
                        objectives: [
                            "Understand what NLP is and its applications",
                            "Learn the basic components of NLP systems",
                            "Explore the history and evolution of NLP"
                        ],
                        sections: [
                            {
                                type: 'text' as const,
                                title: 'Definition and Scope',
                                content: 'NLP combines computational linguistics with statistical, machine learning, and deep learning models to process and understand human language and speech.'
                            },
                            {
                                type: 'text' as const,
                                title: 'Key Applications',
                                content: 'Common NLP applications include machine translation, sentiment analysis, chatbots, speech recognition, and text summarization.'
                            }
                        ]
                    },
                    quiz: lessonQuizzesData["601"]
                },
                {
                    id: 602,
                    title: "History of NLP",
                    duration: "15 min",
                    content: {
                        overview: "The history of NLP spans from rule-based systems to modern neural network approaches, showing significant evolution in how machines understand human language.",
                        objectives: [
                            "Trace the evolution of NLP from early systems",
                            "Understand the shift from rule-based to statistical methods",
                            "Learn about the impact of deep learning on NLP"
                        ],
                        sections: [
                            {
                                type: 'text' as const,
                                title: 'Early NLP Systems (1950s-1980s)',
                                content: 'Early NLP systems were primarily rule-based, relying on hand-crafted grammatical rules and dictionaries. Systems like SHRDLU attempted to understand natural language in limited domains.'
                            },
                            {
                                type: 'text' as const,
                                title: 'Statistical Revolution (1990s-2000s)',
                                content: 'The rise of statistical methods brought machine learning to NLP, using large corpora to learn patterns rather than relying solely on hand-written rules.'
                            }
                        ]
                    }
                },
                {
                    id: 603,
                    title: "Data Acquisition Strategies",
                    duration: "25 min",
                    content: dataAcquisitionContent
                },
                {
                    id: 604,
                    title: "Real-world Problem Statement",
                    duration: "20 min",
                    content: {
                        overview: "Apply your NLP knowledge to solve a practical data acquisition challenge faced by real companies.",
                        objectives: [
                            "Analyze real-world NLP project constraints",
                            "Develop data collection strategies for zero-resource scenarios",
                            "Design phased implementation approaches"
                        ],
                        sections: [
                            {
                                type: 'problem-statement' as const,
                                title: 'E-commerce Chat Routing Challenge',
                                content: problemStatementContent
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 21,
            title: "Unit II: Textual Intelligence & Corpus Engineering",
            description: "Transitioning from raw data acquisition to structured intelligence",
            progress: 0,
            isLocked: false,
            expectedDuration: "20 min",
            lessons: [
                {
                    id: 701,
                    title: "Accessing Text Corpora",
                    duration: "20 min",
                    content: AccessingTextCorpora,
                    quiz: lessonQuizzesData["701"]
                },
                {
                    id: 702,
                    title: "Brown Corpus",
                    duration: "10 min",
                    content: BrownCorpus,
                    quiz: lessonQuizzesData["702"]
                },
                {
                    id: 703,
                    title: "Gutenberg Corpus Explorer",
                    duration: "15 min",
                    isInteractive: true,
                    content: {
                        overview: "Explore the Gutenberg Corpus interactively. Select texts, view content, and analyze word frequencies.",
                        objectives: [
                            "Navigate the Gutenberg file explorer",
                            "View raw and tokenized text",
                            "Use the concordance tool to find word contexts"
                        ],
                        sections: [
                            {
                                type: 'text' as const,
                                title: 'Interactive Explorer',
                                content: 'Head over to the "Interactive" tab to start exploring the Gutenberg Corpus! You can browse files, view their content, and run NLTK-style code snippets to analyze the texts.'
                            }
                        ]
                    },
                    quiz: lessonQuizzesData["703"],
                    interactiveComponent: GutenbergInteractiveLesson
                }
            ]
        },
        {
            id: 31,
            title: "Unit III: Word Embeddings",
            description: "Vector representations of language.",
            progress: 0,
            isLocked: false,
            lessons: [
                { id: 801, title: "Word2Vec & GloVe", duration: "30 min" },
                { id: 802, title: "TF-IDF Weighting", duration: "25 min" },
            ]
        },
        {
            id: 41,
            title: "Unit IV: Sequence Models",
            description: "RNNs, LSTMs, and GRUs for language.",
            progress: 0,
            isLocked: false,
            lessons: [
                { id: 901, title: "Recurrent Networks", duration: "35 min" },
                { id: 902, title: "Attention Mechanism", duration: "40 min" },
            ]
        }
    ],
    actualquizzes: nlpQuizzes,
    achievements: [],
    numericals: [
        {
            id: 1,
            title: "TF-IDF Calculation",
            description: "Calculate the TF-IDF score for a given word in a set of documents.",
            topic: "Word Embeddings",
            difficulty: "Medium" as const,
            xp: 300,
            status: "New" as const
        },
        {
            id: 2,
            title: "Bigram Probability",
            description: "Compute the conditional probability of a word given the previous word in a corpus.",
            topic: "Language Models",
            difficulty: "Easy" as const,
            xp: 150,
            status: "New" as const
        },
        {
            id: 3,
            title: "Viterbi Algorithm",
            description: "Apply the Viterbi algorithm to find the most likely sequence of hidden states.",
            topic: "Sequence Models",
            difficulty: "Hard" as const,
            xp: 500,
            status: "Locked" as const
        }
    ],
    important: [],
    notes: [],
    leaderboard: []
};
