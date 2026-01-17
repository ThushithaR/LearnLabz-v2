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
// Update the createNote function in notes.ts
export async function createNote(note: {
  user_id: number;
  course_id: number;
  note_type: "MODULE" | "GENERAL";
  note_title: string;
  note_subtitle?: string;
  note_content: any; // Use any instead of strict typing
  source: "MANUAL" | "HIGHLIGHT";
}) {
  return supabase
    .from("notes")
    .insert({
      user_id: note.user_id,
      course_id: note.course_id,
      note_type: note.note_type,
      note_title: note.note_title,
      note_subtitle: note.note_subtitle || "",
      note_content: note.note_content,
      source: note.source
    })
    .select()
    .single();
}

/* =========================
   Update note
========================= */
export async function updateNoteById(
  noteId: number,
  updates: Partial<{
    note_title: string;
    note_subtitle: string;
    note_content: { html: string };
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

// Add this to your notes.ts helper file
export async function upsertNote(note: {
  user_id: number;
  course_id: number;
  note_type: "MODULE" | "GENERAL";
  note_title: string;
  note_subtitle?: string;
  note_content: { 
    html: string;
    module_id?: number;
    lesson_id?: number;
  };
  source: "MANUAL" | "HIGHLIGHT";
  note_id?: number; // Add this optional parameter
}) {
  // If note_id is provided, just update that specific note
  if (note.note_id) {
    return supabase
      .from("notes")
      .update({
        note_title: note.note_title,
        note_subtitle: note.note_subtitle,
        note_content: note.note_content,
      })
      .eq("note_id", note.note_id)
      .select()
      .single();
  }

  // Rest of your existing upsertNote logic...
}