import { supabase } from "./client";

export async function getCalendarEvents(userId: number) {
  return supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .order("cal_date");
}

export async function addCalendarEvent(event: {
  user_id: number;
  cal_title: string;
  cal_date: string;
  cal_time: string;
  cal_importance: "NORMAL" | "HIGH" | "CRITICAL";
}) {
  return supabase.from("calendar_events").insert(event);
}

export async function toggleCalendarEventComplete(
  calId: number,
  completed: boolean
) {
  return supabase
    .from("calendar_events")
    .update({ cal_completed: completed })
    .eq("cal_id", calId);
}
