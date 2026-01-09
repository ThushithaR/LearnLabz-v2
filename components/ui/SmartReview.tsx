'use client';

import React, { useState, useEffect } from 'react';
import TopicRecommendations from './TopicRecommendations';
import { getCurrentUserProfile } from '@/lib/supabase/profile';

interface SmartReviewProps {
  courseId: number;
  courseSlug: string;
  unitId: number;
}

interface Metrics {
  mistake_consistency?: {
    weak_topics?: Array<{
      topic: string;
      count: number;
      recommendedLessons: string[];
    }>;
  };
  quiz_patterns?: {
    difficulty?: {
      easy?: number;
      medium?: number;
      hard?: number;
    };
  };
}

export default function SmartReview({ courseId, courseSlug, unitId }: SmartReviewProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [hasAttempts, setHasAttempts] = useState(false);

  useEffect(() => {
    loadSmartReview();
  }, [courseId, unitId]);

  const loadSmartReview = async () => {
    try {
      setLoading(true);

      const user = await getCurrentUserProfile();
      if (!user) {
        console.error("[SmartReview] User not found");
        setLoading(false);
        return;
      }

      const unitIdForQuery = 1; // All quiz data is in unit_id: 1
      
      console.log("[SmartReview] Fetching metrics for user:", user.user_id);

      const response = await fetch(
        `/api/digital-twin/metrics?user_id=${user.user_id}&course_id=${courseId}&unit_id=${unitIdForQuery}`
      );

      if (!response.ok) {
        console.error("[SmartReview] Failed to fetch metrics");
        setHasAttempts(false);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("[SmartReview] Metrics received:", data);

      if (data.mistake_consistency?.weak_topics && data.mistake_consistency.weak_topics.length > 0) {
        setMetrics(data);
        setHasAttempts(true);
      } else {
        setHasAttempts(false);
      }
    } catch (err) {
      console.error('[SmartReview] Error:', err);
      setHasAttempts(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!hasAttempts) {
    return null;
  }

  // Extract weak and strong topics
  const weakTopics = metrics?.mistake_consistency?.weak_topics || [];
  const strongTopics = weakTopics.length > 0 
    ? [{ ...weakTopics[0], count: -1 }] // Just for display
    : [];

  return (
    <TopicRecommendations
      weakTopics={weakTopics}
      strongTopics={strongTopics}
      courseId={courseId}
      unitId={unitId}
      courseSlug={}
    />
  );
}
