"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Calculator, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { courses, CourseId } from "@/lib/courses";
import { COURSE_ID_MAP } from "@/lib/courses";
import { getNumericalsByCourse } from "@/lib/supabase/numericals";
import { Numerical } from "@/lib/types/course";

export default function CourseNumericalsPage({
  params,
}: {
  params: { course: string };
}) {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [numericals, setNumericals] = useState<Numerical[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Difficulty' | 'Topic'>('All');

  useEffect(() => {
    // 1. Static check first
    const course = courses[params.course as CourseId];
    if (!course) {
      router.push("/404");
      return;
    }
    setCourseData(course);

    // 2. Fetch from Backend
    const fetchNumericals = async () => {
      try {
        const courseId = COURSE_ID_MAP[params.course as CourseId] || (params.course === 'aiml' ? 1 : 2);
        const data = await getNumericalsByCourse(courseId);
        setNumericals(data);
      } catch (error) {
        console.error("Failed to load numericals", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNumericals();
  }, [params.course, router]);

  if (isLoading || !courseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading numericals...</p>
        </div>
      </div>
    );
  }

  const completedCount = numericals.filter((n) => n.status === "Completed").length || 0;
  const totalCount = numericals.length || 0;

  const getDisplayData = () => {
    let data = [...numericals];
    if (filter === 'Difficulty') {
      const priority = { Easy: 1, Medium: 2, Hard: 3 };
      data.sort((a, b) => (priority[a.difficulty as keyof typeof priority] || 0) - (priority[b.difficulty as keyof typeof priority] || 0));
    } else if (filter === 'Topic') {
      data.sort((a, b) => (a.topic || "").localeCompare(b.topic || ""));
    }
    return data;
  };

  const displayData = getDisplayData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-2">Numerical Challenges - {courseData.name}</h1>
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
        {displayData.map((numerical) => {
          const isLocked = numerical.status === "Locked";

          return (
            <Card
              key={numerical.id}
              className={`p-5 flex flex-col gap-4 border-2 transition-all ${isLocked
                  ? "opacity-50 bg-white/5 border-transparent pointer-events-none"
                  : "bg-surface border-white/5 hover:border-accent/40"
                }`}
              onClick={() => {
                if (!isLocked) {
                  router.push(`/dashboard/${params.course}/numericals/${numerical.id}`);
                }
              }}
            >
              {/* Top */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Badge
                    variant={
                      numerical.difficulty === "Hard"
                        ? "warning"
                        : numerical.difficulty === "Medium"
                          ? "default"
                          : "secondary" // Easy
                    }
                    className="uppercase text-[10px]"
                  >
                    {numerical.difficulty}
                  </Badge>
                </div>
                <span className="text-xs text-textSecondary">{numerical.status}</span>
              </div>

              {/* Info */}
              <div>
                <h4 className="font-bold text-lg text-textPrimary">{numerical.title}</h4>
                <p className="text-sm text-textSecondary mb-2 line-clamp-2">{numerical.description}</p>
                <div className="flex gap-3 text-xs text-textSecondary">
                  <div className="flex items-center gap-1 text-accent">
                    <Trophy className="w-3 h-3" />
                    {numerical.xp} XP
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-auto pt-4 border-t border-white/5">
                <Button
                  size="sm"
                  variant={numerical.status === "Completed" ? "secondary" : "primary"}
                  disabled={isLocked}
                  className="w-full"
                >
                  {numerical.status === "Completed" ? "Review" : "Solve"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {(!numericals || numericals.length === 0) && (
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-textSecondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-textPrimary mb-2">No Challenges Available</h3>
          <p className="text-textSecondary">Check back later for new numerical challenges in this course.</p>
        </div>
      )}
    </div>
  );
}
