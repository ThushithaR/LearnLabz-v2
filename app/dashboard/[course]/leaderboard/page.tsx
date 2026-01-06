"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { courses, CourseId, COURSE_ID_MAP } from "@/lib/courses";
import { LeaderboardEntry } from "@/lib/types/course";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { getLeaderboard } from "@/lib/supabase/leaderboard";
import { supabase } from "@/lib/supabase/client";

export default function LeaderboardPage({
  params,
}: {
  params: { course: CourseId };
}) {
  const [activeTab, setActiveTab] =
    useState<"Global" | "School" | "Class">("Global");

  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardEntry[]>([]);

  const courseData = courses[params.course];
  const courseId = COURSE_ID_MAP[params.course];

  

  const loadLeaderboard = useCallback(async () => {
    const user = await getCurrentUserProfile();

    if (!user) return;
    const { data, error } = await getLeaderboard(
        courseId,
        activeTab,
        user.school_name,
        user.class_name
      );
      console.log("LEADERBOARD RAW DATA", data);
console.log("LEADERBOARD ERROR", error);

    if (error || !data) return;

    const mapped = data.map((row: any, index: number) => ({
      rank: index + 1,
      name: row.users.user_name,
      avatarUrl: row.users.avatar_url,
      initial: row.users.user_name?.[0] ?? "U",
      tier: `Level ${row.level}`,
      ep: row.xp,
      isUser: row.user_id === user.user_id,
    }));

    setLeaderboardData(mapped);
    
  }, [courseId, activeTab]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Realtime updates (course-specific)
  useEffect(() => {
    const channel = supabase
      .channel(`leaderboard-${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_courses",
          filter: `course_id=eq.${courseId}`,
        },
        loadLeaderboard
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, loadLeaderboard]);

  const currentUser = leaderboardData.find((u) => u.isUser);
  const leaderboardWithoutCurrentUser = leaderboardData.filter(
    (u) => !u.isUser
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">{courseData.name || "Course"} Scholars</h1>
        <p className="text-textSecondary">Top performers in your {activeTab.toLowerCase()}.</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-surface rounded-lg p-1 border border-white/5">
          {(['Global', 'School', 'Class'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-accent text-background shadow-lg' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard - Full Width */}
        <div className="lg:col-span-3 space-y-4">
          {/* Render the top 3 leaderboard entries without current user */}
          {leaderboardWithoutCurrentUser.slice(0, 3).map((user: LeaderboardEntry, idx: number) => (
            <Card key={user.rank} className="flex items-center gap-4 p-4 border-accent/20 bg-gradient-to-r from-surface to-accent/5">
              <div className={`font-black text-2xl w-12 text-center ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                {user.rank}
              </div>
              <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs ring-2 ring-white/5">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.initial
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-textPrimary">{user.name}</div>
                <div className="text-xs text-textSecondary">{user.tier}</div>
              </div>
              <div className="font-mono font-bold text-accent">{user.ep.toLocaleString()} XP</div>
            </Card>
          ))}

          {/* Render the remaining leaderboard entries */}
          <div className="h-px bg-white/10 my-4"></div>
          {leaderboardWithoutCurrentUser.slice(3).map((user: LeaderboardEntry, idx: number) => (
            <Card key={user.rank} className="flex items-center gap-4 p-4 opacity-80 hover:opacity-100 transition-opacity bg-black/20 border-transparent">
              <div className="font-medium text-xl w-12 text-center text-textSecondary">
                {user.rank}
              </div>
              <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.initial
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-textPrimary">{user.name}</div>
                <div className="text-xs text-textSecondary">{user.tier}</div>
              </div>
              <div className="font-mono text-textSecondary">{user.ep.toLocaleString()} XP</div>
            </Card>
          ))}

          {/* Render current user in the leaderboard at the bottom */}
          {currentUser && (
            <Card className="flex items-center gap-4 p-4 border-2 border-accent bg-accent/10 sticky bottom-4 shadow-2xl transform scale-100">
              <div className="font-medium text-xl w-12 text-center text-accent">
                #{currentUser.rank}
              </div>
              <div className="h-10 w-10 rounded-full bg-accent text-background flex items-center justify-center font-bold text-xs">
                AC
              </div>
              <div className="flex-1">
                <div className="font-bold text-textPrimary">You</div>
                <div className="text-xs text-textSecondary">{currentUser.tier}</div>
              </div>
              <div className="font-mono font-bold text-accent">{currentUser.ep.toLocaleString()} XP</div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}
