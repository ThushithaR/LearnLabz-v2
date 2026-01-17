"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  getUserAchievements, 
  updateUserAchievements, 
  calculateXPProgress,
  formatXP 
} from "@/lib/supabase/achievements";
import { courses, CourseId, COURSE_ID_MAP } from "@/lib/courses";
import { supabase } from "@/lib/supabase/client";

interface Achievement {
  ach_id: number;
  ach_name: string;
  ach_condition: string;
  ach_cp: number;
  course_id: number;
  ach_icon: string;
  unlocked: boolean;
  icon: string;
}

interface LevelProgress {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
  totalXPForNextLevel: number;
}

export default function AchievementsPage({ 
  params 
}: { 
  params: { course: CourseId } 
}) {
  const { course } = params;
  const courseData = courses[course];
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userXP, setUserXP] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const router = useRouter();

  // Get numeric course ID
  const numericCourseId = COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP];
  
  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }
        
        if (!session) {
          console.error("No session found - user not logged in");
          router.push("/login");
          return;
        }

        // Get user_id from users table first
        const { data: userInfo, error: userError } = await supabase
          .from("users")
          .select("user_id")
          .eq("auth_user_id", session.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user info:", userError);
          return;
        }

        if (userInfo) {
          console.log("Setting user ID:", userInfo.user_id);
          setUserId(userInfo.user_id);
          
          // Get user course data
          const { data: userCourse } = await supabase
            .from("user_courses")
            .select("xp, level")
            .eq("user_id", userInfo.user_id)
            .eq("course_id", numericCourseId)
            .single();
            
          if (userCourse) {
            console.log("User course data:", userCourse);
            setUserXP(userCourse.xp || 0);
            
            // Calculate level progress from XP
            const progress = calculateXPProgress(userCourse.xp || 0);
            setUserLevel(progress.currentLevel);
            setLevelProgress(progress);
          }
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    getUser();
  }, [router, numericCourseId]);

  const loadAchievements = async () => {
    if (!userId || !numericCourseId) {
      console.log("Missing userId or courseId:", { userId, numericCourseId });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Updating and loading achievements for user:", userId);
      
      // First update achievements based on current progress
      const result = await updateUserAchievements(userId, numericCourseId);
      const earnedXP = result.xpEarned;
      const levelUp = result.newLevel;
      const progress = result.levelProgress;
      
      console.log(`Earned ${earnedXP} XP from achievements`);
      console.log("Level progress:", progress);
      
      if (earnedXP > 0 || progress) {
        setXpEarned(earnedXP);
        if (levelUp) {
          setNewLevel(levelUp);
        }
        
        // Update state with new progress
        if (progress) {
          setUserLevel(progress.currentLevel);
          setLevelProgress(progress);
          setUserXP(progress.totalXPForNextLevel - progress.xpNeededForNextLevel);
        }
      }
      
      // Then fetch the updated list
      const achievementsData = await getUserAchievements(userId, numericCourseId);
      console.log("Loaded achievements data:", achievementsData);
      
      setAchievements(achievementsData.achievements);
      
      // Update XP and level from the response
      if (achievementsData.userXP > 0) {
        setUserXP(achievementsData.userXP);
      }
      if (achievementsData.userLevel > 0) {
        setUserLevel(achievementsData.userLevel);
      }
      if (achievementsData.levelProgress) {
        setLevelProgress(achievementsData.levelProgress);
      }
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load achievements when userId is available
  useEffect(() => {
    if (userId && numericCourseId) {
      loadAchievements();
    }
  }, [userId, numericCourseId]);

  // Function to manually refresh
  const handleRefresh = () => {
    setXpEarned(0);
    setNewLevel(null);
    loadAchievements();
  };

  if (!courseData) {
    return <p className="text-center mt-20">Course not found</p>;
  }

  if (loading && !userId) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-textPrimary">Loading...</h1>
          <p className="text-textSecondary">Please wait while we load your achievements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-textPrimary">Hall of Achievements</h1>
        <p className="text-textSecondary">Your legacy in the world of {courseData.name}.</p>
        
        {/* Level Up Notification */}
        {newLevel && (
          <div className="mt-4 p-4 bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-lg animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-bold text-accent text-lg">Level Up!</h3>
                <p className="text-textSecondary">You've reached <span className="font-bold text-accent">Level {newLevel}</span>!</p>
              </div>
            </div>
          </div>
        )}
        
        {/* User stats */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-4 mb-2">
          <div className="bg-surface/50 px-4 py-3 rounded-lg min-w-[120px]">
            <div className="text-sm text-textSecondary">Current Level</div>
            <div className="text-2xl font-bold text-accent flex items-center gap-2">
              Level {userLevel}
              {newLevel && <span className="text-sm bg-accent text-white px-2 py-1 rounded animate-bounce">↑</span>}
            </div>
          </div>
          <div className="bg-surface/50 px-4 py-3 rounded-lg min-w-[120px]">
            <div className="text-sm text-textSecondary">Total XP</div>
            <div className="text-2xl font-bold text-accent">{formatXP(userXP)} XP</div>
          </div>
          {xpEarned > 0 && (
            <div className="bg-accent/20 px-4 py-3 rounded-lg border border-accent/30 min-w-[120px]">
              <div className="text-sm text-textSecondary">New XP Earned!</div>
              <div className="text-2xl font-bold text-accent">+{formatXP(xpEarned)} XP</div>
            </div>
          )}
        </div>
        
        {/* XP Progress Bar */}
        {levelProgress && (
          <div className="mt-6 mx-auto max-w-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <span className="text-textSecondary text-sm">Level {levelProgress.currentLevel} Progress</span>
                <div className="text-lg font-bold text-accent">
                  {formatXP(levelProgress.xpInCurrentLevel)} / {formatXP(levelProgress.xpNeededForCurrentLevel)} XP
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-textSecondary text-sm">Next Level</span>
                <div className="text-lg font-bold text-accent">
                  Level {levelProgress.currentLevel + 1}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-black/30 h-4 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-gradient-to-r from-accent to-accent/70 h-full transition-all duration-700"
                style={{ 
                  width: `${Math.min(levelProgress.progressPercentage, 100)}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-textSecondary">
                Level {levelProgress.currentLevel}
              </div>
              <div className="text-accent font-semibold">
                {levelProgress.progressPercentage.toFixed(1)}%
              </div>
              <div className="text-textSecondary">
                {formatXP(levelProgress.xpNeededForNextLevel)} XP to Level {levelProgress.currentLevel + 1}
              </div>
            </div>
          </div>
        )}
        
        {/* Refresh button */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userId}
          >
            Refresh Achievements
          </button>
          {lastUpdated && (
            <span className="text-sm text-textSecondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textSecondary text-lg">No achievements found for this course.</p>
          <p className="text-textSecondary mt-2">Complete more activities to unlock achievements!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {achievements.map((ach) => (
              <Card
                key={ach.ach_id}
                className={`p-6 flex flex-col items-center justify-center text-center gap-4 group transition-all duration-300 ${
                  ach.unlocked
                    ? "border-accent/30 bg-gradient-to-br from-surface to-accent/5 hover:scale-105"
                    : "opacity-50 grayscale hover:opacity-70"
                }`}
              >
                <div className="relative">
                  <div
                    className={`text-6xl transition-transform duration-500 ${
                      ach.unlocked ? "group-hover:-translate-y-2" : ""
                    }`}
                  >
                    {ach.icon || ach.ach_icon || "🏆"}
                  </div>
                  {ach.unlocked && (
                    <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full -z-10" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-textPrimary">{ach.ach_name}</h3>
                  <p className="text-xs text-textSecondary mt-1 line-clamp-2">{ach.ach_condition}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-accent">{ach.ach_cp} CP</span>
                    {ach.unlocked && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        +{ach.ach_cp} XP
                      </span>
                    )}
                  </div>
                </div>

                {ach.unlocked ? (
                  <Badge variant="accent" className="mt-2">
                    Unlocked ✓
                  </Badge>
                ) : (
                  <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-white/20 h-full w-1/3" />
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="text-center mt-8 p-4 bg-surface/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="text-left">
                <p className="text-textSecondary">Unlocked Achievements</p>
                <p className="text-2xl font-bold text-accent">
                  {achievements.filter(a => a.unlocked).length}
                  <span className="text-textSecondary text-lg"> / {achievements.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-textSecondary">Total XP from Achievements</p>
                <p className="text-2xl font-bold text-accent">
                  {formatXP(
                    achievements
                      .filter(a => a.unlocked)
                      .reduce((total, ach) => total + ach.ach_cp, 0)
                  )} XP
                </p>
              </div>
            </div>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-accent to-accent/70 h-full transition-all duration-500"
                style={{ 
                  width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}