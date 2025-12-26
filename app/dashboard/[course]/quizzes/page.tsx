"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { courses, CourseId } from "@/lib/courses";
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
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);

  useEffect(() => {
    const course = courses[params.course as CourseId];
    if (!course || !course.features.quizzes) {
      router.push("/404");
      return;
    }
    setCourseData(course);
  }, [params.course, router]);

  /** Group quizzes -> Unit -> Difficulty */
  const units = useMemo(() => {
    if (!courseData?.quizzes) return [];

    const map: Record<string, any[]> = {};
    courseData.quizzes.forEach((quiz: any) => {
      if (!map[quiz.unit]) map[quiz.unit] = [];
      map[quiz.unit].push(quiz);
    });

    return Object.entries(map).map(([unit, quizzes]) => ({
      id: unit,
      title: unit,
      quizzes: ["Easy", "Medium", "Hard"].map(level =>
        quizzes.find(q => q.difficulty === level)
      ).filter(Boolean),
    }));
  }, [courseData]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

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
                      className={`p-5 flex flex-col gap-4 border-2 transition-all ${
                        quiz.status === "Locked"
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
                          {quiz.questions} Questions
                        </h4>
                        <div className="flex gap-3 text-xs text-textSecondary">
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
