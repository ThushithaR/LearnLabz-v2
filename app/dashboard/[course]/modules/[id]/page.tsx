"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { courses, CourseId, COURSE_ID_MAP } from "@/lib/courses";
import { Course, Module, Lesson, ProblemStatementContent, QuizQuestion } from "@/lib/types/course";
import { useCourse } from "@/lib/context/CourseContext";
import { ProblemStatement } from "@/lib/content/nlp/unit1/problemStatement";
import InteractiveRenderer from "@/components/interactive/InteractiveRenderer";
import TuringTestSimulator from "@/lib/content/aiml/unit1/AIApproaches";
import AIAgentLesson from "@/lib/content/aiml/unit1/IntelligentAgents";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import {ChevronLeft,ChevronRight,Clock,BookOpen,CheckCircle2,Save,FileText,ArrowLeft,X,PauseCircle,PlayCircle,Image as ImageIcon,Star,RotateCw,Box} from "lucide-react";
import { GutenbergExplorerProvider } from "@/lib/context/GutenbergExplorerContext";
import { GutenbergExplorerPanel, ExplorerButton } from "@/components/GutenbergExplorer";
import { ModuleProgress } from "@/lib/types/progress";
import { getLessonProgress, getLessonProgressByUnit, upsertLessonProgress, updateUnitProgress } from "@/lib/supabase/progress";
import { supabase } from "@/lib/supabase/client";
import { getUserNotes, createNote, upsertNote } from "@/lib/supabase/notes";

export default function LessonPage({ params }: { params: { course: string; id: string } }) {
  const { course, id } = params;
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get("lesson");



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
  // Note editing state
  const [currentEditingNoteId, setCurrentEditingNoteId] = useState<number | null>(null);
  // lesson completion tracking
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  // Deep link: /modules/:unitId?lesson=<lesson title>
  useEffect(() => {
    if (!moduleData || !lessonParam) return;

    const decoded = decodeURIComponent(lessonParam);
    const idx = moduleData.lessons.findIndex((l) =>
      l.title.toLowerCase() === decoded.toLowerCase()
    );

    if (idx !== -1) {
      setSelectedLessonIdx(idx);
      setActiveTab('reading');
    }
  }, [moduleData, lessonParam]);

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
  const [quizTime, setQuizTime] = useState(0); // [NEW] Track time spent specifically on quiz
  const [quizLocked, setQuizLocked] = useState(false); // Prevent switching back to reading

  // Add to your existing state declarations
  const [isModuleQuiz, setIsModuleQuiz] = useState(false); // Track if we're showing module quiz
  const [lessonQuizScores, setLessonQuizScores] = useState<number[]>([]);
  const [lessonQuizCompleted, setLessonQuizCompleted] = useState<boolean[]>([]);
  const [moduleQuizQuestions, setModuleQuizQuestions] = useState<QuizQuestion[]>([]); // [NEW] Store module-wide questions

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

  // Initialize these states
  useEffect(() => {
    if (moduleData) {
      setLessonQuizScores(new Array(moduleData.lessons.length).fill(0));
      setLessonQuizCompleted(new Array(moduleData.lessons.length).fill(false));
    }
  }, [moduleData]);

  useEffect(() => {
    // Reset quiz state when lesson changes
    if (activeTab === 'quiz') {
      // Only reset if we're not in the middle of a quiz
      if (!quizStarted || showQuizResults) {
        setQuizStarted(false);
        setShowQuizResults(false);
        setCurrentQuizQuestion(0);
        setQuizAnswers([]);
        setQuizLocked(false);
      }
    }
  }, [selectedLessonIdx, activeTab]);

  // Reset lesson time when switching lessons - ALWAYS start from 0
  useEffect(() => {
    // Always reset timer to 0 when switching lessons
    // This ensures consistent timing for Digital Twin analysis
    setLessonTime(0);
  }, [selectedLessonIdx]);

  // Timer for current lesson only
  useEffect(() => {
    if (!hasStarted || isPaused || showQuizResults || activeTab === "quiz") return;
    const interval = setInterval(() => {
      setLessonTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, showQuizResults, activeTab, selectedLessonIdx]);

  // Quiz timer
  useEffect(() => {
    if (!quizStarted || isPaused || showQuizResults) return;
    const interval = setInterval(() => {
      setQuizTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStarted, isPaused, showQuizResults]);

  // Calculate Expected Time for current lesson (Unit Time / total lessons)
  const calculateExpectedTime = () => {
    if (!moduleData) return 0;
    const unitDurationStr = moduleData.expectedDuration || "15 min";
    const unitTimeSec = parseInt(unitDurationStr) * 60;
    const totalLessons = moduleData.lessons.length;
    return Math.round(unitTimeSec / Math.max(1, totalLessons)); // in seconds
  };

  const expectedTimeSec = calculateExpectedTime();


  // Load userId from Supabase Auth
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUserProfile();
      if (user) {
        setUserId(user.user_id);
      } else {
        console.warn("No user profile found in LessonPage");
      }
    }
    loadUser();
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
        // Collect IDs from static data
        const lessonIds = moduleData.lessons.map(l => l.id);

        // Fetch directly from lesson_progress (bypassing the joined 'lessons' table which might be empty)
        const { data, error } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", userId)
          .in("lesson_id", lessonIds);

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

  // Reset quiz state when lesson changes
  useEffect(() => {
    setQuizStarted(false);
    setShowQuizResults(false);
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
    setQuizLocked(false);
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

  const isQuizComplete = () => {
    const questions = isModuleQuiz ? moduleQuizQuestions : lessonData.quiz;
    if (!questions) return false;
    return quizAnswers.slice(0, questions.length).every(answer => answer !== -1);
  };

  const handleQuizNext = () => {
    const questions = isModuleQuiz ? moduleQuizQuestions : lessonData.quiz;
    if (!questions) return;

    if (currentQuizQuestion < questions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      if (isQuizComplete()) {
        handleQuizSubmit();
      } else {
        alert("Please answer all questions before submitting!");
      }
    }
  };

  const handleQuizPrevious = () => {
    if (currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    }
  };

  const handleQuizSubmit = () => {
    setQuizTimeTaken(quizTime);
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
      setQuizTime(0);
    }
  };

  const calculateQuizScore = () => {
    const questions = isModuleQuiz ? moduleQuizQuestions : lessonData.quiz;
    if (!questions || questions.length === 0) return 0;
    let correct = 0;
    quizAnswers.forEach((answer, index) => {
      if (index < questions.length && answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (!moduleData) return <div>Module not found</div>;

  const lessonData: Lesson = moduleData.lessons[selectedLessonIdx];
  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update scroll progress on scroll event
  const handleScroll = () => {
    if (scrollRef.current && activeTab === "reading") {
      // Don't update progress if lesson is already marked as completed
      if (isLessonCompleted) return;
      const scrollTop = scrollRef.current.scrollTop;
      const scrollHeight = scrollRef.current.scrollHeight;
      const clientHeight = scrollRef.current.clientHeight;
      const progress = ((scrollTop + clientHeight) / scrollHeight) * 100;
      if (progress >= 90 && !readCompleted) {
        setReadCompleted(true);
      }
      // Cap progress at 100
      setScrollProgress(Math.min(progress, 100));
    }
  };

  // Placeholder for handleNext logic (now unified in handleNextLesson)
  const handleStartLessonQuiz = () => {
    // Set lesson quiz as started
    setQuizStarted(true);
    setQuizLocked(true);
    setIsModuleQuiz(false);
    setQuizTime(0); // [NEW] Reset quiz timer

    // Initialize answers for lesson quiz
    if (lessonData.quiz) {
      setQuizAnswers(new Array(lessonData.quiz.length).fill(-1));
    } else {
      // Fallback for lessons without quiz
      setQuizAnswers([]);
    }
    setCurrentQuizQuestion(0);
  };

  const handleStartModuleQuiz = () => {
    const allLessonsCompleted = completedLessons.every(c => c);

    if (!allLessonsCompleted) {
      alert("Please complete all lessons before taking the module quiz!");
      return;
    }

    // Collect all unique questions from all lessons in this module
    const allQuestions: QuizQuestion[] = [];
    const seenQuestionIds = new Set<string>();

    moduleData.lessons.forEach(lesson => {
      if (lesson.quiz) {
        lesson.quiz.forEach(q => {
          if (!seenQuestionIds.has(q.id)) {
            allQuestions.push(q);
            seenQuestionIds.add(q.id);
          }
        });
      }
    });

    if (allQuestions.length === 0) {
      alert("This module doesn't have any quiz questions yet.");
      return;
    }

    setModuleQuizQuestions(allQuestions);
    setQuizStarted(true);
    setQuizLocked(true);
    setIsModuleQuiz(true);
    setQuizTime(0); // [NEW] Reset quiz timer
    setQuizAnswers(new Array(allQuestions.length).fill(-1));
    setCurrentQuizQuestion(0);
  };

  const handleTabChange = (tab: 'reading' | 'interactive' | 'quiz') => {
    if (quizLocked && tab !== 'quiz') {
      alert("Cannot switch tabs during quiz. Please complete or exit the quiz first.");
      return;
    }

    if (tab === 'quiz') {
      // Check if this is the final lesson AND all lessons are completed
      const isFinalLesson = selectedLessonIdx === moduleData.lessons.length - 1;
      const allLessonsCompleted = completedLessons.every(c => c);

      if (isFinalLesson && allLessonsCompleted) {
        // Show module quiz (requires completion)
        handleStartModuleQuiz();
      } else {
        // Show lesson quiz immediately (no completion required)
        handleStartLessonQuiz();
      }
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

  // Save current lesson progress helper
  const saveLessonProgress = async () => {
    if (!userId || !moduleData || !lessonData) {
      console.warn("Cannot save progress: Missing userId, moduleData, or lessonData");
      return;
    }

    // Calculate cumulative time: previous total + time in current session
    const lessonKey = lessonData.id.toString();
    const prevTime = lessonTimeMap[lessonKey] || 0;
    const totalTimeSpent = prevTime + lessonTime;

    console.log(`[Timer Debug] Saving Lesson ${lessonKey}: Prev=${prevTime}, currentSession=${lessonTime}, Total=${totalTimeSpent}`);

    try {
      const { data, error } = await upsertLessonProgress({
        user_id: userId,
        course_id: COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP],
        unit_id: moduleData.id,
        lesson_id: Number(lessonData.id),
        lesson_time_spent: totalTimeSpent,
        lesson_progress_percent: Math.max(scrollProgress, (completedLessons[selectedLessonIdx] ? 100 : 0)),
        completed: completedLessons[selectedLessonIdx] || readCompleted,
      });

      if (error) {
        console.error(`[Timer Debug] DB Save Error for Lesson ${lessonKey}:`, error);
      } else {
        console.log(`[Timer Debug] DB Save Success for Lesson ${lessonKey}:`, data);
        // Update the map with the new total and reset session time
        setLessonTimeMap(prev => ({
          ...prev,
          [lessonKey]: totalTimeSpent
        }));
        setLessonTime(0);
      }
    } catch (err) {
      console.error(`[Timer Debug] Failed to save progress for ${lessonKey}:`, err);
    }
  };

  // Save current lesson progress and navigate to next lesson
  const handleNextLesson = async () => {
    await saveLessonProgress();

    // Navigate to next lesson
    if (selectedLessonIdx < moduleData.lessons.length - 1) {
      setSelectedLessonIdx(selectedLessonIdx + 1);
      setActiveTab('reading');
      setReadCompleted(false);
      setScrollProgress(0);
      // lessonTime is already reset in saveLessonProgress
    }
  };

  // Navigate to previous lesson
  const handlePreviousLesson = async () => {
    await saveLessonProgress();

    if (selectedLessonIdx > 0) {
      setSelectedLessonIdx(selectedLessonIdx - 1);
      setActiveTab('reading');
      setReadCompleted(false);
      setScrollProgress(0);
      // lessonTime is already reset in saveLessonProgress
    }
  };

  // Mark all lessons as complete and save to database
  const handleCompleteModule = async () => {
    if (!userId || !moduleData) return;

    try {
      // Save all lessons as completed
      const savePromises = moduleData.lessons.map(async (lesson, idx) => {
        const timeSpent = idx === selectedLessonIdx
          ? lessonTime
          : (lessonTimeMap[lesson.id.toString()] || 0);

        return upsertLessonProgress({
          user_id: userId,
          course_id: COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP],
          unit_id: moduleData.id,
          lesson_id: Number(lesson.id),
          lesson_time_spent: timeSpent,
          lesson_progress_percent: 100,
          completed: true,
        });
      });

      await Promise.all(savePromises);

      // Update local state to mark all as complete
      setCompletedLessons(new Array(moduleData.lessons.length).fill(true));

      alert("Module completed! All lessons saved successfully.");
    } catch (err) {
      console.error("Failed to complete module:", err);
      alert("Failed to save module completion. Please try again.");
    }
  };

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => setIsFullscreen(false);
  }, [setIsFullscreen]);

  // Use refs to keep track of state for the unmount cleanup
  // to avoid triggering the effect every time these values change
  const saveStateRef = useRef({
    userId,
    moduleData,
    lessonData,
    lessonTime,
    lessonTimeMap,
    scrollProgress,
    readCompleted,
    course,
    hasStarted
  });

  useEffect(() => {
    saveStateRef.current = {
      userId,
      moduleData,
      lessonData,
      lessonTime,
      lessonTimeMap,
      scrollProgress,
      readCompleted,
      course,
      hasStarted
    };
  }, [userId, moduleData, lessonData, lessonTime, lessonTimeMap, scrollProgress, readCompleted, course, hasStarted]);

  // Save progress on unmount or navigation away
  useEffect(() => {
    return () => {
      const state = saveStateRef.current;
      // Save current lesson progress when leaving page
      if (state.hasStarted && state.userId && state.moduleData && state.lessonData && state.lessonTime > 0) {
        const totalTimeSpent = (state.lessonTimeMap[state.lessonData.id.toString()] || 0) + state.lessonTime;

        upsertLessonProgress({
          user_id: state.userId,
          course_id: COURSE_ID_MAP[state.course as keyof typeof COURSE_ID_MAP],
          unit_id: state.moduleData.id,
          lesson_id: Number(state.lessonData.id),
          lesson_time_spent: totalTimeSpent,
          lesson_progress_percent: state.scrollProgress,
          completed: state.readCompleted,
        }).catch(err => console.error("Failed to save progress on unmount:", err));
      }
    };
  }, []);

  // Additional UI state declarations
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

  // Fetch existing notes
  useEffect(() => {
    const loadNotes = async () => {
      if (!userId) return;

      const { data } = await getUserNotes(userId, COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP]);

      if (data) setNotes(data);
    };
    loadNotes();
  }, [userId, course]);

  // Reload notes function
  const reloadNotes = async () => {
    if (!userId) return;
    try {
      const { data, error } = await getUserNotes(userId, COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP]);
      if (error) {
        console.error("Failed to load notes:", error);
        return;
      }
      if (data) {
        setNotes(data);
        // No need to auto-open modal here - handleSaveNotes will do it
      }
    } catch (err) {
      console.error("Error reloading notes:", err);
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

  const handleSaveNotes = async () => {
    if (!userId || !moduleData) {
      alert("User not loaded yet");
      return;
    }
    const editor = document.getElementById("module-notes-editor");
    if (!editor) {
      alert("Notes editor not found");
      return;
    }
    const content = editor.innerHTML;
    if (!content.trim()) {
      alert("Please write something first.");
      return;
    }
    try {
      const courseId = COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP];

      console.log("=== DEBUG: Saving note ===");
      console.log("User ID:", userId);
      console.log("Course ID:", courseId);
      console.log("Module ID:", moduleData.id);
      console.log("Lesson ID:", lessonData.id);
      console.log("Current editing note ID:", currentEditingNoteId);
      // Create note content
      const noteContent: any = {
        html: content
      };
      // Check if we have a specific note ID we're editing
      if (currentEditingNoteId) {
        console.log("Updating specific note ID:", currentEditingNoteId);
        // First, get the note to check its type and original title
        const { data: existingNote, error: fetchError } = await supabase
          .from("notes")
          .select("*")
          .eq("note_id", currentEditingNoteId)
          .single();
        if (fetchError) {
          console.error("Error fetching note:", fetchError);
          alert("Failed to fetch note details");
          return;
        }
        let updates: any = {
          note_content: noteContent,
        };
        // Only update the title if it's a MODULE note
        // For GENERAL notes, don't update the title at all
        if (existingNote.note_type === "MODULE") {
          // For MODULE notes, add module_id and lesson_id to content
          noteContent.module_id = moduleData.id;
          noteContent.lesson_id = Number(lessonData.id);
          // Only update title for MODULE notes with the lesson title
          updates.note_title = lessonData.title;
        }
        // For GENERAL notes, don't update the title - keep original
        // Also don't add module_id and lesson_id to GENERAL notes 
        const { data, error } = await supabase
          .from("notes")
          .update(updates)
          .eq("note_id", currentEditingNoteId)
          .select()
          .single();
        if (error) {
          console.error("Error updating note:", error);
          alert("Failed to update note");
          return;
        }
        console.log("Note updated successfully:", data);
        alert("Note updated successfully!");
        // Clear the editing note ID
        setCurrentEditingNoteId(null);
      } else {
        // If no specific note ID, check if a MODULE note already exists for this lesson
        const { data: existingModuleNotes } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .eq("note_type", "MODULE");
        if (existingModuleNotes) {
          // Find existing MODULE note for this lesson
          const existingNote = existingModuleNotes.find(note => {
            try {
              let content: any;
              if (typeof note.note_content === 'string') {
                try {
                  content = JSON.parse(note.note_content);
                } catch {
                  content = { html: note.note_content };
                }
              } else {
                content = note.note_content;
              }
              return content?.module_id === moduleData.id &&
                content?.lesson_id === lessonData.id;
            } catch {
              return false;
            }
          });
          if (existingNote) {
            console.log("Found existing MODULE note to update:", existingNote.note_id);
            // Update existing MODULE note
            noteContent.module_id = moduleData.id;
            noteContent.lesson_id = Number(lessonData.id);
            const { data, error } = await supabase
              .from("notes")
              .update({
                note_title: lessonData.title,
                note_content: noteContent,
              })
              .eq("note_id", existingNote.note_id)
              .select()
              .single();
            if (error) {
              console.error("Error updating note:", error);
              alert("Failed to update note");
              return;
            }
            console.log("Note updated successfully:", data);
            alert("Note updated successfully!");
          } else {
            // Create new MODULE note
            noteContent.module_id = moduleData.id;
            noteContent.lesson_id = Number(lessonData.id);
            const { data, error } = await supabase
              .from("notes")
              .insert({
                user_id: userId,
                course_id: courseId,
                note_type: "MODULE",
                note_title: lessonData.title, // Use lesson title for new MODULE notes
                note_subtitle: "",
                note_content: noteContent,
                source: "MANUAL"
              })
              .select()
              .single();
            if (error) {
              console.error("Error creating note:", error);
              alert("Failed to create note");
              return;
            }
            console.log("Note created successfully:", data);
            alert("Note created successfully!");
          }
        }
      }
      // Reload notes to get the updated list
      await reloadNotes();
      // Open notes modal
      setShowNotesModal(true);
    } catch (err) {
      console.error("Error in save notes:", err);
      alert("Failed to save note");
    }
  };
  // Load existing note content when lesson changes
  useEffect(() => {
    const loadExistingNote = async () => {
      if (!userId || !moduleData || !lessonData) return;
      console.log("=== DEBUG: Loading note for lesson ===");
      console.log("Module ID:", moduleData.id);
      console.log("Lesson ID:", lessonData.id);
      // Reset editing note ID when lesson changes
      setCurrentEditingNoteId(null);
      // Check local notes state first
      let existingNote = notes.find(note => {
        if (note.note_type !== "MODULE") return false;
        try {
          const content = typeof note.note_content === 'string'
            ? JSON.parse(note.note_content)
            : note.note_content;
          return content?.module_id === moduleData.id &&
            content?.lesson_id === lessonData.id;
        } catch {
          return false;
        }
      });
      // If not found locally, check database
      if (!existingNote && userId) {
        const courseId = COURSE_ID_MAP[course as keyof typeof COURSE_ID_MAP];
        const { data: dbNotes } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .eq("note_type", "MODULE");
        if (dbNotes) {
          existingNote = dbNotes.find(note => {
            try {
              const content = typeof note.note_content === 'string'
                ? JSON.parse(note.note_content)
                : note.note_content;

              return content?.module_id === moduleData.id &&
                content?.lesson_id === lessonData.id;
            } catch {
              return false;
            }
          });
        }
      }
      console.log("Found existing note:", existingNote);
      const editor = document.getElementById('module-notes-editor');
      if (editor) {
        if (existingNote) {
          // Load existing note content
          let htmlContent = '';
          if (typeof existingNote.note_content === 'object' && existingNote.note_content !== null) {
            htmlContent = existingNote.note_content.html || '';
          } else if (typeof existingNote.note_content === 'string') {
            try {
              const parsed = JSON.parse(existingNote.note_content);
              htmlContent = parsed.html || '';
            } catch {
              htmlContent = existingNote.note_content || '';
            }
          }
          console.log("Loading HTML content length:", htmlContent.length);
          editor.innerHTML = htmlContent;
        } else {
          console.log("No existing note found, clearing editor");
          editor.innerHTML = '';
        }
      }
    };
    loadExistingNote();
  }, [selectedLessonIdx, userId, moduleData, lessonData, notes]);

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

  // Calculate Total Unit Time (Cumulative of all lessons)
  const totalUnitTime = moduleData.lessons.reduce((acc, lesson) => {
    if (lesson.id.toString() === lessonData.id.toString()) return acc + lessonTime;
    return acc + (lessonTimeMap[lesson.id.toString()] || 0);
  }, 0);

  return (
    <GutenbergExplorerProvider>
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
                    onClick={async () => {
                      // Save current progress before switching
                      if (hasStarted) {
                        await saveLessonProgress();
                      }
                      setSelectedLessonIdx(idx);
                      setActiveTab('reading');
                      setReadCompleted(false);
                      setScrollProgress(0);
                      setLessonTime(0);
                      scrollRef.current?.scrollTo(0, 0);
                    }}
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
                    {sidebarOpen && active && activeTab !== 'quiz' && (
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
                {!showQuizResults && activeTab !== 'quiz' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5 shadow-inner">
                      <Clock className={cn("w-3.5 h-3.5 text-accent", !isPaused && "animate-pulse")} />
                      <div className="flex flex-col -space-y-1">
                        <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">Time Spent</span>
                        <span className="text-sm font-mono font-bold text-white leading-tight">
                          {formatTime((lessonTimeMap[lessonData.id.toString()] || 0) + lessonTime)}
                        </span>
                      </div>
                      <div className="mx-1 w-px h-6 bg-white/10" />
                      <div className="flex flex-col -space-y-1">
                        <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">Expected</span>
                        <span className="text-sm font-mono font-bold text-accent leading-tight">{Math.round(expectedTimeSec / 60)} min</span>
                      </div>
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="ml-2 p-1 bg-white/10 rounded-full transition-colors text-textSecondary hover:text-white"
                        title={isPaused ? "Resume" : "Pause"}
                      >
                        {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center bg-black/20 rounded-lg p-1">
                  {(['reading', 'interactive', 'quiz'] as const).map(tab => {
                    if (tab === 'interactive' && !lessonData.isInteractive) return null;
                    return (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
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
                    <div className="flex items-center gap-4 text-sm text-textSecondary mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Expected: {Math.round(expectedTimeSec / 60)} min</span>
                      </div>
                      {lessonData.isInteractive && <span className="text-accent py-1 px-3 bg-accent/10 rounded-full text-xs font-bold border border-accent/20">Interactive Lesson</span>}
                    </div>
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
                              {typeof section.content === 'object' && section.content !== null && ('lines' in (section.content as any) || 'concepts' in (section.content as any) || 'scenarioId' in (section.content as any) || 'scenarioIdDl' in (section.content as any) || 'kind' in (section.content as any) || 'modelFlow' in (section.content as any) || 'questions' in (section.content as any)) ? (
                                <InteractiveRenderer
                                  title={section.title}
                                  content={section.content}
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

                  {/*navigation*/}
                  <div className="flex flex-col items-center pt-10 gap-4 border-t border-white/5 mt-10">
                    <div className="flex gap-4">

                      {/* Previous Lesson Button */}
                      {selectedLessonIdx > 0 && (
                        <Button variant="outline" onClick={handlePreviousLesson}>
                          ← Previous
                        </Button>
                      )}

                      <Button onClick={() => handleTabChange('quiz')}>
                        Take Lesson Quiz
                      </Button>

                      {selectedLessonIdx < moduleData.lessons.length - 1 ? (
                        <Button onClick={handleNextLesson}>
                          Next Lesson →
                        </Button>
                      ) : (
                        <Button onClick={handleCompleteModule}>
                          Complete Module ✓
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive & Quiz Tabs (Simplified for brevity, same logic applies) */}
              {activeTab === 'interactive' && lessonData.isInteractive && (
                <div className="h-full flex flex-col animate-fade-in w-full">
                  {/* AIML Visualizers - Dynamic Rendering */}
                  {lessonData.interactiveComponent ? (
                    <lessonData.interactiveComponent />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
                        <Box className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Interactive Component Placeholder</h3>
                        <p className="text-textSecondary max-w-md">
                          This lesson will feature an interactive visualization or simulator.
                          The component for {lessonData.title} is currently under development.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="h-full flex flex-col animate-fade-in overflow-hidden">
                  {!isModuleQuiz ? (
                    // LESSON QUIZ
                    !quizStarted ? (
                      <div className="flex-1 flex items-center justify-center p-6">
                        <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10">
                          <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-textPrimary mb-4">Lesson Quiz</h1>
                            <p className="text-textSecondary mb-6">Test your knowledge on this lesson. You can take this quiz at any time.</p>
                            <div className="flex gap-4 justify-center">
                              <Button variant="outline" onClick={() => setActiveTab('reading')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Reading
                              </Button>
                              <Button onClick={handleStartLessonQuiz} className="px-8">
                                Start Quiz
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ) : showQuizResults ? (
                      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
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
                            {lessonData.quiz && lessonData.quiz.map((question, index) => (
                              <div key={question.id} className="p-4 rounded-lg border border-white/5 bg-surface/20">
                                <div className="flex items-start gap-3">
                                  {quizAnswers[index] === question.correctAnswer ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-textPrimary mb-2">{question.question}</p>
                                    <p className="text-sm text-textSecondary">
                                      Your answer: {quizAnswers[index] !== -1 ? question.options[quizAnswers[index]] : 'Not answered'}
                                    </p>
                                    {quizAnswers[index] !== question.correctAnswer && (
                                      <p className="text-sm text-green-400 mt-1">
                                        Correct: {question.options[question.correctAnswer]}
                                      </p>
                                    )}
                                    {question.explanation && (
                                      <p className="text-sm text-textSecondary mt-2 italic border-l-2 border-accent/30 pl-3">
                                        {question.explanation}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => {
                              setQuizStarted(false);
                              setShowQuizResults(false);
                              setQuizLocked(false);
                              setActiveTab('reading');

                              // Save the quiz score for this lesson
                              const score = calculateQuizScore();
                              setLessonQuizScores(prev => {
                                const newScores = [...prev];
                                newScores[selectedLessonIdx] = score;
                                return newScores;
                              });

                              setLessonQuizCompleted(prev => {
                                const newCompleted = [...prev];
                                newCompleted[selectedLessonIdx] = true;
                                return newCompleted;
                              });
                            }}>
                              Back to Lesson
                            </Button>
                            <Button onClick={() => {
                              // If not final lesson, go to next lesson
                              if (selectedLessonIdx < moduleData.lessons.length - 1) {
                                setSelectedLessonIdx(selectedLessonIdx + 1);
                                setActiveTab('reading');
                                setQuizStarted(false);
                                setShowQuizResults(false);
                                setQuizLocked(false);
                              } else {
                                // If final lesson, mark as completed
                                setCompletedLessons(prev => {
                                  const updated = [...prev];
                                  updated[selectedLessonIdx] = true;
                                  return updated;
                                });
                                setActiveTab('reading');
                              }
                            }}>
                              {selectedLessonIdx < moduleData.lessons.length - 1 ? "Next Lesson" : "Complete Lesson"}
                            </Button>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      // LESSON QUIZ IN PROGRESS
                      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
                        {/* Question Area with scroll */}
                        <div className="w-full bg-background relative flex flex-col min-h-[50vh] lg:min-h-full lg:col-span-9 overflow-y-auto">
                          <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                            <div className="max-w-4xl mx-auto w-full">
                              {lessonData.quiz && lessonData.quiz[currentQuizQuestion] ? (
                                <>
                                  <div className="flex items-start justify-between mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-textPrimary leading-relaxed flex-1">
                                      {lessonData.quiz[currentQuizQuestion].question}
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
                                    {lessonData.quiz[currentQuizQuestion].options.map((option, index) => (
                                      <button
                                        key={index}
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
                                </>
                              ) : (
                                <div className="text-center py-12">
                                  <p className="text-textSecondary">No quiz available for this lesson yet.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Navigation & Progress with scroll */}
                        <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
                          <h3 className="font-bold text-xs mb-6 uppercase text-textSecondary tracking-widest">
                            Navigator
                          </h3>

                          <div className="grid grid-cols-3 gap-2 mb-8">
                            {lessonData.quiz && lessonData.quiz.map((_, index) => (
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
                                disabled={quizAnswers[currentQuizQuestion] === -1}
                                className="flex-1"
                              >
                                {lessonData.quiz && currentQuizQuestion === lessonData.quiz.length - 1 ? "Submit" : "Next"}
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to exit the quiz?")) {
                                  setQuizStarted(false);
                                  setQuizLocked(false);
                                  setActiveTab('reading');
                                }
                              }}
                              className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10"
                            >
                              Exit Quiz
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    // MODULE QUIZ
                    !quizStarted ? (
                      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                        <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10">
                          <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-textPrimary mb-4">Module Final Quiz</h1>
                            <div className="flex items-center justify-center gap-6 text-textSecondary">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{formatTime(lessonTime)}</span>
                              </div>
                              <Badge variant="warning">3 Questions</Badge>
                            </div>
                          </div>

                          <div className="bg-accent/5 p-6 rounded-lg border border-accent/10 mb-8">
                            <h3 className="font-bold text-accent mb-2">Module Quiz Instructions</h3>
                            <ul className="text-sm text-textSecondary space-y-1">
                              <li>• This quiz covers all lessons in the module</li>
                              <li>• Complete all lessons first to unlock this quiz</li>
                              <li>• You can navigate between questions</li>
                              <li>• Your score will be calculated automatically</li>
                            </ul>
                          </div>

                          <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => setActiveTab('reading')}>
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back to Reading
                            </Button>
                            <Button onClick={handleStartModuleQuiz} className="px-8">
                              Start Module Quiz
                            </Button>
                          </div>
                        </Card>
                      </div>
                    ) : showQuizResults ? (
                      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                        <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10">
                          <div className="text-center mb-8">
                            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${calculateQuizScore() >= 70 ? 'bg-green-500/20 text-green-400' : calculateQuizScore() >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                              {calculateQuizScore() >= 70 ? <CheckCircle2 className="w-12 h-12" /> : <X className="w-12 h-12" />}
                            </div>
                            <h1 className="text-3xl font-bold text-textPrimary mb-2">Module Quiz Complete!</h1>
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
                            {moduleQuizQuestions.map((question, index) => (
                              <div key={question.id} className="p-4 rounded-lg border border-white/5 bg-surface/20">
                                <div className="flex items-start gap-3">
                                  {quizAnswers[index] === question.correctAnswer ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-textPrimary mb-2">{question.question}</p>
                                    <p className="text-sm text-textSecondary">
                                      Your answer: {quizAnswers[index] !== -1 ? question.options[quizAnswers[index]] : 'Not answered'}
                                    </p>
                                    {quizAnswers[index] !== question.correctAnswer && (
                                      <p className="text-sm text-green-400 mt-1">
                                        Correct: {question.options[question.correctAnswer]}
                                      </p>
                                    )}
                                    {question.explanation && (
                                      <p className="text-sm text-textSecondary mt-2 italic border-l-2 border-accent/30 pl-3">
                                        {question.explanation}
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
                      // MODULE QUIZ IN PROGRESS
                      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
                        {/* Question Area with scroll */}
                        <div className="w-full bg-background relative flex flex-col min-h-[50vh] lg:min-h-full lg:col-span-9 overflow-y-auto">
                          <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                            <div className="max-w-4xl mx-auto w-full">
                              <div className="flex items-start justify-between mb-6">
                                <h2 className="text-2xl md:text-3xl font-bold text-textPrimary leading-relaxed flex-1">
                                  {moduleQuizQuestions[currentQuizQuestion]?.question}
                                </h2>
                              </div>
                              <div className="space-y-4">
                                {moduleQuizQuestions[currentQuizQuestion]?.options.map((option, index) => (
                                  <button
                                    key={index}
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

                        {/* Navigation & Progress with scroll */}
                        <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
                          <h3 className="font-bold text-xs mb-6 uppercase text-textSecondary tracking-widest">
                            Navigator
                          </h3>

                          <div className="grid grid-cols-3 gap-2 mb-8">
                            {moduleQuizQuestions.map((_, index) => (
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
                                disabled={quizAnswers[currentQuizQuestion] === -1}
                                className="flex-1"
                              >
                                {currentQuizQuestion === moduleQuizQuestions.length - 1 ? "Submit" : "Next"}
                              </Button>
                            </div>
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
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DOCKED EXPLORER PANEL */}
          <GutenbergExplorerPanel />

          {/* RIGHT PANEL: Notes - Resizable */}
          {activeTab !== 'quiz' && (
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
                          style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                          }}
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
          )}
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
                      <div className="flex-1">
                        <h3 className="font-medium text-textPrimary">{selectedNote.note_title || selectedNote.title || 'Untitled Note'}</h3>
                      </div>
                      <div className="text-textSecondary prose prose-sm max-w-none mt-4">
                        {typeof selectedNote.note_content === 'object' && selectedNote.note_content?.html ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedNote.note_content.html }} />
                        ) : typeof selectedNote.content === 'object' && selectedNote.content?.html ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedNote.content.html }} />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: selectedNote.note_content || selectedNote.content || '' }} />
                        )}
                      </div>
                      {(selectedNote.created_at || selectedNote.note_created_at) && (
                        <p className="text-xs text-textSecondary mt-4">
                          Created: {new Date(selectedNote.created_at || selectedNote.note_created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {notes && notes.length > 0 ? (
                      notes.map((note, index) => (
                        <div
                          key={note.note_id || note.id}
                          className="p-4 bg-surface/50 rounded-lg border border-white/5 cursor-pointer hover:bg-surface/70 transition-colors"
                          onClick={() => setSelectedNote(note)}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-textPrimary">{note.note_title || note.title || 'Untitled Note'}</h3>
                            </div>
                            <Button size="sm" variant="ghost" className="text-xs" onClick={(e) => {
                              e.stopPropagation();
                              setShowNotesModal(false);
                              const editor = document.getElementById('module-notes-editor');
                              if (editor) {
                                const htmlContent = typeof note.note_content === 'object' ? note.note_content?.html : (typeof note.content === 'object' ? note.content?.html : note.note_content || note.content || '');
                                editor.innerHTML = htmlContent || '';

                                // Store the note ID we're editing
                                setCurrentEditingNoteId(note.note_id);
                              }
                            }}>
                              Edit
                            </Button>
                          </div>
                          {(note.created_at || note.note_created_at) && (
                            <p className="text-xs text-textSecondary mt-2">
                              Created: {new Date(note.created_at || note.note_created_at).toLocaleDateString()}
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
    </GutenbergExplorerProvider >
  );
}
