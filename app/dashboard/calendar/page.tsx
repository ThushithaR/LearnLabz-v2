"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
    const [events, setEvents] = useState<Event[]>(
        courseData?.calendar || [
            { id: 1, title: "Unit IV Assessment", date: "2025-12-23", importance: "Critical", time: "14:00" },
            { id: 2, title: "Project Submission", date: "2025-12-24", importance: "High", time: "23:59" }
        ]
    );
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
            {/* ...rest of your code stays exactly the same... */}
        </div>
    );
}
