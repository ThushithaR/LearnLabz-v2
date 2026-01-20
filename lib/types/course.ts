export interface Course {
  id: string; // course slug or URL-safe id
  name: string; // course name
  description: string; // course description

  features: {
    dashboard: boolean;
    modules: boolean;
    actualquizzes: boolean;
    achievements: boolean;
    numericals: boolean;
    notes: boolean;
    calendar: boolean;
    important: boolean;
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
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  notes: Note[];
  numericals?: Numerical[];
  calendar?: Event[];
  important: StarredQuestion[];
  actualquizzes: ActualQuizzes[];
}

export interface Lesson {
  id: number | string;
  title: string;
  duration: string;
  isInteractive?: boolean; // optional
  interactiveComponent?: any; // Component to render for interactive lessons
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
  quiz?: QuizQuestion[];
}
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
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
  expectedDuration?: string;
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
  initial?: string;
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

export interface MainQuiz {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topics?: string[];
}

export interface LearnerProfile {
  quiz_performance: {
    accuracy: number; // 1.1
    trend: number;    // 1.3 (AVG(last 3) - AVG(prev 3))
    difficulty_wise_accuracy: { easy: number; medium: number; hard: number }; // 1.4
  };
  time_analysis: {
    lesson_time_ratios: Record<number, {
      actual_time_sec: number; // 2.1
      expected_time_sec: number; // 2.2
      ratio: number; // 2.3
      status: 'rushing' | 'ideal' | 'struggling'; // 2.3 logic
    }>;
    quiz_time_ratio: number; // 2.4
  };
  attempt_behavior: {
    first_attempt_accuracy: number; // 4.1
    retry_depth: number; // 4.2
    avg_attempt_time: number; // 4.3
    guessing_flag: boolean; // 4.4
  };
  unit_metrics: Record<number, {
    completion_percent: number; // 5.1
  }>;
  course_signals: {
    progress_percent: number; // 6.1
    streak_days: number; // 6.2
    engagement_rate: number; // 6.3
  };
  focus_lessons: Array<{
    lesson_id: number;
    unit_id: number;
    lesson_title: string;
    reason: 'low_accuracy' | 'rushing' | 'struggling';
  }>;
  last_updated: string;
}
