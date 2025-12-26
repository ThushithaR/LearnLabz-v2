"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Brain, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { courses, CourseId } from "@/lib/courses";

export default function CourseQuizzesPage({
  params,
}: {
  params: { course: string };
}) {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [filter, setFilter] = useState<'All' | 'Difficulty' | 'Unit'>('All');

  useEffect(() => {
    const course = courses[params.course as CourseId];
    if (!course || !course.features.quizzes) {
      router.push("/404");
      return;
    }
    setCourseData(course);
  }, [params.course, router]);

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  const completedCount = courseData.quizzes?.filter((q: any) => q.status === "Completed").length || 0;
  const totalCount = courseData.quizzes?.length || 0;

  // Simple sorting/grouping logic for display
  const getDisplayData = () => {
    let data = [...(courseData.quizzes || [])];
    if (filter === 'Difficulty') {
      const priority = { Easy: 1, Medium: 2, Hard: 3 };
      data.sort((a, b) => (priority[a.difficulty as keyof typeof priority] || 0) - (priority[b.difficulty as keyof typeof priority] || 0));
    } else if (filter === 'Unit') {
      data.sort((a, b) => a.unit.localeCompare(b.unit));
    }
    return data;
  };

  const displayData = getDisplayData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold text-textPrimary mb-2">Quiz Challenges - {courseData.name}</h1>
        <p className="text-textSecondary">Test your knowledge with interactive quizzes</p>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-sm text-textSecondary">{completedCount} / {totalCount} Completed</span>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-surface/20 p-1 rounded-lg w-fit border border-white/10 mb-8">
        {(['All', 'Difficulty', 'Unit'] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={filter === option ? "primary" : "ghost"}
            onClick={() => setFilter(option)}
            className="text-xs"
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayData.map((quiz: any) => (
          <Card
            key={quiz.id}
            className={`p-6 border transition-all hover:border-accent/50 cursor-pointer ${
              quiz.status === "Completed"
                ? "bg-green-500/5 border-green-500/20"
                : quiz.status === "Locked"
                ? "bg-surface/10 border-white/5 opacity-60"
                : "bg-surface/20 border-white/10"
            }`}
            onClick={() => {
              if (quiz.status !== "Locked") {
                router.push(`/dashboard/quizzes/${params.course}/${quiz.id}`);
              }
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <Badge
                variant={quiz.difficulty === "Easy" ? "success" : quiz.difficulty === "Medium" ? "warning" : "secondary"}
                className="mb-2 opacity-70"
              >
                {quiz.difficulty}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-textPrimary">+{quiz.xp || 50} XP</p>
                <p className="text-xs text-textSecondary capitalize">{quiz.status.toLowerCase()}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-textPrimary mb-2">{quiz.title}</h3>
            <p className="text-sm text-textSecondary mb-4">{quiz.description || quiz.unit}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-textSecondary">
                <Clock className="w-3 h-3" />
                <span>{quiz.time}</span>
                <span>•</span>
                <span>{quiz.questions} questions</span>
              </div>
              <Button
                size="sm"
                variant={quiz.status === "Completed" ? "secondary" : "primary"}
                disabled={quiz.status === "Locked"}
                className="text-xs"
              >
                {quiz.status === "Completed" ? "Review" : "Start"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {(!courseData.quizzes || courseData.quizzes.length === 0) && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-textSecondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-textPrimary mb-2">No Quizzes Available</h3>
          <p className="text-textSecondary">Check back later for new quiz challenges in this course.</p>
        </div>
      )}
    </div>
  );
}
