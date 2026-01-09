'use client';

import React from 'react';
import Link from 'next/link';

interface WeakTopic {
  topic: string;
  count: number;
  recommendedLessons: string[];
}

interface TopicRecommendationsProps {
  weakTopics: WeakTopic[];
  strongTopics?: WeakTopic[];
  courseId: number;
  courseSlug: string;
  unitId: number;
}

export default function TopicRecommendations({
  weakTopics,
  strongTopics,
  courseId,
  courseSlug,
  unitId
}: TopicRecommendationsProps) {
  // Get weakest topic
  const weakestTopic = weakTopics && weakTopics.length > 0 ? weakTopics[0] : null;
  
  // Get strongest topic
  const strongest = strongTopics && strongTopics.length > 0 ? strongTopics[0] : null;

  if (!weakestTopic && !strongest) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Weakest Topic */}
      {weakestTopic && (
        <div className="bg-surface rounded-xl border border-white/5 p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-text-secondary text-sm mb-1">Needs Focus</p>
              <h3 className="text-xl font-bold text-text-primary">{weakestTopic.topic}</h3>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>
          
          <p className="text-text-secondary text-sm mb-4">
            Attempted {weakestTopic.count} times
          </p>

          <Link
            href={`/dashboard/${courseSlug}/modules?unit=${unitId}&topic=${encodeURIComponent(weakestTopic.topic)}`}
            className="inline-block px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              opacity: 0.9
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.opacity = '1';
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.opacity = '0.9';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Review Topic →
          </Link>
        </div>
      )}

      {/* Strongest Topic */}
      {strongest && (
        <div className="bg-surface rounded-xl border border-white/5 p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-text-secondary text-sm mb-1">Strongest Area</p>
              <h3 className="text-xl font-bold text-text-primary">{strongest.topic}</h3>
            </div>
            <span className="text-2xl">✨</span>
          </div>
          
          <p className="text-text-secondary text-sm mb-4">
            Mastered this concept
          </p>

          <Link
            href={`/dashboard/${courseSlug}/modules`}
            className="inline-block px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'var(--success)',
              color: 'white',
              opacity: 0.9
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.opacity = '1';
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.opacity = '0.9';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Continue Learning →
          </Link>
        </div>
      )}
    </div>
  );
}
