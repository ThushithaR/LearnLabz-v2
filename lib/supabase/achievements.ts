import { supabase } from "./client";

export async function getUserAchievements(userId: number) {
  return supabase
    .from("user_achievements")
    .select(`
      unlocked_at,
      achievements (
        ach_name,
        ach_cp
      )
    `)
    .eq("user_id", userId);
}
