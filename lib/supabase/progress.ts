import { supabase } from "./client";

/* =========================
   LESSON PROGRESS (MANUAL UPSERT) - FIXED
   ========================= */
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
  try {
    // First, check if we already have 100% progress for this lesson
    const { data: existingProgress } = await supabase
      .from("lesson_progress")
      .select("lp_id, lesson_progress_percent, completed")
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id)
      .maybeSingle();

    // If lesson is already at 100%, don't update it
    if (existingProgress && 
        (existingProgress.lesson_progress_percent === 100 || existingProgress.completed === true)) {
      console.log("Lesson already at 100% - skipping update");
      return { data: existingProgress, error: null };
    }

    let response;

    if (existingProgress) {
      response = await supabase
        .from("lesson_progress")
        .update({
          lesson_time_spent_sec: lesson_time_spent,
          lesson_progress_percent,
          completed,
        })
        .eq("lp_id", existingProgress.lp_id)
        .select();
    } else {
      response = await supabase
        .from("lesson_progress")
        .insert({
          user_id,
          lesson_id,
          lesson_time_spent_sec: lesson_time_spent,
          lesson_progress_percent,
          completed,
        })
        .select();
    }

    const { data, error } = response;

    if (error) {
      console.error("Error upserting lesson progress:", error);
      throw error;
    }

    console.log("Lesson progress saved successfully:", data);

    // Auto-update unit progress (only if we actually updated lesson progress)
    try {
      await updateUnitProgressFromLessons({
        user_id,
        course_id,
        unit_id
      });
    } catch (unitUpdateError) {
      console.error("Failed to auto-update unit progress:", unitUpdateError);
    }

    return { data, error };
  } catch (error) {
    console.error("Failed to save lesson progress:", error);
    throw error;
  }
}

/* =========================
   UNIT PROGRESS (MANUAL UPSERT) - FIXED
   ========================= */
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
  // First check if unit exists for this course
  const { data: unitData } = await supabase
    .from("units")
    .select("unit_id")
    .eq("unit_id", unit_id)
    .eq("course_id", course_id)
    .single();

  if (!unitData) {
    throw new Error("Unit not found in course");
  }

  const { data: existing } = await supabase
    .from("unit_progress")
    .select("up_id, unit_progress_percent")
    .eq("user_id", user_id)
    .eq("unit_id", unit_id)
    .maybeSingle();

  // If existing progress is 100%, don't update with lower value
  const existingProgressPercent = existing?.unit_progress_percent || 0;
  if (existingProgressPercent === 100 && progress_percent < 100) {
    console.log(`Unit ${unit_id} already at 100% - keeping at 100%`);
    return { data: existing, error: null };
  }

  let response;

  if (existing) {
    // Only update if new progress is higher than existing
    const finalProgressPercent = Math.max(existingProgressPercent, progress_percent);
    
    response = await supabase
      .from("unit_progress")
      .update({
        unit_quiz_score: quiz_score,
        unit_unlocked: unlocked,
        unit_progress_percent: finalProgressPercent,
      })
      .eq("up_id", existing.up_id)
      .select();
  } else {
    response = await supabase
      .from("unit_progress")
      .insert({
        user_id,
        course_id,
        unit_id,
        unit_quiz_score: quiz_score,
        unit_unlocked: unlocked,
        unit_progress_percent: progress_percent,
      })
      .select();
  }

  const { data, error } = response;

  if (error) {
    console.error("Error updating unit progress:", error);
    throw error;
  }

  console.log("Unit progress updated successfully:", data);
  return { data, error };
}
/* =========================
   LESSON PROGRESS BY UNIT (JOIN VIA QUERIES)
   ========================= */
export async function getLessonProgressByUnit({
  user_id,
  unit_id
}: {
  user_id: number;
  unit_id: number;
}) {
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("lesson_id, lesson_title, lesson_order_index")
    .eq("unit_id", unit_id)
    .order("lesson_order_index", { ascending: true });

  if (lessonsError || !lessons) {
    return { data: null, error: lessonsError };
  }

  const lessonIds = lessons.map(l => l.lesson_id);

  const { data: progressData, error: progressError } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user_id)
    .in("lesson_id", lessonIds);

  if (progressError) {
    return { data: null, error: progressError };
  }

  const combinedData = lessons.map(lesson => {
    const progress = progressData?.find(
      p => p.lesson_id === lesson.lesson_id
    );

    return {
      lesson_id: lesson.lesson_id,
      lesson_title: lesson.lesson_title,
      lesson_order_index: lesson.lesson_order_index,
      lesson_time_spent_sec: progress?.lesson_time_spent_sec ?? 0,
      completed: progress?.completed ?? false,
      lesson_progress_percent: progress?.lesson_progress_percent ?? 0,
      lp_id: progress?.lp_id ?? null
    };
  });

  return { data: combinedData, error: null };
}

/* =========================
   AUTO-UPDATE UNIT PROGRESS WHEN LESSON PROGRESS CHANGES
   ========================= */
export async function updateUnitProgressFromLessons({
  user_id,
  course_id,
  unit_id
}: {
  user_id: number;
  course_id: number;
  unit_id: number;
}) {
  try {
    // First, check if unit is already at 100%
    const { data: existingUnitProgress } = await supabase
      .from("unit_progress")
      .select("unit_progress_percent")
      .eq("user_id", user_id)
      .eq("unit_id", unit_id)
      .eq("course_id", course_id)
      .maybeSingle();

    // If unit is already at 100%, don't recalculate
    if (existingUnitProgress && existingUnitProgress.unit_progress_percent === 100) {
      console.log(`Unit ${unit_id} already at 100% - skipping recalculation`);
      return { data: existingUnitProgress, error: null };
    }

    // Get all lessons for this unit
    const { data: unitLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("lesson_id")
      .eq("unit_id", unit_id)
      .eq("course_id", course_id);

    if (lessonsError || !unitLessons) {
      console.error("Error fetching unit lessons:", lessonsError);
      throw lessonsError;
    }

    const lessonIds = unitLessons.map(lesson => lesson.lesson_id);

    // Get progress for all lessons in this unit
    const { data: lessonProgressData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("completed, lesson_progress_percent")
      .eq("user_id", user_id)
      .in("lesson_id", lessonIds);

    if (progressError) {
      console.error("Error fetching lesson progress:", progressError);
      throw progressError;
    }

    const totalLessons = lessonIds.length;
    let completedLessons = 0;

    if (lessonProgressData) {
      lessonProgressData.forEach(progress => {
        if (progress.completed === true || progress.lesson_progress_percent === 100) {
          completedLessons += 1;
        }
      });
    }

    // Calculate new progress
    const newProgressPercent = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    console.log(`Calculating unit ${unit_id}: ${completedLessons}/${totalLessons} = ${newProgressPercent}%`);

    // If existing progress is higher than new calculation, keep the higher value
    const existingProgressPercent = existingUnitProgress?.unit_progress_percent || 0;
    const finalProgressPercent = Math.max(existingProgressPercent, newProgressPercent);

    console.log(`Final unit ${unit_id} progress: ${finalProgressPercent}% (existing: ${existingProgressPercent}%, new: ${newProgressPercent}%)`);

    // Update the unit_progress table with the higher value
    const { data, error } = await updateUnitProgress({
      user_id,
      course_id,
      unit_id,
      quiz_score: 0, // Keep existing or 0
      unlocked: true,
      progress_percent: finalProgressPercent
    });

    return { data, error };
  } catch (error) {
    console.error("Failed to update unit progress from lessons:", error);
    throw error;
  }
}

/* =========================
   EVERYTHING BELOW REMAINS UNCHANGED
   ========================= */

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
    .order("unit_order_index", { referencedTable: "units", ascending: true });
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
  // Collect all lesson IDs from all units in this course
  const allLessonIds: number[] = [];
  units.forEach(unit => {
    unit.lessons.forEach(lesson => {
      const lessonId = typeof lesson.id === 'string' ? parseInt(lesson.id) : lesson.id;
      if (!isNaN(lessonId)) {
        allLessonIds.push(lessonId);
      }
    });
  });

  if (allLessonIds.length === 0) {
    return { data: [], error: null };
  }

  // Get progress for all these lessons
  const { data: lessonProgressData, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, lesson_progress_percent")
    .eq("user_id", user_id)
    .in("lesson_id", allLessonIds);

  if (progressError) {
    console.error("Error fetching lesson progress:", progressError);
    return { data: null, error: progressError };
  }

  // Calculate progress for each unit
  const result = units.map(unit => {
    const totalLessons = unit.lessons.length;
    let completedLessons = 0;

    if (lessonProgressData) {
      unit.lessons.forEach(lesson => {
        const lessonId = typeof lesson.id === 'string' ? parseInt(lesson.id) : lesson.id;
        const progress = lessonProgressData.find(lp => lp.lesson_id === lessonId);
        
        // Count as completed if either completed flag is true OR progress is 100%
        if (progress && (progress.completed === true || progress.lesson_progress_percent === 100)) {
          completedLessons += 1;
        }
      });
    }

    const progressPercent = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    console.log(`Unit ${unit.id}: ${completedLessons}/${totalLessons} lessons = ${progressPercent}%`);

    return {
      unit_id: unit.id,
      unit_progress_percent: progressPercent,
      unit_unlocked: true
    };
  });

  return { data: result, error: null };
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

  let newStreak = data.streak_days ?? 0;

  if (data.last_active) {
    const last = new Date(data.last_active);
    last.setHours(0, 0, 0, 0);
    const diffDays =
      (today.getTime() - last.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }

  await supabase
    .from("user_courses")
    .update({
      streak_days: newStreak,
      last_active: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("course_id", courseId);
}

export async function getContinueLesson(
  userId: number,
  courseId: number
) {
  return supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      lesson_progress_percent,
      lessons ( lesson_title, unit_id )
    `)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("completed", false)
    .order("lesson_progress_percent", { ascending: false })
    .limit(1)
    .single();
}

export async function getCompletedUnitsCount(
  userId: number,
  courseId: number
) {
  const { count } = await supabase
    .from("unit_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("unit_progress_percent", 100);

  return count ?? 0;
}
