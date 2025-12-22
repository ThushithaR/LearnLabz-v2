"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Event {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    importance: "Normal" | "High" | "Critical";
    time: string;
}

export default function CalendarPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<Event[]>([
        { id: 1, title: "Unit IV Assessment", date: "2025-12-23", importance: "Critical", time: "14:00" },
        { id: 2, title: "Project Submission", date: "2025-12-24", importance: "High", time: "23:59" }
    ]);
    const [newEvent, setNewEvent] = useState<Partial<Event>>({ importance: "Normal" });

    const days = Array.from({ length: 35 }, (_, i) => i + 1);
    const todayNum = 21; // Simulating Dec 21st
    const todayDate = "2025-12-21";

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.date) return;
        setEvents([...events, { ...newEvent, id: Date.now() } as Event]);
        setIsModalOpen(false);
        setNewEvent({ importance: "Normal" });
    };

    const handleDeleteEvent = (id: number) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const isDueSoon = (dateStr: string) => {
        const today = new Date(todayDate);
        const eventDate = new Date(dateStr);
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 1; // Due today or tomorrow
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-textPrimary">Study Schedule</h1>
                <div className="flex gap-4">
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Event</Button>
                    <div className="flex gap-2 items-center">
                        <button className="text-textSecondary hover:text-white">←</button>
                        <span className="font-bold text-lg">December 2025</span>
                        <button className="text-textSecondary hover:text-white">→</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Card className="p-6">
                        <div className="grid grid-cols-7 mb-4 text-center text-sm text-textSecondary uppercase tracking-wider">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {days.map(day => {
                                const isToday = day === todayNum;
                                const dateStr = `2025-12-${day.toString().padStart(2, '0')}`;
                                const dayEvents = events.filter(e => e.date === dateStr);
                                const hasActivity = [2, 5, 8, 12, 14, 15, 18, 20, 21].includes(day);

                                return (
                                    <div key={day} className={`aspect-square rounded-lg border border-white/5 flex flex-col items-center justify-start p-2 relative hover:bg-white/5 cursor-pointer transition-colors ${isToday ? 'bg-white/5 border-accent' : ''}`}>
                                        <div className="flex justify-between w-full">
                                            <span className={`text-sm ${isToday ? 'text-accent font-bold' : 'text-textSecondary'}`}>{day <= 31 ? day : ''}</span>
                                            {dayEvents.length > 0 && isDueSoon(dateStr) && (
                                                <span className="text-accent animate-pulse">🔔</span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex flex-wrap gap-1 content-end w-full">
                                            {dayEvents.map(ev => (
                                                <div key={ev.id} className={`h-1.5 w-1.5 rounded-full ${ev.importance === 'Critical' ? 'bg-red-500' : 'bg-blue-400'}`} title={ev.title}></div>
                                            ))}
                                            {day <= 31 && hasActivity && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-accent/50"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="p-4 bg-gradient-to-br from-accent/20 to-surface">
                        <div className="text-accent font-bold text-lg mb-1">Target Streak</div>
                        <div className="text-4xl font-bold text-white mb-2">30 Days</div>
                        <p className="text-xs text-textSecondary">Maintain your streak to earn the "Diligent Learner" badge.</p>
                    </Card>

                    <h3 className="font-bold text-textPrimary px-1 flex justify-between items-center">
                        Upcoming Deadlines
                    </h3>
                    <div className="space-y-3">
                        {events.length === 0 && <p className="text-sm text-textSecondary text-center py-4">No upcoming events.</p>}
                        {events.sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
                            <Card key={ev.id} className={`p-4 border-l-4 group relative ${ev.importance === 'Critical' ? 'border-l-red-500' : ev.importance === 'High' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                                <button
                                    onClick={() => handleDeleteEvent(ev.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-textSecondary hover:text-red-500 transition-opacity"
                                    title="Delete Event"
                                >
                                    ✕
                                </button>
                                <div className="text-xs text-textSecondary uppercase flex items-center gap-2">
                                    {ev.date} • {ev.time}
                                    {isDueSoon(ev.date) && <span className="text-xs bg-red-500/10 text-red-400 px-1.5 rounded animate-pulse">! Due Soon</span>}
                                </div>
                                <div className="font-bold">{ev.title}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add Study Event</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-white">✕</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-textSecondary uppercase">Event Title</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 bg-background border border-white/10 rounded p-2 focus:border-accent outline-none"
                                    placeholder="e.g. Revision for Quiz"
                                    value={newEvent.title || ''}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-textSecondary uppercase">Date</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 bg-background border border-white/10 rounded p-2 focus:border-accent outline-none text-white scheme-dark"
                                        value={newEvent.date || ''}
                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-textSecondary uppercase">Time</label>
                                    <input
                                        type="time"
                                        className="w-full mt-1 bg-background border border-white/10 rounded p-2 focus:border-accent outline-none text-white scheme-dark"
                                        value={newEvent.time || ''}
                                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-textSecondary uppercase">Importance</label>
                                <select
                                    className="w-full mt-1 bg-background border border-white/10 rounded p-2 focus:border-accent outline-none text-textSecondary"
                                    value={newEvent.importance}
                                    onChange={(e: any) => setNewEvent({ ...newEvent, importance: e.target.value })}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleAddEvent}>Add Event</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

