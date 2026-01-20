import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { courses, CourseId } from "./courses";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDailyChallenge(courseId: CourseId, random: boolean = false) {
  const course = courses[courseId];
  if (!course || !course.actualquizzes?.length) return null;

  let index;
  if (random) {
    index = Math.floor(Math.random() * course.actualquizzes.length);
  } else {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    index = dayOfYear % course.actualquizzes.length;
  }

  const quiz = course.actualquizzes[index];

  return {
    title: quiz.title,
    description: `Solve ${quiz.questions} questions in under ${quiz.time} to earn ${quiz.xp} XP.`,
    xp: quiz.xp,
    quizId: quiz.id,
  };
}
