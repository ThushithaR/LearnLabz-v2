import { LearnerProfile } from "@/lib/types/course";
import { X, TrendingUp, Clock, AlertTriangle, Target, Activity, FileText, Calculator, Info, Zap, MousePointer2, Trophy, BrainCircuit, ArrowRight } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import Link from "next/link";

export default function DigitalTwinAnalyticsModal({
    profile,
    onClose,
    courseSlug,
}: {
    profile: LearnerProfile;
    onClose: () => void;
    courseSlug: string;
}) {
    const {
        quiz_performance = { accuracy: 0, trend: 0, difficulty_wise_accuracy: { easy: 0, medium: 0, hard: 0 } },
        time_analysis = { lesson_time_ratios: {}, quiz_time_ratio: 1 },
        attempt_behavior = { first_attempt_accuracy: 0, retry_depth: 1, avg_attempt_time: 0, guessing_flag: false },
        unit_metrics = {},
        course_signals = { progress_percent: 0, streak_days: 0, engagement_rate: 0 },
        focus_lessons = [],
        last_updated = new Date().toISOString()
    } = profile || {};

    const getAdvice = () => {
        const recommendations: string[] = [];

        // 1. Check for critical focus lessons
        if (focus_lessons.length > 0) {
            const reasons = focus_lessons.map(l => l.reason);
            const rushingCount = reasons.filter(r => r === 'rushing').length;
            const strugglingCount = reasons.filter(r => r === 'struggling').length;
            const lowAccCount = reasons.filter(r => r === 'low_accuracy').length;

            if (rushingCount > 0) {
                recommendations.push(`⚠️ You're rushing through ${rushingCount} lesson${rushingCount > 1 ? 's' : ''}. Slow down and absorb the material thoroughly.`);
            }
            if (strugglingCount > 0) {
                recommendations.push(`🔴 Struggling detected in ${strugglingCount} lesson${strugglingCount > 1 ? 's' : ''}. Consider reviewing prerequisites or seeking additional resources.`);
            }
            if (lowAccCount > 0) {
                recommendations.push(`📉 Low quiz performance in ${lowAccCount} area${lowAccCount > 1 ? 's' : ''}. Revisit these lessons before moving forward.`);
            }
        }

        // 2. Quiz time efficiency analysis
        if (time_analysis.quiz_time_ratio < 0.6) {
            recommendations.push(`⚡ You're completing quizzes too quickly (${(time_analysis.quiz_time_ratio * 100).toFixed(0)}% of expected time). This may indicate guessing or insufficient understanding.`);
        } else if (time_analysis.quiz_time_ratio > 1.5) {
            recommendations.push(`⏰ Quizzes are taking longer than expected (${(time_analysis.quiz_time_ratio * 100).toFixed(0)}% of expected time). Focus on understanding core concepts to improve speed.`);
        }

        // 3. Guessing detection
        if (attempt_behavior.guessing_flag) {
            recommendations.push(`🎲 CRITICAL: Guessing pattern detected! Average attempt time is ${formatTime(attempt_behavior.avg_attempt_time)} with ${(attempt_behavior.first_attempt_accuracy * 100).toFixed(0)}% first-attempt accuracy. Review content before attempting quizzes.`);
        }

        // 4. Retry depth analysis
        if (attempt_behavior.retry_depth > 2.5) {
            recommendations.push(`🔄 High retry rate (${attempt_behavior.retry_depth.toFixed(1)}x average). Consider spending more time on lessons before taking quizzes.`);
        } else if (attempt_behavior.retry_depth === 1 && quiz_performance.accuracy > 0.85) {
            recommendations.push(`🏆 Excellent! You're acing quizzes on first attempt with ${(quiz_performance.accuracy * 100).toFixed(0)}% accuracy. Keep this momentum!`);
        }

        // 5. Performance trend
        if (quiz_performance.trend < -0.1) {
            recommendations.push(`📉 Performance declining by ${Math.abs(quiz_performance.trend * 100).toFixed(1)}%. Take a break, review recent material, and rebuild your foundation.`);
        } else if (quiz_performance.trend > 0.1) {
            recommendations.push(`📈 Improving! Performance up ${(quiz_performance.trend * 100).toFixed(1)}%. Your study approach is working well.`);
        }

        // 6. Difficulty-specific advice
        const { easy, medium, hard } = quiz_performance.difficulty_wise_accuracy;
        if (hard < 0.5 && medium > 0.7) {
            recommendations.push(`🎯 Hard topics need attention (${(hard * 100).toFixed(0)}% accuracy). Your foundation is solid, focus on advanced concepts.`);
        } else if (easy < 0.7) {
            recommendations.push(`⚠️ Fundamentals need work (${(easy * 100).toFixed(0)}% on easy questions). Strengthen basics before advancing.`);
        }

        // 7. Engagement analysis
        if (course_signals.engagement_rate < 0.5) {
            recommendations.push(`📅 Low engagement (${course_signals.engagement_rate.toFixed(1)} activities/day). Increase study frequency for better retention.`);
        } else if (course_signals.engagement_rate > 2) {
            recommendations.push(`🔥 High engagement (${course_signals.engagement_rate.toFixed(1)} activities/day)! Excellent dedication.`);
        }

        // Default positive message if no issues
        if (recommendations.length === 0) {
            return `✅ Strong performance across all metrics! Overall accuracy: ${(quiz_performance.accuracy * 100).toFixed(0)}%, Engagement: ${course_signals.engagement_rate.toFixed(1)} activities/day, ${course_signals.streak_days}-day streak. Keep up the excellent work!`;
        }

        return recommendations.join(' ');
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.round(sec % 60);
        return `${m}m ${s}s`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm animate-in fade-in duration-300 px-4">
            <div
                className="bg-surface border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="w-5 h-5 text-accent" />
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Learning Performance Report</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-textSecondary hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Top Advice Banner */}
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 flex items-start gap-4">
                        <div className="p-2.5 bg-accent/10 rounded-lg shrink-0">
                            <Zap className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-1">Strategic Advice</h3>
                            <p className="text-sm text-textPrimary leading-relaxed">{getAdvice()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: RECOMMENDATIONS */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <Target className="w-4 h-4 text-accent" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Targeted Focus Areas</h3>
                            </div>

                            {focus_lessons.length > 0 ? (
                                <div className="space-y-3">
                                    {focus_lessons.map((lesson, idx) => (
                                        <div key={idx} className="bg-surface/50 border border-white/5 rounded-xl p-4 flex flex-col gap-3 group hover:border-accent/40 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="secondary" className="text-[9px] uppercase h-4">
                                                            {lesson.reason.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] text-textSecondary font-mono italic">Unit {lesson.unit_id}</span>
                                                    </div>
                                                    <h4 className="font-bold text-white text-base leading-tight">{lesson.lesson_title}</h4>
                                                </div>
                                            </div>

                                            <Link href={`/dashboard/${courseSlug}/modules/${lesson.unit_id}?lesson=${encodeURIComponent(lesson.lesson_title)}`} className="w-full">
                                                <Button className="w-full h-8 text-[11px] font-bold uppercase tracking-widest">
                                                    Open Lesson
                                                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center border border-dashed border-white/10 rounded-xl">
                                    <p className="text-sm text-textSecondary">No critical focus areas identified. Your current trajectory is optimal.</p>
                                </div>
                            )}

                            {/* Summary Stats moved here but as list */}
                            <div className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
                                <h3 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Core Metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-textSecondary">Overall Mastery</div>
                                        <div className="text-xl font-bold text-white">{(quiz_performance.accuracy * 100).toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textSecondary">Average Depth</div>
                                        <div className="text-xl font-bold text-white">{attempt_behavior.retry_depth.toFixed(1)}x</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textSecondary">Engagement Rate</div>
                                        <div className="text-xl font-bold text-accent">{course_signals.engagement_rate.toFixed(1)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textSecondary">Learning Streak</div>
                                        <div className="text-xl font-bold text-orange-400">{course_signals.streak_days} Days</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: DETAILED ANALYTICS */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <TrendingUp className="w-4 h-4 text-accent" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Knowledge Analysis</h3>
                            </div>

                            <section className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
                                <div className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">
                                    Accuracy by Challenge level
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Easy Concepts', value: quiz_performance.difficulty_wise_accuracy.easy, color: 'bg-green-500' },
                                        { label: 'Intermediate', value: quiz_performance.difficulty_wise_accuracy.medium, color: 'bg-yellow-500' },
                                        { label: 'Hard Topics', value: quiz_performance.difficulty_wise_accuracy.hard, color: 'bg-red-500' }
                                    ].map((d) => (
                                        <div key={d.label} className="space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-textSecondary">{d.label}</span>
                                                <span className="text-white font-bold">{(d.value * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${d.color} transition-all duration-1000`}
                                                    style={{ width: `${d.value * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
                                <div className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Retention & Pace</div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MousePointer2 className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs text-textPrimary">First-Attempt Mastery</span>
                                        </div>
                                        <span className="text-xs font-bold text-white">{(attempt_behavior.first_attempt_accuracy * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                                            <span className="text-xs text-textPrimary">Avg Attempt Pace</span>
                                        </div>
                                        <span className="text-xs font-bold text-white">{formatTime(attempt_behavior.avg_attempt_time)}</span>
                                    </div>
                                    {attempt_behavior.guessing_flag && (
                                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] text-red-400 font-bold uppercase">Erratic answering pattern detected</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* TIME ANALYSIS SECTION */}
                            <section className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
                                <div className="text-[10px] text-textSecondary uppercase font-bold tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Time Analysis
                                </div>

                                {/* Quiz Time Ratio */}
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-3.5 h-3.5 text-purple-400" />
                                        <span className="text-xs text-textPrimary">Quiz Time Efficiency</span>
                                    </div>
                                    <span className={`text-xs font-bold ${time_analysis.quiz_time_ratio < 0.8 ? 'text-yellow-400' :
                                        time_analysis.quiz_time_ratio > 1.2 ? 'text-orange-400' :
                                            'text-green-400'
                                        }`}>
                                        {(time_analysis.quiz_time_ratio * 100).toFixed(0)}%
                                    </span>
                                </div>

                                {/* Lesson Time Breakdown */}
                                {Object.keys(time_analysis.lesson_time_ratios).length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="text-[9px] text-textSecondary uppercase font-bold">Lesson Pacing</div>
                                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                            {Object.entries(time_analysis.lesson_time_ratios).map(([lessonId, data]: [string, any]) => (
                                                <div key={lessonId} className="flex items-center justify-between text-[10px] p-2 rounded bg-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'rushing' ? 'bg-yellow-400' :
                                                            data.status === 'struggling' ? 'bg-red-400' :
                                                                'bg-green-400'
                                                            }`} />
                                                        <span className="text-textSecondary font-mono">L{lessonId}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-textSecondary">{formatTime(data.actual_time_sec)}</span>
                                                        <span className={`font-bold ${data.status === 'rushing' ? 'text-yellow-400' :
                                                            data.status === 'struggling' ? 'text-red-400' :
                                                                'text-green-400'
                                                            }`}>
                                                            {(data.ratio * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-[9px] text-textSecondary pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                                <span>Rushing (&lt;60%)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                <span>Ideal (60-150%)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                <span>Struggling (&gt;150%)</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-[10px] text-textSecondary">
                                        No lesson time data available yet
                                    </div>
                                )}
                            </section>

                            <div className="p-4 rounded-xl border border-white/5 bg-gradient-to-br from-accent/5 to-transparent">
                                <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Performance Trend
                                </h4>
                                <div className="flex items-center gap-3">
                                    <div className={`text-2xl font-bold ${quiz_performance.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {quiz_performance.trend >= 0 ? '+' : ''}{(quiz_performance.trend * 100).toFixed(1)}%
                                    </div>
                                    <p className="text-[10px] text-textSecondary leading-tight">
                                        {quiz_performance.trend >= 0
                                            ? "Improving accuracy across recent attempts."
                                            : "Performance has dipped slightly in recent modules."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4 text-[10px] text-textSecondary uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-1.5 font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            System Active
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Captured {new Date(last_updated).toLocaleDateString()}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose} className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest border-white/10 text-textSecondary hover:text-white">
                        Dismiss
                    </Button>
                </div>
            </div>
        </div>
    );
}
