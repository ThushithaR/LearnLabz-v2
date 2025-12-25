export interface Course {
  id: string; // course slug or URL-safe id
  name: string; // course name

  features: {
    dashboard: boolean;
    modules: boolean;
    quizzes: boolean;
    achievements: boolean;
    numericals: boolean;
    notes: boolean;
    calendar: boolean;
  };

  user: {
    name: string;
    email: string;
    tier: string;
    ep: number;
    epToNext: number;
    streak: number;
    modulesCompleted: number;
    quizzesPassed: number;
    level: number;
    avatar: string;
  };

  modules: Module[];
  quizzes: Quiz[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isInteractive?: boolean; // optional
}

export interface Module {
  id: number;
  title: string;
  description: string;
  progress: number;
  isLocked: boolean;
  active?: boolean;
  lessons: Lesson[];
}

export interface Quiz {
  id: number;
  unit: string;
  title: string;
  difficulty: string;
  time: string;
  questions: number;
  status: string;
  score: string;
}

export interface Achievement {
  id: number;
  name: string;
  icon: string;
  unlocked: boolean;
  desc: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  tier: string;
  ep: number;
  avatar: string;
  isUser?: boolean;
}