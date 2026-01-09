'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUserProfile } from '@/lib/supabase/profile';
import { Info } from 'lucide-react';

interface WeakTopic {
  topic: string;
  count: number;
  lessons: string[];
  lessonTitle?: string;
}

interface DigitalTwinCardProps {
  courseId: number;
  courseSlug: string;
  unitId: number;
}

export default function DigitalTwinCard({ courseId, courseSlug, unitId }: DigitalTwinCardProps) {
  const [weakestTopic, setWeakestTopic] = useState<WeakTopic | null>(null);
  const [weakTopics, setWeakTopics] = useState<Array<{ topic: string; count: number; recommendedLessons?: string[] }>>([]);
  const [nextFocus, setNextFocus] = useState<string>('');
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [firstAttemptAccuracy, setFirstAttemptAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMetricInfo, setShowMetricInfo] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [courseId, unitId]);

  const loadMetrics = async () => {
    try {
      const user = await getCurrentUserProfile();
      if (!user) {
        setLoading(false);
        return;
      }

      // Use unitId prop if available, otherwise default to 1
      const unitIdForQuery = unitId || 1;

      console.log('[DigitalTwinCard] Loading metrics for:', { courseId, courseSlug, unitId: unitIdForQuery });

      const response = await fetch(
        `/api/digital-twin/metrics?user_id=${user.user_id}&course_id=${courseId}&unit_id=${unitIdForQuery}`
      );

      if (response.ok) {
        const metrics = await response.json();
        console.log('[DigitalTwinCard] Received metrics:', metrics);

        setMetrics(metrics);

        // Next focus + weak topics (SmartReview merge)
        setNextFocus(metrics.recommendations?.next_focus || '');
        setWeakTopics(metrics.mistake_consistency?.weak_topics || []);

        // Get weakest topic
        const weakest = metrics.mistake_consistency?.weak_topics?.[0];
        if (weakest) {
          console.log('[DigitalTwinCard] Weakest topic found:', weakest);
          
          const lessonTitle: string | undefined =
            weakest.recommendedLessons && weakest.recommendedLessons.length > 0
              ? weakest.recommendedLessons[0]
              : undefined;
          
          setWeakestTopic({
            topic: weakest.topic,
            count: weakest.count,
            lessons: weakest.recommendedLessons || [],
            lessonTitle
          });
        } else {
          console.log('[DigitalTwinCard] No weakest topic found');
          setWeakestTopic(null);
        }

        // Calculate accuracy
        const accuracy = metrics.quiz_patterns?.accuracy_trend?.length > 0
          ? (metrics.quiz_patterns.accuracy_trend.reduce((a: number, b: number) => a + b, 0) / 
             metrics.quiz_patterns.accuracy_trend.length * 100)
          : 0;
        
        setOverallAccuracy(Math.round(accuracy));

        // First attempt accuracy (meaningful metric)
        const firstAcc = metrics.attempt_behavior?.first_attempt_accuracy || 0;
        setFirstAttemptAccuracy(Math.round(firstAcc * 100));
      }
    } catch (err) {
      console.log('[DigitalTwinCard] Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="relative p-4 border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-lg">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-2 bg-white/10 rounded mb-2"></div>
            <div className="h-6 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary/15 to-purple-600/15 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative p-4 rounded-xl border border-white/5 bg-surface shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Digital Twin
              </h3>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                Your learning snapshot
              </p>
            </div>
            <button
              onClick={() => setShowMetricInfo(true)}
              className="text-white/60 hover:text-white transition-colors"
              title="Detailed insights"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {nextFocus && (
            <div className="mb-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Next Focus
              </p>
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                {nextFocus}
              </p>
            </div>
          )}

          {/* Accuracy Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: 'var(--text-secondary)' }} className="text-xs">
                  Accuracy
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                  {overallAccuracy}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-primary to-purple-600 transition-all"
                  style={{ width: `${overallAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <p className="text-[10px] text-textSecondary uppercase tracking-wider mb-0.5">Accuracy</p>
              <p className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                {overallAccuracy}%
              </p>
            </div>
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <p className="text-[10px] text-textSecondary uppercase tracking-wider mb-0.5">First Try</p>
              <p className="text-xs font-bold" style={{ color: firstAttemptAccuracy >= 70 ? '#22c55e' : firstAttemptAccuracy >= 40 ? '#f59e0b' : '#ef4444' }}>
                {firstAttemptAccuracy}%
              </p>
            </div>
          </div>

          {/* Weakest Topic */}
          <div className="space-y-2">
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium">
              Focus on:
            </p>
            {weakestTopic ? (
              <>
                <p className="text-sm font-bold" style={{ color: '#ef4444' }}>
                  {weakestTopic.topic}
                </p>
                {weakestTopic.lessonTitle ? (
                  <Link
                    href={`/dashboard/${courseSlug}/modules/${unitId}?lesson=${encodeURIComponent(
                      weakestTopic.lessonTitle
                    )}`}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white'
                    }}
                  >
                    <span>→ Review Topic</span>
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/${courseSlug}/modules/${unitId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white'
                    }}
                  >
                    <span>→ Review Topic</span>
                  </Link>
                )}
              </>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Not enough quiz data yet to identify a weak topic.
              </p>
            )}
          </div>

          {weakTopics && weakTopics.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                Weak Areas
              </p>
              <div className="space-y-1">
                {weakTopics.slice(0, 2).map((t) => (
                  <div key={t.topic} className="flex items-center justify-between text-xs">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                      {t.topic}
                    </span>
                    <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
                      {t.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Info Modal */}
      {showMetricInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl border border-white/10 p-6 bg-surface"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMetricInfo(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Detailed Insights
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              What we measure + how it’s calculated (with your current values)
            </p>

            <div className="border border-white/10 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Overall Accuracy
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {overallAccuracy}%
                  </p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    First Try
                  </p>
                  <p className="text-sm font-bold" style={{ color: firstAttemptAccuracy >= 70 ? '#22c55e' : firstAttemptAccuracy >= 40 ? '#f59e0b' : '#ef4444' }}>
                    {firstAttemptAccuracy}%
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Weak Topic
                </p>
                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                  {weakestTopic ? `${weakestTopic.topic} (${weakestTopic.count} attempts)` : 'Not enough data yet'}
                </p>
              </div>

              {nextFocus && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Next Focus
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    {nextFocus}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="border border-white/10 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Difficulty Accuracy
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Easy</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.quiz_patterns?.difficulty?.easy != null ? Math.round(metrics.quiz_patterns.difficulty.easy * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Medium</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.quiz_patterns?.difficulty?.medium != null ? Math.round(metrics.quiz_patterns.difficulty.medium * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Hard</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.quiz_patterns?.difficulty?.hard != null ? Math.round(metrics.quiz_patterns.difficulty.hard * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Time Behavior
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Avg Time Ratio</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.time_behavior?.avg_time_ratio != null ? metrics.time_behavior.avg_time_ratio.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Flag</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.time_behavior?.flag || 'no_data'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Attempt Behavior
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Avg Retries</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.attempt_behavior?.avg_retries != null ? metrics.attempt_behavior.avg_retries.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Pattern</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {metrics?.attempt_behavior?.attempt_pattern || 'no_data'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 bg-white/5 rounded p-2">
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Avg Time / Attempt (sec)</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {metrics?.attempt_behavior?.avg_time_per_attempt_sec != null ? Math.round(metrics.attempt_behavior.avg_time_per_attempt_sec) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FullAnalyticsModal({ courseId, onClose }: { courseId: number; onClose: () => void }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFullMetrics();
  }, [courseId]);

  const loadFullMetrics = async () => {
    try {
      const user = await getCurrentUserProfile();
      if (user) {
        const response = await fetch(
          `/api/digital-twin/metrics?user_id=${user.user_id}&course_id=${courseId}&unit_id=1`
        );
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-white/10 p-6"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          📊 Full Learning Analytics
        </h2>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Quiz Patterns */}
            {metrics.quiz_patterns && (
              <div className="border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  📈 Quiz Performance
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Latest Score:</span>
                    <span style={{ color: 'var(--accent-primary)' }} className="font-bold">
                      {Math.round(metrics.quiz_patterns.latest_score * 100)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span style={{ color: 'var(--text-secondary)' }} className="block text-xs">
                      Difficulty Breakdown:
                    </span>
                    <div className="space-y-1 ml-2">
                      <div className="flex justify-between text-xs">
                        <span>Easy: <span style={{ color: '#22c55e' }} className="font-bold">{Math.round(metrics.quiz_patterns.difficulty.easy * 100)}%</span></span>
                        <span>Medium: <span style={{ color: '#f59e0b' }} className="font-bold">{Math.round(metrics.quiz_patterns.difficulty.medium * 100)}%</span></span>
                        <span>Hard: <span style={{ color: '#ef4444' }} className="font-bold">{Math.round(metrics.quiz_patterns.difficulty.hard * 100)}%</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Time Behavior */}
            {metrics.time_behavior && (
              <div className="border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  ⏱️ Time Behavior
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Pace:</span>
                    <span className="capitalize font-bold" style={{
                      color: metrics.time_behavior.flag === 'ideal' ? '#22c55e' : 
                             metrics.time_behavior.flag === 'rushing' ? '#f59e0b' : '#ef4444'
                    }}>
                      {metrics.time_behavior.flag}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Time Ratio:</span>
                    <span style={{ color: 'var(--accent-primary)' }} className="font-bold">
                      {metrics.time_behavior.avg_time_ratio.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Weak Topics */}
            {metrics.mistake_consistency?.weak_topics?.length > 0 && (
              <div className="border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  ⚠️ Topics Needing Focus
                </h3>
                <div className="space-y-2">
                  {metrics.mistake_consistency.weak_topics.map((topic: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>{topic.topic}</span>
                        <span style={{ color: '#ef4444' }} className="font-bold">
                          {topic.count} attempts
                        </span>
                      </div>
                      {topic.recommendedLessons?.length > 0 && (
                        <p style={{ color: 'var(--text-secondary)' }} className="text-xs ml-2">
                          → {topic.recommendedLessons[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attempt Behavior */}
            {metrics.attempt_behavior && (
              <div className="border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  🎯 Learning Pattern
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>First Attempt:</span>
                    <span style={{ color: 'var(--accent-primary)' }} className="font-bold">
                      {Math.round(metrics.attempt_behavior.first_attempt_accuracy * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Retries:</span>
                    <span style={{ color: 'var(--accent-primary)' }} className="font-bold">
                      {metrics.attempt_behavior.avg_retries.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Pattern:</span>
                    <span style={{ color: 'var(--accent-primary)' }} className="font-bold capitalize">
                      {metrics.attempt_behavior.attempt_pattern}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
