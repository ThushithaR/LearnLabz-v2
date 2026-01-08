import { supabase } from "./client";

export async function getUserMaxStreak(userId: number) {
  const { data, error } = await supabase
    .from("user_courses")
    .select("streak_days")
    .eq("user_id", userId);

  if (error) {
    console.error("getUserMaxStreak error:", error);
    return 0;
  }

  if (!data || data.length === 0) return 0;

  // Take maximum streak among all courses
  return Math.max(...data.map((r) => r.streak_days || 0));
}

export async function getUserLastActive(userId: number) {
  const { data, error } = await supabase
    .from("user_courses")
    .select("last_active")
    .eq("user_id", userId)
    .order("last_active", { ascending: false })
    .limit(1)
    .single();

  if (error || !data?.last_active) return null;
  return new Date(data.last_active);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(last: Date, now: Date) {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return isSameDay(last, y);
}

export async function updateUserStreakOnLogin(userId: number) {
  // Get latest last_active
  const { data: rows, error } = await supabase
    .from("user_courses")
    .select("uc_id, streak_days, last_active")
    .eq("user_id", userId);

  if (error) {
    console.error("updateUserStreakOnLogin error:", error);
    return;
  }

  if (!rows || rows.length === 0) {
    // user hasn't enrolled in any course yet → nothing to update
    return;
  }

  const now = new Date();

  // Find the most recent last_active among all courses
  const lastActiveDates = rows
    .map((r) => (r.last_active ? new Date(r.last_active) : null))
    .filter(Boolean) as Date[];

  let newStreak = 1;

  if (lastActiveDates.length > 0) {
    const last = new Date(Math.max(...lastActiveDates.map((d) => d.getTime())));

    if (isSameDay(last, now)) {
      // Already updated today → do nothing
      return;
    }

    if (isYesterday(last, now)) {
      // Continue streak
      newStreak = Math.max(...rows.map(r => r.streak_days || 0)) + 1;
    } else {
      // Break in streak
      newStreak = 1;
    }
  }

  // Update ALL user_courses rows
  await supabase
    .from("user_courses")
    .update({
      streak_days: newStreak,
      last_active: now.toISOString(),
    })
    .eq("user_id", userId);
}
