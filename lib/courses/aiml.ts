// lib/courses/courseA.ts
import { Lesson } from "@/lib/types/course";

export const aiml = {
  id: "aiml", // use a URL-safe id
  name: "Artificial Intelligence and Machine Learning",
  
  features: {
    dashboard: true,
    modules: true,
    quizzes: true,
    achievements: true,
    numericals: false,
    notes: false,
    calendar: true,
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
      unit: "Unit I",
      title: "Intro to AI: Basics",
      difficulty: "Easy",
      time: "15 min",
      questions: 10,
      status: "Completed",
      score: "85%",
    },
    {
      id: 201,
      unit: "Unit II",
      title: "Heuristic Search Methods",
      difficulty: "Medium",
      time: "25 min",
      questions: 15,
      status: "New",
      score: "-",
    },
    {
      id: 301,
      unit: "Unit III",
      title: "Game Theory & Minimax",
      difficulty: "Hard",
      time: "30 min",
      questions: 12,
      status: "Available",
      score: "-",
    },
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
}
