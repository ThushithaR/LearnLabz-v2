"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockUser } from "@/lib/data";

const leaderboardData = [
    { rank: 1, name: "Sarah Connor", tier: "AI Virtuoso", ep: 15400, avatar: "SC" },
    { rank: 2, name: "Marcus Aurelius", tier: "Master Thinker", ep: 14200, avatar: "MA" },
    { rank: 3, name: "Ada Lovelace", tier: "Algorithm Adept", ep: 13950, avatar: "AL" },
    { rank: 142, name: "Alex Chen (You)", tier: "Algorithm Adept", ep: 1250, isUser: true, avatar: "AC" },
    { rank: 4, name: "Alan Turing", tier: "Enlightened Mind", ep: 13100, avatar: "AT" },
    { rank: 5, name: "Grace Hopper", tier: "Curious Scholar", ep: 11000, avatar: "GH" },
];

export default function LeaderboardPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-textPrimary">Global Scholars</h1>
                <p className="text-textSecondary">Top performers this week.</p>
            </div>

            <div className="flex justify-center mb-6">
                <div className="inline-flex bg-surface rounded-lg p-1 border border-white/5">
                    {['Global', 'School', 'Class'].map((tab, i) => (
                        <button key={tab} className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${i === 0 ? 'bg-accent text-background' : 'text-textSecondary hover:text-textPrimary'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {/* Top 3 Podium Visual (Simplified List for now) */}

                {leaderboardData.slice(0, 3).map((user) => (
                    <Card key={user.rank} className="flex items-center gap-4 p-4 border-accent/30 bg-gradient-to-r from-surface to-accent/5">
                        <div className={`font-black text-2xl w-12 text-center ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                            #{user.rank}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">
                            {user.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-textPrimary">{user.name}</div>
                            <div className="text-xs text-textSecondary">{user.tier}</div>
                        </div>
                        <div className="font-mono font-bold text-accent">{user.ep.toLocaleString()} EP</div>
                    </Card>
                ))}

                <div className="h-px bg-white/10 my-4"></div>

                {leaderboardData.slice(4).map((user) => (
                    <Card key={user.rank} className="flex items-center gap-4 p-4 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="font-medium text-xl w-12 text-center text-textSecondary">
                            #{user.rank}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">
                            {user.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-textPrimary">{user.name}</div>
                            <div className="text-xs text-textSecondary">{user.tier}</div>
                        </div>
                        <div className="font-mono text-textSecondary">{user.ep.toLocaleString()} EP</div>
                    </Card>
                ))}

                {/* Sticky User Row if not in view, simplified here as just part of the list but highlighted */}
                {leaderboardData.find(u => u.isUser) && (
                    <Card className="flex items-center gap-4 p-4 border-2 border-accent bg-accent/10 sticky bottom-4 shadow-2xl transform scale-105">
                        <div className="font-medium text-xl w-12 text-center text-accent">
                            #{leaderboardData.find(u => u.isUser)?.rank}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-accent text-background flex items-center justify-center font-bold text-xs">
                            AC
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-textPrimary">You</div>
                            <div className="text-xs text-textSecondary">{mockUser.tier}</div>
                        </div>
                        <div className="font-mono font-bold text-accent">{mockUser.ep.toLocaleString()} EP</div>
                    </Card>
                )}
            </div>
        </div>
    );
}
