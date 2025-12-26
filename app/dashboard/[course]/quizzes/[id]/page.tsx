"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { courses, CourseId } from "@/lib/courses";

export default function QuizSolvePage({ params }: { params: { course: string; id: string } }) {
    const router = useRouter();
    const [courseData, setCourseData] = useState<any>(null);
    const [quizData, setQuizData] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);

    useEffect(() => {
        const course = courses[params.course as CourseId];
        if (!course || !course.features.quizzes) {
            router.push("/404");
            return;
        }
        setCourseData(course);

        // Find the quiz
        const quiz = course.quizzes?.find((q: any) => q.id === parseInt(params.id));
        if (!quiz) {
            router.push("/404");
            return;
        }
        setQuizData(quiz);

        // Set timer (parse time like "15 min" to seconds)
        const timeMatch = quiz.time.match(/(\d+)/);
        if (timeMatch) {
            setTimeLeft(parseInt(timeMatch[1]) * 60);
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
        setQuizStarted(true);
        setSelectedAnswers(new Array(quizData.questionData?.length || 0).fill(-1));
    };

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[questionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < (quizData.questionData?.length || 0) - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitQuiz = () => {
        setShowResults(true);
    };

    const calculateScore = () => {
        if (!quizData.questionData) return 0;
        let correct = 0;
        selectedAnswers.forEach((answer, index) => {
            if (answer === quizData.questionData[index]?.correct) {
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
                            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                score >= 70 ? 'bg-green-500/20 text-green-400' : score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                                {score >= 70 ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                            </div>
                            <h1 className="text-3xl font-bold text-textPrimary mb-2">Quiz Complete!</h1>
                            <p className="text-xl text-textSecondary mb-4">Your Score: {score}%</p>
                            <Badge variant={score >= 70 ? "success" : score >= 50 ? "warning" : "secondary"} className="text-lg px-4 py-2">
                                {score >= 70 ? "Excellent!" : score >= 50 ? "Good Job!" : "Keep Practicing!"}
                            </Badge>
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

    const currentQ = quizData.questionData?.[currentQuestion];

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
                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={handleExit}
                >
                Exit
                </Button>
            </div>
            </div>

            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
                {/* Question Area */}
                <div className="w-full lg:col-span-8 bg-[#0F0E0D] relative flex flex-col min-h-[50vh] lg:min-h-full">
                    <div className="flex-1 p-6 md:p-8">
                        {currentQ && (
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-2xl font-bold text-textPrimary mb-8">{currentQ.question}</h2>
                                <div className="space-y-4">
                                    {currentQ.options.map((option: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQuestion, index)}
                                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                                                selectedAnswers[currentQuestion] === index
                                                    ? 'border-accent bg-accent/10 text-accent'
                                                    : 'border-white/10 bg-surface/20 hover:border-white/20 text-textPrimary'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    selectedAnswers[currentQuestion] === index
                                                        ? 'border-accent bg-accent'
                                                        : 'border-white/20'
                                                }`}>
                                                    {selectedAnswers[currentQuestion] === index && (
                                                        <div className="w-3 h-3 rounded-full bg-background"></div>
                                                    )}
                                                </div>
                                                <span>{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation & Progress */}
                <div className="w-full lg:col-span-4 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0">
                    <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Progress</h3>

                    <div className="grid grid-cols-5 gap-2 mb-8">
                        {quizData.questionData?.map((_: any, index: number) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`aspect-square rounded border-2 text-xs font-bold transition-all ${
                                    index === currentQuestion
                                        ? 'border-accent bg-accent text-background'
                                        : selectedAnswers[index] !== -1
                                        ? 'border-green-400 bg-green-400/10 text-green-400'
                                        : 'border-white/10 bg-surface/20 text-textSecondary hover:border-white/20'
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
                            className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20"
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
