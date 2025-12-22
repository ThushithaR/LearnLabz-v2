"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Clock, AlertCircle } from "lucide-react";

export default function QuizSolvePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [timer, setTimer] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const totalQuestions = 10;

    // Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300">
            {/* Minimalist Fixed Header */}
            <div className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-surface/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-textPrimary tracking-tight">Search Strategies Quiz</h1>
                    <Badge variant="outline">Hard</Badge>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="font-mono text-lg font-bold text-textPrimary tabular-nums">{formatTime(timer)}</span>
                    </div>
                    <Button
                        variant="secondary"
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => {
                            if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                                router.push('/dashboard/quizzes');
                            }
                        }}
                    >
                        Exit Quiz
                    </Button>
                </div>
            </div>

            {/* Main Quiz Area */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Left: Question List / Navigator */}
                <div className="col-span-3 border-r border-white/5 bg-surface/20 p-6 overflow-y-auto">
                    <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-4">Questions</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: totalQuestions }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i + 1)}
                                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${currentQuestion === i + 1
                                        ? 'bg-accent text-background shadow-lg shadow-accent/20 scale-105'
                                        : 'bg-white/5 text-textSecondary hover:bg-white/10'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex gap-2 items-start">
                            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                            <p className="text-xs text-blue-200 leading-relaxed">
                                Questions marked with (*) have multiple correct answers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Question Content */}
                <div className="col-span-9 p-8 md:p-12 overflow-y-auto flex flex-col max-w-4xl mx-auto w-full">
                    <div className="flex-1">
                        <div className="mb-6 text-sm font-medium text-textSecondary">
                            Question {currentQuestion} of {totalQuestions}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-textPrimary leading-tight mb-8">
                            Which of the following heuristics satisfies the admissibility condition for the 8-puzzle problem?
                        </h2>

                        <div className="space-y-4">
                            {[
                                "Manhattan Distance of all tiles from their goal positions",
                                "The square of the number of misplaced tiles",
                                "The sum of Euclidean distances of all tiles",
                                "Linear Conflict + Manhattan Distance * 2"
                            ].map((option, idx) => (
                                <button
                                    key={idx}
                                    className="w-full text-left p-6 rounded-xl border border-white/10 bg-surface/40 hover:bg-accent/5 hover:border-accent/50 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-accent group-hover:text-accent flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-lg text-textSecondary group-hover:text-textPrimary transition-colors">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 flex justify-between pt-8 border-t border-white/5">
                        <Button
                            variant="secondary"
                            disabled={currentQuestion === 1}
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => {
                                if (currentQuestion < totalQuestions) setCurrentQuestion(prev => prev + 1);
                                else alert('Quiz Submitted!');
                            }}
                        >
                            {currentQuestion === totalQuestions ? 'Submit Quiz' : 'Next Question'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
