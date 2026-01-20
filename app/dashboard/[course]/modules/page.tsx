"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { aiml } from "@/lib/courses/aiml";
import { nlp } from "@/lib/courses/nlp";
import { COURSE_ID_MAP } from "@/lib/courses";
import { getCourseUnitProgress, getCourseUnitProgressFromLessons } from "@/lib/supabase/progress";
import { getCurrentUserProfile } from "@/lib/supabase/profile";

export default function ModulesPage({ params }: { params: { course: string } }) {
  const { course } = params;
  const courseData = course === "aiml" ? aiml : nlp;
  const [unitProgress, setUnitProgress] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Loading bar
  useEffect(() => {
    async function loadProgress() {
      try {
        const user = await getCurrentUserProfile();
        if (!user) {
          console.log("No user profile found");
          setLoading(false);
          return;
        }

        const courseId = COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP];

        // First try to get progress from unit_progress table
        const { data } = await getCourseUnitProgress({
          user_id: user.user_id,
          course_id: courseId,
        });

        console.log("Unit progress data from DB:", data);

        // Initialize progress map with 0 for all units first
        // Initialize progress map
        const progressMap: Record<number, number> = {};
        courseData.modules.forEach(unit => {
          progressMap[unit.id] = 0;
        });

        // 1. Get stored unit progress
        if (data && Array.isArray(data)) {
          data.forEach((unit: any) => {
            progressMap[unit.unit_id] = Math.min(100, unit.unit_progress_percent || 0); // Cap at 100%
          });
        }

        // 2. ALWAYS Calculate from lesson_progress (Source of Truth) to fix stale data
        // This ensures that if lesson_progress exists but unit_progress is 0, we show the real value
        const { data: lessonBasedProgress } = await getCourseUnitProgressFromLessons({
          user_id: user.user_id,
          course_id: courseId,
          units: courseData.modules as any,
        });

        if (lessonBasedProgress && Array.isArray(lessonBasedProgress)) {
          lessonBasedProgress.forEach((unit: any) => {
            const calculated = Math.min(100, unit.unit_progress_percent || 0); // Cap at 100%
            // Take the higher value to be safe, but never exceed 100%
            if (calculated > (progressMap[unit.unit_id] || 0)) {
              console.log(`Correcting Unit ${unit.unit_id} progress: ${progressMap[unit.unit_id]}% -> ${calculated}%`);
              progressMap[unit.unit_id] = calculated;
            }
          });
        }

        setUnitProgress(progressMap);

        console.log("Final progress map:", progressMap);
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [course, courseData.modules]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-textPrimary">Units - {courseData.name}</h1>
        </div>
        <div className="text-center py-12 text-textSecondary">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-textPrimary">Units - {courseData.name}</h1>
        <p className="text-textSecondary">
          Structured curriculum designed for depth and mastery.
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid gap-6">
        {courseData.modules.map((unit) => {
          const progress = unitProgress[unit.id] || 0;
          const isStarted = progress > 0;
          console.log(`Rendering unit ${unit.id}: progress=${progress}%, isStarted=${isStarted}`);

          return (
            <Card
              key={unit.id}
              className={`overflow-hidden transition-all ${unit.isLocked ? "opacity-70 grayscale-[0.5]" : "hover:border-accent/40"
                }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Visual Side */}
                <div
                  className={`w-full md:w-48 h-32 md:h-auto shrink-0 flex items-center justify-center text-4xl font-bold ${unit.isLocked
                    ? "bg-surface"
                    : "bg-gradient-to-br from-accent/20 to-highlight/20 text-accent"
                    }`}
                >
                  {unit.order}
                </div>

                {/* Content Side */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                          Unit {unit.order}
                        </span>
                        {isStarted && <Badge variant="accent">In Progress</Badge>}
                        {unit.isLocked && <Badge variant="outline">Locked</Badge>}
                      </div>
                      <h2 className="text-xl font-bold text-textPrimary">{unit.title}</h2>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-textPrimary">{Math.round(progress)}%</div>
                      <div className="text-xs text-textSecondary">Mastery</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-textSecondary">
                      <span>{unit.lessons.length} Lessons • 3 Quizzes • 1 Project</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>

                  <div className="pt-2 flex gap-3">
                    {unit.isLocked ? (
                      <Button disabled variant="secondary" className="w-full sm:w-auto">
                        Locked
                      </Button>
                    ) : (
                      <Link href={`/dashboard/${course}/modules/${unit.id}`}>
                        <Button className="w-full sm:w-auto">
                          {isStarted ? "Continue Learning" : "Review Unit"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
