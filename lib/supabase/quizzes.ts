import { supabase } from "./client";
import { getCurrentUserProfile } from "./profile";
import { ActualQuizzes, MainQuiz } from "@/lib/types/course";

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
  quiz_id: number;
  qa_score: number;
  qa_correct_count: number;
  total_questions: number;
  time_taken_sec: number;
  created_at?: string;
}

import { aimlQuizzes } from "@/lib/quizzes/aiml/quizzes";
import { nlpQuizzes } from "@/lib/quizzes/nlp/quizzes";

export async function getQuizzesByCourse(courseId: number): Promise<ActualQuizzes[]> {
  try {
    const user = await getCurrentUserProfile();

    // 1. Fetch all quizzes for the course
    const { data: quizzesData, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("quiz_order_index", { ascending: true });

    let dbQuizzes = quizzesData as DBQuiz[] || [];

    // FALLBACK: If DB is empty
    if (!dbQuizzes || dbQuizzes.length === 0) {
      console.warn("DB Quizzes empty. Please seed the database.");
      return [];
    }

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError);
      return [];
    }

    // Log for debugging
    console.log(`Fetched ${quizzesData?.length} quizzes for course ${courseId}`);

    let attempts: DBQuizAttempt[] = [];

    // 1.a Fetch unit titles for mapping
    const { data: unitsData, error: unitsError } = await supabase
      .from("units")
      .select("unit_id, unit_title")
      .eq("course_id", courseId);

    if (unitsError) {
      console.error("Error fetching units:", unitsError);
    }
    const unitTitleMap = new Map<number, string>();
      unitsData?.forEach((u) => {
        unitTitleMap.set(u.unit_id, u.unit_title);
      });

    // 2. Fetch all user attempts for quizzes in this course using join (ONLY if user exists)
    if (user) {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes!inner(*)")
        .eq("user_id", user.user_id)
        .eq("quizzes.course_id", courseId);

      if (attemptsError) {
        console.error("Error fetching quiz attempts:", attemptsError);
      } else {
        attempts = attemptsData as DBQuizAttempt[];
      }
    }

    // 3. Transform and Calculate Status
    const transformedQuizzes: ActualQuizzes[] = [];
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
      } as MainQuiz));


      transformedQuizzes.push({
        id: dbQuiz.quiz_id,
        unit: unitTitleMap.get(dbQuiz.unit_id) ?? `Unit ${dbQuiz.unit_id}`,
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

export async function getQuizById(quizId: number): Promise<ActualQuizzes | null> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("quiz_id", quizId)
      .single();

    if (error || !data) {
      console.warn("Quiz not found in DB, checking static fallback...");
      const staticQuiz = aimlQuizzes.find(q => q.id === quizId) || nlpQuizzes.find(q => q.id === quizId);
      if (staticQuiz) {
        return {
          ...staticQuiz,
          courseId: quizId < 400 ? 1 : 2, // 🎯 AIML IDs are 1xx/2xx, NLP are 6xx/7xx
          unitId: typeof staticQuiz.unit === 'string' ? (parseInt(staticQuiz.unit.replace(/\D/g, '')) || 1) : (staticQuiz as any).unitId || 1,
          difficulty: staticQuiz.difficulty as any,
          status: "Available"
        };
      }
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
        } as MainQuiz;
      }

      // Handle Object format
      return {
        id: q.id || q.Id || Math.random(),
        question: q.question || q.Question || "Question Text Missing",
        options: q.options || q.Options || q.choices || [],
        correct: q.correct ?? q.Correct ?? q.answer ?? q.answerIndex ?? 0,
        explanation: q.explanation || q.Explanation || "",
        topics: q.topics || []
      } as MainQuiz;
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
  quiz_id,
  score,
  correct,
  total,
  time_taken
}: {
  user_id: number;
  quiz_id: number;
  score: number;
  correct: number;
  total: number;
  time_taken: number;
}) {
  const { data, error } = await supabase.from("quiz_attempts").insert({
    user_id,
    quiz_id,
    qa_score: score,
    qa_correct_count: correct,
    total_questions: total,
    time_taken_sec: time_taken
  }).select().single();

  if (!error && data) {
    // 🎯 Trigger Digital Twin Recalculation
    // We need course_id. Fetch from quiz if not passed?
    // Actually, getQuizById can help, or we assume caller might handle it.
    // For now, let's fetch course_id to sync.
    const { data: q } = await supabase.from("quizzes").select("course_id").eq("quiz_id", quiz_id).single();
    if (q) {
      const { syncDigitalTwin } = await import("./user-courses");
      syncDigitalTwin(user_id, q.course_id);
    }
  }

  return { data, error };
}

export async function getDailyQuiz(courseId: number) {
  // 1. Get all quizzes for this course
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("quiz_id, quiz_title, quiz_pass_score")
    .eq("course_id", courseId)
    .order("quiz_id");

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
