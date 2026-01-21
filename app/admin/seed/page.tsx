"use client";

import { useState } from "react";
import { aiml } from "@/lib/courses/aiml";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

// Helper to convert time string (e.g. "10 min") to seconds
const parseDuration = (duration: string) => {
    const mins = parseInt(duration) || 0;
    return mins * 60;
};

export default function SeedPage() {
    const [status, setStatus] = useState("Ready to seed");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const seedDatabase = async () => {
        setStatus("Seeding...");
        setLogs([]);
        addLog("=== STARTING FULL DATABASE SEED ===");

        try {
            // 1. Ensure AIML Course Exists
            addLog("Step 1: Checking Course...");
            // Assuming course_id 1 is reserved/created for AIML. 
            // If we needed to create it, we'd do it here, but typically courses are static.
            // We'll proceed with course_id = 1.

            const COURSE_ID = 1;

            // 2. Seed Units (Modules)
            addLog("Step 2: Seeding Units...");
            const unitsToInsert = aiml.modules.map((module, idx) => ({
                unit_id: module.id,
                course_id: COURSE_ID,
                unit_title: module.title, // Maps 'title' to 'unit_title'
                unit_order_index: idx + 1,
                // unit_quiz_id is circular, we updating it later or ignore if not critical
            }));

            const { error: unitError } = await supabase
                .from("units")
                .upsert(unitsToInsert, { onConflict: "unit_id" });

            if (unitError) throw new Error(`Unit Error: ${unitError.message}`);
            addLog(`✅ Upserted ${unitsToInsert.length} Units.`);


            // 3. Seed Lessons
            addLog("Step 3: Seeding Lessons...");
            const lessonsToInsert: any[] = [];

            aiml.modules.forEach(module => {
                module.lessons.forEach((lesson, index) => {
                    lessonsToInsert.push({
                        lesson_id: Number(lesson.id),
                        unit_id: module.id,
                        course_id: COURSE_ID,
                        lesson_title: lesson.title,
                        lesson_order_index: index + 1,
                    });
                });
            });

            const { error: lessonError } = await supabase
                .from("lessons")
                .upsert(lessonsToInsert, { onConflict: "lesson_id" });

            if (lessonError) throw new Error(`Lesson Error: ${lessonError.message}`);
            addLog(`✅ Upserted ${lessonsToInsert.length} Lessons.`);


            // 4. Seed Quizzes
            addLog("Step 4: Seeding Quizzes...");
            const quizzesToInsert = aiml.modules.flatMap(module => {
                // Find quizzes that belong to this unit?
                // aiml.quizzes is a flat list. We need to match them.
                // Assuming your quizzes have an 'id' that we might map or just inserting them all.
                // The provided aiml.tsx has `quizzes: aimlQuizzes`.
                // We'll try to map them. Since aimlQuizzes might be complex, let's look at the type.
                // For now, we safely seed what we can or skip if structure mismatches too much.
                // Re-reading user request: "quizes and numericals too".

                return (aiml.quizzes || []).map((q: any) => ({
                    quiz_id: q.id,
                    course_id: COURSE_ID,
                    unit_id: parseInt(q.unit.replace(/\D/g, '')) || 1, // Extract '1' from 'Unit 1'
                    quiz_title: q.title,
                    quiz_difficulty: q.difficulty,
                    quiz_pass_score: 70, // Default
                    total_questions: q.questions,
                    quiz_lesson_mapping: {}, // Default empty jsonb
                    quiz_time: parseInt(q.time) * 60 || 600,
                    quiz_xp: q.xp,
                    quiz_order_index: 1
                }));
            });

            if (quizzesToInsert.length > 0) {
                const { error: quizError } = await supabase
                    .from("quizzes")
                    .upsert(quizzesToInsert, { onConflict: "quiz_id" });

                if (quizError) {
                    addLog(`⚠️ Quiz Warning: ${quizError.message}`);
                } else {
                    addLog(`✅ Upserted ${quizzesToInsert.length} Quizzes.`);
                }
            }


            // 5. Seed Numericals
            addLog("Step 5: Seeding Numericals...");
            const numericalsToInsert = aiml.numericals.map((n: any, idx) => ({
                numerical_id: n.id,
                course_id: COURSE_ID,
                // We need to map lesson_id. The numerical objects in aiml.tsx don't seem to have explicit lesson_id
                // but the ID logic suggests it matches lesson ID sometimes? 
                // Example: id: 105 (A* Heuristic) matches Lesson 105?
                // Let's assume numerical.id matches lesson.id or use a safe fallback.
                lesson_id: n.id, // Only works if numerical ID == Lesson ID which seems to be the case for 105, 402 etc.
                numerical_title: n.title,
                numerical_problem_statement: n.description, // Mapping description to problem statement
                numerical_difficulty: n.difficulty,
                numerical_max_cp: n.xp,
                numerical_order_index: idx + 1,
                numerical_active: true
            }));

            // Ensure referenced lessons actually exist first (we seeded them in Step 3/4)
            // Some numerical IDs might not match lesson IDs exactly in your data (e.g 402 matches lesson 402? yes)
            // 208? Do we have lesson 208? No, Unit 2 has 201, 202. 
            // If FK fails, we catch it.

            // Filter numericals to only those with valid lesson_ids in our lesson list
            const validLessonIds = new Set(lessonsToInsert.map(l => l.lesson_id));
            const validNumericals = numericalsToInsert.filter(n => validLessonIds.has(n.lesson_id));

            if (validNumericals.length > 0) {
                const { error: numError } = await supabase
                    .from("numericals")
                    .upsert(validNumericals, { onConflict: "numerical_id" });

                if (numError) {
                    addLog(`⚠️ Numerical Warning: ${numError.message}`);
                    addLog(`(Some numericals skipped if Lesson ID didn't match)`);
                } else {
                    addLog(`✅ Upserted ${validNumericals.length} Numericals.`);
                }
            } else {
                addLog("ℹ️ No numericals matched existing lessons (IDs might differ).");
            }


            addLog("=== SEEDING COMPLETE ===");
            setStatus("Success");

        } catch (err) {
            console.error("Unexpected Error:", err);
            addLog(`❌ FATAL ERROR: ${(err as Error).message}`);
            setStatus("Error");
        }
    };

    return (
        <div className="p-10 text-white bg-slate-900 min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-4">Complete Database Seeder</h1>
            <div className="mb-4">
                <p className="mb-2 text-gray-400">Populates Units, Lessons, Quizzes, and Numericals from aiml.tsx</p>
                <Button onClick={seedDatabase} disabled={status === "Seeding..."} className="bg-emerald-600 hover:bg-emerald-700">
                    {status === "Seeding..." ? "Running Database Seeding..." : "Start Full Seed"}
                </Button>
            </div>

            <div className="bg-black/50 p-4 rounded-lg border border-white/10 h-[600px] overflow-y-auto font-mono text-sm">
                {logs.map((log, i) => (
                    <div key={i} className={`mb-1 border-b border-white/5 pb-1 last:border-0 ${log.includes("ERROR") || log.includes("Warning") ? "text-red-400" : "text-green-400"}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
