"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { courses, CourseId } from "@/lib/courses"; // Import the courses data and type for CourseId
import { Note } from "@/lib/types/course"; // Use the Note type, not Notes

export default function NotesPage({
  params,
}: {
  params: { course: CourseId }; // Access the course parameter from the URL
}) {
  const courseData = courses[params.course];

  if (!courseData) {
    return <p className="text-center mt-20">Course not found</p>;
  }

  // Ensure that notes are correctly typed and fall back to an empty array if undefined
  const [notes, setNotes] = useState<Note[]>((courseData.notes as Note[]) || []);

  const [activeNoteId, setActiveNoteId] = useState<number>(notes[0]?.id || 1);
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
      type: "General",
      emoji: "📄",
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (field: keyof Note, value: string) => {
    setNotes(
      notes.map((n) => (n.id === activeNoteId ? { ...n, [field]: value } : n))
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      {/* Notes Sidebar */}
      <div className="w-64 bg-surface/50 border-r border-white/5 flex flex-col pt-4">
        <div className="px-4 mb-4">
          <Button
            onClick={handleCreateNote}
            className="w-full justify-start gap-2"
            variant="secondary"
            size="sm"
          >
            + New Page
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          <div>
            <div className="px-2 py-1 text-xs font-bold text-textSecondary uppercase mb-1">
              Module Notes
            </div>
            {notes
              .filter((n) => n.type === "Module")
              .map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`px-2 py-1.5 rounded cursor-pointer text-sm font-medium transition-colors ${
                    activeNoteId === note.id
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-white/5 text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  <span className="mr-2">{note.emoji}</span>
                  {note.title}
                </div>
              ))}
          </div>

          <div>
            <div className="px-2 py-1 text-xs font-bold text-textSecondary uppercase mb-1">
              General Notes
            </div>
            {notes
              .filter((n) => n.type === "General")
              .map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`px-2 py-1.5 rounded cursor-pointer text-sm font-medium transition-colors ${
                    activeNoteId === note.id
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-white/5 text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  <span className="mr-2">{note.emoji}</span>
                  {note.title}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      {activeNote ? (
        <div className="flex-1 bg-background overflow-y-auto">
          {/* Cover / Header */}
          <div className="h-48 w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 relative group">
            <div className="absolute bottom-4 left-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary">
                Change Cover
              </Button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto -mt-12 relative px-8 pb-20">
            <div className="text-6xl mb-4">{activeNote.emoji}</div>
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote("title", e.target.value)}
              className="w-full bg-transparent text-4xl font-bold text-textPrimary placeholder:text-white/20 focus:outline-none mb-8 border-none"
              placeholder="Untitled"
            />

            <div className="flex gap-4 mb-6">
              <select
                value={activeNote.type}
                onChange={(e) =>
                  updateNote("type", e.target.value as "Module" | "General")
                }
                className="bg-surface border border-white/10 rounded px-3 py-1 text-sm text-textSecondary outline-none focus:border-accent"
              >
                <option value="General">General Note</option>
                <option value="Module">Module Note</option>
              </select>
              <div className="text-xs text-textSecondary flex items-center">
                {activeNote.content.length} chars
              </div>
            </div>

            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote("content", e.target.value)}
              className="w-full h-[60vh] bg-transparent text-lg text-textSecondary leading-relaxed resize-none focus:outline-none placeholder:text-white/10"
              placeholder="Start typing your thoughts..."
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-textSecondary">
          Select a note or create a new one.
        </div>
      )}
    </div>
  );
}
