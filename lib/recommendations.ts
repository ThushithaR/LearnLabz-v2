/**
 * Digital Twin Recommendation Engine
 * Rule-based recommendations based on learner behavior metrics
 */

interface DigitalTwinMetrics {
  quiz_patterns?: {
    accuracy_trend: number[];
    latest_score: number;
    trend_direction: string;
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  time_behavior?: {
    avg_time_ratio: number;
    flag: string;
    total_time_sec: number;
    expected_time_sec: number;
  };
  mistake_consistency?: {
    mistake_frequency: Record<string, number>;
    repeated_mistakes: string[];
    weak_concepts_count: number;
  };
  attempt_behavior?: {
    first_attempt_accuracy: number;
    avg_retries: number;
    avg_time_per_attempt_sec: number;
    attempt_pattern: string;
  };
}

export interface Recommendation {
  id: string;
  type: "concept_revision" | "practice_more" | "confidence_building" | "pace_adjustment" | "mixed";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  icon: string;
  color: string;
  metrics_reason: string[];
}

/**
 * Generate personalized recommendations based on digital twin metrics
 */
export function generateRecommendations(metrics: DigitalTwinMetrics): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!metrics) {
    return recommendations;
  }

  // 1. QUIZ PERFORMANCE ANALYSIS
  if (metrics.quiz_patterns) {
    const qp = metrics.quiz_patterns;
    const reasons: string[] = [];

    // Hard difficulty accuracy is low
    if (qp.difficulty.hard < 0.5) {
      reasons.push("Low accuracy on hard questions (below 50%)");
      recommendations.push({
        id: "concept_revision_hard",
        type: "concept_revision",
        priority: "high",
        title: "Revise Advanced Concepts",
        description: "Your performance on harder questions indicates conceptual gaps. Focus on understanding core principles rather than memorizing.",
        action: "Review unit content and concept videos",
        icon: "🎓",
        color: "bg-red-50 border-red-200",
        metrics_reason: reasons,
      });
    }

    // Surface learning detected (high easy, low medium/hard)
    if (qp.difficulty.easy > 0.8 && qp.difficulty.medium < 0.6) {
      reasons.push("Surface learning pattern: Strong on easy, weak on medium difficulty");
      recommendations.push({
        id: "deepen_understanding",
        type: "concept_revision",
        priority: "high",
        title: "Deepen Your Understanding",
        description: "You're doing well on basic questions but struggling with medium-level problems. This suggests surface-level learning. Time to strengthen fundamentals.",
        action: "Solve numericals and medium-level practice problems",
        icon: "🔍",
        color: "bg-orange-50 border-orange-200",
        metrics_reason: [...reasons],
      });
    }

    // Declining trend
    if (qp.trend_direction === "declining") {
      reasons.push("Performance is declining over recent attempts");
      recommendations.push({
        id: "slow_down",
        type: "pace_adjustment",
        priority: "medium",
        title: "Slow Down Your Pace",
        description: "Your recent quiz scores show a downward trend. You might be rushing or fatigue. Take a break and review fundamentals.",
        action: "Review previous lessons before attempting more quizzes",
        icon: "⏸️",
        color: "bg-yellow-50 border-yellow-200",
        metrics_reason: [...reasons],
      });
    }
  }

  // 2. TIME BEHAVIOR ANALYSIS
  if (metrics.time_behavior) {
    const tb = metrics.time_behavior;
    const reasons: string[] = [];

    if (tb.flag === "rushing") {
      reasons.push("Time ratio < 0.6 (spending 60% or less of expected time)");
      recommendations.push({
        id: "slower_pace",
        type: "pace_adjustment",
        priority: "medium",
        title: "Spend More Time on Content",
        description: "You're completing quizzes much faster than expected. This suggests skimming rather than deep learning.",
        action: "Allocate more time to understand questions before answering",
        icon: "⚡",
        color: "bg-blue-50 border-blue-200",
        metrics_reason: [...reasons],
      });
    }

    if (tb.flag === "over_struggling") {
      reasons.push("Time ratio > 1.5 (spending 150%+ of expected time)");
      recommendations.push({
        id: "time_management",
        type: "confidence_building",
        priority: "medium",
        title: "Build Speed and Confidence",
        description: "You're spending much longer than expected on quizzes. Try to identify patterns in tough questions and practice similar problems.",
        action: "Practice timed quizzes and build pattern recognition",
        icon: "⏱️",
        color: "bg-purple-50 border-purple-200",
        metrics_reason: [...reasons],
      });
    }
  }

  // 3. MISTAKE CONSISTENCY ANALYSIS
  if (metrics.mistake_consistency) {
    const mc = metrics.mistake_consistency;
    const reasons: string[] = [];

    if (mc.weak_concepts_count > 0) {
      reasons.push(`${mc.weak_concepts_count} concept(s) with repeated mistakes`);
      recommendations.push({
        id: "targeted_practice",
        type: "concept_revision",
        priority: "high",
        title: "Target Weak Concepts",
        description: `You've struggled with the same concepts multiple times. This is a clear sign of a conceptual gap that needs focused attention.`,
        action: `Focus on: ${mc.repeated_mistakes.slice(0, 3).join(", ")}`,
        icon: "🎯",
        color: "bg-red-50 border-red-200",
        metrics_reason: [...reasons],
      });
    }
  }

  // 4. ATTEMPT BEHAVIOR ANALYSIS
  if (metrics.attempt_behavior) {
    const ab = metrics.attempt_behavior;
    const reasons: string[] = [];

    // Low first-attempt accuracy
    if (ab.first_attempt_accuracy < 0.5 && ab.first_attempt_accuracy > 0) {
      reasons.push(`Low first-attempt accuracy (${Math.round(ab.first_attempt_accuracy * 100)}%)`);
      recommendations.push({
        id: "review_content",
        type: "concept_revision",
        priority: "high",
        title: "Review Content Before Quizzing",
        description: "You have low success on first attempts, suggesting insufficient content preparation. Review lessons thoroughly before attempting quizzes.",
        action: "Study lesson content before each quiz attempt",
        icon: "📚",
        color: "bg-red-50 border-red-200",
        metrics_reason: [...reasons],
      });
    }

    // Careless mistakes (fast wrong answers)
    if (ab.avg_time_per_attempt_sec < 30 && ab.first_attempt_accuracy < 0.6) {
      reasons.push("Fast attempts with low accuracy suggest guessing/carelessness");
      recommendations.push({
        id: "careful_reading",
        type: "confidence_building",
        priority: "medium",
        title: "Read Questions More Carefully",
        description: "You're answering quickly with low accuracy. Slow down, read each question and option carefully, and think before answering.",
        action: "Practice careful question reading before selecting answers",
        icon: "🔎",
        color: "bg-yellow-50 border-yellow-200",
        metrics_reason: [...reasons],
      });
    }

    // Persistent learner but struggling
    if (ab.avg_retries > 3 && ab.attempt_pattern === "uncertain") {
      reasons.push(`High retry count (${Math.round(ab.avg_retries)}) with uncertain pattern`);
      recommendations.push({
        id: "learning_resources",
        type: "mixed",
        priority: "medium",
        title: "Use Additional Learning Resources",
        description: "You keep retrying but not improving. Use video explanations, textbooks, or ask for help instead of just retaking quizzes.",
        action: "Watch concept videos and read explanations",
        icon: "🎬",
        color: "bg-indigo-50 border-indigo-200",
        metrics_reason: [...reasons],
      });
    }
  }

  // 5. POSITIVE REINFORCEMENT
  if (metrics.quiz_patterns) {
    const qp = metrics.quiz_patterns;
    if (qp.latest_score >= 80 && qp.trend_direction === "improving") {
      recommendations.push({
        id: "keep_going",
        type: "confidence_building",
        priority: "low",
        title: "🎉 Great Progress!",
        description: "Your recent scores are improving and you're performing well! Keep this momentum going.",
        action: "Continue with the next unit or challenge yourself with harder problems",
        icon: "✨",
        color: "bg-green-50 border-green-200",
        metrics_reason: ["Strong recent performance", "Improving trend"],
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Get next suggested action
 */
export function getNextAction(recommendations: Recommendation[]): Recommendation | null {
  if (recommendations.length === 0) return null;
  
  // Return highest priority recommendation
  return recommendations[0];
}

/**
 * Format recommendation for display
 */
export function formatRecommendation(rec: Recommendation): string {
  return `${rec.title}: ${rec.description}`;
}
