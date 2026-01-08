import { supabase } from "./client";

export async function getUserCourseStats(userId: number, courseId: number) {
  return supabase
    .from("user_courses")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
}

export async function enrollUserInCourse(userId: number, courseId: number) {
  // Check if row exists
  const { data: existing, error } = await getUserCourseStats(userId, courseId);

  if (existing) {
    // Just update last_active
    return supabase
      .from("user_courses")
      .update({
        last_active: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();
  }

  // Insert new row
  return supabase
    .from("user_courses")
    .insert({
      user_id: userId,
      course_id: courseId,
      xp: 0,
      level: 1,
      streak_days: 0,
      uc_progress_percent: 0,
      quizzes_passed: 0,
      numericals_solved: 0,
      last_active: new Date().toISOString(),
    })
    .select()
    .single();
}

export async function addXpToUserCourse(
  userId: number,
  courseId: number,
  xpToAdd: number
) {
  // Get current stats
  const { data, error } = await getUserCourseStats(userId, courseId);
  if (error || !data) throw error;

  const newXp = data.xp + xpToAdd;

  // Simple level logic (example)
  const newLevel = Math.floor(newXp / 100) + 1;

  return supabase
    .from("user_courses")
    .update({
      xp: newXp,
      level: newLevel,
      last_active: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .select()
    .single();
}

export async function onQuizCompleted(
  userId: number,
  courseId: number,
  xpGained: number
) {
  // Get current row
  const { data, error } = await getUserCourseStats(userId, courseId);
  if (error || !data) throw error;

  const newXp = data.xp + xpGained;
  const newLevel = Math.floor(newXp / 100) + 1;

  return supabase
    .from("user_courses")
    .update({
      xp: newXp,
      level: newLevel,
      quizzes_passed: (data.quizzes_passed || 0) + 1,
      last_active: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .select()
    .single();
}
