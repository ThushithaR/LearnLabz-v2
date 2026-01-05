"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { aiml } from "@/lib/courses/aiml";
import { nlp } from "@/lib/courses/nlp";
import { Course, Module, Lesson } from "@/lib/types/course";
import { ProblemStatement } from "@/lib/modules/nlp/ProblemStatement";

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

  const [scrollProgress, setScrollProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<boolean[]>(new Array(moduleData.lessons.length).fill(false));

  const scrollRef = useRef<HTMLDivElement>(null);

  // Update scroll progress on scroll event
  const handleScroll = () => {
    if (scrollRef.current && activeTab === "reading") {
      const scrollTop = scrollRef.current.scrollTop;
      const scrollHeight = scrollRef.current.scrollHeight;
      const clientHeight = scrollRef.current.clientHeight;
      const progress = ((scrollTop + clientHeight) / scrollHeight) * 100;
      setScrollProgress(progress);
    }
  };

  // Handle completing the current lesson and moving to next
  const handleNext = () => {
    // Mark current lesson as complete
    setCompletedLessons(prev => {
      const updated = [...prev];
      updated[selectedLessonIdx] = true;
      return updated;
    });

    // Ensure progress is 100% when clicked
    setScrollProgress(100);

    // Go to the next lesson or next module
    if (selectedLessonIdx < moduleData.lessons.length - 1) {
      setSelectedLessonIdx(selectedLessonIdx + 1);
      setActiveTab('reading');
      setScrollProgress(0); // Reset scroll progress for next lesson
      scrollRef.current?.scrollTo(0, 0);
    } else {
      // Handle moving to next module
      const currentModuleIdx = courseData.modules.findIndex(m => m.id === moduleData.id);
      if (currentModuleIdx < courseData.modules.length - 1) {
        const nextModule = courseData.modules[currentModuleIdx + 1];
        window.location.href = `/dashboard/${course}/modules/${nextModule.id}`; // Navigate to next module
      }
    }
  };

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
              const completed = completedLessons[idx];
              const active = idx === selectedLessonIdx;
              const progressPercent = completed ? 100 : active ? scrollProgress : 0;

              return (
                <div
                  key={lesson.id}
                  onClick={() => { setSelectedLessonIdx(idx); setActiveTab('reading'); setScrollProgress(0); scrollRef.current?.scrollTo(0, 0); }}
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
                        {completed && <span className="text-green-500 ml-2">✓</span>}
                      </>
                    )}
                  </div>

                  {/* Track Bar */}
                  {sidebarOpen && (
                    <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full", completed ? "bg-green-500" : active ? "bg-accent" : "bg-transparent")}
                        style={{ width: completed ? '100%' : active ? `${scrollProgress}%` : '0%' }}
                      ></div>
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 relative" onScroll={handleScroll}>
            {activeTab === 'reading' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div className="prose prose-invert prose-p:text-textSecondary prose-headings:text-textPrimary prose-strong:text-accent">
                  <h3>{lessonData.title}</h3>
                  <p>Duration: {lessonData.duration}</p>
                  {lessonData.isInteractive && <span className="text-accent">Interactive Lesson</span>}
                </div>

                <Card className="p-6 bg-gradient-to-r from-surface to-transparent border-l-4 border-l-accent">
                  <h4 className="font-bold text-textPrimary mb-2">Quote of the Day</h4>
                  <p className="text-sm text-textSecondary">
                    "If we have data, let's look at data. If all we have are opinions, let's go with mine."
                  </p>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)', textAlign: 'right' }}>
                            — Jim Barksdale, former CEO of Netscape
                  </p>
                </Card>

                <div className="prose prose-invert prose-p:text-textSecondary">
                  <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }} className="font-bold text-textPrimary mb-2">Introduction</h2>
                    <p>
                        In industrial Machine Learning, the most significant challenge is rarely the algorithm; it is the data acquisition process. In an academic environment, you are typically provided with a complete dataset. In a professional setting, you often start with no data at all.
                        This module covers the practical strategies used to gather and build a dataset for NLP system.
                    </p>
                </div>

                <div
                        style={{
                            background: 'var(--bg-secondary)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                        }}
                    >
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}  className="font-bold text-textPrimary mb-2">Learning Objectives</h2>
                        <p style={{ marginBottom: '0.75rem' }}>
                            By the end of this lesson, you will be able to:
                        </p>
                        <ul
                            style={{
                                listStyle: 'none',
                                paddingLeft: 0,
                                color: 'var(--text-primary)',
                            }} className="text-sm text-textSecondary"
                        >
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }} className="text-sm text-textSecondary">
                                <span style={{ position: 'absolute', left: 0 }}>✓</span>
                                Identify reliable data sources for NLP projects
                            </li>
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }} className="text-sm text-textSecondary">
                                <span style={{ position: 'absolute', left: 0 }}>✓</span>
                                Implement data collection pipelines
                            </li>
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }} className="text-sm text-textSecondary">
                                <span style={{ position: 'absolute', left: 0 }}>✓</span>
                                Handle common data acquisition challenges
                            </li>
                        </ul>
                    </div>


                    {/* Example Problem Statement */}
                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Let's begin with a real-world problem</h2>
                        <ProblemStatement
                            problem="You’ve been hired by a rising e-commerce startup. You must build a system to route customer chat messages to either Commercial Inquiry or Technical Support."
                            twist="The product is brand new. There are no historical logs, no labeled examples, and you have a two-week deadline to deploy a working version."
                            hints={[
                                'If you have zero examples to train a model, can you use basic logic rules to start?',
                                'If you find a similar dataset online, will it work for your specific product names?',
                                'If you manually label only ten messages, can you use technology to turn those into a thousand?',
                            ]}
                            solution={
                                <div>
                                    <p>
                                        <strong>Phase 1 (Immediate):</strong> Use Heuristics. Create a list of 50 keywords for each category. This provides an instant, though imperfect, solution.
                                    </p>
                                    <p style={{ marginTop: '1rem' }}>
                                        <strong>Phase 2 (The "Silver" Dataset):</strong> Use Back Translation to expand your small list of keywords into full sentences. Use Snorkel to label 5,000 unlabeled logs based on your Phase 1 rules.
                                    </p>
                                    <p style={{ marginTop: '1rem' }}>
                                        <strong>Phase 3 (The Model):</strong> Train your NLP model on this "Silver" data.
                                    </p>
                                    <p style={{ marginTop: '1rem' }}>
                                        <strong>Phase 4 (Long-Term):</strong> Set up Product Intervention to start collecting "Gold" data from real users for future updates.
                                    </p>
                                </div>
                            }
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Strategy 1: Public Datasets</h2>
                        <p style={{ marginBottom: '1rem' }}>
                            If you’re lucky, someone else has already suffered for you. Before creating your own data, check for existing datasets.
                        </p>
                        <ul
                            style={{
                                listStyle: 'none',
                                paddingLeft: 0,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                Sources: Use Google Dataset Search or public repositories like the Nicolas Iderhoff collection.
                            </li>

                            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                Application: Use these publicly available datasets to train a "base" model that understands general language before fine-tuning it with your own data.
                            </li>
                        </ul>
                        <p>
                             The limitation is that public data rarely matches your specific "domain." For example, a public dataset of general emails will not contain your company's specific product codes or internal terminology.
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Strategy 2: Web Scraping</h2>
                        <p style={{ marginBottom: '1rem' }}>
                            If no dataset exists, you can collect text from the internet.
                        </p>
                        <ul
                            style={{
                                listStyle: 'none',
                                paddingLeft: 0,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                Method: Extract text from public forums, Q&A sites (like Stack Overflow), or review platforms
                            </li>
                            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                Process: Once scraped, the data usually requires human annotators to categorize it.
                            </li>
                        </ul>
                        <p>
                             The catch is that text from the internet is often "noisy"—it contains slang, irrelevant formatting, and behavior that may not match your actual customers.
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Strategy 3: Product Intervention</h2>
                        <p style={{ marginBottom: '1rem' }}>
                            This is the most effective long-term strategy. It involves changing the software to collect data while people use it.
                        </p>
                        <ul
                            style={{
                                listStyle: 'none',
                                paddingLeft: 0,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                Implementation: Add a feature where the user must select a category (e.g., "Billing" or "Technical Issue") before they can send a message.
                            </li>
                        </ul>
                        <p>
                             This provides the highest quality data, but it usually takes 3 to 6 months to collect enough volume for a robust model.
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Strategy 4: Data Augmentation</h2>
                        <p style={{ marginBottom: '1rem' }}>
                           When you have a very small amount of labeled data, you can use "augmentation" to create synthetic variations of those sentences.
                        </p>
                        
                         <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            marginTop: '1rem',
                            fontSize: '0.95rem'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ccc', padding: '0.75rem', textAlign: 'left' }}>
                                        Technique
                                    </th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.75rem', textAlign: 'left' }}>
                                        Description
                                    </th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.75rem', textAlign: 'left' }}>
                                        Example
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Synonym Replacement
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Replaces non-stopwords with their synonyms to create variation. You can use Synsets in Wordnet.
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        “I want a refund” → “I want a reimbursement”
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Back Translation
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Translates text to another language and back to generate paraphrases
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        English → German → English. So the sentence
                                        “I need help with my order” becomes “Can you assist me with my purchase?”
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                       TF-IDF Replacement
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Replace unimportant words while keeping technical keywords.
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Keeps "Server" or "API" but changes "very" or "quickly."
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                       Bigram Flipping
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Swap two adjacent words.
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        "I am" → "Am I"
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                       Replacing Entities
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Swap names or locations for others in the same category.
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        "Broken in New York" → "Broken in Tokyo"
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                       Adding Noise
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        Intentionally add common typos or keyboard errors.
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '0.75rem' }}>
                                        "Support" → "Suuport" (Helps the model handle real-world "fat finger" mistakes.)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Strategy 5: Advanced Programmatic Labelling</h2>
                        <ul
                            style={{
                                listStyle: 'none',
                                paddingLeft: 0,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>1. </span>
                                Snorkel (Weak Supervision)
                            </li>
                            <p>
                                Instead of a human labeling every row, you write Labeling Functions (LFs). These are scripts based on keywords or patterns.
                                <ul style={{listStyle: 'none', paddingLeft: 0, color: 'var(--text-primary)',}}>
                                    <li style={{marginTop:'1rem', marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 0 }}>•</span>
                                    Example: "If the message contains 'refund', label as Commercial." Snorkel then combines hundreds of these "noisy" rules to create a large, statistically consistent dataset.
                                </li>
                                </ul>
                                
                            </p>
                            <li style={{ marginTop:'1rem', marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>2. </span>
                                Active Learning
                            </li>
                            <p>
                                This is a method to reduce labeling costs. Instead of labeling data at random, the model analyzes a large pool of unlabeled text and selects only the sentences it finds most "confusing." A human then labels only those specific rows.
                            </p>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Key Summary for Recall</h2>
                        <ul
                            style={{
                                listStyle: 'none',
                                paddingLeft: 0,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                <strong>The Data Bottleneck:</strong> ML models are limited by the quality of their training data.
                            </li>
                            <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                <strong>Hybrid Sourcing:</strong> Most professional systems use a mix of public, synthetic, and human-labeled data.
                            </li>
                             <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0 }}>•</span>
                                <strong>S.P.A.C.E. Acronym:</strong>

                                <ul style={{ marginTop: '0.4rem', marginLeft: '1.5rem', listStyleType: 'circle' }}>
                                    <li>
                                    <strong>S</strong> – Scrape (Public forums, discussion boards)
                                    </li>
                                    <li>
                                    <strong>P</strong> – Public (Open datasets)
                                    </li>
                                    <li>
                                    <strong>A</strong> – Augment (Synonyms, Back-translation)
                                    </li>
                                    <li>
                                    <strong>C</strong> – Collect (Product intervention)
                                    </li>
                                    <li>
                                    <strong>E</strong> – Engineer (Snorkel, Active Learning)
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <p>
                             Once you have acquired your data, you must clean it. Let’s move to Text Preprocessing.
                        </p>
                    </div> 

                <div className="flex justify-end pt-10">
                  {selectedLessonIdx < moduleData.lessons.length - 1 && (
                    <Button onClick={handleNext}>
                      Next: {moduleData.lessons[selectedLessonIdx + 1].title} →
                    </Button>
                  )}
                  {selectedLessonIdx === moduleData.lessons.length - 1 && (
                    <Button onClick={handleNext}>
                      Next Module → {/* Show button for Next Module */}
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
                    <Badge variant="warning">Quiz {lessonData.id}</Badge>
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
