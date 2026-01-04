import { supabase } from "./client";

export async function getAllCourses() {
  return supabase
    .from("courses")
    .select("*")
    .order("course_id");
}

export async function getCourseById(courseId: number) {
  return supabase
    .from("courses")
    .select("*")
    .eq("course_id", courseId)
    .single();
}
