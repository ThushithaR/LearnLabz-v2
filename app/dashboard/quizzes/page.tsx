"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronRight, Clock, Trophy, PlayCircle } from "lucide-react";

// Mock Data Structure matching user request [Unit -> [Easy, Medium, Hard]]
const quizUnits = [
    {
        id: "u1",
        title: "Unit I: Introduction & Intelligent Agents",
        quizzes: [
            { id: "q1_e", level: "Easy", time: "5m", qs: 10, ep: 50, status: "Completed", score: "9/10" },
            { id: "q1_m", level: "Medium", time: "15m", qs: 20, ep: 100, status: "Available", score: null },
            { id: "q1_h", level: "Hard", time: "30m", qs: 25, ep: 250, status: "Locked", score: null },
        ]
    },
    {
        id: "u2",
        title: "Unit II: Search Strategies",
        quizzes: [
            { id: "q2_e", level: "Easy", time: "10m", qs: 15, ep: 75, status: "Available", score: null },
            { id: "q2_m", level: "Medium", time: "20m", qs: 25, ep: 150, status: "Locked", score: null },
            { id: "q2_h", level: "Hard", time: "45m", qs: 40, ep: 500, status: "Locked", score: null },
        ]
    },
    {
        id: "u3",
        title: "Unit III: Knowledge Representation",
        quizzes: [
            { id: "q3_e", level: "Easy", time: "10m", qs: 15, ep: 75, status: "Locked", score: null },
            { id: "q3_m", level: "Medium", time: "20m", qs: 25, ep: 150, status: "Locked", score: null },
            { id: "q3_h", level: "Hard", time: "40m", qs: 35, ep: 400, status: "Locked", score: null },
        ]
    }
];

export default function QuizzesPage() {
    const [expandedUnits, setExpandedUnits] = useState<string[]>(["u1", "u2"]);

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev =>
            prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
        );
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <div className="flex flex-col gap-2 shrink-0">
                <h1 className="text-3xl font-bold text-textPrimary">Quizzes & Assessments</h1>
                <p className="text-textSecondary">Master each unit by clearing all difficulty levels.</p>
            </div>

            <div className="space-y-6">
                {quizUnits.map((unit) => (
                    <div key={unit.id} className="space-y-4">
                        <button
                            onClick={() => toggleUnit(unit.id)}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                {expandedUnits.includes(unit.id) ? (
                                    <ChevronDown className="w-5 h-5 text-accent" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-textSecondary group-hover:text-accent" />
                                )}
                                <span className="text-lg font-bold text-textPrimary">{unit.title}</span>
                            </div>
                            <Badge variant="outline" className="opacity-50 group-hover:opacity-100 transition-opacity">
                                {unit.quizzes.filter(q => q.status === 'Completed').length} / {unit.quizzes.length} Completed
                            </Badge>
                        </button>

                        {expandedUnits.includes(unit.id) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-white/5">
                                {unit.quizzes.map((quiz) => (
                                    <Card
                                        key={quiz.id}
                                        className={`relative p-5 flex flex-col gap-4 border-2 transition-all group ${quiz.status === 'Locked'
                                                ? 'opacity-50 border-transparent bg-white/5'
                                                : 'border-white/5 hover:border-accent/40 bg-surface cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <Badge
                                                variant={quiz.level === 'Hard' ? 'warning' : quiz.level === 'Medium' ? 'default' : 'secondary'}
                                                className="uppercase tracking-widest text-[10px]"
                                            >
                                                {quiz.level}
                                            </Badge>
                                            {quiz.status === 'Completed' && <CheckCircle2 className="w-5 h-5 text-success" />}
                                            {quiz.status === 'Locked' && <div className="w-2 h-2 rounded-full bg-white/20" />}
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-textPrimary text-lg mb-1">{quiz.qs} Questions</h4>
                                            <div className="flex items-center gap-3 text-xs font-bold text-textSecondary uppercase tracking-wider">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {quiz.time}
                                                </div>
                                                <div className="flex items-center gap-1 text-accent">
                                                    <Trophy className="w-3 h-3" />
                                                    {quiz.ep} EP
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-white/5">
                                            {quiz.status === 'Locked' ? (
                                                <Button size="sm" variant="ghost" disabled className="w-full justify-start text-textSecondary">
                                                    Locked
                                                </Button>
                                            ) : (
                                                <Link href={`/dashboard/quizzes/${quiz.id}`} className="w-full">
                                                    <Button size="sm" variant="primary" className="w-full gap-2 group-hover:bg-accent group-hover:text-background">
                                                        <PlayCircle className="w-4 h-4" />
                                                        {quiz.status === 'Completed' ? 'Retake' : 'Start'}
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
