"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { courses, CourseId, COURSE_ID_MAP } from "@/lib/courses";
import { Course, Module, Lesson, ProblemStatementContent } from "@/lib/types/course";
import { useCourse } from "@/lib/context/CourseContext";
import { ProblemStatement } from "@/lib/content/nlp/unit1/problemStatement";
import InteractiveCodeWalkthrough from "@/lib/content/nlp/unit2/InteractiveCodeWalkthrough";
import {ChevronLeft,ChevronRight,Clock,BookOpen,CheckCircle2,Save,FileText,ArrowLeft,X,PauseCircle,PlayCircle,Image as ImageIcon,Star,RotateCw} from "lucide-react";
import { ModuleProgress } from "@/lib/types/progress";
import { getLessonProgress, getLessonProgressByUnit, upsertLessonProgress, updateUnitProgress } from "@/lib/supabase/progress";

export default function LessonPage({ params }: { params: { course: string; id: string } }) {
  const { course, id } = params;

  const courseData: Course = courses[course as CourseId];
  const moduleData: Module | undefined = courseData.modules.find(m => m.id.toString() === id);

  // User tracking
  const [userId, setUserId] = useState<number | null>(null);

  // Global State
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Active lesson state (default first lesson)
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'reading' | 'interactive' | 'quiz'>('reading');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true); // Right panel state

  // Resize State
  const [notesWidth, setNotesWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<boolean[]>([]);
  const [readCompleted, setReadCompleted] = useState(false); // Track if reading is done to unlock quiz
  const [starredQuestions, setStarredQuestions] = useState<Set<string>>(new Set());

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizTimeTaken, setQuizTimeTaken] = useState(0);
  const [quizLocked, setQuizLocked] = useState(false); // Prevent switching back to reading

  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  const { isFullscreen, setIsFullscreen } = useCourse();
  // Module progress state
  const progressKey = `module_progress_${course}_${moduleData?.id}`;
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({
  totalReadingTime: 0,
  lessons: {},
  });
  // Lesson time tracking - per lesson
  const [lessonTime, setLessonTime] = useState(0);
  const [lessonTimeMap, setLessonTimeMap] = useState<Record<string, number>>({}); // Track time for each lesson
  
  // Reset lesson time when switching lessons
  useEffect(() => {
    if (!moduleData) return;
    const currentLesson = moduleData.lessons[selectedLessonIdx];
    const currentLessonId = currentLesson?.id.toString();
    if (currentLessonId && lessonTimeMap[currentLessonId]) {
      setLessonTime(lessonTimeMap[currentLessonId]);
    } else {
      setLessonTime(0);
    }
  }, [selectedLessonIdx, moduleData, lessonTimeMap]);
  
  // Timer for current lesson only
  useEffect(() => {
    if (!hasStarted || isPaused || showQuizResults) return;
    const interval = setInterval(() => {
      setLessonTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, showQuizResults]);

  // Load userId from localStorage
  useEffect(() => {
    const userIdStr = localStorage.getItem("user_id");
    if (userIdStr) {
      setUserId(parseInt(userIdStr));
    }
  }, []);

  useEffect(() => {
    if (moduleData) {
      setCompletedLessons(new Array(moduleData.lessons.length).fill(false));
    }
  }, [moduleData]);

  // Load existing lesson progress from database
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId || !moduleData) return;

      try {
        const { data, error } = await getLessonProgressByUnit({
          user_id: userId,
          unit_id: moduleData.id,
        });

        if (error) {
          console.error("Failed to load lesson progress:", error);
          return;
        }

        if (data && Array.isArray(data)) {
          const completed = new Array(moduleData.lessons.length).fill(false);
          const timeMap: Record<string, number> = {};
          let lastCompletedIdx = -1;

          data.forEach((lessonProgress: any) => {
            // Find the lesson index that matches this progress record
            const lessonIdx = moduleData.lessons.findIndex(
              (l) => l.id.toString() === lessonProgress.lesson_id.toString()
            );
            if (lessonIdx !== -1) {
              completed[lessonIdx] = lessonProgress.completed || false;
              // Store time for this specific lesson
              timeMap[lessonProgress.lesson_id.toString()] = lessonProgress.lesson_time_spent_sec || 0;
              
              // Track the last completed lesson
              if (lessonProgress.completed) {
                lastCompletedIdx = lessonIdx;
              }
            }
          });

          setCompletedLessons(completed);
          setLessonTimeMap(timeMap);
          
          // Start from the next incomplete lesson or the first incomplete one
          if (lastCompletedIdx !== -1 && lastCompletedIdx < moduleData.lessons.length - 1) {
            setSelectedLessonIdx(lastCompletedIdx + 1);
          } else if (completed.every(c => c)) {
            // All lessons completed, stay at the last one
            setSelectedLessonIdx(moduleData.lessons.length - 1);
          }
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };

    loadProgress();
  }, [userId, moduleData]);

  // Scroll to top when lesson changes
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [selectedLessonIdx]);

  // Load starred questions from localStorage
  useEffect(() => {
    const storageKey = `starred_questions_${course}_${id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setStarredQuestions(new Set(JSON.parse(saved)));
    }
  }, [course, id]);

  const toggleStarQuestion = (questionId: string) => {
    const newStarred = new Set(starredQuestions);
    if (newStarred.has(questionId)) {
      newStarred.delete(questionId);
    } else {
      newStarred.add(questionId);
    }
    setStarredQuestions(newStarred);

    // Save to localStorage
    const storageKey = `starred_questions_${course}_${id}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newStarred)));
  };

  // Quiz functions
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizLocked(true);
    setQuizAnswers(new Array(3).fill(-1)); // 3 mock questions
    setCurrentQuizQuestion(0);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizQuestion] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizNext = () => {
    if (currentQuizQuestion < 2) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      setShowQuizResults(true);
    }
  };

  const handleQuizPrevious = () => {
    if (currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    }
  };

  const handleQuizSubmit = () => {
    setQuizTimeTaken(lessonTime);
    setShowQuizResults(true);
  };

  const handleQuizExit = () => {
    if (confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
      setQuizStarted(false);
      setQuizLocked(false);
      setShowQuizResults(false);
      setActiveTab('reading');
      setCurrentQuizQuestion(0);
      setQuizAnswers([]);
    }
  };

  const calculateQuizScore = () => {
    // Mock calculation - in real implementation, check against correct answers
    let correct = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === 0) correct++; // Mock: first option is correct
    });
    return Math.round((correct / quizAnswers.length) * 100);
  };

  if (!moduleData) return <div>Module not found</div>;

  const lessonData: Lesson = moduleData.lessons[selectedLessonIdx];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasStarted && !isPaused && !showQuizResults) {
      interval = setInterval(() => {
        setLessonTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isPaused, showQuizResults]);

  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update scroll progress on scroll event
  const handleScroll = () => {
    if (scrollRef.current && activeTab === "reading") {
      const scrollTop = scrollRef.current.scrollTop;
      const scrollHeight = scrollRef.current.scrollHeight;
      const clientHeight = scrollRef.current.clientHeight;
      const progress = ((scrollTop + clientHeight) / scrollHeight) * 100;
      if (progress >= 90 && !readCompleted) {
        setReadCompleted(true);
      }
      setScrollProgress(progress);

      // Auto-mark read complete if scraped to bottom? Optional.
      // Keeping manual button for now as per user request to be explicit.
    }
  };

  // Handle completing the current lesson and moving to next
  const handleNext = async () => {
    setCompletedLessons(prev => {
      const updated = [...prev];
      updated[selectedLessonIdx] = true;
      return updated;
    });
    setScrollProgress(100);

    // Save current lesson progress to database
    if (userId && moduleData && lessonData) {
      try {
        const courseId = COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP];
        await upsertLessonProgress({
          user_id: userId,
          course_id: courseId,
          unit_id: moduleData.id,
          lesson_id: Number(lessonData.id),
          lesson_time_spent: lessonTime,
          lesson_progress_percent: 100,
          completed: true,
        });

        // Update unit progress after each lesson completion
        const updatedCompleted = [...completedLessons];
        updatedCompleted[selectedLessonIdx] = true;
        const lessonCompletionRate = (updatedCompleted.filter(Boolean).length / updatedCompleted.length) * 100;

        await updateUnitProgress({
          user_id: userId,
          course_id: courseId,
          unit_id: moduleData.id,
          quiz_score: 0,
          unlocked: true,
          progress_percent: lessonCompletionRate,
        });
      } catch (err) {
        console.error("Failed to save lesson progress:", err);
      }
    }

    if (selectedLessonIdx < moduleData.lessons.length - 1) {
      setSelectedLessonIdx(selectedLessonIdx + 1);
      setActiveTab('reading');
      setReadCompleted(false); // Reset for next lesson
      setScrollProgress(0);
      scrollRef.current?.scrollTo(0, 0);
      window.scrollTo(0, 0); // Also scroll the window to top
    } else {
      // All lessons completed - navigate to next module
      const currentModuleIdx = courseData.modules.findIndex(m => m.id === moduleData.id);
      if (currentModuleIdx < courseData.modules.length - 1) {
        const nextModule = courseData.modules[currentModuleIdx + 1];
        window.location.href = `/dashboard/${course}/modules/${nextModule.id}`;
      }
    }
  };

  const handleTabChange = (tab: 'reading' | 'interactive' | 'quiz') => {
    if (tab === 'quiz' && !readCompleted) {
      alert("Please finish reading the lesson content first!");
      return;
    }

    if (quizLocked && tab !== 'quiz') {
      alert("Cannot switch tabs during quiz. Please complete or exit the quiz first.");
      return;
    }

    if (tab === 'quiz' && !quizStarted) {
      handleStartQuiz();
    }

    setActiveTab(tab);
  };

  // Handle start module: auto-collapse sidebar for focus & trigger fullscreen
  const handleStartModule = () => {
    setHasStarted(true);
    setSidebarOpen(false); // Auto-collapse sidebar
    setNotesOpen(false);   // Auto-collapse notes
    setIsFullscreen(true); // Trigger global fullscreen (hides header/sidebar)
  };

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => setIsFullscreen(false);
  }, [setIsFullscreen]);

  // Save progress on unmount or navigation away
  useEffect(() => {
    return () => {
      // Save current lesson progress when leaving page
      if (hasStarted && userId && moduleData && lessonData && lessonTime > 0) {
        upsertLessonProgress({
          user_id: userId,
          course_id: COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP],
          unit_id: moduleData.id,
          lesson_id: Number(lessonData.id),
          lesson_time_spent: lessonTime,
          lesson_progress_percent: scrollProgress,
          completed: readCompleted,
        }).catch(err => console.error("Failed to save progress on unmount:", err));
      }
    };
  }, [hasStarted, userId, moduleData, lessonData, lessonTime, scrollProgress, readCompleted, course]);

  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });

  const highlightColors = [
    { name: 'Yellow', value: '#facc15' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' }
  ];

  const [showSmartColorPicker, setShowSmartColorPicker] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const smartHighlightColors = [
    { name: 'Yellow', value: '#facc15' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
  ];
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 'auto', left: 'auto', bottom: 'auto', transform: 'none' });
  const [arrowDirection, setArrowDirection] = useState<'left' | 'right'>('left');
  const [smartPickerPosition, setSmartPickerPosition] = useState<React.CSSProperties>({ position: 'absolute', left: 'calc(100% + 8px)', top: 'auto', bottom: 'auto', transform: 'none' });
  const [showLessonColorPicker, setShowLessonColorPicker] = useState(false);
  const lessonHighlightButtonRef = useRef<HTMLButtonElement>(null);
  const [lessonPickerPosition, setLessonPickerPosition] = useState({ left: 'calc(100% + 8px)', top: 'auto', bottom: 'auto', transform: 'none' });
  const [lessonArrowDirection, setLessonArrowDirection] = useState<'left' | 'right'>('left');

  const [selectedSmartImg, setSelectedSmartImg] = useState<HTMLImageElement | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>(courseData.notes || []);
  const [editingNote, setEditingNote] = useState<any>(null);

  const handleSmartEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedSmartImg(target as HTMLImageElement);
    } else {
      setSelectedSmartImg(null);
    }
  };

  const handleDeleteSmartImage = () => {
    if (selectedSmartImg) {
      selectedSmartImg.remove();
      setSelectedSmartImg(null);
      // Update state
      const editor = document.getElementById('module-notes-editor');
      if (editor) {
        // Since we don't have a direct state binder here like updateNote for general notes, 
        // we just let the contentEditable handle the visual removal
      }
    }
  };

  const applySmartColor = (color: string) => {
    const editor = document.getElementById('module-notes-editor');
    if (editor) {
      editor.focus();
    }

    // Use styleWithCSS to ensure span with background-color is used
    document.execCommand('styleWithCSS', false, 'true');

    if (color === 'transparent') {
      // Try multiple ways to clear highlight
      document.execCommand('hiliteColor', false, 'inherit');
      document.execCommand('backColor', false, 'inherit');
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');
    } else {
      // Clear any existing highlight first to ensure the new one "prevails" cleanly
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');

      // Try hiliteColor first, fallback to backColor
      const success = document.execCommand('hiliteColor', false, color);
      if (!success) {
        document.execCommand('backColor', false, color);
      }
    }

    setShowSmartColorPicker(false);
  };

  const insertSmartImageAtCursor = (src: string) => {
    const notesEditor = document.getElementById('module-notes-editor');
    if (notesEditor) {
      // Focus the editor first
      notesEditor.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.margin = '8px 0';
        img.style.display = 'block';
        img.style.cursor = 'pointer';

        range.deleteContents();
        range.insertNode(img);

        // Move cursor after the image
        range.setStartAfter(img);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, insert at the end
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.margin = '8px 0';
        img.style.display = 'block';
        img.style.cursor = 'pointer';

        notesEditor.appendChild(img);
      }
    }
  };

  const handleInsertSmartImage = () => {
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
            insertSmartImageAtCursor(content.toString());
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSaveNotes = () => {
    const editor = document.getElementById('module-notes-editor');
    if (editor) {
      const content = editor.innerHTML;
      if (content.trim()) {
        if (editingNote) {
          // Update existing note
          setNotes(prev => prev.map(note =>
            note.id === editingNote.id
              ? { ...note, content: content, createdAt: new Date().toISOString() }
              : note
          ));
          setEditingNote(null);
          alert("Note updated successfully!");
        } else {
          // Create new note
          const newNote = {
            id: Date.now().toString(),
            title: `Note ${notes.length + 1}`,
            content: content,
            createdAt: new Date().toISOString(),
          };
          setNotes(prev => [...prev, newNote]);
          alert("Note saved successfully!");
        }
        editor.innerHTML = ''; // Clear editor after saving
      } else {
        alert("Please add some content before saving.");
      }
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);

      // Check if selection is within the lesson content (not notes editor)
      const lessonContent = document.querySelector('.max-w-3xl.mx-auto');
      if (lessonContent && lessonContent.contains(range.commonAncestorContainer)) {
        setSelectedText(selectedText);
        setSelectionRange(range.cloneRange());
        setNotesOpen(true); // Open notes panel to access highlight button
        // Color picker will be opened manually by clicking the highlight button
      }
    }
  };

const applyHighlight = (color: string) => {
    if (selectionRange && selectedText) {
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.style.padding = '2px 4px';
      span.style.borderRadius = '3px';
      span.textContent = selectedText;

      try {
        selectionRange.deleteContents();
        selectionRange.insertNode(span);

        // Save highlight data
        const highlightId = Date.now().toString();
        const newHighlight = {
          id: highlightId,
          text: selectedText,
          color: color,
          lessonId: lessonData.id,
          moduleId: moduleData.id.toString()
        };

        setHighlights(prev => [...prev, newHighlight]);

        // Save to localStorage for persistence
        const storageKey = `highlights_${course}_${moduleData.id}_${lessonData.id}`;
        const savedHighlights = JSON.parse(localStorage.getItem(storageKey) || '[]');
        savedHighlights.push(newHighlight);
        localStorage.setItem(storageKey, JSON.stringify(savedHighlights));
      } catch (error) {
        console.error('Error applying highlight:', error);
      }
    }

    // Reset selection
    setShowColorPicker(false);
    setSelectedText('');
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    const storageKey = `highlights_${course}_${moduleData.id}_${lessonData.id}`;
    const savedHighlights = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedHighlights = savedHighlights.filter((h: any) => h.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updatedHighlights));

    // Note: This doesn't remove the span from contentEditable directly 
    // because that's complex DOM manipulation. For a simple version, 
    // we'll advise the user to delete it manually or re-render if we had controlled content.
    // However, we can try to find the span and remove it.
    const spans = document.querySelectorAll('#module-notes-editor span');
    spans.forEach(span => {
      // Logic to find the specific span would go here
    });
    alert("Highlight data removed. You can now delete the text manually if needed.");
  };

const handleSaveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const clonedContent = range.cloneContents();
      const div = document.createElement('div');
      div.appendChild(clonedContent);
      const htmlContent = div.innerHTML;

      const editor = document.getElementById('module-notes-editor');
      if (editor) {
        // Create a blockquote for the captured text
        const blockquote = document.createElement('blockquote');
        blockquote.style.borderLeft = '2px solid var(--accent)';
        blockquote.style.paddingLeft = '8px';
        blockquote.style.margin = '8px 0';
        blockquote.style.opacity = '0.8';
        blockquote.style.fontStyle = 'italic';
        blockquote.innerHTML = htmlContent;

        editor.appendChild(blockquote);
      }
    } else {
      alert("Please select some text in the lesson first!");
    }
  };

   // Load highlights from localStorage on component mount
  useEffect(() => {
    const savedHighlights = JSON.parse(localStorage.getItem(`highlights_${course}_${moduleData.id}_${lessonData.id}`) || '[]');
    setHighlights(savedHighlights);
  }, [course, moduleData.id, lessonData.id]);

  // Click outside handler for color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker) {
        const target = event.target as Element;
        if (!target.closest('.fixed.z-50')) {
          setShowColorPicker(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showColorPicker]);

  // Click outside handler for smart color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSmartColorPicker) {
        const target = event.target as Element;
        if (!target.closest('.smart-color-picker') && !buttonRef.current?.contains(target)) {
          setShowSmartColorPicker(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSmartColorPicker]);

  // Dynamic positioning for smart color picker
  useEffect(() => {
    if (showSmartColorPicker && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const toolbarRect = buttonRef.current.parentElement?.getBoundingClientRect();
      const containerRect = buttonRef.current.parentElement?.parentElement?.getBoundingClientRect();
      if (!toolbarRect || !containerRect) return;

      const pickerWidth = 140;
      const toolbarWidth = toolbarRect.width;
      const buttonLeftRelative = buttonRect.left - toolbarRect.left;

      let left: number;
      let arrowDirection: 'left' | 'right';

      if (buttonLeftRelative + pickerWidth <= toolbarWidth) {
        left = buttonLeftRelative;
        arrowDirection = 'left';
      } else if (buttonLeftRelative - pickerWidth >= 0) {
        left = buttonLeftRelative - pickerWidth;
        arrowDirection = 'right';
      } else {
        left = buttonLeftRelative;
        arrowDirection = 'left';
      }

      const top = toolbarRect.height;
      setSmartPickerPosition({ position: 'absolute', top: `${top}px`, left: `${left}px`, bottom: 'auto', transform: 'none' });
      setArrowDirection(arrowDirection);
    }
  }, [showSmartColorPicker]);

  // Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Calculate new width: Window width - mouse X position (since panel is on right)
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 800) {
        setNotesWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);


  // START OVERLAY
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[url('/grid-pattern.svg')] bg-cover">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="z-10 text-center animate-in fade-in zoom-in duration-500">
          {/* Badge removed as per user request */}
          <h1 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4 tracking-tight">{moduleData.title}</h1>
          <p className="text-sm text-textSecondary mb-10 max-w-2xl mx-auto">{moduleData.description}</p>

          <Button
            size="lg"
            className="h-14 px-12 text-lg rounded-full shadow-[0_0_40px_-5px_rgba(var(--accent),0.5)] hover:shadow-[0_0_60px_-5px_rgba(var(--accent),0.7)] transition-all scale-100 hover:scale-105"
            onClick={handleStartModule}
          >
            Start Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col animate-in fade-in duration-700", isFullscreen ? "h-screen fixed inset-0 z-50 bg-background" : "h-[calc(100vh-8rem)] -m-6")}>
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Sidebar */}
        <div className={cn(
          "bg-surface border-r border-white/5 flex flex-col transition-all duration-300 relative",
          sidebarOpen ? "w-72" : "w-0 md:w-16" // w-0 on mobile when collapsed? keeping w-16 for desktop
        )}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-4 z-10 bg-surface border border-white/10 rounded-full p-1 text-textSecondary hover:text-white shadow-sm hover:scale-110 transition-all"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {/* Sidebar Header (Hidden when collapsed for cleaner look, or just icon) */}
          <div className={cn(
            "p-4 border-b border-white/5 font-bold text-textPrimary h-14 flex items-center overflow-hidden whitespace-nowrap",
            !sidebarOpen && "justify-center px-0"
          )}>
            {sidebarOpen && (
              <span className="truncate">Course Modules</span>
            )}
            {!sidebarOpen && (
              <BookOpen className="w-5 h-5" />
            )}
          </div>


          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {moduleData.lessons.map((lesson, idx) => {
              const completed = completedLessons[idx];
              const active = idx === selectedLessonIdx;

              return (
                <div
                  key={lesson.id}
                  onClick={() => { setSelectedLessonIdx(idx); setActiveTab('reading'); setReadCompleted(false); setScrollProgress(0); scrollRef.current?.scrollTo(0, 0); }}
                  className={cn(
                    "rounded text-sm cursor-pointer hover:bg-white/5 transition-colors flex flex-col group relative",
                    sidebarOpen ? "p-3" : "p-0 justify-center h-12 w-12 mx-auto items-center",
                    active ? "bg-accent/10" : ""
                  )}
                  title={!sidebarOpen ? lesson.title : undefined}
                >
                  <div className="flex items-center w-full">
                    <div className={cn(
                      "flex items-center justify-center font-bold transition-all shrink-0",
                      sidebarOpen ? "w-6 h-6 bg-white/5 rounded-full text-xs mr-3" : "w-full h-full text-sm"
                    )}>
                      {completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : idx + 1}
                    </div>

                    {sidebarOpen && (
                      <span className={cn("truncate flex-1 font-medium", active ? "text-accent" : "text-textSecondary")}>
                        {lesson.title}
                      </span>
                    )}
                  </div>

                  {/* Track Bar */}
                  {sidebarOpen && active && (
                    <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-accent")}
                        style={{ width: `${scrollProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Tab Header & Timer */}
          <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-surface/30 backdrop-blur gap-4">
            {/* Back Button and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href={`/dashboard/${course}/modules`} onClick={() => setIsFullscreen(false)} className="p-2 hover:bg-white/5 rounded-full text-textSecondary hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="font-bold text-textPrimary truncate hidden md:block">{lessonData.title}</h1>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {/* Timer Display */}
              {!showQuizResults && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5 shadow-inner">
                  <Clock className={cn("w-3.5 h-3.5 text-accent", !isPaused && "animate-pulse")} />
                  <span className="text-sm font-mono font-bold text-white">{formatTime(lessonTime)}</span>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="ml-2 p-1 bg-white/10 rounded-full transition-colors text-textSecondary"
                    title={isPaused ? "Resume" : "Pause"}
                  >
                    {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <div className="flex items-center bg-black/20 rounded-lg p-1">
                {(['reading', 'interactive', 'quiz'] as const).map(tab => {
                  if (tab === 'interactive' && (!lessonData.isInteractive || course === 'nlp')) return null;
                  return (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md capitalize transition-all",
                        activeTab === tab ? "bg-accent text-background shadow-lg" : "text-textSecondary hover:text-textPrimary",
                        tab === 'quiz' && !readCompleted && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={tab === 'quiz' && !readCompleted}
                      title={tab === 'quiz' && !readCompleted ? "Finish reading to unlock" : undefined}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div ref={scrollRef} className={cn("flex-1 overflow-y-auto p-8 relative scroll-smooth", isPaused && "blur-2xl pointer-events-none select-none overflow-hidden")} onScroll={handleScroll}>
            {isPaused && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/20 backdrop-blur-md">
                <div className="text-center p-8 rounded-2xl bg-surface/50 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                  <PauseCircle className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-white mb-2">Learning Paused</h3>
                  <p className="text-textSecondary mb-6">Click the button below to resume your session.</p>
                  <Button
                    size="lg"
                    onClick={() => setIsPaused(false)}
                    className="rounded-full px-8 h-12 shadow-[0_0_20px_rgba(var(--accent),0.3)]"
                  >
                    Resume Learning
                  </Button>
                </div>
              </div>
            )}
            {activeTab === 'reading' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
                <div className="prose prose-p:text-textSecondary prose-headings:text-textPrimary prose-strong:text-accent">
                  <h3>{lessonData.title}</h3>
                  <p>Duration: {lessonData.duration}</p>
                  {lessonData.isInteractive && <span className="text-accent">Interactive Lesson</span>}
                </div>

                {/* Render lesson content dynamically */}
                {lessonData.content && (
                  <>
                    {/* Overview or Quote of the Day Section */}
                    {(lessonData.content.overview || lessonData.content.quoteOfTheDay) && (
                      <Card className="p-6 bg-gradient-to-r from-surface to-transparent border-l-4 border-l-accent">
                        <h4 className="font-bold text-textPrimary mb-2">{lessonData.content.quoteOfTheDay ? "Quote of the Day" : "Overview"}</h4>
                        <p className="text-sm text-textSecondary leading-relaxed">
                          {lessonData.content.quoteOfTheDay || lessonData.content.overview}
                        </p>
                        {lessonData.content.quoteAttribution && (
                          <p className="text-xs text-textSecondary/60 italic mt-3 text-right">
                            — {lessonData.content.quoteAttribution}
                          </p>
                        )}
                      </Card>
                    )}

                    {/* Learning Objectives */}
                    {lessonData.content.objectives && lessonData.content.objectives.length > 0 && (
                      <div className="bg-surface p-6 rounded-lg mb-8 border border-white/10">
                        <h4 className="font-bold text-textPrimary mb-4 text-xl">Learning Objectives</h4>
                        <p className="mb-3 text-textSecondary">
                          By the end of this lesson, you will be able to:
                        </p>
                        <ul className="list-none p-0 text-sm text-textSecondary">
                          {lessonData.content.objectives.map((objective, index) => (
                            <li key={index} className="mb-2 pl-6 relative text-sm text-textSecondary">
                              <span className="absolute left-0">✓</span>
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Content Sections */}
                    {lessonData.content.sections && lessonData.content.sections.map((section, index) => (
                      <div key={index} className="mb-8">
                        {section.type === 'text' && (
                          <>
                            <h2 className="font-bold text-textPrimary mb-4 text-xl">
                              {section.title}
                            </h2>
                            <div className="prose prose-p:text-textSecondary">
                              <p>{section.content as React.ReactNode}</p>
                            </div>
                          </>
                        )}

                        {section.type === 'interactive' && (
                          <div className="mt-8 pt-8 border-t border-white/10">
                            <h2 className="font-bold text-textPrimary mb-6 text-2xl">
                              {section.title}
                            </h2>
                            <div className="rounded-lg border border-white/10 p-6 bg-surface/50">
                              {typeof section.content === 'object' && section.content !== null && 'lines' in (section.content as any) ? (
                                <InteractiveCodeWalkthrough
                                  lines={(section.content as any).lines}
                                  outputs={(section.content as any).outputs}
                                  summary={(section.content as any).summary}
                                />
                              ) : (
                                (section.content as React.ReactNode)
                              )}
                            </div>
                          </div>
                        )}

                        {section.type === 'problem-statement' && (
                          <div className="mt-12 pt-8 border-t border-white/10">
                            <h2 className="font-bold text-textPrimary mb-6 text-2xl">
                              Let's begin with a real-world problem
                            </h2>
                            {typeof section.content === 'object' && section.content !== null && (
                              <ProblemStatement
                                problem={(section.content as ProblemStatementContent).problem}
                                twist={(section.content as ProblemStatementContent).twist}
                                hints={(section.content as ProblemStatementContent).hints}
                                solution={(section.content as ProblemStatementContent).solution}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                <div className="flex flex-col items-center pt-10 gap-4 border-t border-white/5 mt-10">
                  {selectedLessonIdx < moduleData.lessons.length - 1 ? (
                    <Button onClick={handleNext} disabled={scrollProgress < 90 && !readCompleted} className={scrollProgress < 90 && !readCompleted ? "opacity-50" : ""}>
                      Next Lesson →
                    </Button>
                  ) : (
                    <>
                      {!readCompleted ? (
                        <Button onClick={() => setReadCompleted(true)} disabled={scrollProgress < 90} className={scrollProgress < 90 ? "opacity-50" : "bg-accent/20 text-accent hover:bg-accent hover:text-white"}>
                          ✓ Mark as Complete
                        </Button>
                      ) : (
                        <Button onClick={() => handleTabChange('quiz')} className="bg-accent/20 text-accent hover:bg-accent hover:text-white">
                          Proceed to Quiz
                        </Button>
                      )}
                    </>
                  )}
                  {scrollProgress < 90 && !readCompleted && <p className="text-xs text-textSecondary italic">Scroll to the bottom to proceed</p>}
                  {readCompleted && <p className="text-xs text-green-400">✓ Reading completed! Quiz is now available.</p>}
                </div>
              </div>
            )}

            {/* Interactive & Quiz Tabs (Simplified for brevity, same logic applies) */}
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
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="h-full flex flex-col animate-fade-in">
                {!quizStarted ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-textPrimary mb-4">Lesson Quiz</h1>
                        <div className="flex items-center justify-center gap-6 text-textSecondary">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{formatTime(lessonTime)}</span>
                          </div>
                          <Badge variant="warning">3 Questions</Badge>
                        </div>
                      </div>

                      <div className="bg-accent/5 p-6 rounded-lg border border-accent/10 mb-8">
                        <h3 className="font-bold text-accent mb-2">Quiz Instructions</h3>
                        <ul className="text-sm text-textSecondary space-y-1">
                          <li>• Answer all questions based on the lesson content</li>
                          <li>• You can navigate between questions</li>
                          <li>• Your score will be calculated automatically</li>
                          <li>• Timer continues from your reading session</li>
                        </ul>
                      </div>

                      <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => setActiveTab('reading')}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Reading
                        </Button>
                        <Button onClick={handleStartQuiz} className="px-8">
                          Start Quiz
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : showQuizResults ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10">
                      <div className="text-center mb-8">
                        <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${calculateQuizScore() >= 70 ? 'bg-green-500/20 text-green-400' : calculateQuizScore() >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {calculateQuizScore() >= 70 ? <CheckCircle2 className="w-12 h-12" /> : <X className="w-12 h-12" />}
                        </div>
                        <h1 className="text-3xl font-bold text-textPrimary mb-2">Quiz Complete!</h1>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <Card className="p-4 bg-surface/40 backdrop-blur-md border border-white/5">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Total Score</div>
                            <div className="text-2xl font-bold text-white">{calculateQuizScore()}%</div>
                          </Card>
                          <Card className="p-4 bg-surface/40 backdrop-blur-md border border-white/5">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Performance</div>
                            <div className="text-2xl font-bold text-accent">{formatTime(quizTimeTaken)}</div>
                          </Card>
                        </div>

                        <div className="flex justify-center mb-8">
                          <Badge variant={calculateQuizScore() >= 70 ? "success" : calculateQuizScore() >= 50 ? "warning" : "secondary"} className="text-lg px-6 py-2 rounded-full shadow-lg">
                            {calculateQuizScore() >= 70 ? "Excellent Mastery!" : calculateQuizScore() >= 50 ? "Strong Performance!" : "Good Try, Keep Going!"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        {[1, 2, 3].map((index) => (
                          <div key={index} className="p-4 rounded-lg border border-white/5 bg-surface/20">
                            <div className="flex items-start gap-3">
                              {quizAnswers[index - 1] === 0 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-textPrimary mb-2">Question {index} for {lessonData.title}</p>
                                <p className="text-sm text-textSecondary">
                                  Your answer: {["Option A", "Option B", "Option C", "Option D"][quizAnswers[index - 1]] || 'Not answered'}
                                </p>
                                {quizAnswers[index - 1] !== 0 && (
                                  <p className="text-sm text-green-400 mt-1">
                                    Correct: Option A
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={handleQuizExit}>
                          Back to Lesson
                        </Button>

                        <Button onClick={() => window.location.href = `/dashboard/${course}/modules`}>
                          Next Module
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
                    {/* Question Area */}
                    <div className="w-full bg-background relative flex flex-col min-h-[50vh] lg:min-h-full lg:col-span-9">
                      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                        <div className="max-w-4xl mx-auto w-full">
                          <div className="flex items-start justify-between mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary leading-relaxed flex-1">
                              Question {currentQuizQuestion + 1} for {lessonData.title}
                            </h2>
                            <button
                              onClick={() => toggleStarQuestion(`${lessonData.id}-q${currentQuizQuestion + 1}`)}
                              className="ml-4 p-2 rounded-lg border border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-accent/10 transition-all group"
                              title={starredQuestions.has(`${lessonData.id}-q${currentQuizQuestion + 1}`) ? "Remove from important" : "Mark as important"}
                            >
                              <Star className={`w-5 h-5 ${starredQuestions.has(`${lessonData.id}-q${currentQuizQuestion + 1}`) ? 'fill-accent text-accent' : 'text-textSecondary group-hover:text-accent'} transition-colors`} />
                            </button>
                          </div>
                          <div className="space-y-4">
                            {["Option A", "Option B", "Option C", "Option D"].map((option, index) => (
                              <button
                                key={option}
                                onClick={() => handleQuizAnswer(index)}
                                className={`w-full p-5 rounded-xl border text-left transition-all group ${quizAnswers[currentQuizQuestion] === index
                                  ? 'border-accent bg-accent/10 text-accent shadow-[0_0_20px_-5px_rgba(var(--accent),0.3)]'
                                  : 'border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-surface/60 text-textPrimary'
                                  }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${quizAnswers[currentQuizQuestion] === index
                                    ? 'border-accent bg-accent text-white'
                                    : 'border-white/20 group-hover:border-accent'
                                    }`}>
                                    {quizAnswers[currentQuizQuestion] === index && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm animate-in zoom-in duration-200"></div>
                                    )}
                                  </div>
                                  <span className="text-lg">{option}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation & Progress */}
                    <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0">
                      <h3 className="font-bold text-xs mb-6 uppercase text-textSecondary tracking-widest flex justify-between items-center">
                        Navigator
                        <span className="text-accent">{formatTime(lessonTime)}</span>
                      </h3>

                      <div className="grid grid-cols-3 gap-2 mb-8">
                        {[0, 1, 2].map((index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentQuizQuestion(index)}
                            className={`aspect-square rounded-md border text-sm font-bold transition-all ${index === currentQuizQuestion
                              ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20'
                              : quizAnswers[index] !== -1
                                ? 'border-green-500/50 bg-green-500/10 text-green-500'
                                : 'border-white/10 bg-surface/40 text-textSecondary hover:border-white/20'
                              }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleQuizPrevious}
                            disabled={currentQuizQuestion === 0}
                            className="flex-1"
                          >
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleQuizNext}
                            disabled={currentQuizQuestion === 2}
                            className="flex-1"
                          >
                            Next
                          </Button>
                        </div>
                        <Button
                          onClick={handleQuizSubmit}
                          disabled={quizAnswers.includes(-1)}
                          className="w-full"
                        >
                          Submit Quiz
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleQuizExit}
                          className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                          Exit Quiz
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: Notes - Resizable */}
        <div
          className={cn(
            "bg-surface border-l border-white/5 hidden xl:flex flex-col transition-all duration-300 relative",
            notesOpen ? "" : "w-16"
          )}
          style={notesOpen ? { width: notesWidth } : {}}
        >
          {/* Resize Handle */}
          {notesOpen && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/50 z-20"
              onMouseDown={() => setIsResizing(true)}
            ></div>
          )}

          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className="absolute -left-3 top-4 z-10 bg-surface border border-white/10 rounded-full p-1 text-textSecondary hover:text-white shadow-sm hover:scale-110 transition-all"
            title={notesOpen ? "Collapse Notes" : "Expand Notes"}
          >
            {notesOpen ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>

          <div className={cn(
            "p-4 font-bold border-b border-white/5 text-sm uppercase tracking-wider text-textSecondary h-14 flex items-center overflow-hidden whitespace-nowrap",
            !notesOpen && "justify-center px-0"
          )}>
            {notesOpen ? (
              activeTab === 'reading' ? 'Smart Notes' : activeTab === 'interactive' ? 'Controls' : 'Review'
            ) : (
              <FileText className="w-5 h-5 text-textSecondary" />
            )}
          </div>

          {notesOpen && (
            <div className="p-4 space-y-4 flex-1 flex flex-col">
              {activeTab === 'reading' && (
                <div className="flex flex-col gap-2 h-full border border-white/10 rounded-xl overflow-visible relative">
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 bg-surface/50 backdrop-blur-md p-1.5 overflow-visible relative">
                    <button
                      onClick={() => document.execCommand('bold')}
                      onMouseDown={(e) => e.preventDefault()}
                      className="p-2 hover:bg-white/10 rounded-lg text-[10px] font-bold w-7 h-7 flex items-center justify-center transition-all hover:scale-110"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => document.execCommand('italic')}
                      onMouseDown={(e) => e.preventDefault()}
                      className="p-2 hover:bg-white/10 rounded-lg text-[10px] italic w-7 h-7 flex items-center justify-center transition-all hover:scale-110"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={() => document.execCommand('underline')}
                      onMouseDown={(e) => e.preventDefault()}
                      className="p-2 hover:bg-white/10 rounded-lg text-[10px] underline w-7 h-7 flex items-center justify-center transition-all hover:scale-110"
                      title="Underline"
                    >
                      U
                    </button>

                    <button
                      ref={buttonRef}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowSmartColorPicker(!showSmartColorPicker);
                      }}
                      className={cn(
                        "p-2 rounded-lg w-7 h-7 flex items-center justify-center transition-all hover:scale-110",
                        showSmartColorPicker ? "bg-white/20" : "hover:bg-white/10"
                      )}
                      title="Highlight"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                    </button>

                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                    <button
                      onClick={handleInsertSmartImage}
                      onMouseDown={(e) => e.preventDefault()}
                      className="p-1 hover:bg-white/10 rounded text-[10px] w-6 h-6 flex items-center justify-center transition-all hover:scale-110 text-textSecondary hover:text-white"
                      title="Upload Image"
                    >
                      <ImageIcon className="w-3 h-3" />
                    </button>
                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveSelection}
                      onMouseDown={(e) => e.preventDefault()}
                      className="h-7 text-[9px] px-2 text-textPrimary hover:bg-accent/20 border border-white/10 rounded-lg"
                    >
                      + Capture
                    </Button>
                    <button
                      onClick={() => setShowNotesModal(true)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="p-1 hover:bg-white/10 rounded text-[10px] w-6 h-6 flex items-center justify-center transition-all hover:scale-110 text-textSecondary hover:text-white"
                      title="View All Notes"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Smart Color Picker */}
                  {showSmartColorPicker && (
                    <div
                      className="smart-color-picker absolute z-[100] bg-surface/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl min-w-[140px] animate-in zoom-in slide-in-from-left-1 duration-200"
                      style={smartPickerPosition}
                    >
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {smartHighlightColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => applySmartColor(color.value)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-8 h-8 rounded-lg border border-white/10 hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center group"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => applySmartColor('transparent')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white transition-all text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/5"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                      {/* Arrow pointing left, aligned with the bottom corner */}
                      <div className={`absolute bottom-2 ${arrowDirection === 'left' ? '-left-1' : '-right-1'} w-2 h-2 bg-surface border-l border-b border-white/20 ${arrowDirection === 'left' ? 'rotate-45' : '-rotate-45'}`} />
                    </div>
                  )}

                  {/* Highlight Color Picker in Sidebar */}
                  {showColorPicker && (
                    <div className="bg-surface/50 backdrop-blur-md p-3 rounded-lg border border-white/10">
                      <h5 className="text-xs font-bold text-textSecondary uppercase mb-2">Highlight Colors</h5>
                      <div className="grid grid-cols-3 gap-1">
                        {highlightColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => applyHighlight(color.value)}
                            className="w-8 h-8 rounded border border-white/20 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>

                      {highlights.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h6 className="text-[10px] font-bold text-textSecondary uppercase mb-2">Active Highlights</h6>
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                            {highlights.map(h => (
                              <div key={h.id} className="flex items-center justify-between gap-2 p-1.5 bg-black/20 rounded border border-white/5 group">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }}></div>
                                  <span className="text-[10px] text-textSecondary truncate">{h.text}</span>
                                </div>
                                <button
                                  onClick={() => removeHighlight(h.id)}
                                  className="text-textSecondary hover:text-red-400 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setShowColorPicker(false)}
                        className="mt-2 w-full text-xs text-textSecondary hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <h4 className="sr-only">My Notes</h4>
                  <div className="relative flex-1 min-h-[160px]">
                    <div
                      className="w-full h-full bg-black/20 rounded-b border border-white/10 p-2 text-sm text-white overflow-y-auto focus:outline-none focus:ring-1 focus:ring-accent [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2 [&_img]:border [&_img]:border-white/10 [&_img]:cursor-pointer [&_img:hover]:ring-1 [&_img:hover]:ring-accent"
                      contentEditable
                      suppressContentEditableWarning
                      onClick={handleSmartEditorClick}
                      id="module-notes-editor"
                    ></div>

                    {selectedSmartImg && (
                      <div
                        className="absolute z-40 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xl cursor-pointer hover:bg-red-600 transition-all flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1"
                        style={{
                          left: `${selectedSmartImg.offsetLeft + selectedSmartImg.offsetWidth / 2}px`,
                          top: `${selectedSmartImg.offsetTop + 10}px`,
                          transform: 'translateX(-50%)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSmartImage();
                        }}
                      >
                        <X className="w-2.5 h-2.5" /> Remove
                      </div>
                    )}
                  </div>

                  <Button size="sm" onClick={handleSaveNotes} className="w-full">
                    <Save className="w-4 h-4 mr-2" /> Save Notes
                  </Button>
                </div>
              )}
              {/* Controls for other tabs omitted for brevity */}
            </div>
          )}

          {/* {!notesOpen} block removed as per request to remove duplicate icons - the header icon is sufficient */}

        </div>
      </div>



      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-white/10 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-textPrimary">All Saved Notes</h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-2 hover:bg-white/10 rounded-full text-textSecondary hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedNote ? (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNote(null)}
                    className="mb-4"
                  >
                    ← Back to Notes List
                  </Button>
                  <div className="p-4 bg-surface/50 rounded-lg border border-white/5">
                    <div className="flex items-start gap-2 mb-4">
                      {selectedNote.emoji && <span className="text-lg">{selectedNote.emoji}</span>}
                      <div className="flex-1">
                        <h3 className="font-medium text-textPrimary">{selectedNote.title}</h3>
                        {selectedNote.subtitle && <p className="text-sm text-textSecondary">{selectedNote.subtitle}</p>}
                      </div>
                    </div>
                    <div className="text-textSecondary prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                    {selectedNote.createdAt && (
                      <p className="text-xs text-textSecondary mt-4">
                        Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {courseData.notes && courseData.notes.length > 0 ? (
                    courseData.notes.map((note, index) => (
                      <div
                        key={note.id}
                        className="p-4 bg-surface/50 rounded-lg border border-white/5 cursor-pointer hover:bg-surface/70 transition-colors"
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {note.emoji && <span className="text-lg">{note.emoji}</span>}
                          <div className="flex-1">
                            <h3 className="font-medium text-textPrimary">{note.title}</h3>
                            {note.subtitle && <p className="text-sm text-textSecondary">{note.subtitle}</p>}
                          </div>
                          <Button size="sm" variant="ghost" className="text-xs" onClick={(e) => { e.stopPropagation(); setShowNotesModal(false); const editor = document.getElementById('module-notes-editor'); if (editor) { editor.innerHTML = note.content; } }}>
                            Edit
                          </Button>
                        </div>
                        {note.createdAt && (
                          <p className="text-xs text-textSecondary mt-2">
                            Created: {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-textSecondary">No notes saved yet.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
