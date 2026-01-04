"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import {updateUserStreak} from "@/lib/supabase/progress"
import {supabase} from "@/lib/supabase/client"
import {
  getCalendarEvents,
  addCalendarEvent,
  toggleCalendarEventComplete,
} from "@/lib/supabase/calendar";
import { getCurrentUserProfile } from "@/lib/supabase/profile";

/* =========================
   Types
========================= */
interface CalendarEvent {
  cal_id: number;
  cal_title: string;
  cal_date: string; // YYYY-MM-DD
  cal_time: string | null;
  cal_importance: "NORMAL" | "HIGH" | "CRITICAL";
  cal_completed: boolean;
}

export default function CalendarPage() {
  /* =========================
     State
  ========================= */
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    importance: "NORMAL" as "NORMAL" | "HIGH" | "CRITICAL",
  });

  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());

  /* =========================
     Load events + streak days
  ========================= */
  useEffect(() => {
    async function load() {
      const user = await getCurrentUserProfile();
      if (!user) return;

      setUserId(user.user_id);

      const { data } = await getCalendarEvents(user.user_id);
      if (data) setEvents(data);

      // 🔥 Build streak only from continuous login days
      const { data: userCourses } = await supabase
        .from("user_courses")
        .select("last_active")
        .eq("user_id", user.user_id)
        .order("last_active", { ascending: false });

      if (!userCourses || userCourses.length === 0) return;

      const streakSet = new Set<number>();
      let streakDate = new Date(); // today
      streakDate.setHours(0, 0, 0, 0);

      for (const uc of userCourses) {
        const login = new Date(uc.last_active);
        login.setHours(0, 0, 0, 0);

        const diff = (streakDate.getTime() - login.getTime()) / 86400000;

        if (diff === 0 || diff === 1) {
          // today or yesterday
          streakSet.add(streakDate.getDate());
          streakDate.setDate(streakDate.getDate() - 1);
        } else {
          // streak broken
          break;
        }
      }

      setActiveDays(streakSet);
    }

    load();
  }, []);

  /* =========================
     Add event
  ========================= */
  const handleAddEvent = async () => {
    if (!userId || !newEvent.title || !newEvent.date) return;

    const { error } = await addCalendarEvent({
      user_id: userId,
      cal_title: newEvent.title,
      cal_date: newEvent.date,
      cal_time: newEvent.time,
      cal_importance: newEvent.importance,
    });

    if (!error) {
      const { data } = await getCalendarEvents(userId);
      setEvents(data ?? []);
      setIsModalOpen(false);
      setNewEvent({ title: "", date: "", time: "", importance: "NORMAL" });
    }
  };

  /* =========================
     Toggle completion
  ========================= */
  const toggleComplete = async (
    event: CalendarEvent,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!userId) return;

    await toggleCalendarEventComplete(
      event.cal_id,
      !event.cal_completed
    );

    setEvents((prev) =>
      prev.map((ev) =>
        ev.cal_id === event.cal_id
          ? { ...ev, cal_completed: !ev.cal_completed }
          : ev
      )
    );
  };

  /* =========================
     Calendar helpers
  ========================= */
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayNum = now.getDate();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const getEventsForDay = (day: number) =>
    events.filter(
      (e) => new Date(e.cal_date).getDate() === day
    );

  const getImportanceColor = (
    importance: string,
    completed: boolean
  ) => {
    if (completed)
      return "text-textSecondary border-white/5 bg-white/[0.02] line-through opacity-60 grayscale";

    switch (importance) {
      case "CRITICAL":
        return "text-red-400 border-red-400/30 bg-red-400/5";
      case "HIGH":
        return "text-orange-400 border-orange-400/30 bg-orange-400/5";
      default:
        return "text-blue-400 border-blue-400/30 bg-blue-400/5";
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Calendar</h1>
          <p className="text-textSecondary mt-1">
            Track your important dates and deadlines
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent/90"
        >
          Add Event
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-textPrimary">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div
              key={d}
              className="text-center text-sm font-medium text-textSecondary py-2"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            if (!day)
              return <div key={i} className="min-h-[100px]" />;

            const dayEvents = getEventsForDay(day);
            const isToday = day === todayNum;

            return (
              <Card
                key={i}
                className={cn(
                  "min-h-[100px] p-2 transition-colors",
                  isToday
                    ? "backdrop-blur-lg bg-accent/30 shadow-xl border-accent"
                    : "hover:bg-surface/80"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday ? "text-accent" : "text-textPrimary"
                    )}
                  >
                    {day}
                  </span>
                  {activeDays.has(day) && (
                    <Flame className="w-3 h-3 text-orange-500" />
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.cal_id}
                      onClick={(e) => toggleComplete(event, e)}
                      title={`${event.cal_title} ${
                        event.cal_time ? `at ${event.cal_time}` : ""
                      }`}
                      className={cn(
                        "text-xs p-1.5 rounded border cursor-pointer transition-all",
                        getImportanceColor(
                          event.cal_importance,
                          event.cal_completed
                        )
                      )}
                    >
                      <div className="font-medium truncate">
                        {event.cal_title}
                      </div>
                      {!event.cal_completed && event.cal_time && (
                        <div className="text-[10px] opacity-75">
                          {event.cal_time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* =========================
         Add Event Modal
      ========================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">
              Add New Event
            </h3>

            <div className="space-y-4">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
              />

              <select
                value={newEvent.importance}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    importance: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-surface border border-white/10 rounded-md text-textPrimary"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1" onClick={handleAddEvent}>
                Add Event
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
