"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { courses, CourseId } from "@/lib/courses";
import { Course, LeaderboardEntry } from "@/lib/types/course";

export default function LeaderboardPage({
  params,
}: {
  params: { course: CourseId }; // Access the course parameter from the URL
}) {
  const [activeTab, setActiveTab] = useState<'Global' | 'School' | 'Class'>('Global');

  // Retrieve the course data based on the `course` parameter from the URL
  const courseData: Course = courses[params.course];

  if (!courseData) {
    return <p className="text-center mt-20">Course not found</p>; // Handle case if course data is not found
  }

  const leaderboardData: LeaderboardEntry[] = courseData.leaderboard || []; // Get leaderboard data for the selected course

  // Mock data variations based on tab
  const displayedData = useMemo(() => {
    if (activeTab === 'Global') return leaderboardData;
    // Shuffle/Filter for School/Class to simulate different lists
    const shuffled = [...leaderboardData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, activeTab === 'Class' ? 5 : 8);
  }, [activeTab, leaderboardData]);

  // Find the current user and exclude them from the general leaderboard list
  const currentUser = displayedData.find((user) => user.isUser);
  const leaderboardWithoutCurrentUser = displayedData.filter((user) => !user.isUser);

  // Social / Chat State
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Anyone started the Unit 4 project?", color: "text-accent" },
    { id: 2, user: "You", text: "Yeah, just started researching datasets.", color: "text-textPrimary", self: true },
    { id: 3, user: "Bob", text: "Looking for a group partner!", color: "text-yellow-400" },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: "You",
      text: inputText,
      color: "text-textPrimary",
      self: true,
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

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
              <div className={`font-black text-2xl w-12 text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-amber-600'}`}>
                {idx + 1}
              </div>
              <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs ring-2 ring-white/5">
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="font-bold text-textPrimary">{user.name}</div>
                <div className="text-xs text-textSecondary">{user.tier}</div>
              </div>
              <div className="font-mono font-bold text-accent">{user.ep.toLocaleString()} EP</div>
            </Card>
          ))}

          {/* Render the remaining leaderboard entries */}
          <div className="h-px bg-white/10 my-4"></div>
          {leaderboardWithoutCurrentUser.slice(3).map((user: LeaderboardEntry, idx: number) => (
            <Card key={user.rank} className="flex items-center gap-4 p-4 opacity-80 hover:opacity-100 transition-opacity bg-black/20 border-transparent">
              <div className="font-medium text-xl w-12 text-center text-textSecondary">
                {idx + 4}
              </div>
              <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="font-bold text-textPrimary">{user.name}</div>
                <div className="text-xs text-textSecondary">{user.tier}</div>
              </div>
              <div className="font-mono text-textSecondary">{user.ep.toLocaleString()} EP</div>
            </Card>
          ))}

          {/* Render current user in the leaderboard at the bottom */}
          {currentUser && (
            <Card className="flex items-center gap-4 p-4 border-2 border-accent bg-accent/10 sticky bottom-4 shadow-2xl transform scale-100">
              <div className="font-medium text-xl w-12 text-center text-accent">
                #{leaderboardData.indexOf(currentUser) + 1}
              </div>
              <div className="h-10 w-10 rounded-full bg-accent text-background flex items-center justify-center font-bold text-xs">
                AC
              </div>
              <div className="flex-1">
                <div className="font-bold text-textPrimary">You</div>
                <div className="text-xs text-textSecondary">{currentUser.tier}</div>
              </div>
              <div className="font-mono font-bold text-accent">{currentUser.ep.toLocaleString()} EP</div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}
