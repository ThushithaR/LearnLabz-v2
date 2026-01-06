import { supabase } from "./client";

export async function getUserCourseStats(userId: number, courseId: number) {
  return supabase
    .from("user_courses")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
}
