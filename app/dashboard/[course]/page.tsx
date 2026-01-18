"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
// import DigitalTwinCard from "@/components/ui/DigitalTwinCard";
import {
  ArrowRight,
  Clock,
  Flame,
  Target,
  Zap,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { courses, CourseId } from "@/lib/courses";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { getUpcomingDeadlines, toggleCalendarEventComplete } from "@/lib/supabase/calendar";
import { getDailyQuiz } from "@/lib/supabase/quizzes";
import { COURSE_ID_MAP } from "@/lib/courses";
import { getUserCourseStats } from "@/lib/supabase/user-courses";
import { getContinueLesson } from "@/lib/supabase/progress";
import { getCompletedUnitsCount } from "@/lib/supabase/progress";
import { getUserMaxStreak } from "@/lib/supabase/streak";
import { getDailyChallenge } from "@/lib/utils";

export default function CourseDashboardPage({
  params,
}: {
  params: { course: CourseId };
}) {
  const { course } = params;
  const courseData = courses[course];
  const courseId = COURSE_ID_MAP[course];
  const [stats, setStats] = useState<any>(null);
  const [continueLesson, setContinueLesson] = useState<any>(null);
  const [latestQuizUnitId, setLatestQuizUnitId] = useState<number | null>(null);
  const [completedUnits, setCompletedUnits] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  // get user profile
  useEffect(() => {
    const loadProfile = async () => {
      const u = await getCurrentUserProfile();
      setProfile(u);
    };
    loadProfile();
  }, []);

  //get user course stats 
  useEffect(() => {
    const loadStats = async () => {
      const user = await getCurrentUserProfile();
      if (!user) return;
      const { data } = await getUserCourseStats(user.user_id, courseId);
      const streak = await getUserMaxStreak(user.user_id);
      setStats(data);
      setMaxStreak(streak);
    };
    loadStats();  
  }, [courseId]);

  // continue lesson
  useEffect(() => {
    const loadContinue = async () => {
      const user = await getCurrentUserProfile();
      if (!user) return;
      const { data } = await getContinueLesson(user.user_id, courseId);
      setContinueLesson(data);
    };
    loadContinue();
  }, [courseId]);

  useEffect(() => {
    const loadLatestQuizUnit = async () => {
      const user = await getCurrentUserProfile();
      if (!user) return;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('unit_id')
        .eq('user_id', user.user_id)
        .eq('course_id', courseId)
        .order('qa_id', { ascending: false })
        .limit(1);

      if (error) {
        setLatestQuizUnitId(null);
        return;
      }

      const unitId = data && data.length > 0 ? (data[0] as any).unit_id : null;
      setLatestQuizUnitId(typeof unitId === 'number' ? unitId : null);
    };

    loadLatestQuizUnit();
  }, [courseId]);

  // completed units count
  useEffect(() => {
    const loadCompleted = async () => {
      const user = await getCurrentUserProfile();
      if (!user) return;

      const count = await getCompletedUnitsCount(user.user_id, courseId);
      setCompletedUnits(count);
    };
    loadCompleted();
  }, [courseId]);

  // Initialize deadlines from course calendar, add `isDone` default
  const [deadlines, setDeadlines] = useState<any[]>([]);
  useEffect(() => {
    const loadDeadlines = async () => {
      const user = await getCurrentUserProfile();
      if (!user) return;

      const { data } = await getUpcomingDeadlines(user.user_id);
      if (data) setDeadlines(data);
    };

    loadDeadlines();
  }, [courseId]);


  const toggleDeadline = async (id: number, current: boolean) => {
    await toggleCalendarEventComplete(id, !current);
    setDeadlines((prev) =>
      prev.map((d) =>
        d.cal_id === id
          ? { ...d, cal_completed: !current }
          : d
      )
    );
  };

  // daily challenges
  const [dailyQuiz, setDailyQuiz] = useState<any>(null);
  useEffect(() => {
    const loadDaily = async () => {
      const quiz = getDailyChallenge(courseId as CourseId);
      setDailyQuiz(quiz);
    };
    loadDaily();
  }, [courseId]);

  const activeModule = courseData.modules.find((m) => m.active);

  // const unitIdForDigitalTwin = latestQuizUnitId || continueLesson?.lessons?.unit_id || activeModule?.id || 1;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-4">
      {/* 1. Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
            Hello, {profile?.user_name?.split(" ")[0] || "Student"}.
          </h1>
          <p className="text-xs text-textSecondary mt-1 font-light flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span className="text-accent font-medium">{maxStreak} day streak</span>
            <span className="text-white/20">|</span>
            <span>Keep the momentum.</span>
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex gap-8 border-l border-white/10 pl-6">
          <div>
            <div className="text-lg font-bold font-mono text-textPrimary">{stats?.xp}</div>
            <div className="text-[9px] text-textSecondary uppercase tracking-widest font-medium">XP Earned</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-textPrimary">{stats?.level}</div>
            <div className="text-[9px] text-textSecondary uppercase tracking-widest font-medium">Level</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-textPrimary">{completedUnits}</div>
            <div className="text-[9px] text-textSecondary uppercase tracking-widest font-medium">Modules</div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section - Compact */}
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
        <Card className="relative p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-xl rounded-xl">
          <div className="grid md:grid-cols-2">
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-accent">
                <span className="flex items-center justify-center w-4 h-4 rounded-full border border-accent/30 text-[9px] font-bold">
                  {activeModule?.id || "I"}
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase">Current Focus</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-1">
                {continueLesson?.lessons.lesson_title || "Start Learning"}
              </h2>
              <p className="text-textSecondary text-xs mb-4 leading-relaxed max-w-md line-clamp-2">
                {activeModule?.description || ""}
                {" "}You are {(continueLesson?.lesson_progress_percent || 0).toFixed(2)}% through this module.
              </p>

              <div className="flex items-center gap-4">
                {activeModule && (
                  <Link href={`/dashboard/${course}/modules/${continueLesson?.lessons?.unit_id || activeModule.id}`}>
                    <Button size="sm" className="px-5 gap-2 h-9 text-sm">
                      Resume Learning <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="h-[2px] w-full bg-white/5">
            <div className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]" style={{ width: `${continueLesson?.lesson_progress_percent || 0}%` }}></div>
          </div>
        </Card>
      </div>

      {/* 4. Action Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        {/* Deadlines */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all backdrop-blur-md shadow-lg shadow-black/20 rounded-xl">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Deadlines</span>
          </div>

          <div className="p-3 flex-1 space-y-1.5">
            {deadlines.length === 0 ? (
              <p className="text-xs text-textSecondary px-2">
                No upcoming deadlines 🎉
              </p>
            ) : (
              deadlines.map((cal) => {
                const dateObj = new Date(cal.cal_date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString("default", { month: "short" });

                return (
                  <div
                    key={cal.cal_id}
                    className={`p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center gap-3 transition-all group border border-transparent hover:border-white/10 ${cal.cal_completed ? "opacity-40 grayscale" : ""
                      }`}
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-bold leading-none" style={{ color: 'var(--accent-primary)' }}>
                        {day}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider opacity-70">
                        {month}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-textPrimary">
                        {cal.cal_title}
                      </p>
                      <p className="text-[9px] text-textSecondary">
                        {cal.cal_completed
                          ? "Completed"
                          : `Due: ${cal.cal_time}`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Digital Twin - Between Deadlines and Daily Challenge */}
        {/* <DigitalTwinCard courseId={courseId} courseSlug={course} unitId={unitIdForDigitalTwin} /> */}

        {/* Daily Challenge */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all group backdrop-blur-md shadow-lg shadow-black/20 rounded-xl">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Daily Challenge</span>
            </div>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-5">{dailyQuiz?.xp || 500} XP</Badge>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-textPrimary leading-snug mb-1 group-hover:text-accent transition-colors truncate">
                {dailyQuiz?.title || "No Challenge Today"}
              </h4>
              <p className="text-xs text-textSecondary leading-relaxed mb-2 line-clamp-2">
                {dailyQuiz?.description || "Check back tomorrow for a new challenge."}
              </p>
            </div>
            <Link href={dailyQuiz ? `/dashboard/${course}/quizzes/${dailyQuiz?.quizId}` : `/dashboard/${course}/quizzes`} className="w-full">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs border-white/10 hover:border-accent/40 group-hover:bg-accent/5">
                Start Challenge
              </Button>
            </Link>
          </div>
        </Card>
      </div>

    </div>
  );
}
