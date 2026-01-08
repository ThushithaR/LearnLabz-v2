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
  // First check if user is already enrolled in this course
  const { data: existing } = await getUserCourseStats(userId, courseId);
  
  if (existing) {
    // User already enrolled, just update the timestamp
    return supabase
      .from("user_courses")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select()
      .single();
  }
  
  // New enrollment
  return supabase
    .from("user_courses")
    .insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
}
