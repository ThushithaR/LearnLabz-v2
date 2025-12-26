"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCourse } from "@/lib/context/CourseContext";
import { courses } from "@/lib/courses";

interface Event {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    importance: "Normal" | "High" | "Critical";
    time: string;
}

export default function CalendarPage() {
    const { selectedCourse } = useCourse();
    const courseData = selectedCourse ? courses[selectedCourse] : null;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const allEvents = Object.values(courses).flatMap(course => course.calendar || []);
    const [events, setEvents] = useState<Event[]>(allEvents.length > 0 ? allEvents : [
        { id: 1, title: "Unit IV Assessment", date: "2025-12-23", importance: "Critical", time: "14:00" },
        { id: 2, title: "Project Submission", date: "2025-12-24", importance: "High", time: "23:59" }
    ]);
    const [newEvent, setNewEvent] = useState<Partial<Event>>({ importance: "Normal" });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = [...Array.from({ length: startDayOfWeek }, () => null), ...Array.from({ length: numDays }, (_, i) => i + 1)];
    const todayNum = now.getDate();
    const todayDate = now.toISOString().split('T')[0];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[month];

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

    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day;
        });
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case "Critical": return "text-red-400 border-red-400/30 bg-red-400/5";
            case "High": return "text-orange-400 border-orange-400/30 bg-orange-400/5";
            case "Normal": return "text-blue-400 border-blue-400/30 bg-blue-400/5";
            default: return "text-gray-400 border-gray-400/30 bg-gray-400/5";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Calendar</h1>
                    <p className="text-textSecondary mt-1">Track your important dates and deadlines</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent/90">
                    Add Event
                </Button>
            </div>

            <div className="flex gap-6">
                <Card className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-textPrimary">{currentMonthName} {year}</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Previous</Button>
                            <Button variant="outline" size="sm">Next</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-textSecondary py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => {
                            if (day === null) {
                                return (
                                    <div key={index} className="min-h-[80px] p-2">
                                        {/* Empty cell for days before the start of the month */}
                                    </div>
                                );
                            }
                            const dayEvents = getEventsForDay(day);
                            const isToday = day === todayNum;

                            return (
                                <Card
                                    key={day}
                                    className={`min-h-[80px] p-2 cursor-pointer hover:bg-surface/80 transition-colors ${
                                        isToday ? 'backdrop-blur-lg bg-accent/30 shadow-xl shadow-accent/30 border border-accent' : ''
                                    }`}
                                >
                                    <div className={`text-sm font-medium mb-1 ${
                                        isToday ? 'text-accent' : 'text-textPrimary'
                                    }`}>
                                        {day}
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={`text-xs p-1 rounded border ${getImportanceColor(event.importance)}`}
                                                title={`${event.title} at ${event.time}`}
                                            >
                                                <div className="font-medium truncate">{event.title}</div>
                                                <div className="text-xs opacity-75">{event.time}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </Card>

                {/* Events List */}
                <Card className="w-64 p-4">
                    <h3 className="text-lg font-semibold text-textPrimary mb-4">Upcoming Events</h3>
                    <div className="space-y-2">
                        {events
                            .filter(event => new Date(event.date) >= new Date(todayDate))
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map(event => (
                                <div key={event.id} className="flex items-center justify-between p-2 border border-white/5 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            event.importance === 'Critical' ? 'bg-red-400' :
                                            event.importance === 'High' ? 'bg-orange-400' : 'bg-blue-400'
                                        }`} />
                                        <div>
                                            <div className="font-medium text-textPrimary text-sm">{event.title}</div>
                                            <div className="text-xs text-textSecondary">
                                                {event.date} at {event.time}
                                                {isDueSoon(event.date) && (
                                                    <span className="ml-1 text-red-400 font-medium">Due Soon!</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ))}
                    </div>
                </Card>
            </div>

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-textPrimary mb-4">Add New Event</h3>
                        <div className="space-y-4">
                            <Input
                                placeholder="Event title"
                                value={newEvent.title || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                            <Input
                                type="date"
                                value={newEvent.date || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            />
                            <Input
                                type="time"
                                value={newEvent.time || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            />
                            <select
                                value={newEvent.importance || 'Normal'}
                                onChange={(e) => setNewEvent({ ...newEvent, importance: e.target.value as Event['importance'] })}
                                className="w-full px-3 py-2 bg-surface border border-white/10 rounded-md text-textPrimary"
                            >
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleAddEvent} className="flex-1">
                                Add Event
                            </Button>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
