"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { achievements } from "@/lib/data";

const allAchievements = [
    ...achievements,
    { id: 5, name: "Graph Guru", icon: "🕸️", unlocked: false, desc: "Complete Unit II" },
    { id: 6, name: "Perfect Score", icon: "💯", unlocked: false, desc: "Get 100% on a Quiz" },
    { id: 7, name: "Night Owl", icon: "🦉", unlocked: false, desc: "Study after 11 PM" },
    { id: 8, name: "Helping Hand", icon: "🤝", unlocked: false, desc: "Answer a forum question" },
];

export default function AchievementsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-textPrimary">Hall of Achievements</h1>
                <p className="text-textSecondary">Your legacy in the world of AI.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allAchievements.map((ach) => (
                    <Card key={ach.id} className={`p-6 flex flex-col items-center justify-center text-center gap-4 group transition-all duration-300 ${ach.unlocked ? 'border-accent/30 bg-gradient-to-br from-surface to-accent/5 hover:scale-105' : 'opacity-50 grayscale hover:opacity-70'}`}>
                        <div className="relative">
                            <div className={`text-6xl transition-transform duration-500 ${ach.unlocked ? 'group-hover:-translate-y-2' : ''}`}>
                                {ach.icon}
                            </div>
                            {ach.unlocked && <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full -z-10 animate-pulse"></div>}
                        </div>

                        <div>
                            <h3 className="font-bold text-textPrimary">{ach.name}</h3>
                            <p className="text-xs text-textSecondary mt-1">{ach.desc || "Unlock requirement hidden"}</p>
                        </div>

                        {ach.unlocked ? (
                            <Badge variant="accent">Unlocked</Badge>
                        ) : (
                            <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden mt-2">
                                <div className="bg-white/20 h-full w-1/3"></div> {/* Mock progress */}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
