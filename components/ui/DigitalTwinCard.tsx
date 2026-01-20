import { useState } from "react";
import { LearnerProfile } from "@/lib/types/course";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Brain, ArrowRight, Zap, Target, Activity, AlertTriangle } from "lucide-react";
import DigitalTwinAnalyticsModal from "./DigitalTwinAnalyticsModal";

export default function DigitalTwinCard({
    profile,
    courseSlug
}: {
    profile: LearnerProfile | null;
    courseSlug: string;
}) {
    const [showModal, setShowModal] = useState(false);

    // Fallback if no profile data yet
    if (!profile) {
        return (
            <Card className="flex flex-col p-0 overflow-hidden border border-white/5 bg-surface/40 rounded-xl relative group">
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 relative z-10">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Digital Twin</span>
                </div>
                <div className="p-6 text-center relative z-10">
                    <p className="text-xs text-textSecondary mb-2">Analyzing your learning patterns...</p>
                    <p className="text-[10px] text-white/40">Complete more activities to activate.</p>
                </div>
            </Card>
        );
    }

    const {
        quiz_performance = { accuracy: 0, trend: 0 },
        attempt_behavior = { retry_depth: 1, guessing_flag: false },
        course_signals = { engagement_rate: 0 }
    } = profile || {};

    // Determine top recommendation
    let primaryRec = "Maintain consistent rhythm";
    let subRec = "";

    if (profile.focus_lessons && profile.focus_lessons.length > 0) {
        const topLesson = profile.focus_lessons[0];
        primaryRec = `Focus: ${topLesson.lesson_title}`;
        if (topLesson.reason === 'low_accuracy') subRec = "Improve quiz performance here";
        else if (topLesson.reason === 'rushing') subRec = "Spend more time on this material";
        else if (topLesson.reason === 'struggling') subRec = "Review and retry concepts";
    } else if (attempt_behavior.guessing_flag) {
        primaryRec = "Stop guessing patterns";
        subRec = "Review content before quizzes";
    } else if (quiz_performance.accuracy > 0.9) {
        primaryRec = "Challenge Professional Modules";
        subRec = "Move to advanced topics";
    }

    return (
        <>
            <Card className="flex flex-col p-0 overflow-hidden border border-white/10 bg-surface/40 hover:bg-surface/60 transition-all rounded-xl relative group">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Digital Twin</span>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Target className="w-3.5 h-3.5 text-red-400" />
                            <h4 className="font-bold text-xs text-textPrimary uppercase tracking-tighter">Insights</h4>
                        </div>
                        <ul className="space-y-1">
                            <li className="text-[11px] text-textSecondary flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                {(quiz_performance.accuracy * 100).toFixed(0)}% Overall Accuracy
                            </li>
                            <li className="text-[11px] text-textSecondary flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                {attempt_behavior.retry_depth.toFixed(1)}x Avg Retries
                            </li>
                        </ul>
                    </div>

                    <div className="bg-purple-500/10 rounded-lg p-2.5 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[9px] font-black text-purple-400 uppercase">Focus Recommendation</span>
                        </div>
                        <p className="text-xs font-bold text-white tracking-tight leading-tight truncate">{primaryRec}</p>
                        {subRec && <p className="text-[10px] text-white/50 mt-0.5">{subRec}</p>}
                    </div>

                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-[10px] h-8 font-bold uppercase tracking-wider"
                        onClick={() => setShowModal(true)}
                    >
                        Deconstruct Profile
                        <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </Card>

            {showModal && (
                <DigitalTwinAnalyticsModal
                    profile={profile}
                    onClose={() => setShowModal(false)}
                    courseSlug={courseSlug}
                />
            )}
        </>
    );
}
