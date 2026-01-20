// lib/courses/foundation.ts
import { Course } from "@/lib/types/course";
import { foundationQuizzes } from "@/lib/quizzes/foundation/quizzes";

export const foundation = {
  id: "foundation", // use a URL-safe id
  name: "Foundation (Class 10)",
  description: "Basics of Artificial Intelligence and Machine Learning and Natural Language Processing fundamentals.",

  features: {
    dashboard: true,
    modules: true,
    actualquizzes: true,
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

  actualquizzes: foundationQuizzes,
  achievements: [],
  leaderboard: [],
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
  important: [],
  notes:[]
}
