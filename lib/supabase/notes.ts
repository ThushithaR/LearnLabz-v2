import { supabase } from "./client";

/* =========================
   Fetch notes
========================= */
export async function getUserNotes(userId: number, courseId: number) {
  return supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("note_id", { ascending: false });
}

/* =========================
   Create note
========================= */
export async function createNote(note: {
  user_id: number;
  course_id: number;
  note_type: "MODULE" | "GENERAL";
  title: string;
  subtitle: string,
  content: { html: string; module_id: number; lesson_id: number };
  source: "MANUAL" | "HIGHLIGHT";
}) {
  return supabase
    .from("notes")
    .insert(note)
    .select()
    .single(); // ✅ returns ONE row
}

/* =========================
   Update note
========================= */
export async function updateNoteById(
  noteId: number,
  updates: Partial<{
    title: string;
    subtitle: string,
    content: { html: string };
    note_type: "MODULE" | "GENERAL";
  }>
) {
  return supabase
    .from("notes")
    .update(updates)
    .eq("note_id", noteId);
}

/* =========================
   Delete note
========================= */
export async function deleteNoteById(noteId: number) {
  return supabase
    .from("notes")
    .delete()
    .eq("note_id", noteId);
}
