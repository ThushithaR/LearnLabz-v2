'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUserProfile } from '@/lib/supabase/profile';
import { courses, COURSE_ID_MAP } from '@/lib/courses';
import { CourseId } from '@/lib/courses';

interface CourseMetrics {
  courseId: number;
  courseName: string;
  courseSlug: string;
  weakestTopic?: {
    topic: string;
    count: number;
    accuracy: number;
    lessons: string[];
    unitId?: number;
  };
  overallAccuracy: number;
  latestScore: number;
  difficultyAccuracy: {
    easy: number;
    medium: number;
    hard: number;
  };
  attemptPattern: string;
  timeEfficiency: string;
  timeRatio: number;
  totalTimeSec: number;
  expectedTimeSec: number;
  firstAttemptAccuracy: number;
  totalAttempts: number;
  uniqueQuizzes: number;
  weakTopicsCount: number;
  repeatedMistakesCount: number;
  avgRetries: number;
  avgTimePerAttemptSec: number;
  apiMetrics: any;
}

export default function DigitalTwinPage() {
  const [courseMetrics, setCourseMetrics] = useState<CourseMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseId>('aiml');
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [availableUnits, setAvailableUnits] = useState<number[]>([1, 2, 3, 4]);
  const [availableLessons, setAvailableLessons] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    loadCourseMetrics();
    loadAvailableLessons();
  }, [selectedCourse, selectedUnit]);

  const loadAvailableLessons = async () => {
    try {
      const course = courses[selectedCourse];
      const unit = course.modules.find(m => m.id === selectedUnit);
      if (unit) {
        const lessons = unit.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title
        }));
        setAvailableLessons(lessons);
      }
    } catch (err) {
      console.error('Error loading lessons:', err);
    }
  };

  const loadCourseMetrics = async () => {
    console.log('[DigitalTwin] Starting to load course metrics...');
    try {
      const user = await getCurrentUserProfile();
      console.log('[DigitalTwin] User profile:', user);
      if (!user) {
        console.log('[DigitalTwin] No user found, setting loading to false');
        setLoading(false);
        return;
      }

      const course = courses[selectedCourse];
      const courseIdNum = COURSE_ID_MAP[selectedCourse];
      console.log('[DigitalTwin] Loading metrics for course:', { selectedCourse, courseIdNum, selectedUnit, selectedLesson });
      
      const metricsData: CourseMetrics[] = [];

      try {
        const response = await fetch(
          `/api/digital-twin/metrics?user_id=${user.user_id}&course_id=${courseIdNum}&unit_id=${selectedUnit}&lesson_id=${selectedLesson}`
        );
        console.log('[DigitalTwin] API response status:', response.status);

        if (response.ok) {
          const metrics = await response.json();
          console.log('[DigitalTwin] API response data:', metrics);

          // Extract weakest topic
          const weakestTopic = metrics.mistake_consistency?.weak_topics?.[0];
          
          // Calculate average accuracy from last 5 quizzes
          const overallAccuracy = metrics.quiz_patterns?.accuracy_trend?.length > 0
            ? (metrics.quiz_patterns.accuracy_trend.reduce((a: number, b: number) => a + b, 0) / 
               metrics.quiz_patterns.accuracy_trend.length * 100)
            : 0;

          const difficultyAccuracy = metrics.quiz_patterns?.difficulty || { easy: 0, medium: 0, hard: 0 };

          // Time efficiency flag
          const timeFlag = metrics.time_behavior?.flag || 'ideal';
          const timeEfficiencyMap: Record<string, string> = {
            'rushing': 'Too Fast - Slow Down',
            'ideal': 'Perfect Pace',
            'over_struggling': 'Taking Too Long'
          };

          const weakestTopicAccuracy = (() => {
            const topic = weakestTopic?.topic;
            if (!topic) return 0;
            const acc = metrics.quiz_patterns?.topic_accuracy?.[topic];
            return typeof acc === 'number' ? Math.round(acc * 100) : 0;
          })();

          metricsData.push({
            courseId: courseIdNum,
            courseName: course.name,
            courseSlug: selectedCourse,
            weakestTopic: weakestTopic ? {
              topic: weakestTopic.topic,
              count: weakestTopic.count,
              accuracy: weakestTopicAccuracy,
              lessons: weakestTopic.recommendedLessons || [],
              unitId: selectedUnit
            } : undefined,
            overallAccuracy: Math.round(overallAccuracy),
            latestScore: Math.round((metrics.quiz_patterns?.latest_score || 0) * 100),
            difficultyAccuracy: {
              easy: Math.round((difficultyAccuracy.easy || 0) * 100),
              medium: Math.round((difficultyAccuracy.medium || 0) * 100),
              hard: Math.round((difficultyAccuracy.hard || 0) * 100),
            },
            attemptPattern: metrics.attempt_behavior?.attempt_pattern || 'balanced',
            timeEfficiency: timeEfficiencyMap[timeFlag] || 'Unknown',
            timeRatio: metrics.time_behavior?.avg_time_ratio || 0,
            totalTimeSec: metrics.time_behavior?.total_time_sec || 0,
            expectedTimeSec: metrics.time_behavior?.expected_time_sec || 0,
            firstAttemptAccuracy: Math.round((metrics.attempt_behavior?.first_attempt_accuracy || 0) * 100),
            totalAttempts: metrics.meta?.total_attempts || 0,
            uniqueQuizzes: metrics.meta?.unique_quizzes || 0,
            weakTopicsCount: metrics.mistake_consistency?.weak_topics?.length || 0,
            repeatedMistakesCount: metrics.mistake_consistency?.repeated_mistakes?.length || 0,
            avgRetries: metrics.attempt_behavior?.avg_retries || 0,
            avgTimePerAttemptSec: metrics.attempt_behavior?.avg_time_per_attempt_sec || 0,
            apiMetrics: metrics,
          });
        }
      } catch (err) {
        console.log(`[DigitalTwin] Could not load metrics for course ${courseIdNum}:`, err);
      }

      console.log('[DigitalTwin] Setting course metrics:', metricsData);
      setCourseMetrics(metricsData);
    } catch (err) {
      console.error('[DigitalTwin] Error loading metrics:', err);
    } finally {
      console.log('[DigitalTwin] Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="animate-pulse space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-gradient-to-br from-white/5 to-white/10 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            🧠 Learning Digital Twin
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your personalized learning profile across all courses
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 border border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-white/10">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Filter Your Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value as CourseId)}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="aiml">AI & Machine Learning</option>
                <option value="nlp">Natural Language Processing</option>
              </select>
            </div>

            {/* Unit Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Unit
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {availableUnits.map(unit => (
                  <option key={unit} value={unit}>Unit {unit}</option>
                ))}
              </select>
            </div>

            {/* Lesson Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Lesson
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="all">All Lessons</option>
                {availableLessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course Metrics */}
        {courseMetrics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courseMetrics.map(course => (
              <CourseDigitalTwin
                key={course.courseId}
                metrics={course}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Data Available
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Take some quizzes to see your learning analytics here.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-block mt-4 px-6 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseDigitalTwin({ metrics }: { metrics: CourseMetrics }) {
  const topicAccuracyEntries: Array<[string, number]> = Object.entries(
    metrics.apiMetrics?.quiz_patterns?.topic_accuracy || {}
  ) as Array<[string, number]>;

  topicAccuracyEntries.sort((a, b) => (b[1] || 0) - (a[1] || 0));

  const mistakeFrequencyEntries: Array<[string, number]> = Object.entries(
    metrics.apiMetrics?.mistake_consistency?.mistake_frequency || {}
  ) as Array<[string, number]>;

  mistakeFrequencyEntries.sort((a, b) => (b[1] || 0) - (a[1] || 0));

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative p-6 border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl">
        {/* Course Title */}
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          {metrics.courseName}
        </h2>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Overall Accuracy */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>
              {metrics.overallAccuracy}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
          </div>

          {/* First Attempt Accuracy */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {metrics.firstAttemptAccuracy}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>First Attempt</div>
          </div>

          {/* Time Efficiency */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
            <div className="text-sm font-bold" style={{ color: '#fbbf24' }}>
              {metrics.timeEfficiency}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pace</div>
          </div>

          {/* Learning Pattern */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
            <div className="text-sm font-bold capitalize" style={{ color: '#a855f7' }}>
              {metrics.attemptPattern}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pattern</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
              Overall Progress
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
              {metrics.overallAccuracy}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-primary to-purple-600 transition-all"
              style={{ width: `${metrics.overallAccuracy}%` }}
            ></div>
          </div>
        </div>

        {/* Weakest Topic Card */}
        {metrics.weakestTopic ? (
          <div className="border border-white/10 rounded-lg p-4 mb-6" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.05)'
          }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 style={{ color: '#ef4444' }} className="font-semibold text-sm">
                  ⚠️ Needs Attention
                </h3>
                <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {metrics.weakestTopic.topic}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444'
              }}>
                {metrics.weakestTopic.count} attempts
              </span>
            </div>

            {/* Recommended Lessons */}
            {metrics.weakestTopic.lessons.length > 0 && (
              <div className="mb-4 space-y-2">
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium">
                  Recommended lessons:
                </p>
                <div className="space-y-1">
                  {metrics.weakestTopic.lessons.slice(0, 2).map((lesson, idx) => (
                    <p key={idx} style={{ color: 'var(--text-secondary)' }} className="text-xs">
                      • {lesson}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Review Button - Navigate within course */}
            <Link
              href={metrics.weakestTopic.lessons.length > 0
                ? `/dashboard/${metrics.courseSlug}/modules/${metrics.weakestTopic.unitId}?lesson=${encodeURIComponent(metrics.weakestTopic.lessons[0])}`
                : `/dashboard/${metrics.courseSlug}/modules/${metrics.weakestTopic.unitId}`}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <span>→ Review Topic</span>
            </Link>
          </div>
        ) : (
          <div className="border border-white/10 rounded-lg p-4 mb-6" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.05)'
          }}>
            <p style={{ color: '#22c55e' }} className="text-sm font-medium">
              ✨ No weak topics detected! Great progress.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.weakTopicsCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Weak Topics</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.totalAttempts}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Attempts</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.uniqueQuizzes}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Quizzes</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.difficultyAccuracy.easy}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Easy</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.difficultyAccuracy.medium}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Medium</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.difficultyAccuracy.hard}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Hard</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.latestScore}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Latest</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.avgRetries.toFixed(2)}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg Retries</div>
          </div>
          <div>
            <div className="text-lg font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
              {metrics.attemptPattern}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pattern</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'rgba(102, 126, 234, 0.06)' }}>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>First Attempt Accuracy</div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.firstAttemptAccuracy}%
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Avg time/attempt: {Math.round(metrics.avgTimePerAttemptSec)}s
            </div>
          </div>
          <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)' }}>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Time</div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {metrics.timeEfficiency}
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Ratio: {metrics.timeRatio.toFixed(2)}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Total: {Math.round(metrics.totalTimeSec)}s / Expected: {Math.round(metrics.expectedTimeSec)}s
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Score Trend (Last Attempts)
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Count: {metrics.apiMetrics?.quiz_patterns?.accuracy_trend?.length || 0}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(metrics.apiMetrics?.quiz_patterns?.accuracy_trend || []).map((v: number, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 rounded text-xs border border-white/10"
                style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                {Math.round(v * 100)}%
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Topic Accuracy (Top)
            </div>
            {topicAccuracyEntries.length === 0 ? (
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>No topic accuracy data</div>
            ) : (
              <div className="space-y-2">
                {topicAccuracyEntries.slice(0, 8).map(([topic, acc]) => (
                  <div key={topic} className="flex items-center justify-between text-xs">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{topic}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{Math.round((acc || 0) * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Mistakes (Frequency)
            </div>
            {mistakeFrequencyEntries.length === 0 ? (
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>No mistake frequency data</div>
            ) : (
              <div className="space-y-2">
                {mistakeFrequencyEntries.slice(0, 8).map(([key, cnt]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{key}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cnt}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Repeated Mistakes
          </div>
          {metrics.apiMetrics?.mistake_consistency?.repeated_mistakes?.length ? (
            <div className="flex gap-2 flex-wrap">
              {metrics.apiMetrics.mistake_consistency.repeated_mistakes.slice(0, 12).map((t: string) => (
                <span
                  key={t}
                  className="px-2 py-1 rounded text-xs border border-white/10"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>None</div>
          )}
        </div>

        <div className="border border-white/10 rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Recommendations
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            {metrics.apiMetrics?.recommendations?.next_focus || 'No recommendation'}
          </div>
          {metrics.apiMetrics?.recommendations?.weak_concept_lessons?.length ? (
            <div className="space-y-1">
              {metrics.apiMetrics.recommendations.weak_concept_lessons.slice(0, 6).map((l: string, idx: number) => (
                <div key={`${l}-${idx}`} className="text-xs" style={{ color: 'var(--text-primary)' }}>
                  {l}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>No recommended lessons</div>
          )}
        </div>

        {/* Full Analysis Link */}
        <Link
          href={`/dashboard/${metrics.courseSlug}`}
          className="text-sm font-medium transition-all hover:opacity-80"
          style={{ color: 'var(--accent-primary)' }}
        >
          View full course dashboard →
        </Link>
      </div>
    </div>
  );
}
