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
    })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .select()
    .single();
}

/* =========================
   DIGITAL TWIN DATA FETCHER
   ========================= */
export async function getUserDigitalTwinData(userId: number, courseId: number) {
  try {
    const [quizAttemptsRes, lessonProgressRes, unitProgressRes, userStatsRes] = await Promise.all([
      supabase.from("quiz_attempts")
        .select(`*, quizzes!inner(course_id, unit_id, quiz_time, quiz_difficulty, quiz_title)`)
        .eq("user_id", userId)
        .eq("quizzes.course_id", courseId)
        .order("qa_id", { ascending: false }),

      supabase.from("lesson_progress")
        .select(`*, lessons!inner(course_id, unit_id, title)`)
        .eq("user_id", userId)
        .eq("lessons.course_id", courseId),

      supabase.from("unit_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId),

      supabase.from("user_courses")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single()
    ]);

    return {
      quizAttempts: quizAttemptsRes.data || [],
      lessonProgress: lessonProgressRes.data || [],
      unitProgress: unitProgressRes.data || [],
      userStats: userStatsRes.data || null
    };
  } catch (err) {
    console.error("Failed to fetch digital twin data:", err);
    return { quizAttempts: [], lessonProgress: [], unitProgress: [], userStats: null };
  }
}

export async function updateUserLearnerProfile(userId: number, courseId: number, profile: any) {
  return supabase
    .from("user_courses")
    .update({
      learner_profile: profile,
      last_active: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .select()
    .single();
}

import { calculateDigitalTwin } from "@/lib/digital-twin";

export async function syncDigitalTwin(userId: number, courseId: number) {
  try {
    const { quizAttempts, lessonProgress, unitProgress, userStats: fetchedUserStats } = await getUserDigitalTwinData(userId, courseId);

    // Ensure we have user stats for activeDays calculation
    let userStats = fetchedUserStats;
    if (!userStats) {
      const { data } = await supabase.from("user_courses").select("*").eq("user_id", userId).eq("course_id", courseId).single();
      userStats = data;
    }

    const profile = calculateDigitalTwin(quizAttempts, lessonProgress, unitProgress, userStats, courseId);
    await updateUserLearnerProfile(userId, courseId, profile);
    return profile;
  } catch (err) {
    console.error("Sync Digital Twin failed:", err);
    return null;
  }
}
