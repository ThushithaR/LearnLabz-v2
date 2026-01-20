
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProgress() {
    const courseId = 1; // AIML
    const userId = 1; // Assuming admin user or the user you are testing with

    console.log(`Checking progress for User ${userId}, Course ${courseId} (AIML)`);

    // 1. Check Lessons
    const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("lesson_id, unit_id")
        .eq("course_id", courseId);

    if (lessonsError) {
        console.error("Error fetching lessons:", lessonsError);
        return;
    }
    console.log(`Found ${lessons.length} lessons for AIML.`);
    if (lessons.length > 0) {
        console.log("Sample lesson:", lessons[0]);
    }

    // 2. Check Lesson Progress
    const { data: progress, error: progressError } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .in("lesson_id", lessons.map(l => l.lesson_id));

    if (progressError) {
        console.error("Error fetching progress:", progressError);
        return;
    }
    console.log(`Found ${progress.length} lesson progress records.`);

    // 3. Match them up
    const unitMap = {};
    lessons.forEach(l => {
        if (!unitMap[l.unit_id]) unitMap[l.unit_id] = { total: 0, completed: 0 };
        unitMap[l.unit_id].total++;

        const p = progress.find(pg => pg.lesson_id === l.lesson_id);
        if (p && (p.completed || p.lesson_progress_percent === 100)) {
            unitMap[l.unit_id].completed++;
        }
    });

    console.log("Calculated Unit Progress:");
    console.table(unitMap);
}

checkProgress();
