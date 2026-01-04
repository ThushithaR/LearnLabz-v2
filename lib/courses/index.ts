// lib/courses/index.ts
import { aiml } from "./aiml"
import { nlp } from "./nlp"
import { Course } from "@/lib/types/course"

export type CourseId = "aiml" | "nlp";

export const courses: Record<CourseId, Course> = {
  aiml,
  nlp,
}

export const COURSE_ID_MAP: Record<CourseId, number> = {
  aiml: 1,
  nlp: 2,
};