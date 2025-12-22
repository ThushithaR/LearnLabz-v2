"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowUpRight, Calculator, CheckCircle2, Circle } from "lucide-react";

// Mock Data
const numericals = [
    { id: "402", title: "Optimal Move - Minimax", topic: "Game Theory", difficulty: "Hard", status: "New", xp: 50 },
    { id: "105", title: "A* Heuristic Estimation", topic: "Informed Search", difficulty: "Medium", status: "Completing", xp: 30 },
    { id: "208", title: "Alpha-Beta Pruning Count", topic: "Game Theory", difficulty: "Hard", status: "Locked", xp: 50 },
    { id: "101", title: "BFS Path Cost", topic: "Uninformed Search", difficulty: "Easy", status: "Done", xp: 15 },
    { id: "303", title: "Neural Net Weights", topic: "Neural Networks", difficulty: "Medium", status: "New", xp: 30 },
];

export default function NumericalsHub() {
    const [filter, setFilter] = useState<'All' | 'Difficulty' | 'Topic'>('All');

    // Simple sorting/grouping logic for display
    const getDisplayData = () => {
        let data = [...numericals];
        if (filter === 'Difficulty') {
            const priority = { Easy: 1, Medium: 2, Hard: 3 };
            data.sort((a, b) => (priority[a.difficulty as keyof typeof priority] || 0) - (priority[b.difficulty as keyof typeof priority] || 0));
        } else if (filter === 'Topic') {
            data.sort((a, b) => a.topic.localeCompare(b.topic));
        }
        return data;
    };

    const displayData = getDisplayData();

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-textPrimary">Numerical Labs</h1>
                <p className="text-textSecondary">Deep dive into algorithmic problems. Workspace included.</p>
            </div>

            {/* Sort/Filter Controls */}
            <div className="flex items-center gap-4 bg-surface/50 p-1 rounded-lg w-fit border border-white/5">
                {['All', 'Difficulty', 'Topic'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === f
                                ? 'bg-accent text-background shadow-md'
                                : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'
                            }`}
                    >
                        Sort by {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData.map((item) => (
                    <Link href={`/dashboard/numericals/${item.id}`} key={item.id} className={item.status === 'Locked' ? 'pointer-events-none' : ''}>
                        <Card className={`h-full group hover:border-accent/40 transition-all flex flex-col ${item.status === 'Locked' ? 'opacity-50 grayscale' : 'cursor-pointer'}`}>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className="opacity-70">{item.difficulty}</Badge>
                                    {item.status === 'Done' ? (
                                        <CheckCircle2 className="text-success w-5 h-5" />
                                    ) : item.status === 'New' ? (
                                        <Badge variant="accent" className="animate-pulse px-1.5 py-0 text-[10px]">NEW</Badge>
                                    ) : (
                                        <Circle className="text-white/20 w-5 h-5" />
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-textPrimary group-hover:text-accent transition-colors mb-1">
                                    {item.title}
                                </h3>
                                <div className="text-xs text-textSecondary font-medium uppercase tracking-wider mb-6">
                                    {item.topic}
                                </div>

                                <div className="mt-auto flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-textSecondary group-hover:text-textPrimary">
                                        <Calculator className="w-4 h-4" />
                                        <span>Workspace Ready</span>
                                    </div>
                                    <div className="text-accent font-bold">
                                        {item.xp} XP
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-xs font-bold text-textSecondary group-hover:text-textPrimary transition-colors">
                                <span>ID: #{item.id}</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
