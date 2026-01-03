"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
import { getDailyChallenge } from "@/lib/utils";

export default function CourseDashboardPage({
  params,
}: {
  params: { course: CourseId };
}) {
  const { course } = params;
  const courseData = courses[course];
  const user = courseData.user;

  // Initialize deadlines from course calendar, add `isDone` default
  const [deadlines, setDeadlines] = useState(
    (courseData.calendar || []).map((d) => ({ ...d, isDone: false }))
  );

  const toggleDeadline = (id: number) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDone: !d.isDone } : d))
    );
  };

  const activeModule = courseData.modules.find((m) => m.active);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-4">
      {/* 1. Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
            Hello, {user.name.split(" ")[0]}.
          </h1>
          <p className="text-xs text-textSecondary mt-1 font-light flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span className="text-accent font-medium">{user.streak} day streak</span>
            <span className="text-white/20">|</span>
            <span>Keep the momentum.</span>
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex gap-8 border-l border-white/10 pl-6">
          <div>
            <div className="text-lg font-bold font-mono text-textPrimary">{user.ep}</div>
            <div className="text-[9px] text-textSecondary uppercase tracking-widest font-medium">XP Earned</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-textPrimary">#{user.level}</div>
            <div className="text-[9px] text-textSecondary uppercase tracking-widest font-medium">Level</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-textPrimary">{user.modulesCompleted}</div>
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
                {activeModule?.title || "Start Learning"}
              </h2>
              <p className="text-textSecondary text-xs mb-4 leading-relaxed max-w-md line-clamp-2">
                {activeModule?.description || ""}
                {" "}You are {activeModule?.progress || 0}% through this module.
              </p>

              <div className="flex items-center gap-4">
                {activeModule && (
                  <Link href={`/dashboard/${course}/modules/${activeModule.id}`}>
                    <Button size="sm" className="px-5 gap-2 h-9 text-sm">
                      Resume Learning <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="h-[2px] w-full bg-white/5">
            <div className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]" style={{ width: `${activeModule?.progress || 0}%` }}></div>
          </div>
        </Card>
      </div>

      {/* 3. Action Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        {/* Daily Challenge */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all group backdrop-blur-md shadow-lg shadow-black/20 rounded-xl">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Daily Challenge</span>
            </div>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-5">{getDailyChallenge(course)?.xp || 500} XP</Badge>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-textPrimary leading-snug mb-1 group-hover:text-accent transition-colors truncate">
                {getDailyChallenge(course)?.title || "No Challenge Today"}
              </h4>
              <p className="text-xs text-textSecondary leading-relaxed mb-2 line-clamp-2">
                {getDailyChallenge(course)?.description || "Check back tomorrow for a new challenge."}
              </p>
            </div>
            <Link href={getDailyChallenge(course) ? `/dashboard/${course}/quizzes/${getDailyChallenge(course)?.quizId}` : `/dashboard/${course}/quizzes`} className="w-full">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs border-white/10 hover:border-accent/40 group-hover:bg-accent/5">
                Start Challenge
              </Button>
            </Link>
          </div>
        </Card>

        {/* Smart Review */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all backdrop-blur-md shadow-lg shadow-black/20 rounded-xl">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Smart Review</span>
          </div>

          <div className="p-3 flex-1 space-y-1.5">
            {courseData.modules.slice(0, 2).map((mod) => (
              <Link key={mod.id} href={`/dashboard/${course}/modules/${mod.id}`} className="block">
                <div className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer group flex items-center justify-between transition-all border border-transparent hover:border-white/10">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-red-400"></span> Weak Spot
                    </div>
                    <h5 className="text-xs font-medium text-textPrimary group-hover:text-accent transition-colors truncate">{mod.title}</h5>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Deadlines */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all backdrop-blur-md shadow-lg shadow-black/20 rounded-xl">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Deadlines</span>
          </div>

          <div className="p-3 flex-1 space-y-1.5">
            {deadlines.map((deadline) => {
              // parse date to get day and month
              const dateObj = new Date(deadline.date);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString("default", { month: "short" });

              return (
                <div
                  key={deadline.id}
                  className={`p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center gap-3 transition-all group border border-transparent hover:border-white/10 ${deadline.isDone ? "opacity-40 grayscale" : ""}`}
                >
                  {/* Checkbox */}
                  <div
                    className="cursor-pointer shrink-0"
                    onClick={() => toggleDeadline(deadline.id)}
                  >
                    {deadline.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/20 group-hover:text-accent transition-colors stroke-2" />
                    )}
                  </div>

                  {/* Date box */}
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-white/5 border border-white/10 shrink-0">
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${deadline.isDone ? "text-textSecondary" : "text-red-400"}`}>
                      {deadline.id === 1 ? "Today" : month}
                    </span>
                    <span className="text-sm font-bold text-textPrimary leading-none mt-0.5">{day}</span>
                  </div>

                  {/* Deadline info */}
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-[11px] font-bold truncate ${deadline.isDone ? "line-through text-textSecondary" : "text-textPrimary"}`}>
                      {deadline.title}
                    </h5>
                    <p className="text-[9px] text-textSecondary">
                      {deadline.isDone ? "Completed" : `Due: ${deadline.time}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
