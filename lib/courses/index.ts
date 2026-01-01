// lib/courses/index.ts
import { aiml } from "./aiml"
import { nlp } from "./nlp"
import { Course } from "@/lib/types/course"

export type CourseId = "aiml" | "nlp";

export const courses: Record<CourseId, Course> = {
  aiml,
  nlp,
}
