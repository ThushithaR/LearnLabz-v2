// lib/courses/nlp.ts
import { dataAcquisitionContent } from "@/lib/content/nlp/unit1/dataAcquisition";
import { problemStatementContent } from "@/lib/content/nlp/unit1/problemStatement";
import { AccessingTextCorpora } from "@/lib/content/nlp/unit2/AccessingTextCorpora";
import {BrownCorpus} from "@/lib/content/nlp/unit2/BrownCorpus";

export const nlp = {
    id: "nlp",
    name: "Natural Language Processing",
    description: "An introductory course on Natural Language Processing techniques and applications.",

    features: {
        dashboard: true,
        modules: true,
        quizzes: true,
        achievements: true,
        numericals: true,
        notes: true,
        calendar: true,
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
            id: 1,
            title: "Unit I: Introduction to NLP",
            description: "Natural Language Processing basics, history, and data acquisition.",
            progress: 65,
            isLocked: false,
            active: true,
            lessons: [
                {
                    id: "1.1",
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
                    }
                },
                {
                    id: "1.2",
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
                    id: "1.3",
                    title: "Data Acquisition Strategies",
                    duration: "25 min",
                    content: dataAcquisitionContent
                },
                {
                    id: "1.4",
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
            id: 2,
            title: "Unit II: Textual Intelligence & Corpus Engineering",
            description: "Transitioning from raw data acquisition to structured intelligence",
            progress: 0,
            isLocked: false,
            lessons: [
                { id: "2.1", title: "Accessing Text Corpora", duration: "20 min", content: AccessingTextCorpora },
                { id: "2.2", title: "Brown Corpus", duration: "10 min", content: BrownCorpus },
            ]
        },
        {
            id: 3,
            title: "Unit III: Word Embeddings",
            description: "Vector representations of language.",
            progress: 0,
            isLocked: false,
            lessons: [
                { id: "3.1", title: "Word2Vec & GloVe", duration: "30 min" },
                { id: "3.2", title: "TF-IDF Weighting", duration: "25 min" },
            ]
        },
        {
            id: 4,
            title: "Unit IV: Sequence Models",
            description: "RNNs, LSTMs, and GRUs for language.",
            progress: 0,
            isLocked: false,
            lessons: [
                { id: "4.1", title: "Recurrent Networks", duration: "35 min" },
                { id: "4.2", title: "Attention Mechanism", duration: "40 min" },
            ]
        }
    ],
    quizzes: [
        {
            id: 1,
            unit: "Unit I",
            title: "NLP Foundations",
            difficulty: "Easy",
            time: "10 min",
            questions: 1,
            xp: 100,
            status: "New",
            score: "-",
            questionData: [
                {
                    id: 1,
                    question: "What does NLP stand for?",
                    options: ["Natural Language Processing", "Neural Linguistic Program", "Native Language Protocol", "Next Level Process"],
                    correct: 0,
                    explanation: "NLP refers to Natural Language Processing, a subfield of AI focused on human-computer language interaction."
                }
            ]
        },
        {
            id: 2,
            unit: "Unit I",
            title: "NLP History & Scope",
            difficulty: "Medium",
            time: "15 min",
            questions: 2,
            xp: 200,
            status: "Locked",
            score: "-",
            questionData: [
                {
                    id: 1,
                    question: "Which of these was an early rule-based NLP system?",
                    options: ["SHRDLU", "BERT", "GPT-4", "LSTM"],
                    correct: 0,
                    explanation: "SHRDLU was an early natural language understanding program, developed by Terry Winograd at MIT in 1968-1970."
                }
            ]
        },
        {
            id: 3,
            unit: "Unit I",
            title: "Advanced NLP Logic",
            difficulty: "Hard",
            time: "20 min",
            questions: 5,
            xp: 500,
            status: "Locked",
            score: "-",
            questionData: []
        },
        {
            id: 201,
            unit: "Unit II",
            title: "Preprocessing Mastery",
            difficulty: "Easy",
            time: "12 min",
            questions: 10,
            xp: 150,
            status: "Locked",
            score: "-",
            questionData: []
        }
    ],
    achievements: [
        { id: 1, name: "First Token", icon: "🪙", unlocked: true, desc: "Complete your first NLP lesson" },
        { id: 2, name: "Linguist", icon: "🗣️", unlocked: true, desc: "Maintain a 7-day streak in NLP" },
        { id: 3, name: "Context King", icon: "👑", unlocked: false, desc: "Score 100% on the Sequence Models quiz" },
    ],
    leaderboard: [
        { rank: 1, name: "Liam Smith", tier: "NLP Maestro", ep: 12500, avatar: "LS" },
        { rank: 2, name: "Noah Williams", tier: "Data Wrangler", ep: 11200, avatar: "NW" },
        { rank: 3, name: "Emma Brown", tier: "Language Expert", ep: 9800, avatar: "EB" },
        { rank: 4, name: "Olivia Jones", tier: "Token Master", ep: 8500, avatar: "OJ" },
        { rank: 5, name: "Sophie Lee (You)", tier: "NLP Novice", ep: 800, isUser: true, avatar: "SL" },
    ],
    calendar: [
        { id: 1, title: "Unit I Quiz", date: "2025-12-31", importance: "High" as const, time: "23:59" },
        { id: 2, title: "NLP Project Proposal", date: "2026-01-05", importance: "Critical" as const, time: "18:00" },
        { id: 3, title: "Reading: Attention Paper", date: "2026-01-02", importance: "Normal" as const, time: "12:00" },
    ],
    numericals: [
        {
            id: 1,
            title: "TF-IDF Calculation",
            description: "Calculate the TF-IDF score for a given word in a set of documents.",
            topic: "Word Embeddings",
            difficulty: "Medium",
            xp: 300,
            status: "New"
        },
        {
            id: 2,
            title: "Bigram Probability",
            description: "Compute the conditional probability of a word given the previous word in a corpus.",
            topic: "Language Models",
            difficulty: "Easy",
            xp: 150,
            status: "New"
        },
        {
            id: 3,
            title: "Viterbi Algorithm",
            description: "Apply the Viterbi algorithm to find the most likely sequence of hidden states.",
            topic: "Sequence Models",
            difficulty: "Hard",
            xp: 500,
            status: "Locked"
        }
    ],
    notes: [
        {
            id: 1,
            title: "Introduction to NLP Basics",
            content: "<h2>Core Concepts</h2><p>Natural Language Processing is bridging the gap between human communication and computer understanding.</p><ul><li><b>Syntax:</b> Sentence structure</li><li><i>Semantics:</i> Meaning of words</li><li><u>Pragmatics:</u> Context of usage</li></ul><p><span style='background-color: #facc15'>Key takeaway:</span> Data quality is crucial for model performance.</p>",
            type: "Module",
            emoji: "📚"
        }
    ]
};
