import { Lesson } from "@/lib/types/course";
import { aimlQuizzes } from "@/lib/quizzes/aiml/quizzes";
import { introductionContent } from "@/lib/content/aiml/unit1/Introduction";
import { aiFoundationsContent } from "@/lib/content/aiml/unit1/AIFoundations";
import { aiApproachesContent } from "@/lib/content/aiml/unit1/AIApproaches";
import { intelligentAgentsContent } from "@/lib/content/aiml/unit1/IntelligentAgents";
import { searchAlgosContent } from "@/lib/content/aiml/unit1/SearchAlgos";
import TuringTestSimulator from "@/lib/content/aiml/unit1/AIApproaches";
import AIAgentLesson from "@/lib/content/aiml/unit1/IntelligentAgents";
import { heuristicsContent } from "@/lib/content/aiml/unit2/InformedSearch/heuristics";
import AStarVisualizer, { astarLessonContent } from "@/lib/content/aiml/unit2/InformedSearch/Astar";
import AlphaBetaVisualizer, { alphabetaContent } from "@/lib/content/aiml/unit3/AdversarialSearch/AlphaBeta";

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
        {
          id: "1.1",
          title: "What is AI?",
          duration: "10 min",
          content: introductionContent
        },
        {
          id: "1.2",
          title: "Foundations of AI",
          duration: "15 min",
          content: aiFoundationsContent
        },
        {
          id: "1.3",
          title: "AI Approaches",
          duration: "20 min",
          content: aiApproachesContent,
          isInteractive: true,
          interactiveComponent: TuringTestSimulator
        },
        {
          id: "1.4",
          title: "Intelligent Agents",
          duration: "25 min",
          content: intelligentAgentsContent,
          isInteractive: true,
          interactiveComponent: AIAgentLesson
        },
        {
          id: "1.5",
          title: "Problem Solving Agents",
          duration: "30 min",
          content: searchAlgosContent
        },
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
        {
          id: "2.1",
          title: "Heuristic Functions",
          duration: "20 min",
          content: heuristicsContent
        },
        {
          id: "2.2",
          title: "A* Search Algorithm",
          duration: "35 min",
          isInteractive: true,
          content: astarLessonContent,
          interactiveComponent: AStarVisualizer
        },
      ],
    },
    {
      id: 3,
      title: "Unit III: Adversarial Search",
      description: "Games, Minimax algorithm, and Alpha-Beta pruning.",
      progress: 0,
      isLocked: false,
      active: false,
      lessons: [
        {
          id: "3.1",
          title: "Adversarial Search",
          duration: "30 min",
          isInteractive: true,
          content: alphabetaContent,
          interactiveComponent: AlphaBetaVisualizer
        }
      ]
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

  quizzes: aimlQuizzes,
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
  numericals: [
    { id: 402, title: "Optimal Move - Minimax", description: "Game Theory", topic: "Practical", difficulty: "Hard" as const, status: "Pending" as const, xp: 50, topics: ["Minimax", "Alpha-beta pruning"] },
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
  notes: []
}
