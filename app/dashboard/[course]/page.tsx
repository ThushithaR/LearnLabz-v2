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
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-4">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight">
            Hello, {user.name.split(" ")[0]}.
          </h1>
          <p className="text-sm text-textSecondary mt-1 font-light flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-accent font-medium">{user.streak} day streak</span>
            <span className="text-white/20">|</span>
            <span>Keep the momentum.</span>
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex gap-10 border-l border-white/10 pl-8">
          <div>
            <div className="text-xl font-bold font-mono text-textPrimary">{user.ep}</div>
            <div className="text-[10px] text-textSecondary uppercase tracking-widest font-medium">XP Earned</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-textPrimary">#{user.level}</div>
            <div className="text-[10px] text-textSecondary uppercase tracking-widest font-medium">Level</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-textPrimary">{user.modulesCompleted}</div>
            <div className="text-[10px] text-textSecondary uppercase tracking-widest font-medium">Modules</div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
        <Card className="relative p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-xl">
          <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-accent/30 text-[10px] font-bold">
                  {activeModule?.id || "I"}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Current Focus</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-textPrimary mb-2">
                {activeModule?.title || "Start Learning"}
              </h2>
              <p className="text-textSecondary text-sm mb-6 leading-relaxed max-w-md">
                {activeModule?.description || ""}
                {" "}You are {activeModule?.progress || 0}% through this module.
              </p>

              <div className="flex items-center gap-4">
                {activeModule && (
                  <Link href={`/dashboard/${course}/modules/${activeModule.id}`}>
                    <Button className="px-6 gap-2">
                      Resume Learning <ArrowRight className="w-4 h-4" />
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

      {/* 3. Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
        {/* Daily Challenge */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all group backdrop-blur-md shadow-lg shadow-black/20">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Daily Challenge</span>
            </div>
            <Badge variant="outline" className="px-2 py-0.5">{getDailyChallenge(course)?.xp || 500} XP</Badge>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-textPrimary leading-snug mb-2 group-hover:text-accent transition-colors">
                {getDailyChallenge(course)?.title || "No Challenge Today"}
              </h4>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">
                {getDailyChallenge(course)?.description || "Check back tomorrow for a new challenge."}
              </p>
            </div>
            <Link href={getDailyChallenge(course) ? `/dashboard/${course}/quizzes/${getDailyChallenge(course)?.quizId}` : `/dashboard/${course}/quizzes`} className="w-full">
              <Button variant="outline" className="w-full border-white/10 hover:border-accent/40 group-hover:bg-accent/5">
                Start Challenge
              </Button>
            </Link>
          </div>
        </Card>

        {/* Smart Review */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all backdrop-blur-md shadow-lg shadow-black/20">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Smart Review</span>
          </div>

          <div className="p-3 flex-1 space-y-2">
            {courseData.modules.slice(0, 2).map((mod) => (
              <Link key={mod.id} href={`/dashboard/${course}/modules/${mod.id}`} className="block">
                <div className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer group flex items-center justify-between transition-all border border-transparent hover:border-white/10">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Weak Spot
                    </div>
                    <h5 className="text-sm font-medium text-textPrimary group-hover:text-accent transition-colors">{mod.title}</h5>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Deadlines */}
        <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.07] to-transparent hover:from-white/[0.1] transition-all backdrop-blur-md shadow-lg shadow-black/20">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Deadlines</span>
        </div>

        <div className="p-3 flex-1 space-y-2">
            {deadlines.map((deadline) => {
            // parse date to get day and month
            const dateObj = new Date(deadline.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString("default", { month: "short" });

            return (
                <div
                key={deadline.id}
                className={`p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center gap-4 transition-all group border border-transparent hover:border-white/10 ${deadline.isDone ? "opacity-40 grayscale" : ""}`}
                >
                {/* Checkbox */}
                <div
                    className="cursor-pointer shrink-0"
                    onClick={() => toggleDeadline(deadline.id)}
                >
                    {deadline.isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                    <Circle className="w-6 h-6 text-white/20 group-hover:text-accent transition-colors stroke-2" />
                    )}
                </div>

                {/* Date box */}
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white/5 border border-white/10 shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${deadline.isDone ? "text-textSecondary" : "text-red-400"}`}>
                    {deadline.id === 1 ? "Today" : month}
                    </span>
                    <span className="text-lg font-bold text-textPrimary leading-none mt-0.5">{day}</span>
                </div>

                {/* Deadline info */}
                <div className="flex-1 min-w-0">
                    <h5 className={`text-xs font-bold truncate ${deadline.isDone ? "line-through text-textSecondary" : "text-textPrimary"}`}>
                    {deadline.title}
                    </h5>
                    <p className="text-[10px] text-textSecondary mt-0.5">
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
