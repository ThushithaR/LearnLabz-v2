// lib/courses/index.ts
import { aiml } from "./aiml"
import { nlp } from "./nlp"
import { foundation } from "./foundation"
import { Course } from "@/lib/types/course"

export type CourseId = "aiml" | "nlp" | "foundation";

export const courses: Record<CourseId, Course> = {
  aiml,
  nlp,
  foundation
}

export const COURSE_ID_MAP: Record<CourseId, number> = {
  aiml: 1,
  nlp: 2,
  foundation: 3,
};