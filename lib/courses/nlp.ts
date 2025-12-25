// lib/courses/courseB.ts
export const nlp = {
  id: "nlp",
  name: "Natural Language Processing",

  features: {
    dashboard: true,
    modules: true,
    quizzes: false,
    achievements: false,
    numericals: false,
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
  quizzes: [{
        id: 101,
        unit: "Unit I",
        title: "Intro to NLP",
        difficulty: "Easy",
        time: "15 min",
        questions: 10,
        status: "Completed",
        score: "90%"
    },
    {
        id: 201,
        unit: "Unit II",
        title: "Text Preprocessing Quiz",
        difficulty: "Medium",
        time: "20 min",
        questions: 12,
        status: "New",
        score: "-"
    },
    {
        id: 301,
        unit: "Unit III",
        title: "Word Embeddings Quiz",
        difficulty: "Hard",
        time: "25 min",
        questions: 15,
        status: "Available",
        score: "-"
    }],
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
}
