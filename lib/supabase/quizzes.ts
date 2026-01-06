import { supabase } from "./client";

export async function getQuizzesByCourse(courseId: number) {
  return supabase
    .from("quizzes")
    .select("*")
    .eq("course_id", courseId);
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
  });
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
