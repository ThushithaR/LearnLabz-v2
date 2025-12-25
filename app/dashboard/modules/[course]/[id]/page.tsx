"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { aiml } from "@/lib/courses/aiml";
import { nlp } from "@/lib/courses/nlp";
import { Course, Module, Lesson } from "@/lib/types/course";

export default function LessonPage({ params }: { params: { course: string; id: string } }) {
  const { course, id } = params;

  const courseData: Course = course === "aiml" ? aiml : nlp;
  const moduleData: Module | undefined = courseData.modules.find(m => m.id.toString() === id);

  if (!moduleData) return <div>Module not found</div>;

  // Active lesson state (default first lesson)
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const lessonData: Lesson = moduleData.lessons[selectedLessonIdx];

  const [activeTab, setActiveTab] = useState<'reading' | 'interactive' | 'quiz'>('reading');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-6">
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL: Sidebar */}
        <div className={cn(
          "bg-surface border-r border-white/5 flex flex-col transition-all duration-300 relative",
          sidebarOpen ? "w-72" : "w-16"
        )}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-4 z-10 bg-surface border border-white/10 rounded-full p-1 text-textSecondary hover:text-white shadow-sm hover:scale-110 transition-all"
          >
            {sidebarOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            )}
          </button>

          {/* Sidebar Header */}
          <div className={cn(
            "p-4 border-b border-white/5 font-bold text-textPrimary h-14 flex items-center overflow-hidden whitespace-nowrap",
            !sidebarOpen && "justify-center px-0"
          )}>
            {sidebarOpen ? (
              <span className="truncate">{moduleData.title}</span>
            ) : (
              <span className="text-xs text-textSecondary">MODULE</span>
            )}
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {moduleData.lessons.map((lesson, idx) => {
              const completed = idx < selectedLessonIdx;
              const active = idx === selectedLessonIdx;
              const progressPercent = active ? moduleData.progress : completed ? 100 : 0;

              return (
                <div
                  key={lesson.id}
                  onClick={() => { setSelectedLessonIdx(idx); setActiveTab('reading'); }}
                  className={cn(
                    "rounded text-sm cursor-pointer hover:bg-white/5 transition-colors flex flex-col group relative",
                    sidebarOpen ? "p-3" : "p-0 justify-center h-12 w-12 mx-auto items-center",
                    active ? "bg-accent/10" : ""
                  )}
                >
                  <div className="flex items-center w-full">
                    <div className={cn(
                      "flex items-center justify-center font-bold transition-all shrink-0",
                      sidebarOpen ? "w-6 h-6 bg-white/5 rounded-full text-xs mr-3" : "w-full h-full text-sm"
                    )}>
                      {idx + 1}
                    </div>

                    {sidebarOpen && (
                      <>
                        <span className={cn("truncate flex-1 font-medium", active ? "text-accent" : "text-textSecondary")}>
                          {lesson.title}
                        </span>
                        {completed && <span className="text-success ml-2">✓</span>}
                      </>
                    )}
                  </div>

                  {/* Track Bar */}
                  {sidebarOpen && (
                    <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", completed ? "bg-success" : active ? "bg-accent" : "bg-transparent")}
                        style={{ width: completed ? '100%' : active ? `${moduleData.progress}%` : '0%' }}
                      ></div>
                    </div>
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  {!sidebarOpen && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1a1a1a] text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-opacity animate-in fade-in slide-in-from-left-2">
                      {lesson.title}
                      <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full", completed ? "bg-success" : active ? "bg-accent" : "bg-transparent")}
                          style={{ width: completed ? '100%' : active ? `${moduleData.progress}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Tab Header */}
          <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-surface/30 backdrop-blur">
            <h1 className="font-bold text-textPrimary truncate">{lessonData.title}</h1>
            <div className="flex items-center bg-black/20 rounded-lg p-1">
              {(['reading', 'interactive', 'quiz'] as const).map(tab => {
                // Hide interactive tab for NLP or non-interactive lessons
                if (tab === 'interactive' && (!lessonData.isInteractive || course === 'nlp')) return null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md capitalize transition-all",
                      activeTab === tab ? "bg-accent text-background shadow-lg" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            {activeTab === 'reading' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div className="prose prose-invert prose-p:text-textSecondary prose-headings:text-textPrimary prose-strong:text-accent">
                  <h3>{lessonData.title}</h3>
                  <p>Duration: {lessonData.duration}</p>
                  {lessonData.isInteractive && <span className="text-accent">Interactive Lesson</span>}
                </div>

                <Card className="p-6 bg-gradient-to-r from-surface to-transparent border-l-4 border-l-accent">
                  <h4 className="font-bold text-textPrimary mb-2">Key Takeaway</h4>
                  <p className="text-sm text-textSecondary">
                    Remember the key concepts of this lesson.
                  </p>
                </Card>

                <div className="flex justify-end pt-10">
                  {selectedLessonIdx < moduleData.lessons.length - 1 && (
                    <Button onClick={() => setSelectedLessonIdx(selectedLessonIdx + 1)}>
                      Next: {moduleData.lessons[selectedLessonIdx + 1].title} →
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'interactive' && lessonData.isInteractive && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade-in">
                <div className="w-full max-w-4xl aspect-video bg-black/40 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🕸️</div>
                    <h3 className="text-xl font-bold">Interactive Visualizer</h3>
                    <p className="text-textSecondary mb-6">Simulate this lesson interactively.</p>
                    <div className="flex justify-center gap-2">
                      <Button size="sm">▶ Run</Button>
                      <Button size="sm" variant="secondary">Step</Button>
                      <Button size="sm" variant="outline">Reset</Button>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-textSecondary">
                  Adjust controls to experiment.
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="max-w-2xl mx-auto py-10 animate-fade-in">
                <Card className="p-8">
                  <div className="mb-6 flex justify-between items-center">
                    <Badge variant="warning">Quiz Placeholder</Badge>
                    <span className="text-sm text-textSecondary">Question 1 of 3</span>
                  </div>
                  <h3 className="text-lg font-bold mb-4">This is a quiz question for {lessonData.title}</h3>
                  <div className="space-y-3">
                    {["Option A", "Option B", "Option C", "Option D"].map(opt => (
                      <button key={opt} className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-accent/10 border border-white/5 hover:border-accent transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button size="lg">Submit Answer</Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 bg-surface border-l border-white/5 hidden xl:flex flex-col">
          <div className="p-4 font-bold border-b border-white/5 text-sm uppercase tracking-wider text-textSecondary">
            {activeTab === 'reading' ? 'Smart Notes' : activeTab === 'interactive' ? 'Controls' : 'Review'}
          </div>
          <div className="p-4 space-y-4 flex-1">
            {activeTab === 'reading' && (
              <>
                <Card className="p-3 bg-black/20 text-sm">
                  <div className="font-bold text-accent mb-1">Definition</div>
                  <div>Key concept highlights here.</div>
                </Card>
                <div className="mt-auto">
                  <h4 className="font-bold text-sm mb-2">My Notes</h4>
                  <textarea className="w-full h-32 bg-black/20 rounded border border-white/10 p-2 text-sm text-white resize-none" placeholder="Type to add a note..."></textarea>
                </div>
              </>
            )}
            {activeTab === 'interactive' && lessonData.isInteractive && (
              <div className="text-sm space-y-2 text-textSecondary">
                <p><strong>Click</strong> to set start/end nodes.</p>
                <p><strong>Drag</strong> to create walls.</p>
                <p><strong>Heuristic Weight:</strong> 1.0</p>
                <input type="range" className="w-full accent-accent" />
              </div>
            )}
            {activeTab === 'quiz' && (
              <div className="text-sm text-textSecondary">
                Review the question before submitting.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
