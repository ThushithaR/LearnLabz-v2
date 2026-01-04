import { supabase } from "./client";

export async function upsertLessonProgress({
  user_id,
  course_id,
  unit_id,
  lesson_id,
  lesson_time_spent,
  lesson_progress_percent,
  completed
}: {
  user_id: number;
  course_id: number;
  unit_id: number;
  lesson_id: number;
  lesson_time_spent: number;
  lesson_progress_percent: number;
  completed: boolean;
}) {
  return supabase.from("lesson_progress").upsert({
    user_id,
    course_id,
    unit_id,
    lesson_id,
    lesson_time_spent_sec: lesson_time_spent,
    lesson_progress_percent: lesson_progress_percent,
    completed
  });
}

export async function updateUnitProgress({
  user_id,
  course_id,
  unit_id,
  quiz_score,
  unlocked,
  progress_percent
}: {
  user_id: number;
  course_id: number;
  unit_id: number;
  quiz_score: number;
  unlocked: boolean;
  progress_percent: number;
}) {
  return supabase.from("unit_progress").upsert({
    user_id,
    course_id,
    unit_id,
    unit_quiz_score: quiz_score,
    unit_unlocked: unlocked,
    unit_progress_percent: progress_percent
  });
}

export async function updateUserStreak(
  userId: number,
  courseId: number
) {
  const { data } = await supabase
    .from("user_courses")
    .select("streak_days, last_active")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (!data) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;

  if (data.last_active) {
    const last = new Date(data.last_active);
    last.setHours(0, 0, 0, 0);

    const diffDays =
      (today.getTime() - last.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      return; // same day → no change
    }

    if (diffDays === 1) {
      newStreak = data.streak_days + 1;
    }
  }

  await supabase
    .from("user_courses")
    .update({
      streak_days: newStreak,
      last_active: today.toISOString(),
    })
    .eq("user_id", userId)
    .eq("course_id", courseId);
}
