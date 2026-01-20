
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing - normally use env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"; // Replace with actual from .env.local if needed, but I'll read file first
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// I will read the .env.local file to get the real keys
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');

    const urlMatch = envConfig.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = envConfig.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

    if (urlMatch && keyMatch) {
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();
        runDebug(url, key);
    } else {
        console.error("Could not parse .env.local");
    }
} catch (e) {
    console.error("Could not read .env.local", e);
}

async function runDebug(url, key) {
    const supabase = createClient(url, key);
    const courseId = 1; // AIML
    // We need a user ID. I'll search for the user 'alex@learnlabz.com' as a fallback, or just list all progress

    console.log("Fetching lessons for Course 1 (AIML)...");
    const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('lesson_id, unit_id, lesson_title')
        .eq('course_id', courseId);

    if (lErr) return console.error(lErr);
    console.log(`Found ${lessons.length} lessons.`);

    // Group lessons by unit
    const lessonsByUnit = {};
    lessons.forEach(l => {
        if (!lessonsByUnit[l.unit_id]) lessonsByUnit[l.unit_id] = [];
        lessonsByUnit[l.unit_id].push(l.lesson_id);
    });
    console.log("Lessons per unit:", Object.keys(lessonsByUnit).map(u => `Unit ${u}: ${lessonsByUnit[u].length} lessons`));

    console.log("Fetching lesson_progress...");
    const { data: progress, error: pErr } = await supabase
        .from('lesson_progress')
        .select('*')
        .in('lesson_id', lessons.map(l => l.lesson_id)); // Get all progress for these lessons

    if (pErr) return console.error(pErr);
    console.log(`Found ${progress.length} total progress records for these lessons.`);

    // Analyze for specific users
    const userProgress = {};
    progress.forEach(p => {
        if (!userProgress[p.user_id]) userProgress[p.user_id] = [];
        userProgress[p.user_id].push(p);
    });

    console.log(`Found data for ${Object.keys(userProgress).length} users.`);

    Object.keys(userProgress).forEach(uid => {
        console.log(`\nUser ${uid}:`);
        const userP = userProgress[uid];

        // Calculate unit progress for this user
        Object.keys(lessonsByUnit).forEach(unitId => {
            const unitLessonIds = lessonsByUnit[unitId];
            const completedCount = unitLessonIds.filter(lid => {
                const p = userP.find(up => up.lesson_id === lid);
                return p && (p.completed || p.lesson_progress_percent >= 100);
            }).length;

            const percent = Math.round((completedCount / unitLessonIds.length) * 100);
            console.log(`  Unit ${unitId}: ${completedCount}/${unitLessonIds.length} completed (${percent}%)`);
        });
    });
}
