import { supabase } from "./client";

export async function getUserNotes(userId: number) {
  return supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("note_id", { ascending: false });
}

export async function createNote(note: {
  user_id: number;
  course_id?: number | null;
  note_type: "MODULE" | "GENERAL";
  note_title?: string;
  note_content: any;
  note_attachments?: any;
  source: "HIGHLIGHT" | "MANUAL";
}) {
  return supabase.from("notes").insert(note);
}
