"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, ChevronLeft, ChevronRight, Star, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { courses, CourseId } from "@/lib/courses";
import { getQuizById, submitQuizAttempt } from "@/lib/supabase/quizzes";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { Quiz } from "@/lib/types/course";

export default function QuizSolvePage({ params }: { params: { course: string; id: string } }) {
    const router = useRouter();
    const [courseData, setCourseData] = useState<any>(null);
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [navigatorOpen, setNavigatorOpen] = useState(true);
    const [starredQuestions, setStarredQuestions] = useState<Set<number>>(new Set());
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    const [calcDisplay, setCalcDisplay] = useState("0");
    const [calcPrevious, setCalcPrevious] = useState("");
    const [quizTimeTaken, setQuizTimeTaken] = useState(0);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const course = courses[params.course as CourseId];
        if (!course || !course.features.quizzes) {
            router.push("/404");
            return;
        }
        setCourseData(course);

        // Fetch quiz from Backend
        const fetchQuiz = async () => {
            const quiz = await getQuizById(parseInt(params.id));
            if (!quiz) {
                console.error("Quiz not found in DB with ID:", params.id);
                router.push("/404");
                return;
            }
            setQuizData(quiz);

            // Set timer
            const timeMatch = quiz.time.match(/(\d+)/);
            if (timeMatch) {
                setTimeLeft(parseInt(timeMatch[1]) * 60);
            }
        };
        fetchQuiz();

        // Fetch User
        const fetchUser = async () => {
            const user = await getCurrentUserProfile();
            if (user) {
                setUserId(user.user_id);
            }
        };
        fetchUser();

        // Load starred questions from localStorage
        const storageKey = `starred_questions_${params.course}_${params.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setStarredQuestions(new Set(JSON.parse(saved)));
        }
    }, [params.course, params.id, router]);

    // Timer effect
    useEffect(() => {
        if (quizStarted && timeLeft > 0 && !showResults) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && quizStarted && !showResults) {
            handleSubmitQuiz();
        }
    }, [timeLeft, quizStarted, showResults]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartQuiz = () => {
        if (!quizData) return;
        setQuizStarted(true);
        setSelectedAnswers(new Array(quizData.questionData?.length || 0).fill(-1));
    };

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[questionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (!quizData) return;
        if (currentQuestion < (quizData.questionData?.length || 0) - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quizData || !courseData) return;

        // Calculate time taken
        let initialTime = 0;
        const timeMatch = quizData.time.match(/(\d+)/);
        if (timeMatch) {
            initialTime = parseInt(timeMatch[1]) * 60;
        }
        const timeTaken = initialTime - timeLeft;
        setQuizTimeTaken(timeTaken);

        const scoreVal = calculateScore();

        // Calculate correct count
        let correctCount = 0;
        selectedAnswers.forEach((answer, index) => {
            if (quizData.questionData && answer === quizData.questionData[index]?.correct) {
                correctCount++;
            }
        });

        // Submit to Backend
        if (userId && quizData.unitId && quizData.courseId) {
            try {
                await submitQuizAttempt({
                    user_id: userId,
                    course_id: quizData.courseId,
                    unit_id: quizData.unitId,
                    quiz_id: quizData.id,
                    score: scoreVal,
                    correct: correctCount,
                    total: quizData.questionData?.length || 0,
                    time_taken: timeTaken
                });
            } catch (error) {
                console.error("Failed to submit quiz:", error);
            }
        }

        setShowResults(true);
    };

    const toggleStarQuestion = (questionIndex: number) => {
        const newStarred = new Set(starredQuestions);
        if (newStarred.has(questionIndex)) {
            newStarred.delete(questionIndex);
        } else {
            newStarred.add(questionIndex);
        }
        setStarredQuestions(newStarred);

        // Save to localStorage
        const storageKey = `starred_questions_${params.course}_${params.id}`;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newStarred)));
    };

    // Calculator functions
    const handleCalcNumber = (num: string) => {
        if (calcDisplay === "0") {
            setCalcDisplay(num);
        } else {
            setCalcDisplay(calcDisplay + num);
        }
    };

    const handleCalcOperation = (op: string) => {
        if (calcDisplay !== "0") {
            setCalcPrevious(calcDisplay + op);
            setCalcDisplay("0");
        }
    };

    const handleCalcEquals = () => {
        if (calcPrevious && calcDisplay !== "0") {
            try {
                const result = eval(calcPrevious + calcDisplay);
                setCalcDisplay(result.toString());
                setCalcPrevious("");
            } catch {
                setCalcDisplay("Error");
                setCalcPrevious("");
            }
        }
    };

    const handleCalcClear = () => {
        setCalcDisplay("0");
        setCalcPrevious("");
    };

    const handleCalcBackspace = () => {
        if (calcDisplay.length > 1) {
            setCalcDisplay(calcDisplay.slice(0, -1));
        } else {
            setCalcDisplay("0");
        }
    };

    const calculateScore = () => {
        if (!quizData || !quizData.questionData) return 0;
        let correct = 0;
        selectedAnswers.forEach((answer, index) => {
            if (quizData.questionData && answer === quizData.questionData[index]?.correct) {
                correct++;
            }
        });
        return Math.round((correct / quizData.questionData.length) * 100);
    };

    const handleExit = () => {
        if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
            router.push(`/dashboard/${params.course}/quizzes`);
        }
    };

    const handleRetake = () => {
        if (!quizData) return;
        setCurrentQuestion(0);
        setSelectedAnswers(new Array(quizData.questionData?.length || 0).fill(-1));
        setShowResults(false);
        setQuizStarted(false);
        const timeMatch = quizData.time.match(/(\d+)/);
        if (timeMatch) {
            setTimeLeft(parseInt(timeMatch[1]) * 60);
        }
    };

    if (!courseData || !quizData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-textSecondary">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300">
                <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-textPrimary mb-4">{quizData.title}</h1>
                            <div className="flex items-center justify-center gap-6 text-textSecondary">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{quizData.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={quizData.difficulty === "Easy" ? "success" : quizData.difficulty === "Medium" ? "warning" : "secondary"}>
                                        {quizData.difficulty}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>{quizData.questions} Questions</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-accent/5 p-6 rounded-lg border border-accent/10 mb-8">
                            <h3 className="font-bold text-accent mb-2">Quiz Instructions</h3>
                            <ul className="text-sm text-textSecondary space-y-1">
                                <li>• Answer all questions to the best of your ability</li>
                                <li>• You have {quizData.time} to complete the quiz</li>
                                <li>• You can navigate between questions</li>
                                <li>• Your score will be calculated automatically</li>
                            </ul>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => router.push(`/dashboard/${params.course}/quizzes`)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleStartQuiz} className="px-8">
                                Start Quiz
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (showResults) {
        const score = calculateScore();
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300">
                {/* Header */}
                <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16">
                    <div>
                        <h1 className="text-lg font-bold text-textPrimary">{quizData.title} - Results</h1>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    <Card className="max-w-2xl w-full p-8 bg-surface/90 border border-white/10 mx-auto">
                        <div className="text-center mb-8">
                            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${score >= 70 ? 'bg-green-500/20 text-green-400' : score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {score >= 70 ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                            </div>
                            <h1 className="text-3xl font-bold text-textPrimary mb-2">Quiz Complete!</h1>
                            <p className="text-xl text-textSecondary mb-4">Your Score: {score}%</p>
                            <Badge variant={score >= 70 ? "success" : score >= 50 ? "warning" : "secondary"} className="text-lg px-4 py-2">
                                {score >= 70 ? "Excellent!" : score >= 50 ? "Good Job!" : "Keep Practicing!"}
                            </Badge>
                            <div className="mt-4 flex items-center justify-center gap-2 text-textSecondary">
                                <Clock className="w-4 h-4" />
                                <span>Time Taken: {formatTime(quizTimeTaken)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {quizData.questionData?.map((question: any, index: number) => (
                                <div key={index} className="p-4 rounded-lg border border-white/5 bg-surface/20">
                                    <div className="flex items-start gap-3">
                                        {selectedAnswers[index] === question.correct ? (
                                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-textPrimary mb-2">{question.question}</p>
                                            <p className="text-sm text-textSecondary">
                                                Your answer: {question.options[selectedAnswers[index]] || 'Not answered'}
                                            </p>
                                            {selectedAnswers[index] !== question.correct && (
                                                <p className="text-sm text-green-400 mt-1">
                                                    Correct: {question.options[question.correct]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={handleRetake}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retake Quiz
                            </Button>
                            <Button onClick={() => router.push(`/dashboard/${params.course}/quizzes`)}>
                                Back to Quizzes
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }


    const currentQ = quizData?.questionData?.[currentQuestion];

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
                {/* Left */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-textPrimary">
                            {quizData.title}
                        </h1>

                        <Badge
                            variant={
                                quizData.difficulty === "Hard"
                                    ? "warning"
                                    : quizData.difficulty === "Medium"
                                        ? "default"
                                        : "secondary"
                            }
                            className="uppercase text-[10px]"
                        >
                            {quizData.difficulty}
                        </Badge>
                    </div>

                    <div className="text-xs text-textSecondary">
                        Question {currentQuestion + 1} of {quizData.questionData?.length || 0}
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">
                            Time Remaining
                        </div>
                        <div className="font-mono text-xl text-accent font-bold tabular-nums">
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={handleExit}
                    >
                        Exit
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden transition-all duration-300">
                {/* Question Area */}
                <div className={cn(
                    "w-full bg-background relative flex flex-col min-h-[50vh] lg:min-h-full transition-all duration-300",
                    navigatorOpen ? "lg:col-span-9" : "lg:col-span-12"
                )}>
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                        {currentQ && (
                            <div className="max-w-4xl mx-auto w-full py-6">
                                <div className="flex items-start justify-between mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-textPrimary leading-relaxed flex-1">{currentQ.question}</h2>
                                    <button
                                        onClick={() => toggleStarQuestion(currentQuestion)}
                                        className="ml-4 p-2 rounded-lg border border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-accent/10 transition-all group"
                                        title={starredQuestions.has(currentQuestion) ? "Remove from important" : "Mark as important"}
                                    >
                                        <Star className={`w-5 h-5 ${starredQuestions.has(currentQuestion) ? 'fill-accent text-accent' : 'text-textSecondary group-hover:text-accent'} transition-colors`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {currentQ.options.map((option: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQuestion, index)}
                                            className={`w-full p-5 rounded-xl border text-left transition-all group ${selectedAnswers[currentQuestion] === index
                                                ? 'border-accent bg-accent/10 text-accent shadow-[0_0_20px_-5px_rgba(var(--accent),0.3)]'
                                                : 'border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-surface/60 text-textPrimary'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAnswers[currentQuestion] === index
                                                    ? 'border-accent bg-accent text-white'
                                                    : 'border-white/20 group-hover:border-accent'
                                                    }`}>
                                                    {selectedAnswers[currentQuestion] === index && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm animate-in zoom-in duration-200"></div>
                                                    )}
                                                </div>
                                                <span className="text-lg">{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toggle Navigator Button (for collapsed state) */}
                {!navigatorOpen && (
                    <button
                        onClick={() => setNavigatorOpen(true)}
                        className="fixed right-0 top-1/2 -translate-y-1/2 bg-accent text-white p-2 rounded-l-lg shadow-lg z-30 hover:pr-4 transition-all"
                        title="Open Navigator"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {/* Navigation & Progress */}
                <div className={cn(
                    "w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 transition-all duration-300 relative",
                    !navigatorOpen && "lg:hidden"
                )}>
                    <button
                        onClick={() => setNavigatorOpen(false)}
                        className="absolute -left-3 top-6 z-10 bg-surface border border-white/10 rounded-full p-1 text-textSecondary hover:text-white shadow-sm hidden lg:block"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>

                    <h3 className="font-bold text-xs mb-6 uppercase text-textSecondary tracking-widest flex justify-between items-center">
                        Navigator
                    </h3>

                    {/* Calculator Toggle */}
                    <div className="mb-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCalculatorOpen(!calculatorOpen)}
                            className="w-full border-accent/20 text-accent hover:bg-accent/10"
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            {calculatorOpen ? 'Hide Calculator' : 'Show Calculator'}
                        </Button>
                    </div>

                    {/* Calculator */}
                    {calculatorOpen && (
                        <div className="mb-6 p-4 bg-surface/50 rounded-lg border border-white/10">
                            <div className="bg-black/50 rounded p-3 mb-3 text-right text-textPrimary font-mono text-lg">
                                {calcDisplay}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={handleCalcClear} className="col-span-2 p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">C</button>
                                <button onClick={handleCalcBackspace} className="p-2 bg-surface/40 text-textSecondary rounded hover:bg-surface/60">←</button>
                                <button onClick={() => handleCalcOperation('/')} className="p-2 bg-accent/20 text-accent rounded hover:bg-accent/30">÷</button>

                                <button onClick={() => handleCalcNumber('7')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">7</button>
                                <button onClick={() => handleCalcNumber('8')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">8</button>
                                <button onClick={() => handleCalcNumber('9')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">9</button>
                                <button onClick={() => handleCalcOperation('*')} className="p-2 bg-accent/20 text-accent rounded hover:bg-accent/30">×</button>

                                <button onClick={() => handleCalcNumber('4')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">4</button>
                                <button onClick={() => handleCalcNumber('5')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">5</button>
                                <button onClick={() => handleCalcNumber('6')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">6</button>
                                <button onClick={() => handleCalcOperation('-')} className="p-2 bg-accent/20 text-accent rounded hover:bg-accent/30">−</button>

                                <button onClick={() => handleCalcNumber('1')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">1</button>
                                <button onClick={() => handleCalcNumber('2')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">2</button>
                                <button onClick={() => handleCalcNumber('3')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">3</button>
                                <button onClick={() => handleCalcOperation('+')} className="p-2 bg-accent/20 text-accent rounded hover:bg-accent/30">+</button>

                                <button onClick={() => handleCalcNumber('0')} className="col-span-2 p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">0</button>
                                <button onClick={() => handleCalcNumber('.')} className="p-2 bg-surface/40 text-textPrimary rounded hover:bg-surface/60">.</button>
                                <button onClick={handleCalcEquals} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">=</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-5 gap-2 mb-8 content-start">
                        {quizData.questionData?.map((_: any, index: number) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`aspect-square rounded-md border text-sm font-bold transition-all ${index === currentQuestion
                                    ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20'
                                    : selectedAnswers[index] !== -1
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
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className="flex-1"
                            >
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleNext}
                                disabled={currentQuestion === (quizData.questionData?.length || 0) - 1}
                                className="flex-1"
                            >
                                Next
                            </Button>
                        </div>
                        <Button
                            size="lg"
                            className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90 text-white"
                            onClick={handleSubmitQuiz}
                        >
                            Submit Quiz
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
