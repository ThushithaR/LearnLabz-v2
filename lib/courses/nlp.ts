// lib/courses/courseB.ts
import { Lesson } from "@/lib/types/course";
export const nlp = {
    id: "nlp",
    name: "Natural Language Processing",

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
    modules: [{
        id: 1,
        title: "Unit I: Introduction to NLP",
        description: "Natural Language Processing basics, history, and applications.",
        progress: 100,
        isLocked: false,
        lessons: [
            { id: "1.1", title: "What is NLP?", duration: "10 min" },
            { id: "1.2", title: "History of NLP", duration: "15 min" },
        ]
    },
    {
        id: 2,
        title: "Unit II: Text Preprocessing",
        description: "Tokenization, stemming, lemmatization, and stopwords.",
        progress: 50,
        isLocked: false,
        active: true,
        lessons: [
            { id: "2.1", title: "Tokenization", duration: "20 min" },
            { id: "2.2", title: "Stemming vs Lemmatization", duration: "25 min" },
        ]
    },
    {
        id: 3,
        title: "Unit III: Word Embeddings",
        description: "Word2Vec, GloVe, and vector representation of text.",
        progress: 0,
        isLocked: false,
        lessons: [
            { id: "3.1", title: "Word2Vec Basics", duration: "25 min" },
            { id: "3.2", title: "GloVe Embeddings", duration: "30 min" },
        ]
    },
    {
        id: 4,
        title: "Unit IV: NLP Applications",
        description: "Sentiment Analysis, Named Entity Recognition, and Chatbots.",
        progress: 0,
        isLocked: true,
        lessons: [
            { id: "4.1", title: "Sentiment Analysis", duration: "20 min" },
            { id: "4.2", title: "NER & Chatbots", duration: "30 min" },
        ]
    }],
    quizzes: [
      {
        id: 101,
        title: 'Introduction to NLP - Easy',
        unit: 'Unit I',
        difficulty: 'Easy',
        time: '15 min',
        questions: 10,
        xp: 50,
        status: 'Completed',
        score: '90%',
        questionData: [
          {
            id: 1,
            question: 'What does NLP stand for?',
            options: ['Natural Language Processing', 'Neural Language Programming', 'Network Language Protocol', 'Natural Learning Process'],
            correct: 0,
            explanation: 'NLP stands for Natural Language Processing, which involves the interaction between computers and human language.'
          },
          {
            id: 2,
            question: 'Which of the following is a common NLP task?',
            options: ['Image recognition', 'Speech synthesis', 'Data compression', 'Network routing'],
            correct: 1,
            explanation: 'Speech synthesis is a common NLP task where text is converted to spoken language.'
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
        questions: 12,
        xp: 75,
        status: 'New',
        score: '-',
        questionData: [
          // Medium level questions for Unit I
        ]
      },
      {
        id: 103,
        title: 'Introduction to NLP - Hard',
        unit: 'Unit I',
        difficulty: 'Hard',
        time: '25 min',
        questions: 15,
        xp: 150,
        status: 'Available',
        score: '-',
        questionData: [
          // Hard level questions for Unit I
        ]
      },
      {
        id: 201,
        title: 'Text Preprocessing - Easy',
        unit: 'Unit II',
        difficulty: 'Easy',
        time: '18 min',
        questions: 11,
        xp: 55,
        status: 'Available',
        score: '-',
        questionData: [
          // Easy questions for Unit II
        ]
      },
      // Add more quizzes for other units...
    ],
    achievements: [{ id: 1, name: "First Steps", icon: "🚀", unlocked: true, desc: "Complete your first NLP lesson" },
      { id: 2, name: "Text Pro", icon: "📝", unlocked: false, desc: "Complete all preprocessing lessons" },
      { id: 3, name: "Quiz Master", icon: "🧠", unlocked: false, desc: "Score 100% on 3 quizzes" },],
    leaderboard: [
      { rank: 1, name: "John Doe", tier: "Language Expert", ep: 13400, avatar: "JD" },
      { rank: 2, name: "Jane Smith", tier: "Syntax Master", ep: 12950, avatar: "JS" },
      { rank: 3, name: "Alice Wong", tier: "Grammar Guru", ep: 12600, avatar: "AW" },
      { rank: 4, name: "Bob Li", tier: "Semantics Savant", ep: 12000, avatar: "BL" },
      { rank: 5, name: "Charlie Kim", tier: "Linguist", ep: 11000, avatar: "CK" },
      { rank: 32, name: "Alex Chen (You)", tier: "Syntax Master", ep: 980, isUser: true, avatar: "AC" },
    ],
    notes: [
        {
            id: 1,
            title: "NLP Overview",
            content: "Natural Language Processing (NLP) is a field of AI that deals with the interaction between computers and human language. It includes tasks such as text classification, tokenization, and named entity recognition.",
            type: "Module" as const,
            emoji: "📘"
        },
        {
            id: 2,
            title: "Text Preprocessing",
            content: "Text preprocessing includes steps like tokenization, removing stop words, stemming, and lemmatization to clean and prepare text data for analysis and machine learning tasks.",
            type: "Module" as const,
            emoji: "🧹"
        },
        {
            id: 3,
            title: "Machine Translation",
            content: "Machine translation involves using algorithms to translate text from one language to another. Examples include Google Translate and deep learning-based translation models.",
            type: "Module" as const,
            emoji: "🌍"
        },
        {
            id: 4,
            title: "Chatbot Design",
            content: "Chatbots are systems that interact with users in natural language. Key components of chatbot design include intent recognition, entity extraction, and response generation.",
            type: "Module" as const,
            emoji: "🤖"
        },
        {
            id: 5,
            title: "Sentiment Analysis",
            content: "Sentiment analysis is the process of analyzing text to determine whether the sentiment expressed is positive, negative, or neutral. It's widely used in customer feedback analysis.",
            type: "Module" as const,
            emoji: "💬"
        },
        {
            id: 6,
            title: "NLP Applications",
            content: "NLP is used in many real-world applications, including voice assistants like Siri and Alexa, social media analysis, and document classification.",
            type: "General" as const,
            emoji: "🛠️"
        },
    ],
    numericals: [
        { id: 501, title: "TF-IDF Vectorization", description: "Text Processing", topic: "Tf-idf", difficulty: "Medium" as const, status: "Pending" as const, xp: 40 },
        { id: 502, title: "N-Gram Language Model", description: "Language Models", topic: "N Grams", difficulty: "Hard" as const, status: "Pending" as const, xp: 30 },
        { id: 503, title: "Sentiment Analysis Accuracy", description: "Sentiment Analysis", topic: "Accuracy", difficulty: "Easy" as const, status: "Completed" as const, xp: 30 },
        { id: 504, title: "Word Embedding Similarity", description: "Word Embeddings", topic: "Embeddings", difficulty: "Medium" as const, status: "Pending" as const, xp: 20 },
        { id: 505, title: "POS Tagging Precision", description: "Part-of-Speech Tagging", topic: "Precision", difficulty: "Hard" as const, status: "Locked" as const, xp: 25 },
    ],
    calendar: [
        { id: 1, title: "Unit II Quiz", date: "2025-12-27", importance: "High" as const, time: "15:00" },
        { id: 2, title: "NLP Project Deadline", date: "2025-12-26", importance: "Critical" as const, time: "23:59" },
        { id: 3, title: "Word Embeddings Workshop", date: "2025-12-27", importance: "Normal" as const, time: "11:00" },
    ],
}
