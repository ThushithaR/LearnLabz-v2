"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { courses, CourseId, COURSE_ID_MAP } from "@/lib/courses";
import { getQuizzesByCourse } from "@/lib/supabase/quizzes";
import { ActualQuizzes } from "@/lib/types/course";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import {
  ChevronDown,
  ChevronRight,
  Clock,
  Trophy,
  PlayCircle,
} from "lucide-react";

export default function CourseQuizzesPage({
  params,
}: {
  params: { course: string };
}) {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<ActualQuizzes[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load static course data (for name/features)
      const course = courses[params.course as CourseId];
      if (!course || !course.features.actualquizzes) {
        router.push("/404");
        return;
      }
      setCourseData(course);

      // 2. Load dynamic quizzes from backend
      try {
        const courseId = COURSE_ID_MAP[params.course as CourseId];
        const dbQuizzes = await getQuizzesByCourse(courseId);
        setQuizzes(dbQuizzes);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.course, router]);

  /* Group quizzes -> Unit -> Difficulty */
  const units = useMemo(() => {
    if (!quizzes || quizzes.length === 0) return [];

    const map: Record<string, ActualQuizzes[]> = {};
    quizzes.forEach((quiz) => {
      // "Unit 1" -> "Unit 1" key
      if (!map[quiz.unit]) map[quiz.unit] = [];
      map[quiz.unit].push(quiz);
    });

    return Object.entries(map).map(([unit, unitQuizzes]) => ({
      id: unit,
      title: unit, // e.g. "Unit 1"
      quizzes: ["Easy", "Medium", "Hard"].map(level =>
        unitQuizzes.find(q => q.difficulty === level)
      ).filter(Boolean) as ActualQuizzes[],
    }));
  }, [quizzes]);

  // Auto-expand all units on load
  useEffect(() => {
    if (units.length > 0) {
      setExpandedUnits(units.map(u => u.id));
    }
  }, [units]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!courseData) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">
          Quizzes & Assessments – {courseData.name}
        </h1>
        <p className="text-textSecondary">
          Clear all difficulty levels in each unit to master the course.
        </p>
      </div>

      {/* Units */}
      <div className="space-y-6">
        {units.map(unit => {
          const completed = unit.quizzes.filter(
            (q: any) => q.status === "Completed"
          ).length;

          return (
            <div key={unit.id} className="space-y-4">
              {/* Unit Header */}
              <button
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  {expandedUnits.includes(unit.id) ? (
                    <ChevronDown className="w-5 h-5 text-accent" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-textSecondary" />
                  )}
                  <span className="text-lg font-bold text-textPrimary">
                    {unit.title}
                  </span>
                </div>
                <Badge variant="outline">
                  {completed} / {unit.quizzes.length} Completed
                </Badge>
              </button>

              {/* Quizzes */}
              {expandedUnits.includes(unit.id) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l border-white/5">
                  {unit.quizzes.map((quiz: any) => (
                    <Card
                      key={quiz.id}
                      className={`p-5 flex flex-col gap-4 border-2 transition-all ${quiz.status === "Locked"
                        ? "opacity-50 bg-white/5 border-transparent"
                        : "bg-surface border-white/5 hover:border-accent/40"
                        }`}
                    >
                      {/* Top */}
                      <div className="flex justify-between">
                        <Badge
                          variant={
                            quiz.difficulty === "Hard"
                              ? "warning"
                              : quiz.difficulty === "Medium"
                                ? "default"
                                : "secondary"
                          }
                          className="uppercase text-[10px]"
                        >
                          {quiz.difficulty}
                        </Badge>
                        <span className="text-xs text-textSecondary">
                          {quiz.status}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <h4 className="font-bold text-lg text-textPrimary">
                        {quiz.title}
                        </h4>
                        <div className="flex gap-3 text-xs text-textSecondary">
                          <div className="flex items-center gap-1">
                            {quiz.questions} Questions
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {quiz.time}
                          </div>
                          <div className="flex items-center gap-1 text-accent">
                            <Trophy className="w-3 h-3" />
                            {quiz.xp} XP
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-auto pt-4 border-t border-white/5">
                        {quiz.status === "Locked" ? (
                          <Button size="sm" variant="ghost" disabled className="w-full">
                            Locked
                          </Button>
                        ) : (
                          <Link
                            href={`/dashboard/${params.course}/quizzes/${quiz.id}`}
                          >
                            <Button size="sm" className="w-full gap-2">
                              <PlayCircle className="w-4 h-4" />
                              {quiz.status === "Completed" ? "Retake" : "Start"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
