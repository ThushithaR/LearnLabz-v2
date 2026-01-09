import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[Metrics API] Initialized with URL:', supabaseUrl);

const supabaseAdmin = createClient(
  supabaseUrl || '',
  serviceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  console.log('[Metrics API] GET request received');
  
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');
  const courseId = searchParams.get('course_id');
  const unitId = searchParams.get('unit_id');
  const lessonId = searchParams.get('lesson_id');

  console.log('[Metrics API] Fetching metrics for:', { userId, courseId, unitId, lessonId });

  if (!userId || !courseId || !unitId) {
    console.error('[Metrics API] Missing required parameters');
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    if (!serviceRoleKey) {
      console.error('[Metrics API] Service role key not configured');
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    // Fetch all quiz attempts for this unit and course
    console.log('[Metrics API] Fetching quiz attempts for:', { userId, courseId: parseInt(courseId), unitId: parseInt(unitId) });
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', parseInt(userId))
      .eq('course_id', parseInt(courseId))
      .eq('unit_id', parseInt(unitId))
      .order('qa_id', { ascending: true });

    console.log('[Metrics API] Attempts query result:', { count: attempts?.length, error: attemptsError?.message });
    
    // Debug: Log the actual attempts with their course info
    if (attempts && attempts.length > 0) {
      console.log('[Metrics API] Sample attempts:', attempts.slice(0, 3).map(a => ({
        qa_id: a.qa_id,
        course_id: a.course_id,
        quiz_id: a.quiz_id,
        qa_score: a.qa_score
      })));
    }

    if (attemptsError) {
      console.error('[Metrics API] Error fetching attempts:', attemptsError);
      return NextResponse.json(
        { error: attemptsError.message },
        { status: 500 }
      );
    }

    console.log('[Metrics API] Found', attempts?.length || 0, 'attempts');

    // Calculate metrics from attempts
    console.log('[Metrics API] Calculating metrics from attempts...');
    
    // Fetch quiz data to get difficulty and other info
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('quiz_id, quiz_difficulty, quiz_lesson_mapping, quiz_title, quiz_time')
      .eq('course_id', parseInt(courseId))
      .eq('unit_id', parseInt(unitId));

    // If lesson filter is applied, further filter quizzes
    let filteredQuizzes = quizzes;
    if (lessonId && lessonId !== 'all' && quizzes) {
      filteredQuizzes = quizzes.filter(quiz => {
        try {
          let mapping = quiz.quiz_lesson_mapping;
          if (typeof mapping === 'string') {
            mapping = JSON.parse(mapping);
          }
          
          // Check if this quiz is related to the selected lesson
          if (mapping && typeof mapping === 'object') {
            // Check if lesson_id is in the mapping or if lesson title matches
            if (mapping.lesson_id && mapping.lesson_id === lessonId) {
              return true;
            }
            
            // Check lesson titles if available
            if (mapping.lesson_title && typeof mapping.lesson_title === 'string') {
              return mapping.lesson_title.toLowerCase().includes(lessonId.toLowerCase());
            }
            
            // Check if any topics match the lesson
            if (mapping.topics && Array.isArray(mapping.topics)) {
              return mapping.topics.some((topic: string) => 
                topic.toLowerCase().includes(lessonId.toLowerCase())
              );
            }
          }
          return false;
        } catch (e) {
          return false;
        }
      });
    }

    // Filter attempts by lesson if specified
    let filteredAttempts = attempts;
    if (lessonId && lessonId !== 'all' && attempts && filteredQuizzes) {
      const validQuizIds = new Set(filteredQuizzes.map(q => q.quiz_id));
      filteredAttempts = attempts.filter(attempt => validQuizIds.has(attempt.quiz_id));
      console.log('[Metrics API] Filtered to', filteredAttempts?.length || 0, 'attempts for lesson:', lessonId);
    }

    // If no attempts, return empty metrics
    if (!filteredAttempts || filteredAttempts.length === 0) {
      console.log('[Metrics API] No attempts found, returning empty metrics');
      return NextResponse.json({
        quiz_patterns: {
          accuracy_trend: [],
          difficulty: { easy: 0, medium: 0, hard: 0 },
          topic_accuracy: {},
        },
        time_behavior: {
          avg_time_ratio: 0,
          flag: 'no_data',
        },
        mistake_consistency: {
          mistake_frequency: {},
          repeated_mistakes: [],
          weak_concepts_count: 0,
        },
        attempt_behavior: {
          first_attempt_accuracy: 0,
          avg_retries: 0,
          avg_time_per_attempt_sec: 0,
          attempt_pattern: 'no_data',
        },
      });
    }

    const quizMap: Record<number, any> = {};
    if (!quizzesError && filteredQuizzes) {
      filteredQuizzes.forEach(q => {
        quizMap[q.quiz_id] = q;
      });
    }

    console.log('[Metrics API] Loaded', Object.keys(quizMap).length, 'quizzes for unit', unitId, lessonId && lessonId !== 'all' ? `(filtered by lesson: ${lessonId})` : '');

    // Fetch lessons to map topics
    const { data: lessons, error: lessonsError } = await supabaseAdmin
      .from('lessons')
      .select('lesson_id, lesson_title, unit_id')
      .eq('unit_id', parseInt(unitId));

    const lessonMap: Record<number, any> = {};
    if (!lessonsError && lessons) {
      lessons.forEach(l => {
        lessonMap[l.lesson_id] = l;
      });
    }

    console.log('[Metrics API] Loaded', Object.keys(lessonMap).length, 'lessons for unit');

    // Quiz Patterns - last 5 scores
    const scores = filteredAttempts.map(a => (a.qa_score || 0) / 100);
    const accuracy_trend = scores.slice(-5);
    
    // Topic-wise accuracy (DB-driven from quiz_lesson_mapping topics)
    const topicAccuracyAgg: Record<string, { sumAccuracy: number; count: number }> = {};

    // Difficulty-wise accuracy
    const difficultyStats: Record<string, { sumAccuracy: number; count: number }> = {
      EASY: { sumAccuracy: 0, count: 0 },
      MEDIUM: { sumAccuracy: 0, count: 0 },
      HARD: { sumAccuracy: 0, count: 0 }
    };

    (filteredAttempts as any[]).forEach(attempt => {
      const quiz = quizMap[attempt.quiz_id];
      const difficultyRaw = (quiz?.quiz_difficulty || 'MEDIUM').toString().toUpperCase();
      const difficulty = difficultyRaw === 'EASY' || difficultyRaw === 'MEDIUM' || difficultyRaw === 'HARD'
        ? difficultyRaw
        : difficultyRaw.startsWith('E') ? 'EASY'
        : difficultyRaw.startsWith('H') ? 'HARD'
        : 'MEDIUM';

      // Attempt-level accuracy ratio (0..1) from DB counts
      const attemptAcc = (attempt.total_questions || 0) > 0
        ? (attempt.qa_correct_count || 0) / attempt.total_questions
        : (attempt.qa_score || 0) / 100;

      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].sumAccuracy += attemptAcc;
        difficultyStats[difficulty].count++;
      }

      // Topic accuracy: average attempt accuracy for quizzes that include each topic
      if (quiz && quiz.quiz_lesson_mapping) {
        try {
          let mapping = quiz.quiz_lesson_mapping;
          if (typeof mapping === 'string') mapping = JSON.parse(mapping);

          let topics: string[] = [];
          if (Array.isArray(mapping)) {
            mapping.forEach((item: any) => {
              if (item.topics && Array.isArray(item.topics)) topics.push(...item.topics);
            });
          } else if (mapping && typeof mapping === 'object') {
            if (mapping.topics && Array.isArray(mapping.topics)) {
              topics = mapping.topics;
            } else {
              Object.values(mapping).forEach((v: any) => {
                if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
                  topics.push(...v);
                }
              });
            }
          }

          topics.forEach((t) => {
            const key = String(t);
            if (!topicAccuracyAgg[key]) topicAccuracyAgg[key] = { sumAccuracy: 0, count: 0 };
            topicAccuracyAgg[key].sumAccuracy += attemptAcc;
            topicAccuracyAgg[key].count++;
          });
        } catch {
          // ignore mapping parse errors here (handled elsewhere too)
        }
      }
    });

    const difficulty = {
      easy: difficultyStats.EASY.count > 0 ? difficultyStats.EASY.sumAccuracy / difficultyStats.EASY.count : 0,
      medium: difficultyStats.MEDIUM.count > 0 ? difficultyStats.MEDIUM.sumAccuracy / difficultyStats.MEDIUM.count : 0,
      hard: difficultyStats.HARD.count > 0 ? difficultyStats.HARD.sumAccuracy / difficultyStats.HARD.count : 0
    };

    const topic_accuracy: Record<string, number> = {};
    Object.entries(topicAccuracyAgg).forEach(([t, v]) => {
      topic_accuracy[t] = v.count > 0 ? v.sumAccuracy / v.count : 0;
    });

    console.log('[Metrics API] Difficulty accuracy:', difficulty);

    // Time Behavior (DB-driven expected time from quizzes.quiz_time)
    const totalTime = filteredAttempts.reduce((sum, a) => sum + (a.time_taken_sec || 0), 0);
    const expectedTotalTime = (filteredAttempts as any[]).reduce((sum, a) => {
      const q = quizMap[a.quiz_id];
      const raw = q?.quiz_time;
      const expectedSec = typeof raw === 'number'
        ? (raw < 100 ? raw * 60 : raw)
        : 600;
      return sum + expectedSec;
    }, 0);

    const avg_time_ratio = expectedTotalTime > 0 ? totalTime / expectedTotalTime : 0;

    // Mistake Consistency - track topics from quiz_lesson_mapping
    const quizAttempts: Record<number, any[]> = {};
    const topicMistakes: Record<string, { count: number; quizzes: number[]; lessons: string[] }> = {};
    
    (filteredAttempts as any[]).forEach(a => {
      if (!quizAttempts[a.quiz_id]) quizAttempts[a.quiz_id] = [];
      quizAttempts[a.quiz_id].push(a);

      // Extract topics from quiz_lesson_mapping if score is low
      const quiz = quizMap[a.quiz_id];
      if (quiz && quiz.quiz_lesson_mapping && (a.qa_score || 0) < 60) {
        try {
          let mapping = quiz.quiz_lesson_mapping;
          if (typeof mapping === 'string') {
            mapping = JSON.parse(mapping);
          }

          // mapping could be an object with topics or array of questions
          if (mapping && typeof mapping === 'object') {
            // Try to extract topics
            let topics: string[] = [];
            
            if (Array.isArray(mapping)) {
              // Array format: extract topics from questions
              mapping.forEach((item: any) => {
                if (item.topics && Array.isArray(item.topics)) {
                  topics.push(...item.topics);
                }
              });
            } else if (mapping.topics && Array.isArray(mapping.topics)) {
              // Direct topics field
              topics = mapping.topics;
            } else if (typeof mapping === 'object') {
              // Try to find any array that looks like topics
              Object.values(mapping).forEach((v: any) => {
                if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
                  topics.push(...v);
                }
              });
            }

            // Track each topic
            topics.forEach(topic => {
              if (!topicMistakes[topic]) {
                topicMistakes[topic] = { count: 0, quizzes: [], lessons: [] };
              }
              topicMistakes[topic].count++;
              if (!topicMistakes[topic].quizzes.includes(a.quiz_id)) {
                topicMistakes[topic].quizzes.push(a.quiz_id);
              }
            });
          }
        } catch (e) {
          console.log('[Metrics API] Could not parse quiz_lesson_mapping for quiz', a.quiz_id);
        }
      }
    });

    const mistake_frequency: Record<string, number> = {};
    const repeated_mistakes: string[] = [];
    const weak_topics: Array<{ topic: string; count: number; recommendedLessons: string[] }> = [];
    let weak_concepts_count = 0;

    // Calculate weak concepts from topic mistakes
    Object.entries(topicMistakes).forEach(([topic, data]) => {
      if (data.count >= 2) {
        weak_concepts_count++;
        repeated_mistakes.push(topic);
        
        // Find lessons that might teach this topic
        const recommendedLessons = Object.values(lessonMap)
          .filter(l => l.lesson_title.toLowerCase().includes(topic.toLowerCase()))
          .map(l => l.lesson_title);

        // IMPORTANT: Only surface a weak topic if we can map it to real lessons in THIS unit.
        // This prevents cross-course/topic leakage like NLP topics showing up in AIML.
        if (recommendedLessons.length > 0) {
          weak_topics.push({
            topic,
            count: data.count,
            recommendedLessons
          });
        }
        
        mistake_frequency[topic] = data.count;
      }
    });

    // Also check quiz-level retries as secondary indicator
    Object.entries(quizAttempts).forEach(([quizId, quizAtts]) => {
      if (quizAtts.length > 1) {
        // This quiz was attempted multiple times
        const quiz = quizMap[parseInt(quizId)];
        const quizTitle = quiz?.quiz_title || `Quiz ${quizId}`;
        
        // If not already in mistake_frequency from topics, add it
        if (!mistake_frequency[quizTitle]) {
          mistake_frequency[quizTitle] = quizAtts.length;
        }
      }
    });

    // Attempt Behavior - first attempt accuracy
    let firstAttemptCorrect = 0;
    let firstAttemptTotal = 0;
    let totalRetries = 0;
    
    Object.values(quizAttempts).forEach(quizAtts => {
      if (quizAtts.length > 0) {
        firstAttemptTotal++;
        const firstScore = quizAtts[0].qa_score || 0;
        if (firstScore >= 60) {
          firstAttemptCorrect++;
        }
        totalRetries += Math.max(0, quizAtts.length - 1);
      }
    });

    const first_attempt_accuracy = firstAttemptTotal > 0 
      ? firstAttemptCorrect / firstAttemptTotal 
      : 0;

    const avg_retries = firstAttemptTotal > 0 
      ? totalRetries / firstAttemptTotal 
      : 0;

    // Determine attempt pattern
    let attempt_pattern = 'balanced';
    if (first_attempt_accuracy > 0.7) {
      attempt_pattern = 'confident';
    } else if (first_attempt_accuracy < 0.4) {
      attempt_pattern = 'uncertain';
    } else if (avg_retries > 2) {
      attempt_pattern = 'persistent';
    }

    const result = {
      meta: {
        total_attempts: filteredAttempts.length,
        unique_quizzes: Object.keys(quizAttempts).length,
      },
      quiz_patterns: {
        accuracy_trend,
        latest_score: scores[scores.length - 1] || 0,
        difficulty,
        topic_accuracy,
      },
      time_behavior: {
        avg_time_ratio,
        flag: avg_time_ratio < 0.6 ? 'rushing' : avg_time_ratio > 1.5 ? 'over_struggling' : 'ideal',
        total_time_sec: totalTime,
        expected_time_sec: expectedTotalTime,
      },
      mistake_consistency: {
        mistake_frequency,
        repeated_mistakes,
        weak_concepts_count,
        weak_topics, // NEW: Includes recommended lessons
      },
      attempt_behavior: {
        first_attempt_accuracy,
        avg_retries,
        avg_time_per_attempt_sec: filteredAttempts.length > 0 ? totalTime / filteredAttempts.length : 0,
        attempt_pattern,
      },
      recommendations: {
        // Generate actionable recommendations from metrics
        weak_concept_lessons: weak_topics.flatMap(t => t.recommendedLessons),
        next_focus: weak_topics.length > 0 
          ? `Focus on: ${weak_topics.map(t => t.topic).join(', ')}`
          : avg_time_ratio < 0.6
          ? 'Work on deeper understanding - you might be rushing'
          : avg_time_ratio > 1.5
          ? 'Take a break - you seem to be over-thinking'
          : 'Continue with advanced topics - you have solid fundamentals',
      }
    };

    console.log('[Metrics API] Returning metrics:', result);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Metrics API] Error:', err?.message || err, err?.stack);
    return NextResponse.json(
      { error: err?.message || 'Internal server error', details: err?.stack },
      { status: 500 }
    );
  }
}
