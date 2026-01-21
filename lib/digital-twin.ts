import { LearnerProfile } from "@/lib/types/course";
import { courses, CourseId } from "@/lib/courses";

/**
 * Calculates the Digital Twin learner profile based on user data.
 * Adheres strictly to the logic and formulas provided in the metric suite.
 */
export function calculateDigitalTwin(
    quizAttempts: any[],
    lessonProgress: any[],
    unitProgress: any[],
    userStats: any = null,
    courseId: number = 2
): LearnerProfile {
    // 1. Course Context Setup
    const courseKeyMap: Record<number, CourseId> = { 1: 'aiml', 2: 'nlp', 3: 'foundation' };
    const courseKey = courseKeyMap[courseId] || 'nlp';
    const activeCourse = courses[courseKey];
    const DEFAULT_UNIT_EXPECTED_TIME = 900; // 15 mins

    // Helper for chronological sorting
    const sortedAttempts = [...quizAttempts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // --- 1️⃣ QUIZ PERFORMANCE PATTERNS ---

    // 1.1 Quiz Accuracy (per quiz attempt)
    // Formula: qa_correct_count / total_questions
    const totalCorrect = quizAttempts.reduce((acc, curr) => acc + (curr.qa_correct_count || 0), 0);
    const totalQuestions = quizAttempts.reduce((acc, curr) => acc + (curr.total_questions || 0), 0);
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) : 0;

    // 1.3 Quiz Accuracy Trend
    // Formula: AVG(last_3_quiz_accuracy) − AVG(previous_3_quiz_accuracy)
    const accuracies = sortedAttempts.map(a => (a.total_questions > 0 ? a.qa_correct_count / a.total_questions : 0));
    const last3 = accuracies.slice(-3);
    const prev3 = accuracies.slice(-6, -3);
    const avgLast3 = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;
    const avgPrev3 = prev3.length > 0 ? prev3.reduce((a, b) => a + b, 0) / prev3.length : 0;
    const accuracyTrend = avgLast3 - avgPrev3;

    // 1.4 Difficulty-Wise Accuracy
    // Formula: SUM(qa_correct_count) / SUM(total_questions) Grouped by quizzes.quiz_difficulty
    const diffStats: Record<string, { correct: number, total: number }> = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    quizAttempts.forEach(a => {
        const diff = (a.quizzes?.quiz_difficulty || 'easy').toLowerCase();
        if (diffStats[diff]) {
            diffStats[diff].correct += (a.qa_correct_count || 0);
            diffStats[diff].total += (a.total_questions || 0);
        }
    });

    // --- 2️⃣ TIME SPENT vs EXPECTED TIME ---

    const lessonTimeRatios: Record<number, any> = {};
    const focusLessonsMap: Record<number, { lesson_id: number, unit_id: number, lesson_title: string, reason: 'low_accuracy' | 'rushing' | 'struggling' }> = {};

    lessonProgress.forEach(p => {
        const lid = p.lesson_id;
        if (lid) {
            const uid = p.unit_id || p.lessons?.unit_id;
            const staticUnit = activeCourse?.modules.find(m => m.id === uid);
            const unitExpectedSec = staticUnit?.expectedDuration
                ? (parseInt(staticUnit.expectedDuration) * 60)
                : DEFAULT_UNIT_EXPECTED_TIME;
            const lessonCount = staticUnit?.lessons.length || 1;
            const expectedTimeSec = Math.round(unitExpectedSec / lessonCount);

            const actualTimeSec = p.lesson_time_spent_sec || 0;
            const ratio = actualTimeSec / Math.max(1, expectedTimeSec);
            let status: 'rushing' | 'ideal' | 'struggling' = 'ideal';
            if (ratio < 0.6) {
                status = 'rushing';
                focusLessonsMap[lid] = { lesson_id: lid, unit_id: uid, lesson_title: p.lessons?.title || `Lesson ${lid}`, reason: 'rushing' };
            }
            else if (ratio > 1.5) {
                status = 'struggling';
                focusLessonsMap[lid] = { lesson_id: lid, unit_id: uid, lesson_title: p.lessons?.title || `Lesson ${lid}`, reason: 'struggling' };
            }

            lessonTimeRatios[lid] = {
                actual_time_sec: actualTimeSec,
                expected_time_sec: expectedTimeSec,
                ratio: ratio,
                status: status
            };
        }
    });

    // 2.4 Quiz Time Ratio
    const totalTakenTime = quizAttempts.reduce((acc, curr) => acc + (curr.time_taken_sec || 0), 0);
    const totalExpectedQuizTime = quizAttempts.reduce((acc, curr) => acc + (curr.quizzes?.quiz_time || 600), 0);
    const overallQuizTimeRatio = totalExpectedQuizTime > 0 ? totalTakenTime / totalExpectedQuizTime : 1;

    // Add quiz-based focus lessons
    quizAttempts.forEach(a => {
        const acc = a.total_questions > 0 ? a.qa_correct_count / a.total_questions : 0;
        if (acc < 0.7) {
            if (a.quizzes) {
                const quizTitle = a.quizzes.quiz_title || `Quiz ${a.quiz_id}`;
                const focusId = a.quiz_id;
                const uid = a.quizzes.unit_id || 1;

                // Try to find if this quiz matches a lesson title in the same unit
                let lessonTitle = quizTitle;
                const unit = activeCourse?.modules.find(m => m.id === uid);
                const matchingLesson = unit?.lessons.find(l => l.id === focusId || quizTitle.includes(l.title));
                if (matchingLesson) lessonTitle = matchingLesson.title;

                focusLessonsMap[focusId] = {
                    lesson_id: focusId,
                    unit_id: uid,
                    lesson_title: lessonTitle,
                    reason: 'low_accuracy'
                };
            }
        }
    });

    // --- 4️⃣ ATTEMPT BEHAVIOR ---

    const quizMap: Record<number, any[]> = {};
    sortedAttempts.forEach(a => {
        if (!quizMap[a.quiz_id]) quizMap[a.quiz_id] = [];
        quizMap[a.quiz_id].push(a);
    });

    // 4.1 First-Attempt Accuracy
    // Formula: COUNT(first_attempt_correct = true) / COUNT(DISTINCT quiz_id)
    const distinctQuizzes = Object.keys(quizMap).length;
    let firstAttemptCorrectCount = 0;
    Object.values(quizMap).forEach(attempts => {
        const firstAttempt = attempts[0];
        if (firstAttempt && (firstAttempt.qa_correct_count === firstAttempt.total_questions && firstAttempt.total_questions > 0)) {
            firstAttemptCorrectCount++;
        }
    });
    const firstAttemptAccuracy = distinctQuizzes > 0 ? (firstAttemptCorrectCount / distinctQuizzes) : 0;

    // 4.2 Retry Depth
    // Formula: COUNT(*) / COUNT(DISTINCT quiz_id)
    const retryDepth = distinctQuizzes > 0 ? (quizAttempts.length / distinctQuizzes) : 1;

    // 4.3 Average Attempt Time
    // Formula: AVG(time_taken_sec)
    const avgAttemptTime = quizAttempts.length > 0 ? (totalTakenTime / quizAttempts.length) : 0;

    // 4.4 Guessing Detection
    // Formula: (avg_time_per_attempt < threshold) AND (first_attempt_accuracy < 0.5)
    const GUESSING_THRESHOLD_SEC = 45; // 45 seconds per quiz attempt as threshold
    const guessingFlag = (avgAttemptTime < GUESSING_THRESHOLD_SEC) && (firstAttemptAccuracy < 0.5);

    // --- 5️⃣ UNIT-LEVEL PROGRESS METRICS ---

    const unitMetrics: Record<number, { completion_percent: number }> = {};
    unitProgress.forEach(up => {
        unitMetrics[up.unit_id] = {
            completion_percent: up.unit_progress_percent || 0
        };
    });

    // --- 6️⃣ COURSE-LEVEL DIGITAL TWIN SIGNALS ---

    // Enrollment and Active Days calculation
    const enrollmentDate = userStats?.created_at ? new Date(userStats.created_at) : new Date();
    const activeDays = Math.max(1, Math.ceil((new Date().getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)));

    const courseSignals = {
        progress_percent: userStats?.uc_progress_percent || 0, // 6.1 Course Progress
        streak_days: userStats?.streak_days || 0, // 6.2 Learning Consistency
        // 6.3 Engagement Velocity (quizzes_passed + numericals_solved) / active_days
        engagement_rate: ((userStats?.quizzes_passed || 0) + (userStats?.numericals_solved || 0)) / activeDays
    };

    return {
        quiz_performance: {
            accuracy: overallAccuracy,
            trend: accuracyTrend,
            difficulty_wise_accuracy: {
                easy: diffStats.easy.total > 0 ? diffStats.easy.correct / diffStats.easy.total : 0,
                medium: diffStats.medium.total > 0 ? diffStats.medium.correct / diffStats.medium.total : 0,
                hard: diffStats.hard.total > 0 ? diffStats.hard.correct / diffStats.hard.total : 0,
            }
        },
        time_analysis: {
            lesson_time_ratios: lessonTimeRatios,
            quiz_time_ratio: overallQuizTimeRatio
        },
        attempt_behavior: {
            first_attempt_accuracy: firstAttemptAccuracy,
            retry_depth: retryDepth,
            avg_attempt_time: avgAttemptTime,
            guessing_flag: guessingFlag
        },
        unit_metrics: unitMetrics,
        course_signals: courseSignals,
        focus_lessons: Object.values(focusLessonsMap).slice(0, 3),
        last_updated: new Date().toISOString()
    };
}
