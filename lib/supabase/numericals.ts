import { supabase } from "./client";

export async function getNumericalsByLesson(lessonId: number) {
  return supabase
    .from("numericals")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("numerical_active", true)
    .order("numerical_order_index");
}

export async function submitNumericalAttempt({
  user_id,
  numerical_id,
  is_correct,
  penalty_percent,
  cp,
  time_taken
}: {
  user_id: number;
  numerical_id: number;
  is_correct: boolean;
  penalty_percent: number;
  cp: number;
  time_taken: number;
}) {
  return supabase.from("numerical_attempts").insert({
    user_id,
    numerical_id,
    is_correct,
    penalty_percent,
    numerical_got_cp: cp,
    time_taken_sec: time_taken
  });
}
