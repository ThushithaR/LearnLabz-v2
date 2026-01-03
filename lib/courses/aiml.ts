// lib/courses/courseA.ts
import { Lesson } from "@/lib/types/course";

export const aiml = {
  id: "aiml", // use a URL-safe id
  name: "Artificial Intelligence and Machine Learning",
  description: "A comprehensive course on Artificial Intelligence and Machine Learning fundamentals.",

  features: {
    dashboard: true,
    modules: true,
    quizzes: true,
    achievements: true,
    numericals: true,
    notes: false,
    calendar: true,
    important: true,
  },

  user: {
    name: "Alex Chen",
    email: "alex@learnlabz.com",
    tier: "Algorithm Adept",
    ep: 1250,
    epToNext: 2000,
    streak: 14,
    modulesCompleted: 3,
    quizzesPassed: 12,
    level: 5,
    avatar: "/avatars/alex.png",
  },

  modules: [
    {
      id: 1,
      title: "Unit I: Introduction to AI",
      description: "History, Intelligent Agents, and Problem Solving agents.",
      progress: 100,
      isLocked: false,
      lessons: [
        { id: "1.1", title: "What is AI?", duration: "10 min" },
        { id: "1.2", title: "History of AI", duration: "15 min" },
      ],
    },
    {
      id: 2,
      title: "Unit II: Informed Search Strategies",
      description: "Heuristics, A* Search, and Best-first search algorithms.",
      progress: 45,
      isLocked: false,
      active: true,
      lessons: [
        { id: "2.1", title: "Heuristic Functions", duration: "20 min" },
        { id: "2.2", title: "A* Search Algorithm", duration: "35 min", isInteractive: true },
      ],
    },
    {
      id: 3,
      title: "Unit III: Adversarial Search",
      description: "Game Theory, Minimax algorithm, and Alpha-Beta pruning.",
      progress: 0,
      isLocked: false,
      lessons: [
        { id: "3.1", title: "Game Theory Basics", duration: "25 min" },
        { id: "3.2", title: "Minimax Algorithm", duration: "30 min" },
      ],
    },
    {
      id: 4,
      title: "Unit IV: Constraint Satisfaction",
      description: "Definition, Constraint Propagation, and Backtracking.",
      progress: 0,
      isLocked: false,
      lessons: [
        { id: "4.1", title: "CSP Definition", duration: "15 min" },
        { id: "4.2", title: "Backtracking Search", duration: "25 min" },
      ],
    },
    {
      id: 5,
      title: "Unit V: Neural Networks",
      description: "Perceptrons, Backpropagation, and Deep Learning basics.",
      progress: 0,
      isLocked: false,
      lessons: [
        { id: "5.1", title: "Artificial Neurons", duration: "20 min" },
        { id: "5.2", title: "Activation Functions", duration: "15 min" },
      ],
    },
  ],

  quizzes: [
    {
      id: 101,
      unit: 'Unit I',
      title: 'Introduction to AI',
      difficulty: 'Easy',
      time: '15 min',
      questions: 10,
      xp: 50,
      status: 'Completed',
      score: '85%',
      questionData: [
        {
          id: 1,
          question: 'What does AI stand for?',
          options: ['Artificial Intelligence', 'Automated Integration', 'Advanced Interface', 'Algorithmic Implementation'],
          correct: 0,
          explanation: 'AI stands for Artificial Intelligence, which is the simulation of human intelligence in machines.',
          topics: ['BFS', 'DFS', 'Heuristic Search']
        },
        {
          id: 2,
          question: 'Which of the following is NOT a component of an intelligent agent?',
          options: ['Percepts', 'Actions', 'Environment', 'Database'],
          correct: 3,
          explanation: 'Intelligent agents consist of percepts (inputs), actions (outputs), and environment, but not necessarily a database.',
          topics: ['BFS', 'DFS', 'Heuristic Search'],
        },
        // Add more questions...
      ]
    },
    {
      id: 102,
      unit: 'Unit I',
      title: 'Introduction to AI ',
      difficulty: 'Medium',
      time: '25 min',
      questions: 15,
      xp: 100,
      status: 'Available',
      score: '-',
      topics: ['AI Applications', 'Agent Types', 'Search Algorithms'],
      questionData: [
        // Medium level questions for Unit I
      ]
    },
    {
      id: 103,
      unit: 'Unit I',
      title: 'Introduction to AI' ,
      difficulty: 'Hard',
      time: '35 min',
      questions: 20,
      xp: 200,
      status: 'Locked',
      score: '-',
      questionData: [
        // Hard level questions for Unit I
      ]
    },
    {
      id: 201,
      unit: 'Unit II',
      title: 'Search Strategies',
      difficulty: 'Easy',
      time: '20 min',
      questions: 12,
      xp: 60,
      status: 'Available',
      score: '-',
      questionData: [
        // Easy questions for Unit II
      ]
    },
    // Add more quizzes for other units...
  ],

  achievements: [
    { id: 1, name: "First Steps", icon: "🚀", unlocked: true, desc: "Complete your first lesson" },
    { id: 2, name: "Week Warrior", icon: "🔥", unlocked: true, desc: "Maintain a 7-day streak" },
    { id: 3, name: "Quiz Master", icon: "🧠", unlocked: false, desc: "Score 100% on 3 quizzes" },
    { id: 4, name: "Bug Hunter", icon: "🐛", unlocked: false, desc: "Report a bug" },
  ],
  leaderboard: [
    { rank: 1, name: "Sarah Connor", tier: "AI Virtuoso", ep: 15400, avatar: "SC" },
    { rank: 2, name: "Marcus Aurelius", tier: "Master Thinker", ep: 14200, avatar: "MA" },
    { rank: 3, name: "Ada Lovelace", tier: "Algorithm Adept", ep: 13950, avatar: "AL" },
    { rank: 4, name: "Alan Turing", tier: "Enlightened Mind", ep: 13100, avatar: "AT" },
    { rank: 5, name: "Grace Hopper", tier: "Curious Scholar", ep: 11000, avatar: "GH" },
    { rank: 142, name: "Alex Chen (You)", tier: "Algorithm Adept", ep: 1250, isUser: true, avatar: "AC" },
  ],
  notes: [
      { id: 1, title: "Heuristics Draft", content: "Heuristics are crucial for informed search...\n\n\"A admissible heuristic never overestimates the cost.\"\n\nThings to remember regarding Euclidean vs Manhattan distance:\n- Manhattan is good for grid movements (4-way)\n- Euclidean is better for any-angle movement", type: "Module" as const, emoji: "📝" },
      { id: 2, title: "Project Ideas", content: "1. AI Chess Bot\n2. Pathfinding Visualizer\n3. Spam Classifier", type: "General" as const, emoji: "💡" },
      { id: 3, title: "Heuristic Algorithms", content: "Heuristic algorithms are used in AI to find solutions faster...\n\n- A* algorithm\n- Greedy algorithm", type: "Module" as const, emoji: "🧠" },
      { id: 4, title: "AI Ethics", content: "What are the ethical implications of AI?\n- AI bias\n- Privacy concerns", type: "General" as const, emoji: "⚖️" },
    ],
    numericals : [
    { id: 402, title: "Optimal Move - Minimax", description: "Game Theory", topic: "Practical", difficulty: "Hard" as const, status: "Pending" as const, xp: 50, topics :["Minimax","Alpha-beta pruning"]},
    { id: 105, title: "A* Heuristic Estimation", description: "Informed Search", topic: "Practical", difficulty: "Medium" as const, status: "Completing" as const, xp: 30 },
    { id: 208, title: "Alpha-Beta Pruning Count", description: "Game Theory", topic: "Practical", difficulty: "Hard" as const, status: "Locked" as const, xp: 50 },
    { id: 101, title: "BFS Path Cost", description: "Uninformed Search", topic: "Practical", difficulty: "Easy" as const, status: "Completed" as const, xp: 15 },
    { id: 303, title: "Neural Net Weights", description: "Neural Networks", topic: "Practical", difficulty: "Medium" as const, status: "New" as const, xp: 30 },
  ],
  calendar: [
    { id: 1, title: "Unit IV Assessment", date: "2025-12-29", importance: "Critical" as const, time: "14:00", done: true },
    { id: 2, title: "Project Submission", date: "2025-12-24", importance: "High" as const, time: "23:59", done: true },
    { id: 3, title: "AI Ethics Discussion", date: "2025-12-25", importance: "Normal" as const, time: "10:00" },
  ],
  important: []
}
