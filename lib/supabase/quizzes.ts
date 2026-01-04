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
