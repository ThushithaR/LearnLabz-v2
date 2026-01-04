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
  const response = supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id,
        course_id,
        unit_id,
        lesson_id,
        lesson_time_spent_sec: lesson_time_spent,
        lesson_progress_percent,
        completed
      },
      {
        onConflict: "user_id,course_id,lesson_id"
      }
    )
    .select();
  
  const { data, error } = await response;
  
  if (error) {
    console.error("Error upserting lesson progress:", error);
    throw error;
  }
  
  console.log("Lesson progress saved successfully:", data);
  return { data, error };
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
  const response = supabase
    .from("unit_progress")
    .upsert(
      {
        user_id,
        course_id,
        unit_id,
        unit_quiz_score: quiz_score,
        unit_unlocked: unlocked,
        unit_progress_percent: progress_percent
      },
      {
        onConflict: "user_id,unit_id,course_id"
      }
    )
    .select();
  
  const { data, error } = await response;
  
  if (error) {
    console.error("Error updating unit progress:", error);
    throw error;
  }
  
  console.log("Unit progress updated successfully:", data);
  return { data, error };
}

export async function getLessonProgress({
  user_id,
  lesson_id
}: {
  user_id: number;
  lesson_id: number;
}) {
  return supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .single();
}

export async function getLessonProgressByUnit({
  user_id,
  unit_id
}: {
  user_id: number;
  unit_id: number;
}) {
  return supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      lesson_time_spent_sec,
      completed,
      lesson_progress_percent,
      lessons (
        lesson_title,
        lesson_order_index
      )
    `)
    .eq("user_id", user_id)
    .eq("unit_id", unit_id)
    .order("lesson_order_index", { referencedTable: "lessons", ascending: true })
}

export async function getUnitProgress({
  user_id,
  unit_id
}: {
  user_id: number;
  unit_id: number;
}) {
  return supabase
    .from("unit_progress")
    .select("*")
    .eq("user_id", user_id)
    .eq("unit_id", unit_id)
    .single();
}

export async function getCourseUnitProgress({
  user_id,
  course_id
}: {
  user_id: number;
  course_id: number;
}) {
  return supabase
    .from("unit_progress")
    .select(`
      unit_id,
      unit_progress_percent,
      unit_unlocked,
      units (
        unit_title,
        unit_order_index
      )
    `)
    .eq("user_id", user_id)
    .eq("course_id", course_id)
    .order("unit_order_index", { referencedTable: "units", ascending: true })
}

export async function getCourseUnitProgressFromLessons({
  user_id,
  course_id,
  units
}: {
  user_id: number;
  course_id: number;
  units: Array<{ id: number; lessons: Array<{ id: string | number }> }>;
}) {
  // Get all lesson progress for the user
  const { data: lessonProgressData } = await supabase
    .from("lesson_progress")
    .select("unit_id, completed")
    .eq("user_id", user_id)
    .eq("course_id", course_id);

  if (!lessonProgressData) {
    return { data: null, error: null };
  }

  // Calculate progress for each unit
  const unitProgressMap: Record<number, number> = {};
  
  units.forEach(unit => {
    const totalLessons = unit.lessons.length;
    const completedLessons = lessonProgressData.filter(
      lp => lp.unit_id === unit.id && lp.completed === true
    ).length;
    
    unitProgressMap[unit.id] = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  });

  // Convert to array format matching getCourseUnitProgress
  const data = Object.entries(unitProgressMap).map(([unitId, progress]) => ({
    unit_id: parseInt(unitId),
    unit_progress_percent: progress,
    unit_unlocked: progress > 0 || progress === 0, // Unlock if started or new
  }));

  return { data, error: null };
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
