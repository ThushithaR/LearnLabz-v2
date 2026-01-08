import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
    // 1. Fetch ALL quizzes to see what IDs exist
    const { data: allQuizzes, error: allError } = await supabase
        .from("quizzes")
        .select("quiz_id, course_id, quiz_title");

    if (allError) {
        return NextResponse.json({ error: allError }, { status: 500 });
    }

    // 2. Fetch quizzes SPECIFICALLY for course 2
    const { data: course2Quizzes, error: course2Error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", 2);

    return NextResponse.json({
        allQuizzes,
        course2Quizzes,
        course2Error
    });
}
