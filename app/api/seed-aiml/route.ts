
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { aiml } from "@/lib/courses/aiml";
// aimlQuizzes is imported within aiml.tsx but we might need to import it directly if it's not exported from aiml object
// Checked aiml.tsx: it has `quizzes: aimlQuizzes`
import { aimlQuizzes } from "@/lib/quizzes/aiml/quizzes";

export async function GET() {
    try {
        const courseId = 1; // Assuming AIML is course 1 based on previous context, will verify with index.ts

        const results = {
            numericals: 0,
            quizzes: 0,
            errors: [] as string[]
        };

        // 1. Seed Numericals
        if (aiml.numericals) {
            for (const num of aiml.numericals) {
                // Map difficulty string to enum format if needed, but DB likely takes "Hard" | "Medium" | "Easy"
                // Ensure properties match DB columns
                const { error } = await supabase.from("numericals").upsert({
                    numerical_id: num.id,
                    course_id: courseId,
                    lesson_id: 1, // Defaulting to 1 as specific mapping is missing in object, or we can try to find it
                    numerical_title: num.title,
                    numerical_problem_statement: num.description,
                    numerical_difficulty: num.difficulty,
                    numerical_max_cp: num.xp,
                    numerical_active: true,
                    numerical_order_index: num.id // efficient ordering
                });

                if (error) {
                    console.error(`Error seeding numerical ${num.id}:`, error);
                    results.errors.push(`Numerical ${num.id}: ${error.message}`);
                } else {
                    results.numericals++;
                }
            }
        }

        // 2. Seed Quizzes
        if (aimlQuizzes) {
            for (const quiz of aimlQuizzes) {
                const timeParts = quiz.time.split(' ');
                const timeVal = parseInt(timeParts[0]);
                const timeSec = timeParts[1].includes('min') ? timeVal * 60 : timeVal;

                const { error } = await supabase.from("quizzes").upsert({
                    quiz_id: quiz.id,
                    course_id: courseId,
                    unit_id: parseInt(quiz.unit.replace(/\D/g, '')) || 1,
                    quiz_title: quiz.title,
                    quiz_difficulty: quiz.difficulty,
                    quiz_pass_score: 70, // Default pass score
                    total_questions: quiz.questions,
                    quiz_lesson_mapping: quiz.questionData, // Store JSON directly
                    quiz_time: timeSec,
                    quiz_xp: quiz.xp,
                    quiz_order_index: quiz.id
                });

                if (error) {
                    console.error(`Error seeding quiz ${quiz.id}:`, error);
                    results.errors.push(`Quiz ${quiz.id}: ${error.message}`);
                } else {
                    results.quizzes++;
                }
            }
        }

        return NextResponse.json({
            message: "Seeding complete",
            results
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
