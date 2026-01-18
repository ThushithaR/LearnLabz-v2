import { supabase } from "./client";
import { getCurrentUserProfile } from "./profile";
import { Numerical } from "@/lib/types/course";

// DB Row Type
interface DBNumerical {
  numerical_id: number;
  course_id: number;
  lesson_id: number;
  numerical_title: string;
  numerical_problem_statement: string;
  numerical_difficulty: "Easy" | "Medium" | "Hard";
  numerical_max_cp: number;
  numerical_active: boolean;
  numerical_order_index: number;
}

interface DBNumericalAttempt {
  na_id: number;
  user_id: number;
  numerical_id: number;
  is_correct: boolean;
  penalty_percent: number;
  numerical_got_cp: number;
  time_taken_sec: number;
}

// Exponential level configuration (same as achievements.ts)
const LEVEL_CONFIG = {
  baseXP: 200,
  growthFactor: 2,
  maxLevel: 100,
};

// Calculate level based on XP (copied from achievements.ts)
function calculateLevelFromXP(xp: number): number {
  if (xp < LEVEL_CONFIG.baseXP) return 1;
  
  const level = Math.floor(
    Math.log2((xp / LEVEL_CONFIG.baseXP) * (LEVEL_CONFIG.growthFactor - 1) + 1)
  ) + 1;
  
  return Math.min(level, LEVEL_CONFIG.maxLevel);
}

export async function getNumericalsByCourse(courseId: number): Promise<Numerical[]> {
  try {
    const user = await getCurrentUserProfile();

    // 1. Fetch active numericals for the course
    const { data: numericalsData, error: numericalsError } = await supabase
      .from("numericals")
      .select("*")
      .eq("course_id", courseId)
      .eq("numerical_active", true)
      .order("numerical_order_index", { ascending: true });

    if (numericalsError) {
      console.error("Error fetching numericals:", numericalsError);
      return [];
    }

    const dbNumericals = numericalsData as DBNumerical[];
    let attempts: DBNumericalAttempt[] = [];

    // 2. Fetch user attempts
    if (user) {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("numerical_attempts")
        .select("*")
        .eq("user_id", user.user_id);

      if (!attemptsError) {
        attempts = attemptsData as DBNumericalAttempt[];
      }
    }

    // 3. Transform and Calculate Status
    const transformedNumericals: Numerical[] = [];
    let isPreviousCompleted = true;

    for (const dbNum of dbNumericals) {
      const myAttempts = attempts.filter(a => a.numerical_id === dbNum.numerical_id);
      const isCompleted = myAttempts.some(a => a.is_correct);

      let status: "New" | "Completed" | "Pending";

      if (isCompleted) {
        status = "Completed";
      } else if (isPreviousCompleted) {
        status = "New";
      } else {
        status = "Pending";
      }

      transformedNumericals.push({
        id: dbNum.numerical_id,
        courseId: dbNum.course_id,
        lessonId: dbNum.lesson_id,
        title: dbNum.numerical_title,
        description: dbNum.numerical_problem_statement || "No description available",
        topic: "General",
        difficulty: (dbNum.numerical_difficulty.charAt(0).toUpperCase() + dbNum.numerical_difficulty.slice(1).toLowerCase()) as "Easy" | "Medium" | "Hard",
        xp: dbNum.numerical_max_cp,
        status: status,
        topics: []
      });

      if (!isCompleted) {
        isPreviousCompleted = false;
      }
    }

    return transformedNumericals;

  } catch (error) {
    console.error("Unexpected error in getNumericalsByCourse:", error);
    return [];
  }
}

export async function getNumericalById(numericalId: number): Promise<Numerical | null> {
  try {
    const { data, error } = await supabase
      .from("numericals")
      .select("*")
      .eq("numerical_id", numericalId)
      .single();

    if (error || !data) {
      console.error("Error fetching numerical:", error);
      return null;
    }

    const dbNum = data as DBNumerical;

    return {
      id: dbNum.numerical_id,
      courseId: dbNum.course_id,
      lessonId: dbNum.lesson_id,
      title: dbNum.numerical_title,
      description: dbNum.numerical_problem_statement || "",
      topic: "General",
      difficulty: (dbNum.numerical_difficulty.charAt(0).toUpperCase() + dbNum.numerical_difficulty.slice(1).toLowerCase()) as "Easy" | "Medium" | "Hard",
      xp: dbNum.numerical_max_cp,
      status: "New",
      topics: []
    };

  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function submitNumericalAttempt({
  user_id,
  numerical_id,
  is_correct,
  penalty_percent = 0, // Default to 0, can be overridden if needed
  cp,
  time_taken
}: {
  user_id: number;
  numerical_id: number;
  is_correct: boolean;
  penalty_percent?: number; // Optional now
  cp: number;
  time_taken: number;
}) {
  try {
    console.log("Submitting numerical attempt:", {
      user_id,
      numerical_id,
      is_correct,
      penalty_percent,
      cp,
      time_taken
    });

    // 1. Get numerical details including course_id
    const { data: numericalData, error: numericalError } = await supabase
      .from("numericals")
      .select("course_id, numerical_max_cp, numerical_title")
      .eq("numerical_id", numerical_id)
      .single();

    if (numericalError) {
      console.error("Error fetching numerical data:", numericalError);
      return { data: null, error: numericalError };
    }

    const courseId = numericalData.course_id;
    
    // 2. Calculate XP earned (100% match required)
    // Only give XP if is_correct is true (answers 100% match)
    const xpEarned = is_correct ? cp : 0;
    
    console.log(`Numerical "${numericalData.numerical_title}": ${is_correct ? 'CORRECT' : 'INCORRECT'}, XP: ${xpEarned}`);

    // 3. Submit the attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from("numerical_attempts")
      .insert({
        user_id,
        numerical_id,
        is_correct,
        penalty_percent, // Will be 0 by default
        numerical_got_cp: xpEarned,
        time_taken_sec: time_taken
      })
      .select()
      .single();

    if (attemptError) {
      console.error("Error submitting numerical attempt:", attemptError);
      return { data: null, error: attemptError };
    }

    console.log("Numerical attempt saved successfully");

    // 4. Update user XP and level if answer is correct (100% match)
    if (is_correct && xpEarned > 0) {
      console.log(`Updating XP and level: +${xpEarned} XP for user ${user_id}`);
      
      // Get current user progress
      const { data: userCourse, error: userError } = await supabase
        .from("user_courses")
        .select("xp, level, numericals_solved")
        .eq("user_id", user_id)
        .eq("course_id", courseId)
        .single();

      if (userError) {
        console.error("Error fetching user course data:", userError);
        return { data: attemptData, error: null }; // Still return success for attempt
      }

      if (userCourse) {
        const currentXP = userCourse.xp || 0;
        const currentLevel = userCourse.level || 1;
        const newXP = currentXP + xpEarned;
        const newLevel = calculateLevelFromXP(newXP);
        const levelIncreased = newLevel > currentLevel;

        console.log(`XP: ${currentXP} → ${newXP}, Level: ${currentLevel} → ${newLevel}`);

        // Update user_courses with new XP, level, and increment solved count
        const { error: updateError } = await supabase
          .from("user_courses")
          .update({
            xp: newXP,
            level: newLevel,
            numericals_solved: (userCourse.numericals_solved || 0) + 1,
            last_active: new Date().toISOString()
          })
          .eq("user_id", user_id)
          .eq("course_id", courseId);

        if (updateError) {
          console.error("Error updating user XP and level:", updateError);
        } else {
          console.log(`User updated: ${newXP} XP, Level ${newLevel}`);
          
          if (levelIncreased) {
            console.log(`🎉 LEVEL UP! User is now level ${newLevel}`);
          }
        }
      }
    } else {
      console.log("No XP awarded - answer was incorrect");
    }

    return { data: attemptData, error: null };
    
  } catch (error) {
    console.error("Unexpected error in submitNumericalAttempt:", error);
    return { data: null, error: error as Error };
  }
}