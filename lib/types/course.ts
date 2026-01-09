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
    important: boolean;
    actualquizzes: boolean;
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
  important: StarredQuestion[];
  actualquizzes: ActualQuizzes[];
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
  quiz ?: QuizQuestion[];
}
export interface QuizQuestion{
  id:string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation ?: string;
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
  unitId?: number; // Added for DB consistency
  courseId?: number; // Added for DB consistency
  title: string;
  difficulty: string;
  time: string;
  questions: number;
  xp: number,
  status: string;
  score: string;
  questionData?: QuizQuestion[];
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
  avatarUrl?: string | null;
  initial: string;
  tier: string;
  ep: number;
  isUser: boolean;
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
  id: number; // numerical_id
  courseId?: number;
  lessonId?: number;
  title: string; // numerical_title
  description: string; // numerical_problem_statement
  topic: string; // NOT in DB, default to "General"
  difficulty: "Easy" | "Medium" | "Hard"; // numerical_difficulty
  solution?: string;
  status: "Locked" | "New" | "Completed" | "Completing" | "Pending";
  xp: number; // numerical_max_cp
  topics?: string[];
}

export interface Event {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  importance: "Normal" | "High" | "Critical";
  time: string;
  done?: boolean; // optional; false by default
}

export interface StarredQuestion {
  id: string;
  question: string;
  answer?: string;
  options?: string[];
  correct?: number;
  quizTitle: string;
  unit: string;
  difficulty: string;
  time: string;
  course: string;
  moduleId: string;
  questionIndex: number;
}

export interface ActualQuizzes {
  id: number;
  unit: string;
  unitId?: number;
  courseId?: number;
  title: string;
  difficulty: string;
  time: string;
  questions: number;
  xp: number,
  status: string;
  score: string;
  questionData: MainQuiz[];
}

export interface  MainQuiz{
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topics?: string[];
}