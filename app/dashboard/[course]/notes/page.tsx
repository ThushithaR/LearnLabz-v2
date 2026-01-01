"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { courses, CourseId } from "@/lib/courses";
import { Note } from "@/lib/types/course";
import { useCourse } from "@/lib/context/CourseContext";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [notes, setNotes] = useState<Note[]>(
    ((courseData.notes as Note[])?.length > 0 ? (courseData.notes as Note[]) : [
      {
        id: 1,
        title: "NLP Unit 1 Reflection",
        subtitle: "Key takeaways from unit 1",
        content: "<h2>My Progress</h2><p>I have learned the <b>basics of Tokenization</b> and how it differs from stemming.</p><p><span style='background-color: #facc15'>Important:</span> Always use lemmatization for better root extraction.</p>",
        type: "Module",
      },
      {
        id: 2,
        title: "Study Schedule",
        subtitle: "Weekly goals",
        content: "<ul><li>Monday: Text Preprocessing</li><li>Wednesday: Word Embeddings</li><li>Friday: Project Work</li></ul>",
        type: "General",
      }
    ])
  );

  const [activeNoteId, setActiveNoteId] = useState<number>(notes[0]?.id || 1);
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // New Features: Sidebar Collapse & Fullscreen
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isFullscreen, setIsFullscreen } = useCourse();

  // New Note Creation State
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteData, setNewNoteData] = useState({ title: "", subtitle: "" });

  // Editor Ref
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const highlightColors = [
    { name: 'Yellow', value: '#facc15' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Rose', value: '#fb7185' },
    { name: 'Orange', value: '#fb923c' },
  ];

  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImg(target as HTMLImageElement);
    } else {
      setSelectedImg(null);
    }
  };

  const handleDeleteImage = () => {
    if (selectedImg) {
      selectedImg.remove();
      setSelectedImg(null);
      // Manually trigger the note update for content change after deletion
      const editor = document.getElementById('notes-editor');
      if (editor) {
        updateNote("content", editor.innerHTML);
      }
    }
  };

  const applyColor = (color: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Use styleWithCSS to ensure span with background-color is used
    document.execCommand('styleWithCSS', false, 'true');

    if (color === 'transparent') {
      // Try multiple ways to clear highlight
      document.execCommand('hiliteColor', false, 'inherit');
      document.execCommand('backColor', false, 'inherit');
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');
    } else {
      // Try hiliteColor first, fallback to backColor
      const success = document.execCommand('hiliteColor', false, color);
      if (!success) {
        document.execCommand('backColor', false, color);
      }
    }

    // Sync state
    updateNote("content", editorRef.current.innerHTML);
    setShowColorPicker(false);
  };

  const insertImageAtCursor = (src: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const img = document.createElement('img');
      img.src = src;
      // Styling is handled by tailwind on parent, but we can add some basics
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '12px';
      img.style.margin = '16px 0';
      img.style.display = 'block';
      img.style.cursor = 'pointer';

      range.deleteContents();
      range.insertNode(img);

      // Update state
      const editor = document.getElementById('notes-editor');
      if (editor) {
        updateNote("content", editor.innerHTML);
      }
    }
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const content = readerEvent.target?.result;
          if (content) {
            insertImageAtCursor(content.toString());
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertURL = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      insertImageAtCursor(url);
    }
  };

  const handleCreateNote = () => {
    if (!newNoteData.title.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: newNoteData.title,
      subtitle: newNoteData.subtitle,
      content: "",
      type: "General",
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setIsCreatingNote(false);
    setNewNoteData({ title: "", subtitle: "" });
  };

  const updateNote = (field: keyof Note, value: string) => {
    setNotes(prevNotes =>
      prevNotes.map((n) => (n.id === activeNoteId ? { ...n, [field]: value } : n))
    );
  };

  // Sync editor content when active note changes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      // Only update if content is different to avoid cursor jumps
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNoteId]);

  return (
    <div className={cn("flex transition-all duration-300", isFullscreen ? "fixed inset-0 z-50 bg-background h-screen" : "h-[calc(100vh-8rem)] -m-6")}>
      {/* Notes Sidebar */}
      <div
        className={cn(
          "bg-surface/50 border-r border-white/5 flex flex-col pt-4 transition-all duration-300 relative",
          isSidebarOpen ? "w-64" : "w-12 px-2 items-center"
        )}
      >
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 z-10 bg-surface border border-white/10 rounded-full p-1 text-textSecondary hover:text-white shadow-sm hover:scale-110 transition-all"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        <div className={cn("mb-4 transition-all", isSidebarOpen ? "px-4" : "px-0")}>
          {isSidebarOpen ? (
            <Button
              onClick={() => setIsCreatingNote(true)}
              className="w-full justify-start gap-2"
              variant="secondary"
              size="sm"
            >
              + New Page
            </Button>
          ) : (
            <button onClick={() => setIsCreatingNote(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-black transition-colors" title="New Note">
              +
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-thin scrollbar-thumb-white/10">
          <div>
            {isSidebarOpen && <div className="px-2 py-1 text-xs font-bold text-textSecondary uppercase mb-1">Module Notes</div>}
            {notes
              .filter((n) => n.type === "Module")
              .map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`py-1.5 rounded cursor-pointer text-sm font-medium transition-colors flex items-center ${activeNoteId === note.id
                    ? "bg-accent/10 text-accent border-l-2 border-accent"
                    : "hover:bg-white/5 text-textSecondary hover:text-textPrimary"
                    } ${isSidebarOpen ? "px-4" : "justify-center"}`}
                  title={!isSidebarOpen ? note.title : undefined}
                >
                  {isSidebarOpen && <span className="truncate">{note.title}</span>}
                </div>
              ))}
          </div>

          <div>
            {isSidebarOpen && <div className="px-2 py-1 text-xs font-bold text-textSecondary uppercase mb-1">General Notes</div>}
            {notes
              .filter((n) => n.type === "General")
              .map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`py-1.5 rounded cursor-pointer text-sm font-medium transition-colors flex items-center ${activeNoteId === note.id
                    ? "bg-accent/10 text-accent border-l-2 border-accent"
                    : "hover:bg-white/5 text-textSecondary hover:text-textPrimary"
                    } ${isSidebarOpen ? "px-4" : "justify-center"}`}
                  title={!isSidebarOpen ? note.title : undefined}
                >
                  {isSidebarOpen && <span className="truncate">{note.title}</span>}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      {activeNote ? (
        <div className="flex-1 bg-background overflow-y-auto relative flex flex-col">
          {/* Toolbar / Header within Note */}
          <div className="h-14 border-b border-white/5 flex items-center justify-end px-6 gap-2 bg-surface/30 backdrop-blur sticky top-0 z-10">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/5 rounded text-textSecondary hover:text-white transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>

          <div className="max-w-3xl mx-auto w-full px-8 pb-20 pt-10">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote("title", e.target.value)}
              className="w-full bg-transparent text-4xl font-bold text-textPrimary placeholder:text-white/20 focus:outline-none mb-2 border-none text-center"
              placeholder="Title"
            />
            {activeNote.subtitle !== undefined && (
              <input
                type="text"
                value={activeNote.subtitle}
                onChange={(e) => updateNote("subtitle", e.target.value)}
                className="w-full bg-transparent text-lg text-textSecondary placeholder:text-white/10 focus:outline-none mb-8 border-none text-center"
                placeholder="Subtitle"
              />
            )}

            <div className="flex justify-center gap-4 mb-8">
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

            {/* Rich Text Toolbar - Pinned to top */}
            <div className="sticky top-4 z-30 flex items-center justify-center gap-1 mb-8 bg-surface/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-fit mx-auto shadow-2xl shadow-black/50 overflow-visible transition-all hover:bg-surface/90">
              <button
                onClick={() => document.execCommand('bold')}
                onMouseDown={(e) => e.preventDefault()}
                className="p-2 hover:bg-white/10 rounded-xl text-sm font-bold w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() => document.execCommand('italic')}
                onMouseDown={(e) => e.preventDefault()}
                className="p-2 hover:bg-white/10 rounded-xl text-sm italic w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
                title="Italic"
              >
                I
              </button>
              <button
                onClick={() => document.execCommand('underline')}
                onMouseDown={(e) => e.preventDefault()}
                className="p-2 hover:bg-white/10 rounded-xl text-sm underline w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
                title="Underline"
              >
                U
              </button>
              <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

              <div className="relative">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className={cn(
                    "p-2 rounded-xl text-sm w-10 h-10 flex items-center justify-center transition-all hover:scale-110",
                    showColorPicker ? "bg-white/20 text-white" : "hover:bg-white/10 text-textSecondary"
                  )}
                  title="Highlight"
                >
                  <span className="bg-accent w-4 h-4 rounded-full shadow-[0_0_10px_rgba(var(--accent),0.5)]"></span>
                </button>

                {showColorPicker && (
                  <div
                    className="absolute left-full bottom-[80%] ml-3 z-[100] bg-surface/95 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl min-w-[160px] animate-in zoom-in slide-in-from-left-2 duration-200"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {highlightColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => applyColor(color.value)}
                          onMouseDown={(e) => e.preventDefault()}
                          className="w-10 h-10 rounded-xl border border-white/10 hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center group"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => applyColor('transparent')}
                      onMouseDown={(e) => e.preventDefault()}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                    {/* Arrow pointing left, aligned with the bottom anchor */}
                    <div className="absolute bottom-3 -left-1.5 w-3 h-3 bg-surface border-l border-b border-white/20 rotate-45" />
                  </div>
                )}
              </div>

              <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

              <button
                onClick={handleInsertImage}
                className="p-2 hover:bg-white/10 rounded-xl text-sm w-10 h-10 flex items-center justify-center transition-all hover:scale-110 text-textSecondary hover:text-white"
                title="Upload Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleInsertURL}
                className="p-2 hover:bg-white/10 rounded-xl text-[10px] font-bold w-10 h-10 flex items-center justify-center transition-all hover:scale-110 text-textSecondary hover:text-white"
                title="Insert Image URL"
              >
                URL
              </button>
            </div>

            <div className="relative">
              <div
                ref={editorRef}
                id="notes-editor"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => updateNote("content", e.currentTarget.innerHTML)}
                onClick={handleEditorClick}
                className="w-full min-h-[60vh] bg-transparent text-lg text-textSecondary leading-relaxed focus:outline-none placeholder:text-white/10 prose prose-invert max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4 [&_img]:border [&_img]:border-white/10 [&_img]:cursor-pointer [&_img]:transition-all [&_img]:select-none [&_img.selected]:ring-4 [&_img.selected]:ring-accent"
              />

              {selectedImg && (
                <div
                  className="absolute z-40 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl cursor-pointer hover:bg-red-600 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
                  style={{
                    left: `${selectedImg.offsetLeft + selectedImg.offsetWidth / 2}px`,
                    top: `${selectedImg.offsetTop + 20}px`,
                    transform: 'translateX(-50%)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage();
                  }}
                >
                  <X className="w-3 h-3" /> Remove Image
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-textSecondary">
          Select a note or create a new one.
        </div>
      )}

      {/* New Note Modal */}
      {isCreatingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsCreatingNote(false)} />
          <div className="bg-surface border border-white/10 rounded-3xl p-8 w-full max-w-md relative animate-in zoom-in duration-300 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Page</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase mb-1.5 block">Title</label>
                <input
                  autoFocus
                  type="text"
                  value={newNoteData.title}
                  onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
                  placeholder="e.g. NLP Basics"
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase mb-1.5 block">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={newNoteData.subtitle}
                  onChange={(e) => setNewNoteData({ ...newNoteData, subtitle: e.target.value })}
                  placeholder="e.g. Unit 1 review"
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsCreatingNote(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleCreateNote} className="flex-1 shadow-[0_0_20px_rgba(var(--accent),0.3)]">Create Page</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
