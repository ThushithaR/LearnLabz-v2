'use client';

import React, { useState, useEffect } from 'react';
import TopicRecommendations from './TopicRecommendations';
import { getCurrentUserProfile } from '@/lib/supabase/profile';
import { supabase } from '@/lib/supabase/client';

interface SmartReviewProps {
  courseId: number;
  courseSlug: string;
  unitId: number;
}

export default function SmartReview({ courseId, courseSlug, unitId }: SmartReviewProps) {
  const [loading, setLoading] = useState(true);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [nextFocus, setNextFocus] = useState<string>('');
  const [hasAttempts, setHasAttempts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [courseId, unitId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const user = await getCurrentUserProfile();
      if (!user) {
        console.log("[SmartReview] User not found");
        setHasAttempts(false);
        setLoading(false);
        return;
      }

      // Force unit_id: 1 (temporary fix for DB structure)
      const unitIdForQuery = 1;

      console.log("[SmartReview] Loading recommendations for:", {
        userId: user.user_id,
        courseId,
        unitId: unitIdForQuery
      });

      // Fetch metrics from API
      const metricsResponse = await fetch(
        `/api/digital-twin/metrics?user_id=${user.user_id}&course_id=${courseId}&unit_id=${unitIdForQuery}`
      );

      if (!metricsResponse.ok) {
        console.log("[SmartReview] No metrics available yet");
        setHasAttempts(false);
        setLoading(false);
        return;
      }

      const metrics = await metricsResponse.json();
      console.log("[SmartReview] Metrics received:", metrics);

      // Extract weak topics and recommendations
      const topics = metrics.mistake_consistency?.weak_topics || [];
      const nextFocusMsg = metrics.recommendations?.next_focus || '';

      // Course validation - filter out wrong course topics
      const validTopics = topics.filter((topic: any) => {
        const topicName = topic.topic.toLowerCase();
        const isAimlCourse = courseSlug === 'aiml';
        const isNlpCourse = courseSlug === 'nlp';
        
        // List of obvious NLP topics that shouldn't appear in AIML
        const nlpTopics = ['rationality', 'tokenization', 'lemmatization', 'stemming', 'n-gram', 'bag of words', 'tf-idf', 'word embeddings'];
        // List of obvious AIML topics that shouldn't appear in NLP  
        const aimlTopics = ['dfs', 'bfs', 'dls', 'iddfs', 'search', 'algorithm', 'tree', 'graph'];
        
        const isWrongCourse = (isAimlCourse && nlpTopics.some(nlpTopic => topicName.includes(nlpTopic))) ||
                            (isNlpCourse && aimlTopics.some(aimlTopic => topicName.includes(aimlTopic)));
        
        return !isWrongCourse;
      });

      console.log('[SmartReview] Original topics:', topics.length);
      console.log('[SmartReview] Valid topics after filtering:', validTopics.length);

      if (validTopics.length > 0) {
        setWeakTopics(validTopics);
        setNextFocus(nextFocusMsg);
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
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
    );
  }

  if (!hasAttempts) {
    return null; // Don't show anything if no quiz attempts
  }

  return (
    <div className="smart-review-container">
      <TopicRecommendations
        weakTopics={weakTopics}
        courseId={courseId}
        courseSlug={courseSlug}
        unitId={unitId}
      />
    </div>
  );
}
