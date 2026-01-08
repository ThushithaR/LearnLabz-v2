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
    // Sequential logic: Only unlock next if previous is completed? 
    // Usually numericals might be open or sequential. Assuming sequential for now like quizzes.
    let isPreviousCompleted = true; // First one is unlocked

    for (const dbNum of dbNumericals) {
      // Find best/successful attempt
      const myAttempts = attempts.filter(a => a.numerical_id === dbNum.numerical_id);
      const isCompleted = myAttempts.some(a => a.is_correct);

      let status:  "New" | "Completed" | "Pending" ;

      if (isCompleted) {
        status = "Completed";
      } else if (isPreviousCompleted) {
        status = "New"; // Available
      } else {
        status = "Pending";
      }

      transformedNumericals.push({
        id: dbNum.numerical_id,
        courseId: dbNum.course_id,
        lessonId: dbNum.lesson_id,
        title: dbNum.numerical_title,
        description: dbNum.numerical_problem_statement || "No description available",
        topic: "General", // Missing in DB
        difficulty: (dbNum.numerical_difficulty.charAt(0).toUpperCase() + dbNum.numerical_difficulty.slice(1).toLowerCase()) as "Easy" | "Medium" | "Hard",
        xp: dbNum.numerical_max_cp,
        status: status,
        topics: []
      });

      // Update sequential flag
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
      status: "New", // Default for single fetch
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
  penalty_percent,
  cp,
  time_taken
}: {
  user_id: number;
  numerical_id: number;
  is_correct: boolean;
  penalty_percent: number;
  cp: number;
  time_taken: number;
}) {
  return supabase.from("numerical_attempts").insert({
    user_id,
    numerical_id,
    is_correct,
    penalty_percent,
    numerical_got_cp: cp,
    time_taken_sec: time_taken
  }).select();
}
