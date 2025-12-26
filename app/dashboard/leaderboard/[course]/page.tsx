"use client";

import { Card } from "@/components/ui/Card";
import { courses, CourseId } from "@/lib/courses"; // Import the courses data and type for CourseId

export default function LeaderboardPage({
  params,
}: {
  params: { course: CourseId }; // Access the course parameter from the URL
}) {
  // Retrieve the course data based on the `course` parameter from the URL
  const courseData = courses[params.course];

  if (!courseData) {
    return <p className="text-center mt-20">Course not found</p>; // Handle case if course data is not found
  }

  const leaderboardData = courseData.leaderboard || []; // Get leaderboard data for the selected course

  // Find the current user and exclude them from the general leaderboard list
  const currentUser = leaderboardData.find((user) => user.isUser);
  const leaderboardWithoutCurrentUser = leaderboardData.filter((user) => !user.isUser);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">{courseData?.name || "Course"} Scholars</h1>
        <p className="text-textSecondary">Top performers this week.</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-surface rounded-lg p-1 border border-white/5">
          {['Global', 'School', 'Class'].map((tab, i) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${i === 0 ? 'bg-accent text-background' : 'text-textSecondary hover:text-textPrimary'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Render the top 3 leaderboard entries without current user */}
        {leaderboardWithoutCurrentUser.slice(0, 3).map((user) => (
          <Card key={user.rank} className="flex items-center gap-4 p-4 border-accent/30 bg-gradient-to-r from-surface to-accent/5">
            <div className={`font-black text-2xl w-12 text-center ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
              #{user.rank}
            </div>
            <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">
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
        {leaderboardWithoutCurrentUser.slice(3).map((user) => (
          <Card key={user.rank} className="flex items-center gap-4 p-4 opacity-80 hover:opacity-100 transition-opacity">
            <div className="font-medium text-xl w-12 text-center text-textSecondary">
              #{user.rank}
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
          <Card className="flex items-center gap-4 p-4 border-2 border-accent bg-accent/10 sticky bottom-4 shadow-2xl transform scale-105">
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
            <div className="font-mono font-bold text-accent">{currentUser.ep.toLocaleString()} EP</div>
          </Card>
        )}
      </div>
    </div>
  );
}
