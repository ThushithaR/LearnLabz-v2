import { supabase } from "./client";
import { getCurrentUserProfile } from "./profile";
import { Quiz, QuizQuestion } from "@/lib/types/course";

// DB Row Types
interface DBQuiz {
  quiz_id: number;
  course_id: number;
  unit_id: number;
  quiz_title: string;
  quiz_difficulty: "Easy" | "Medium" | "Hard";
  quiz_pass_score: number;
  total_questions: number;
  quiz_lesson_mapping: any; // jsonb
  quiz_time: number; // in seconds
  quiz_xp: number;
  quiz_order_index: number;
}

interface DBQuizAttempt {
  qa_id: number;
  user_id: number;
  course_id: number;
  unit_id: number;
  quiz_id: number;
  qa_score: number;
  qa_correct_count: number;
  total_questions: number;
  time_taken_sec: number;
  created_at?: string;
}

export async function getQuizzesByCourse(courseId: number): Promise<Quiz[]> {
  try {
    const user = await getCurrentUserProfile();

    // 1. Fetch all quizzes for the course
    const { data: quizzesData, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("quiz_order_index", { ascending: true });

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError);
      return [];
    }

    // Log for debugging
    console.log(`Fetched ${quizzesData?.length} quizzes for course ${courseId}`);

    const dbQuizzes = quizzesData as DBQuiz[];
    let attempts: DBQuizAttempt[] = [];

    // 2. Fetch all user attempts for this course (ONLY if user exists)
    if (user) {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.user_id)
        .eq("course_id", courseId);

      if (attemptsError) {
        console.error("Error fetching quiz attempts:", attemptsError);
      } else {
        attempts = attemptsData as DBQuizAttempt[];
      }
    }

    // 3. Transform and Calculate Status
    const transformedQuizzes: Quiz[] = [];
    let isPreviousQuizPassed = true; // First quiz is always unlocked

    for (const dbQuiz of dbQuizzes) {
      // Find best attempt for this quiz (highest score)
      const quizAttempts = attempts.filter(a => a.quiz_id === dbQuiz.quiz_id);
      const bestAttempt = quizAttempts.reduce((prev, current) => {
        return (prev && prev.qa_score > current.qa_score) ? prev : current;
      }, null as DBQuizAttempt | null);

      const isPassed = bestAttempt ? bestAttempt.qa_score >= dbQuiz.quiz_pass_score : false;

      let status = "Locked";
      let scoreDisplay = "-";

      if (bestAttempt) {
        if (isPassed) {
          status = "Completed";
          scoreDisplay = `${bestAttempt.qa_score}%`;
        } else {
          // Attempted but failed
          status = "Available"; // Still available to retry
          scoreDisplay = `${bestAttempt.qa_score}%`;
        }
      } else {
        // No attempt yet
        if (isPreviousQuizPassed) {
          status = "Available";
        } else {
          status = "Locked";
        }
      }

      // Formatted Time
      // Smart detection: If time < 100, assume minutes. If > 100, assume seconds.
      const timeVal = dbQuiz.quiz_time;
      const timeInMinutes = timeVal < 100 ? timeVal : Math.ceil(timeVal / 60);

      // Robust JSON Parsing for Question Data
      let rawMapping = dbQuiz.quiz_lesson_mapping;
      // 1. Handle stringified JSON
      if (typeof rawMapping === 'string') {
        try { rawMapping = JSON.parse(rawMapping); } catch (e) { console.error("Failed to parse quiz_lesson_mapping:", e); }
      }

      // 2. Extract Array
      let questionsArray: any[] = [];
      if (Array.isArray(rawMapping)) {
        questionsArray = rawMapping;
      } else if (typeof rawMapping === 'object' && rawMapping !== null) {
        // Check if it's a wrapper like { questions: [...] }
        const possibleArray = Object.values(rawMapping).find(v => Array.isArray(v));
        if (possibleArray) {
          questionsArray = possibleArray as any[];
        } else {
          // Assume it's a map like { "1": {...}, "2": {...} }
          questionsArray = Object.values(rawMapping);
        }
      }

      // 3. Map Fields
      const questionData = questionsArray.map((q: any) => ({
        id: q.id || q.Id || Math.random(),
        question: q.question || q.Question || "Question Text Missing",
        options: q.options || q.Options || q.choices || [],
        correct: q.correct ?? q.Correct ?? q.answer ?? q.answerIndex ?? 0,
        explanation: q.explanation || q.Explanation || "",
        topics: q.topics || []
      } as QuizQuestion));


      transformedQuizzes.push({
        id: dbQuiz.quiz_id,
        unit: `Unit ${dbQuiz.unit_id}`, // Simple mapping, could be enhanced
        unitId: dbQuiz.unit_id,
        courseId: dbQuiz.course_id,
        title: dbQuiz.quiz_title,
        difficulty: (dbQuiz.quiz_difficulty.charAt(0).toUpperCase() + dbQuiz.quiz_difficulty.slice(1).toLowerCase()) as "Easy" | "Medium" | "Hard",
        time: `${timeInMinutes} min`,
        questions: dbQuiz.total_questions,
        xp: dbQuiz.quiz_xp,
        status: status,
        score: scoreDisplay,
        questionData: questionData
      });

      // Update flag for next iteration
      // Check if THIS quiz allows the NEXT one to open
      if (!isPassed) {
        isPreviousQuizPassed = false;
      }
    }

    return transformedQuizzes;

  } catch (error) {
    console.error("Unexpected error in getQuizzesByCourse:", error);
    return [];
  }
}

export async function getQuizById(quizId: number): Promise<Quiz | null> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("quiz_id", quizId)
      .single();

    if (error || !data) {
      console.error("Error fetching quiz:", error);
      return null;
    }

    const dbQuiz = data as DBQuiz;

    // Smart detection for time
    const timeVal = dbQuiz.quiz_time;
    const timeInMinutes = timeVal < 100 ? timeVal : Math.ceil(timeVal / 60);

    // Robust JSON Parsing for Question Data
    let rawMapping = dbQuiz.quiz_lesson_mapping;
    // 1. Handle stringified JSON
    if (typeof rawMapping === 'string') {
      try { rawMapping = JSON.parse(rawMapping); } catch (e) { console.error("Failed to parse quiz_lesson_mapping:", e); }
    }

    // 2. Extract Array
    let questionsArray: any[] = [];
    if (Array.isArray(rawMapping)) {
      questionsArray = rawMapping;
    } else if (typeof rawMapping === 'object' && rawMapping !== null) {
      // Wrapper check
      const possibleArray = Object.values(rawMapping).find(v => Array.isArray(v));
      if (possibleArray) {
        questionsArray = possibleArray as any[];
      } else {
        // Map check
        questionsArray = Object.values(rawMapping);
      }
    }

    // 3. Map Fields
    const questionData = questionsArray.map((q: any, index: number) => {
      // Handle Array format (legacy/optimized) [question, options, correct, explanation]
      if (Array.isArray(q)) {
        return {
          id: index + 1,
          question: q[0] || "Question Text Missing",
          options: q[1] || [],
          correct: q[2] || 0,
          explanation: q[3] || "",
          topics: []
        } as QuizQuestion;
      }

      // Handle Object format
      return {
        id: q.id || q.Id || Math.random(),
        question: q.question || q.Question || "Question Text Missing",
        options: q.options || q.Options || q.choices || [],
        correct: q.correct ?? q.Correct ?? q.answer ?? q.answerIndex ?? 0,
        explanation: q.explanation || q.Explanation || "",
        topics: q.topics || []
      } as QuizQuestion;
    });

    return {
      id: dbQuiz.quiz_id,
      unit: `Unit ${dbQuiz.unit_id}`,
      unitId: dbQuiz.unit_id,
      courseId: dbQuiz.course_id,
      title: dbQuiz.quiz_title,
      difficulty: dbQuiz.quiz_difficulty,
      time: `${timeInMinutes} min`,
      questions: dbQuiz.total_questions,
      xp: dbQuiz.quiz_xp,
      status: "Available", // Helper function typically doesn't check lock status for single fetch unless requested
      score: "-",
      questionData: questionData
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function submitQuizAttempt({
  user_id,
  course_id,
  unit_id,
  quiz_id,
  score,
  correct,
  total,
  time_taken
}: {
  user_id: number;
  course_id: number;
  unit_id: number;
  quiz_id: number;
  score: number;
  correct: number;
  total: number;
  time_taken: number;
}) {
  return supabase.from("quiz_attempts").insert({
    user_id,
    course_id,
    unit_id,
    quiz_id,
    qa_score: score,
    qa_correct_count: correct,
    total_questions: total,
    time_taken_sec: time_taken
  }).select();
}

export async function getDailyQuiz(courseId: number) {
  // 1. Get all quizzes for this course
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("quiz_id, quiz_title, quiz_pass_score")
    .eq("course_id", courseId)
    .order("id");

  if (error || !quizzes || quizzes.length === 0) return null;

  // 2. Get day index (changes once per day globally)
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

  // 3. Cycle through quizzes
  const quiz = quizzes[dayIndex % quizzes.length];

  return {
    quizId: quiz.quiz_id,
    title: quiz.quiz_title,
    description: "Daily practice quiz",
    xp: 500,
  };
}
