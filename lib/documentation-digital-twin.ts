/**
 * DIGITAL TWIN API DOCUMENTATION
 * Complete guide to using the digital twin system
 */

// ============================================================================
// 1. CALCULATING METRICS (Backend Service)
// ============================================================================

import {
  updateDigitalTwin,
  getDigitalTwinProfile,
  calculateQuizPatterns,
  calculateTimeBehavior,
  calculateMistakeConsistency,
  calculateAttemptBehavior,
} from '@/lib/supabase/digital-twin';

/**
 * UPDATE DIGITAL TWIN - FULL RECALCULATION
 * 
 * Call this after each quiz/numerical submission to refresh all metrics
 */
async function updateUserMetrics(
  userId: number,
  courseId: number,
  unitId: number
) {
  const profile = await updateDigitalTwin(userId, courseId, unitId);
  // Returns: full profile with metrics JSONB
  return profile;
}

// EXAMPLE USAGE:
// After quiz submission in quiz-taking page
// await updateDigitalTwin(user.user_id, courseId, unitId);

/**
 * GET EXISTING PROFILE
 * 
 * Fetch previously calculated metrics (no recalculation)
 */
async function getUserLearningProfile(
  userId: number,
  courseId: number,
  unitId: number
) {
  const profile = await getDigitalTwinProfile(userId, courseId, unitId);
  
  if (profile) {
    const {
      metrics,
      last_recommendation,
      updated_at,
    } = profile;
    
    // Access metrics by type
    const quizPatterns = metrics.quiz_patterns;
    const timeBehavior = metrics.time_behavior;
    const mistakes = metrics.mistake_consistency;
    const attempts = metrics.attempt_behavior;
    
    return { quizPatterns, timeBehavior, mistakes, attempts };
  }
  
  return null;
}

/**
 * CALCULATE INDIVIDUAL METRICS
 * 
 * If you need just one metric without recalculating all
 */

// Quiz performance only
async function getQuizPerformance(
  userId: number,
  courseId: number,
  unitId: number
) {
  const patterns = await calculateQuizPatterns(userId, courseId, unitId);
  
  return {
    accuracyTrend: patterns.accuracy_trend,        // [0.6, 0.65, 0.72]
    latestScore: patterns.latest_score,            // 0.72
    trend: patterns.trend_direction,               // "improving"
    difficulty: patterns.difficulty,               // {easy: 0.9, medium: 0.7, hard: 0.4}
  };
}

// Time behavior only
async function getTimeAnalysis(
  userId: number,
  courseId: number,
  unitId: number
) {
  const timeBehavior = await calculateTimeBehavior(userId, courseId, unitId);
  
  return {
    ratio: timeBehavior.avg_time_ratio,            // 1.6
    status: timeBehavior.flag,                     // "over_struggling"
    timeSpent: timeBehavior.total_time_sec,        // 3600 seconds
    expectedTime: timeBehavior.expected_time_sec,  // 2250 seconds
  };
}

// Mistake tracking only
async function getWeakConcepts(
  userId: number,
  courseId: number,
  unitId: number
) {
  const mistakes = await calculateMistakeConsistency(userId, courseId, unitId);
  
  return {
    weakSpots: mistakes.repeated_mistakes,         // ["Quiz_101"]
    count: mistakes.weak_concepts_count,           // 1
    frequency: mistakes.mistake_frequency,         // {Quiz_101: 3, Quiz_102: 1}
  };
}

// Attempt behavior only
async function getAttemptPatterns(
  userId: number,
  courseId: number,
  unitId: number
) {
  const behavior = await calculateAttemptBehavior(userId, courseId, unitId);
  
  return {
    firstAttemptSuccess: behavior.first_attempt_accuracy,  // 0.55
    avgRetries: behavior.avg_retries,                       // 2.3
    timePerAttempt: behavior.avg_time_per_attempt_sec,      // 45
    pattern: behavior.attempt_pattern,                      // "uncertain"
  };
}

// ============================================================================
// 2. GENERATING RECOMMENDATIONS
// ============================================================================

import {
  generateRecommendations,
  getNextAction,
  Recommendation,
} from '@/lib/recommendations';

/**
 * GET ALL RECOMMENDATIONS
 * 
 * Based on metrics, returns array of personalized recommendations
 */
async function getPersonalizedRecommendations(
  userId: number,
  courseId: number,
  unitId: number
): Promise<Recommendation[]> {
  // First get the profile with metrics
  const profile = await getDigitalTwinProfile(userId, courseId, unitId);
  
  if (!profile || !profile.metrics) {
    return [];
  }
  
  // Generate recommendations from metrics
  const recommendations = generateRecommendations(profile.metrics);
  
  // Returns array sorted by priority (high -> medium -> low)
  return recommendations;
  
  // Each recommendation has:
  // {
  //   id: string                          // unique identifier
  //   type: "concept_revision" | ...      // recommendation type
  //   priority: "high" | "medium" | "low" // urgency
  //   title: string                       // short title
  //   description: string                 // detailed explanation
  //   action: string                      // what student should do
  //   icon: string                        // emoji icon
  //   color: string                       // Tailwind color classes
  //   metrics_reason: string[]            // why this recommendation
  // }
}

/**
 * GET NEXT SUGGESTED ACTION
 * 
 * Returns the highest priority recommendation
 * Perfect for notifications or quick action button
 */
async function getTopAction(
  userId: number,
  courseId: number,
  unitId: number
): Promise<Recommendation | null> {
  const recommendations = await getPersonalizedRecommendations(userId, courseId, unitId);
  const topAction = getNextAction(recommendations);
  
  if (topAction) {
    console.log(`Suggested: ${topAction.title}`);
    // Can use for:
    // - Push notification
    // - Email reminder
    // - In-app banner
    // - Floating action button
  }
  
  return topAction;
}

// ============================================================================
// 3. REACT COMPONENT USAGE
// ============================================================================

import SmartReview from '@/components/ui/SmartReview';

/**
 * USE IN REACT COMPONENT
 */
function MyDashboard() {
  const courseId = 1;  // AIML
  const courseSlug = 'aiml'; // Course slug for routing
  const unitId = 2;    // Unit 2

  return (
    <div>
      {/* Full smart review component - handles everything */}
      <SmartReview courseId={courseId} courseSlug={courseSlug} unitId={unitId} />
    </div>
  );
}

/**
 * COMPONENT FEATURES
 * 
 * SmartReview automatically:
 * ✓ Loads user profile
 * ✓ Calculates all metrics
 * ✓ Generates recommendations
 * ✓ Displays with visualizations
 * ✓ Shows next action card
 * ✓ Lists all recommendations
 * ✓ Provides refresh button
 * ✓ Handles loading/error states
 */

// ============================================================================
// 4. PRACTICAL EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Show recommendation in notification
 */
async function sendLearningNotification(userId: number, courseId: number, unitId: number) {
  const topAction = await getTopAction(userId, courseId, unitId);
  
  if (topAction && topAction.priority === 'high') {
    // Send email notification
    await sendEmail({
      to: user.email,
      subject: `📚 ${topAction.title}`,
      body: topAction.description,
      cta: topAction.action,
    });
  }
}

/**
 * EXAMPLE 2: Create learning dashboard sidebar
 */
async function getLearningInsightsSidebar(userId: number, courseId: number, unitId: number) {
  const [
    quizPerf,
    timeBehavior,
    weakConcepts,
    recommendations
  ] = await Promise.all([
    getQuizPerformance(userId, courseId, unitId),
    getTimeAnalysis(userId, courseId, unitId),
    getWeakConcepts(userId, courseId, unitId),
    getPersonalizedRecommendations(userId, courseId, unitId),
  ]);
  
  return {
    performanceCard: {
      label: "Quiz Score",
      value: `${Math.round(quizPerf.latestScore * 100)}%`,
      trend: quizPerf.trend,
      icon: "📊",
    },
    efficiencyCard: {
      label: "Learning Efficiency",
      value: `${Math.round(timeBehavior.ratio * 100)}%`,
      status: timeBehavior.status,
      icon: "⏱️",
    },
    weakSpotsCard: {
      label: "Weak Concepts",
      value: weakConcepts.count,
      topics: weakConcepts.weakSpots,
      icon: "⚠️",
    },
    topRecommendation: recommendations[0],
  };
}

/**
 * EXAMPLE 3: Filter recommendations by type
 */
async function getConceptRevisions(userId: number, courseId: number, unitId: number) {
  const recommendations = await getPersonalizedRecommendations(userId, courseId, unitId);
  
  // Get only concept revision recommendations
  const conceptRecs = recommendations.filter(
    rec => rec.type === 'concept_revision'
  );
  
  return conceptRecs;
  
  // Use for: "Focus areas" section in dashboard
}

/**
 * EXAMPLE 4: Get metrics for analytics
 */
async function exportLearningMetrics(userId: number, courseId: number, unitId: number) {
  const profile = await getDigitalTwinProfile(userId, courseId, unitId);
  
  if (!profile) return null;
  
  return {
    timestamp: profile.updated_at,
    quizMetrics: {
      latestScore: profile.metrics.quiz_patterns.latest_score,
      trend: profile.metrics.quiz_patterns.trend_direction,
      performanceByDifficulty: profile.metrics.quiz_patterns.difficulty,
    },
    timeMetrics: {
      ratio: profile.metrics.time_behavior.avg_time_ratio,
      status: profile.metrics.time_behavior.flag,
    },
    engagementMetrics: {
      firstAttemptSuccess: profile.metrics.attempt_behavior.first_attempt_accuracy,
      pattern: profile.metrics.attempt_behavior.attempt_pattern,
    },
    weakAreas: {
      count: profile.metrics.mistake_consistency.weak_concepts_count,
      concepts: profile.metrics.mistake_consistency.repeated_mistakes,
    },
  };
  
  // Use for: Research, CSV export, teacher dashboards
}

/**
 * EXAMPLE 5: Show progress over time
 */
async function trackProgressOverUnits(userId: number, courseId: number, unitIds: number[]) {
  const profilesPerUnit = await Promise.all(
    unitIds.map(uid => getDigitalTwinProfile(userId, courseId, uid))
  );
  
  const progression = profilesPerUnit.map((profile, idx) => ({
    unitId: unitIds[idx],
    score: profile.metrics.quiz_patterns.latest_score,
    trend: profile.metrics.quiz_patterns.trend_direction,
    weakConcepts: profile.metrics.mistake_consistency.weak_concepts_count,
    timestamp: profile.updated_at,
  }));
  
  return progression;
  
  // Use for: Progress graphs, unit completion tracking
}

// ============================================================================
// 5. API TYPES
// ============================================================================

/**
 * DigitalTwinMetrics Type
 */
interface DigitalTwinMetrics {
  quiz_patterns?: {
    accuracy_trend: number[];
    latest_score: number;
    trend_direction: 'improving' | 'declining' | 'stable';
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  time_behavior?: {
    avg_time_ratio: number;
    flag: 'rushing' | 'ideal' | 'over_struggling' | 'no_data';
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
    attempt_pattern: 'confident' | 'uncertain' | 'persistent' | 'balanced' | 'no_data';
  };
}

/**
 * Recommendation Type
 */
interface Recommendation {
  id: string;
  type: 'concept_revision' | 'practice_more' | 'confidence_building' | 'pace_adjustment' | 'mixed';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  icon: string;
  color: string;
  metrics_reason: string[];
}

/**
 * UserLearningProfile Type
 */
interface UserLearningProfile {
  ulp_id: number;
  user_id: number;
  course_id: number;
  unit_id: number;
  quiz_score_latest: number;
  quiz_best_score: number;
  quiz_attempt_count: number;
  total_time_spent_sec: number;
  expected_time_sec: number;
  metrics: DigitalTwinMetrics;
  last_recommendation: string;
  recommendation_generated_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 6. COMMON PATTERNS
// ============================================================================

/**
 * Pattern 1: Detect at-risk student
 */
function isAtRisk(metrics: DigitalTwinMetrics): boolean {
  return (
    metrics.quiz_patterns?.trend_direction === 'declining' ||
    metrics.quiz_patterns?.difficulty?.hard < 0.3 ||
    metrics.mistake_consistency?.weak_concepts_count >= 3
  );
}

/**
 * Pattern 2: Check if ready for advancement
 */
function isReadyForNext(metrics: DigitalTwinMetrics): boolean {
  return (
    metrics.quiz_patterns?.latest_score >= 0.8 &&
    metrics.quiz_patterns?.trend_direction !== 'declining' &&
    metrics.time_behavior?.flag === 'ideal'
  );
}

/**
 * Pattern 3: Identify learning style
 */
function inferLearningStyle(metrics: DigitalTwinMetrics) {
  if (metrics.attempt_behavior?.first_attempt_accuracy > 0.7) {
    return 'confident_learner';
  }
  if (metrics.time_behavior?.avg_time_ratio > 1.5) {
    return 'deliberate_learner';
  }
  if (metrics.attempt_behavior?.avg_retries < 1.5) {
    return 'quick_learner';
  }
  return 'typical_learner';
}

// ============================================================================
// END OF DOCUMENTATION
// ============================================================================
