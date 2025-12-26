"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Calculator, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { courses, CourseId } from "@/lib/courses";

export default function CourseNumericalsPage({
  params,
}: {
  params: { course: string };
}) {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [filter, setFilter] = useState<'All' | 'Difficulty' | 'Topic'>('All');

  useEffect(() => {
    const course = courses[params.course as CourseId];
    if (!course || !course.features.numericals) {
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
          <p className="text-textSecondary">Loading numericals...</p>
        </div>
      </div>
    );
  }

  const completedCount = courseData.numericals?.filter((n: any) => n.status === "Completed").length || 0;
  const totalCount = courseData.numericals?.length || 0;

  // Simple sorting/grouping logic for display
  const getDisplayData = () => {
    let data = [...(courseData.numericals || [])];
    if (filter === 'Difficulty') {
      const priority = { Easy: 1, Medium: 2, Hard: 3 };
      data.sort((a, b) => (priority[a.difficulty as keyof typeof priority] || 0) - (priority[b.difficulty as keyof typeof priority] || 0));
    } else if (filter === 'Topic') {
      data.sort((a, b) => a.topic.localeCompare(b.topic));
    }
    return data;
  };

  const displayData = getDisplayData();

  return (
    <div className="p-6">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-2">{courseData.name} - Numerical Challenges</h1>
        <p className="text-textSecondary">Practice algorithmic problems and numerical computations</p>
      </div>

      {/* Sort Controls */}
      <div className="bg-surface/20 p-1 rounded-lg w-fit border border-white/10 mb-8">
        {(['All', 'Difficulty', 'Topic'] as const).map((option) => (
          <Button
            key={option}
            variant={filter === option ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(option)}
            className={`text-xs ${filter === option ? 'bg-accent text-textPrimary' : 'text-textSecondary hover:text-textPrimary'}`}
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-surface/20 border border-white/10">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-textPrimary">{totalCount}</p>
              <p className="text-sm text-textSecondary">Total Challenges</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-surface/20 border border-white/10">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-textPrimary">{completedCount}</p>
              <p className="text-sm text-textSecondary">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-surface/20 border border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-textPrimary">{totalCount - completedCount}</p>
              <p className="text-sm text-textSecondary">Remaining</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayData.map((numerical: any) => (
          <Card
            key={numerical.id}
            className={`p-6 border transition-all hover:border-accent/50 cursor-pointer ${
              numerical.status === "Completed"
                ? "bg-green-500/5 border-green-500/20"
                : numerical.status === "Locked"
                ? "bg-surface/10 border-white/5 opacity-60"
                : "bg-surface/20 border-white/10"
            }`}
            onClick={() => {
              if (numerical.status !== "Locked") {
                router.push(`/dashboard/numericals/${params.course}/${numerical.id}`);
              }
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <Badge
                variant={numerical.difficulty === "Easy" ? "success" : "warning"}
                className="mb-2 opacity-70"
              >
                {numerical.difficulty}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-textPrimary">+{numerical.xp} XP</p>
                <p className="text-xs text-textSecondary capitalize">{numerical.status.toLowerCase()}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-textPrimary mb-2">{numerical.title}</h3>
            <p className="text-sm text-textSecondary mb-4">{numerical.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-textSecondary">{numerical.topic}</span>
              <Button
                size="sm"
                variant={numerical.status === "Completed" ? "secondary" : "primary"}
                disabled={numerical.status === "Locked"}
                className="text-xs"
              >
                {numerical.status === "Completed" ? "Review" : "Solve"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {(!courseData.numericals || courseData.numericals.length === 0) && (
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-textSecondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-textPrimary mb-2">No Challenges Available</h3>
          <p className="text-textSecondary">Check back later for new numerical challenges in this course.</p>
        </div>
      )}
    </div>
  );
}
