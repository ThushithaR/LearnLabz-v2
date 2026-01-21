// lib/courses/foundation.ts
import { Course } from "@/lib/types/course";
import { foundationQuizzes } from "@/lib/quizzes/foundation/quizzes";
import { revisitingAIMLDL } from "@/lib/content/tenth/chapter2/RevisitingAIMLDL";
import { modelling } from "@/lib/content/tenth/chapter2/Modelling";

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
      id: 71,
      title: "Unit II: Advanced concepts of Modelling in AI",
      order:1,
      description: "Types of AIML models",
      progress: 100,
      isLocked: false,
      lessons: [
        { id: 1001, title: "Revisiting AI, ML and DL", duration: "10 min", content: revisitingAIMLDL },
        { id: 1002, title: "Modelling", duration: "15 min", content: modelling },
        { id: 1003, title: "Neural Networks", duration: "20 min" },
      ],
    },
    {
      id: 81,
      title: "Unit III: Evaluating Models",
      order:2,
      description: "Understanding model performance metrics",
      progress: 45,
      isLocked: false,
      active: true,
      lessons: [
        { id: 1101, title: "Importance of Model Evaluation", duration: "20 min" },
        { id: 1102, title: "Splitting the training set data for evaluation", duration: "35 min", isInteractive: true },
        { id: 1103, title: "What is Accuracy and Error?", duration: "25 min" },
        { id: 1104, title: "Evaluation metrics for classification", duration: "30 min" },
        {id: 1105, title: "Ethical concerns around model evaluation", duration: "30 min" },
      ],
    },
    {
      id: 91,
      title: "Unit V: Computer Vision",
      order:3,
      description: "Image Processing, Convolutional Neural Networks, and Applications.",
      progress: 0,
      isLocked: false,
      lessons: [
        { id: 1201, title: "Introduction to Computer Vision", duration: "30 min" },
        { id: 1202, title: "Applications of CV", duration: "25 min" },
        { id: 1203, title: "Computer Vision Tasks", duration: "30 min" },
        { id: 1204, title: "No-Code AI Tools", duration: "30 min" },
        { id: 1205, title: "Image Features", duration: "30 min" },
        { id: 1206, title: "Convolution", duration: "30 min" },
        { id: 1207, title: "Convolution Neural Network", duration: "30 min" },
        { id: 1208, title: "Python libraries in Computer Vision", duration: "30 min" },
      ],
    },
    {
      id: 101,
      title: "Unit VI: Natural Language Processing",
      order:4,
      description: "Text Processing, Language Models, and Applications.",
      progress: 0,
      isLocked: false,
      lessons: [
        { id: 1301, title: "Introduction to Natural Language Processing", duration: "15 min" },
        { id: 1302, title: "Applications of Natural Language Processing", duration: "25 min" },
        { id: 1303, title: "Stages of Natural Language Processing", duration: "30 min" },
        { id: 1304, title: "Chatbots", duration: "30 min" },
        { id: 1305, title: "Text Processing", duration: "30 min" },
        { id: 1306, title: "NLP: Use Case Walkthrough", duration: "30 min" },
      ],
    },
  ],

  actualquizzes: foundationQuizzes,
  achievements: [],
  leaderboard: [],
  numericals : [],
  calendar: [],
  important: [],
  notes:[]
}