export interface Course {
  id: string; // course slug or URL-safe id
  name: string; // course name
  description: string; // course description

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
  notes: Note[];
  numericals?: Numerical[];
  calendar?: Event[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isInteractive?: boolean; // optional
  content?: {
    overview?: string;
    quoteOfTheDay?: string;
    quoteAttribution?: string;
    objectives?: string[];
    sections?: LessonSection[];
    problemStatement?: {
      problem: string;
      twist?: string;
      hints?: string[];
      solution?: string | React.ReactNode;
    };
  };
}

export interface ProblemStatementContent {
  problem: string;
  twist?: string;
  hints?: string[];
  solution?: string | React.ReactNode;
}

export interface LessonSection {
  type: 'text' | 'problem-statement' | 'examples' | 'summary' | 'interactive';
  title?: string;
  content: string | React.ReactNode | ProblemStatementContent;
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
  xp: number,
  status: string;
  score: string;
  questionData?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
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

export interface Note {
  id: number;            // Unique identifier for the note
  title: string;         // Title of the note
  subtitle?: string;      // Optional: Subtitle of the note
  content: string;       // Content of the note (could be plain text, markdown, etc.)
  type: "Module" | "General";  // Type of note: can be Module or General
  emoji?: string;         // Optional: Emoji representing the note
  createdAt?: string;    // Optional: Date the note was created
  updatedAt?: string;    // Optional: Date the note was last updated
}

export interface Numerical {
  id: number; // Unique identifier for the numerical problem
  title: string; // Title of the numerical problem
  description: string; // Description of the problem
  topic: string // Type of numerical: Theory or Practical
  difficulty: "Easy" | "Medium" | "Hard"; // Difficulty level
  solution?: string; // Solution or steps to solve the problem (optional)
  status: "Locked" | "New" | "Completed" | "Completing" | "Pending"; // Current status of the problem
  xp: number
}

export interface Event {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  importance: "Normal" | "High" | "Critical";
  time: string;
  done?: boolean; // optional; false by default
}
