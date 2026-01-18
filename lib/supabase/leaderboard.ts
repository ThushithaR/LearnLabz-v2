import { supabase } from "./client";

export async function getLeaderboard(
  courseId: number,
  scope: "Global" | "School" | "Class",
  school?: string,
  className?: string
) {
  let query = supabase
    .from("user_courses")
    .select(`
      user_id,
      xp,
      level,
      users!user_courses_user_id_fkey!inner (
        user_name,
        avatar_url,
        school_name,
        class_name
      )
    `)
    .eq("course_id", courseId)
    .order("xp", { ascending: false });

  if (scope === "School" && school) {
    query = query.eq("users.school_name", school);
  }

  if (scope === "Class" && className) {
    query = query.eq("users.class_name", className);
  }

  return await query;
}
