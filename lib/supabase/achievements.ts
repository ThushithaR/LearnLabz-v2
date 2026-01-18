import { supabase } from "./client";

interface UserCourseData {
  xp: number;
  level: number;
  lessons_completed: number;
  units_completed: number;
  total_units: number;
  quizzes_passed: number;
  quiz_avg_score: number;
  numericals_solved: number;
  streak_days: number;
  notes_created: number;
}

// ================ EXPONENTIAL LEVEL SYSTEM ================
const LEVEL_CONFIG = {
  baseXP: 200,        // XP needed for level 1 to 2
  growthFactor: 2,    // Multiplier for each level (2 = double each time)
  maxLevel: 100,      // Maximum level cap
};

// Calculate XP required for a specific level
function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0; // Level 1 requires 0 XP
  
  // Exponential formula: XP = baseXP * (growthFactor^(level-2))
  // Level 1-2: 200 XP
  // Level 2-3: 400 XP
  // Level 3-4: 800 XP
  // Level 4-5: 1600 XP, etc.
  return LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.growthFactor, level - 2);
}

// Calculate total XP needed to reach a level
function totalXPForLevel(targetLevel: number): number {
  let totalXP = 0;
  for (let level = 2; level <= targetLevel; level++) {
    totalXP += xpRequiredForLevel(level);
  }
  return totalXP;
}

// Calculate level based on XP using efficient formula
export function calculateLevelFromXP(xp: number): number {
  if (xp < LEVEL_CONFIG.baseXP) return 1;
  
  // For exponential growth with factor 2, we can use:
  // level = floor(log2((xp / baseXP) * (growthFactor - 1) + 1)) + 1
  const level = Math.floor(
    Math.log2((xp / LEVEL_CONFIG.baseXP) * (LEVEL_CONFIG.growthFactor - 1) + 1)
  ) + 1;
  
  return Math.min(level, LEVEL_CONFIG.maxLevel);
}

// Calculate XP progress for current level
export function calculateXPProgress(xp: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
  totalXPForNextLevel: number;
} {
  const currentLevel = calculateLevelFromXP(xp);
  
  // Total XP needed to reach current level
  const totalXPForCurrentLevel = totalXPForLevel(currentLevel);
  
  // Total XP needed to reach next level
  const totalXPForNextLevel = totalXPForLevel(currentLevel + 1);
  
  // XP in current level (since reaching current level)
  const xpInCurrentLevel = xp - totalXPForCurrentLevel;
  
  // XP needed to complete current level
  const xpNeededForCurrentLevel = totalXPForNextLevel - totalXPForCurrentLevel;
  
  // XP still needed for next level
  const xpNeededForNextLevel = totalXPForNextLevel - xp;
  
  // Progress percentage
  const progressPercentage = xpNeededForCurrentLevel > 0 
    ? (xpInCurrentLevel / xpNeededForCurrentLevel) * 100 
    : 0;
  
  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage,
    totalXPForNextLevel
  };
}

// Format XP for display (1000 -> 1K, 1000000 -> 1M)
export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

// Generate level requirements for display
export function generateLevelRequirements(maxLevel: number = 10): Array<{
  level: number;
  xpRequired: number;
  totalXP: number;
}> {
  const levels = [];
  let totalXP = 0;
  
  for (let level = 1; level <= maxLevel; level++) {
    const xpRequired = level === 1 ? 0 : xpRequiredForLevel(level);
    totalXP += xpRequired;
    
    levels.push({
      level,
      xpRequired,
      totalXP: level === 1 ? 0 : totalXP
    });
  }
  
  return levels;
}
// ================ END EXPONENTIAL LEVEL SYSTEM ================

export async function updateUserAchievements(userId: number, courseId: number) {
  try {
    console.log(`Updating achievements for user ${userId}, course ${courseId}`);
    
    // 1️⃣ Fetch achievements for this course
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .eq("course_id", courseId);

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return { xpEarned: 0, newLevel: null, levelProgress: null };
    }

    if (!achievements?.length) {
      console.log("No achievements found for course:", courseId);
      return { xpEarned: 0, newLevel: null, levelProgress: null };
    }

    // 2️⃣ Fetch user course progress
    const { data: userCourse, error: userCourseError } = await supabase
      .from("user_courses")
      .select("xp, level, quizzes_passed, numericals_solved, streak_days")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (userCourseError) {
      console.error("Error fetching user course:", userCourseError);
      return { xpEarned: 0, newLevel: null, levelProgress: null };
    }

    if (!userCourse) {
      console.log("No user course found");
      return { xpEarned: 0, newLevel: null, levelProgress: null };
    }

    console.log("Current user course data:", userCourse);

    // 3️⃣ Calculate level based on exponential formula
    const currentXP = userCourse.xp || 0;
    const currentDBLevel = userCourse.level || 1;
    const calculatedLevel = calculateLevelFromXP(currentXP);
    const levelProgress = calculateXPProgress(currentXP);
    
    console.log(`XP: ${currentXP}, DB Level: ${currentDBLevel}, Calculated Level: ${calculatedLevel}`);
    console.log(`Level Progress:`, levelProgress);
    
    // If there's a mismatch, we should correct it
    const shouldUpdateLevel = currentDBLevel !== calculatedLevel;

    // 4️⃣ Fetch derived progress
    const [
      lessonsRes,
      unitsRes,
      quizRes,
      notesRes,
      totalUnitsRes,
      numericalAttemptsRes
    ] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", true)
        .eq("course_id", courseId),
      supabase
        .from("unit_progress")
        .select("unit_progress_percent, unit_unlocked")
        .eq("user_id", userId)
        .eq("course_id", courseId),
      supabase
        .from("quiz_attempts")
        .select("qa_score")
        .eq("user_id", userId)
        .eq("course_id", courseId),
      supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId),
      supabase
        .from("units")
        .select("unit_id")
        .eq("course_id", courseId),
      supabase
        .from("numerical_attempts")
        .select("is_correct")
        .eq("user_id", userId)
        .eq("course_id", courseId)
    ]);

    // Calculate completed units (assuming 100% progress means completed)
    const completedUnits = unitsRes.data?.filter(unit => unit.unit_progress_percent >= 100)?.length || 0;
    const totalUnits = totalUnitsRes.data?.length || 0;
    
    // Calculate quiz average score
    const quizScores = quizRes.data?.map(q => q.qa_score) || [];
    const avgQuizScore = quizScores.length > 0 
      ? Math.round((quizScores.reduce((a, b) => a + b, 0) / quizScores.length) * 10) / 10 
      : 0;

    // Count correct numerical attempts
    const correctNumericals = numericalAttemptsRes.data?.filter(na => na.is_correct)?.length || 0;

    // Start with current user data
    const userData: UserCourseData = {
      xp: currentXP,
      level: calculatedLevel, // Use calculated level for achievement conditions
      lessons_completed: lessonsRes.data?.length || 0,
      units_completed: completedUnits,
      total_units: totalUnits,
      quizzes_passed: userCourse.quizzes_passed || 0,
      quiz_avg_score: avgQuizScore,
      numericals_solved: correctNumericals,
      streak_days: userCourse.streak_days || 0,
      notes_created: notesRes.data?.length || 0,
    };

    console.log("User data for achievements:", userData);

    // 5️⃣ Already unlocked achievements
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from("user_achievements")
      .select("ach_id")
      .eq("user_id", userId);

    if (unlockedError) {
      console.error("Error fetching unlocked achievements:", unlockedError);
      return { xpEarned: 0, newLevel: null, levelProgress };
    }

    const unlockedIds = unlockedAchievements?.map(a => a.ach_id) || [];

    // 6️⃣ Evaluate conditions and unlock
    let totalXPEarned = 0;
    const unlockedNow: number[] = [];
    
    for (const ach of achievements) {
      if (unlockedIds.includes(ach.ach_id)) continue;

      // Replace placeholders in condition string with actual values
      let condition = ach.ach_condition
        .replace(/\b(xp)\b/g, userData.xp.toString())
        .replace(/\b(level)\b/g, userData.level.toString())
        .replace(/\b(lessons_completed)\b/g, userData.lessons_completed.toString())
        .replace(/\b(units_completed)\b/g, userData.units_completed.toString())
        .replace(/\b(total_units)\b/g, userData.total_units.toString())
        .replace(/\b(quizzes_passed)\b/g, userData.quizzes_passed.toString())
        .replace(/\b(quiz_avg_score)\b/g, userData.quiz_avg_score.toString())
        .replace(/\b(numericals_solved)\b/g, userData.numericals_solved.toString())
        .replace(/\b(streak_days)\b/g, userData.streak_days.toString())
        .replace(/\b(notes_created)\b/g, userData.notes_created.toString())
        .replace(/\bAND\b/g, "&&")
        .replace(/\bOR\b/g, "||");

      // Fix the condition to be valid JavaScript
      condition = condition.replace(/(\w+)\s*>=\s*(\w+)/g, "$1 >= $2")
                          .replace(/(\w+)\s*=\s*(\w+)/g, "$1 == $2");

      let unlocked = false;
      try {
        // Evaluate the condition
        unlocked = eval(condition);
        console.log(`Achievement ${ach.ach_name}: condition="${condition}" result=${unlocked}`);
      } catch (e) {
        console.error(`Failed to evaluate achievement "${ach.ach_name}":`, condition, e);
        continue;
      }

      if (unlocked) {
        console.log(`Unlocking achievement: ${ach.ach_name} with ${ach.ach_cp} CP`);
        
        // 1. Insert the achievement
        const { error: insertError } = await supabase
          .from("user_achievements")
          .insert({ 
            user_id: userId, 
            ach_id: ach.ach_id 
          });

        if (insertError) {
          console.error("Error inserting achievement:", insertError);
          continue;
        }

        // 2. Add XP to running total
        totalXPEarned += ach.ach_cp;
        userData.xp += ach.ach_cp; // Update for subsequent evaluations
        unlockedNow.push(ach.ach_id);
      }
    }

    // 7️⃣ Update XP and level in database if any achievements were unlocked OR level needs correction
    let newCalculatedLevel = calculatedLevel;
    let levelIncreased = false;
    let needsLevelUpdate = shouldUpdateLevel;
    let finalXP = currentXP + totalXPEarned;
    
    if (totalXPEarned > 0 || needsLevelUpdate) {
      if (totalXPEarned > 0) {
        const newXP = currentXP + totalXPEarned;
        const newProgress = calculateXPProgress(newXP);
        newCalculatedLevel = newProgress.currentLevel;
        finalXP = newXP;
        
        console.log(`Updating XP from ${currentXP} to ${newXP}, level from ${currentDBLevel} to ${newCalculatedLevel}`);
      } else {
        console.log(`Correcting level from ${currentDBLevel} to ${calculatedLevel}`);
      }
      
      // Update both XP AND level
      const { error: updateError } = await supabase
        .from("user_courses")
        .update({ 
          xp: finalXP,
          level: newCalculatedLevel
        })
        .eq("user_id", userId)
        .eq("course_id", courseId);

      if (updateError) {
        console.error("Error updating user XP and level:", updateError);
      } else {
        console.log(`Updated: XP=${finalXP}, Level=${newCalculatedLevel}`);
        levelIncreased = newCalculatedLevel > currentDBLevel;
      }
    }

    console.log(`Unlocked ${unlockedNow.length} new achievements, earned ${totalXPEarned} XP`);
    
    // Calculate final progress
    const finalProgress = calculateXPProgress(finalXP);
    
    return { 
      xpEarned: totalXPEarned, 
      newLevel: levelIncreased ? newCalculatedLevel : null,
      levelProgress: finalProgress
    };
    
  } catch (error) {
    console.error("Unexpected error in updateUserAchievements:", error);
    return { xpEarned: 0, newLevel: null, levelProgress: null };
  }
}

export async function getUserAchievements(userId: number, courseId: number) {
  try {
    console.log(`Getting achievements for user ${userId}, course ${courseId}`);
    
    // Also get user XP and level
    const { data: userCourse } = await supabase
      .from("user_courses")
      .select("xp, level")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    // Fetch all achievements for the course
    const { data: allAchievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .eq("course_id", courseId)
      .order("ach_cp", { ascending: true });

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return { achievements: [], userXP: 0, userLevel: 1, levelProgress: null };
    }

    // Fetch user's unlocked achievements
    const { data: userUnlocked, error: unlockedError } = await supabase
      .from("user_achievements")
      .select("ach_id")
      .eq("user_id", userId);

    if (unlockedError) {
      console.error("Error fetching unlocked achievements:", unlockedError);
      return { achievements: [], userXP: 0, userLevel: 1, levelProgress: null };
    }

    const unlockedIds = userUnlocked?.map(a => a.ach_id) || [];

    // Calculate level progress
    const currentXP = userCourse?.xp || 0;
    const levelProgress = calculateXPProgress(currentXP);

    console.log(`Found ${allAchievements?.length || 0} achievements, ${unlockedIds.length} unlocked`);
    console.log(`User XP: ${currentXP}, Level: ${levelProgress.currentLevel}`);

    // Return achievements with unlocked status and icon
    return { 
      achievements: allAchievements?.map(ach => ({
        ...ach,
        unlocked: unlockedIds.includes(ach.ach_id),
        icon: ach.ach_icon || "🏆",
      })) || [],
      userXP: currentXP,
      userLevel: levelProgress.currentLevel,
      levelProgress
    };
    
  } catch (error) {
    console.error("Unexpected error in getUserAchievements:", error);
    return { achievements: [], userXP: 0, userLevel: 1, levelProgress: null };
  }
}

// Function to recalculate level based on current XP
export async function recalculateUserLevel(userId: number, courseId: number) {
  try {
    console.log(`Recalculating level for user ${userId}, course ${courseId}`);
    
    // Fetch current user data
    const { data: userCourse, error: fetchError } = await supabase
      .from("user_courses")
      .select("xp, level")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (fetchError) {
      console.error("Error fetching user course:", fetchError);
      return { success: false, newLevel: null };
    }

    if (!userCourse) {
      console.log("No user course found");
      return { success: false, newLevel: null };
    }

    const currentXP = userCourse.xp || 0;
    const currentLevel = userCourse.level || 1;
    
    // Calculate what level SHOULD be based on XP
    const calculatedLevel = calculateLevelFromXP(currentXP);
    
    console.log(`Current: ${currentXP} XP, Level ${currentLevel}, Calculated: Level ${calculatedLevel}`);
    
    // If levels don't match, update to correct level
    if (currentLevel !== calculatedLevel) {
      console.log(`Updating level from ${currentLevel} to ${calculatedLevel}`);
      
      const { error: updateError } = await supabase
        .from("user_courses")
        .update({ 
          level: calculatedLevel
        })
        .eq("user_id", userId)
        .eq("course_id", courseId);

      if (updateError) {
        console.error("Error updating user level:", updateError);
        return { success: false, newLevel: null };
      }
      
      const levelIncreased = calculatedLevel > currentLevel;
      return { 
        success: true, 
        newLevel: levelIncreased ? calculatedLevel : null,
        currentLevel: calculatedLevel
      };
    }
    
    // No change needed
    return { 
      success: true, 
      newLevel: null,
      currentLevel
    };
    
  } catch (error) {
    console.error("Unexpected error in recalculateUserLevel:", error);
    return { success: false, newLevel: null };
  }
}