import { supabase } from "./client";

export async function getLeaderboard(courseId: number) {
  return supabase
    .from("user_courses")
    .select(`
      xp,
      level,
      users (
        user_name,
        avatar_url
      )
    `)
    .eq("course_id", courseId)
    .order("xp", { ascending: false })
    .limit(50);
}
