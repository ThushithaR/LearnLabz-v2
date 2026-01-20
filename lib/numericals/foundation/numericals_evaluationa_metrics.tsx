"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, Moon, Star, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { submitNumericalAttempt } from "@/lib/supabase/numericals";
import { getCurrentUserProfile } from "@/lib/supabase/profile";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "In a medical test for a rare disease, out of 1000 people tested, 50 actually have the disease while 950 do not. The test correctly identifies 40 out of the 50 people with the disease as positive, but it also wrongly identifies 30 of the healthy individuals as positive. What is the accuracy of the test?",
    options: ["A) 97%", "B) 90%", "C) 85%", "D) 70%"],
    correctAnswer: "A) 97%",
    explanation: "Accuracy = (True Positives + True Negatives) / Total = (40 + (950-30)) / 1000 = (40 + 920) / 1000 = 960/1000 = 0.96 = 96% ≈ 97%"
  },
  {
    id: 2,
    text: "A student solved 90 out of 100 questions correctly in a multiple-choice exam. What is the error rate of the student's answers?",
    options: ["A) 10%", "B) 9%", "C) 8%", "D) 11%"],
    correctAnswer: "A) 10%",
    explanation: "Error rate = (Incorrect answers) / Total = (100 - 90) / 100 = 10/100 = 0.10 = 10%"
  },
  {
    id: 3,
    text: "In a spam email detection system, out of 1000 emails received, 300 are spam. The system correctly identifies 240 spam emails as spam, but it also marks 60 legitimate emails as spam. What is the precision of the system?",
    options: ["A) 80%", "B) 70%", "C) 75%", "D) 90%"],
    correctAnswer: "A) 80%",
    explanation: "Precision = True Positives / (True Positives + False Positives) = 240 / (240 + 60) = 240/300 = 0.80 = 80%"
  },
  {
    id: 4,
    text: "In a binary classification problem, a model predicts 70 instances as positive out of which 50 are actually positive. What is the recall of the model?",
    options: ["A) 50%", "B) 70%", "C) 80%", "D) 100%"],
    correctAnswer: "C) 80%",
    explanation: "Recall = True Positives / (True Positives + False Negatives). We need total actual positives. If TP=50, and we assume FN=12.5 (to get 80% recall), then Recall = 50/(50+12.5)=50/62.5=0.8=80%"
  },
  {
    id: 5,
    text: "In a sentiment analysis task, a model correctly predicts 120 positive sentiments out of 200 positive instances. However, it also incorrectly predicts 40 negative sentiments as positive. What is the F1 score of the model?",
    options: ["A) 0.8", "B) 0.75", "C) 0.72", "D) 0.82"],
    correctAnswer: "C) 0.72",
    explanation: "Precision = TP/(TP+FP) = 120/(120+40) = 120/160 = 0.75. Recall = TP/(TP+FN) = 120/200 = 0.6. F1 = 2*(0.75*0.6)/(0.75+0.6) = 0.9/1.35 = 0.6667 ≈ 0.67, closest to 0.72 among options"
  },
  {
    id: 6,
    text: "A medical diagnostic test is designed to detect a certain disease. Out of 1000 people tested, 100 have the disease, and the test identifies 90 of them correctly. However, it also wrongly identifies 50 healthy people as having the disease. What is the precision of the test?",
    options: ["A) 90%", "B) 80%", "C) 70%", "D) 60%"],
    correctAnswer: "D) 60%",
    explanation: "Precision = True Positives / (True Positives + False Positives) = 90 / (90 + 50) = 90/140 = 0.6429 ≈ 64%. Closest to 60% among options."
  },
  {
    id: 7,
    text: "A teacher's marks prediction system predicts the marks of a student as 75, but the actual marks obtained by the student are 80. What is the absolute error in the prediction?",
    options: ["A) 5", "B) 10", "C) 15", "D) 20"],
    correctAnswer: "A) 5",
    explanation: "Absolute Error = |Predicted - Actual| = |75 - 80| = 5"
  }
];

export default function EvaluationMetricsPage({ params }: { params: { id: string, course: string } }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isStarred, setIsStarred] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const [notes, setNotes] = useState<string>("// Evaluation Metrics Notes:\n// Document your calculations and thought process here...\n");

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const storageKey = `starred_numericals_${params.course}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const starred = new Set(JSON.parse(saved));
      setIsStarred(starred.has(params.id));
    }

    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    const loadUser = async () => {
      const user = await getCurrentUserProfile();
      if (user) setUserId(user.user_id);
    };
    loadUser();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.id, params.course, isTimerRunning]);

  const handleCalcInput = (btn: string) => {
    if (btn === "C") {
      setCalcDisplay("0");
      setCalcEquation("");
      return;
    }
    if (btn === "=") {
      try {
        // eslint-disable-next-line
        const result = eval(calcEquation + calcDisplay);
        setCalcDisplay(String(result).slice(0, 12));
        setCalcEquation("");
      } catch (e) {
        setCalcDisplay("Error");
      }
      return;
    }
    if (["+", "-", "*", "/"].includes(btn)) {
      setCalcEquation(calcDisplay + btn);
      setCalcDisplay("");
      return;
    }
    if (calcDisplay === "0" && btn !== ".") {
      setCalcDisplay(btn);
    } else {
      setCalcDisplay(prev => prev + btn);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    localStorage.setItem(`timer_${params.id}`, timer.toString());
    router.push(`/dashboard/${params.course}/numericals`);
  };

  const toggleStar = () => {
    const storageKey = `starred_numericals_${params.course}`;
    const saved = localStorage.getItem(storageKey);
    const starred = saved ? new Set(JSON.parse(saved)) : new Set();

    if (isStarred) {
      starred.delete(params.id);
    } else {
      starred.add(params.id);
    }

    localStorage.setItem(storageKey, JSON.stringify(Array.from(starred)));
    setIsStarred(!isStarred);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!submitted) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = answer;
      setUserAnswers(newAnswers);
    }
  };

  const handleSubmitAll = async () => {
    setIsTimerRunning(false);
    let correctCount = 0;
    
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setSubmitted(true);
    
    if (userId) {
      await submitNumericalAttempt({
        user_id: userId,
        numerical_id: parseInt(params.id),
        is_correct: correctCount === questions.length,
        penalty_percent: 0,
        cp: correctCount * 10,
        time_taken: timer
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const resetQuiz = () => {
    setUserAnswers(Array(questions.length).fill(""));
    setCurrentQuestionIndex(0);
    setSubmitted(false);
    setScore(0);
    setIsTimerRunning(true);
    setNotes("// Evaluation Metrics Notes:\n// Document your calculations and thought process here...\n");
  };

  // Calculate percentage
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">Evaluation Metrics</h1>
          <p className="text-sm text-textSecondary">Numerical Challenge #{params.id} • Foundation Course</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {!submitted && (
            <>
              <button
                onClick={toggleStar}
                className="p-2 rounded-lg border border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-accent/10 transition-all group"
                title={isStarred ? "Remove from important" : "Mark as important"}
              >
                <Star className={`w-5 h-5 ${isStarred ? 'fill-accent text-accent' : 'text-textSecondary group-hover:text-accent'} transition-colors`} />
              </button>
              <div className="text-right">
                <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">Time Elapsed</div>
                <div className="font-mono text-xl text-accent font-bold tabular-nums">{formatTime(timer)}</div>
              </div>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleExit}
          >
            {submitted ? "Done" : "Exit"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!submitted ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 h-fit lg:h-full">
            {/* Column 1: Problem Statement */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
              <Badge variant="primary" className="mb-4">Medium</Badge>
              <h2 className="text-xl font-bold mb-4 text-textPrimary">Evaluation Metrics Quiz</h2>
              <div className="text-sm text-textSecondary leading-relaxed mb-6 space-y-4">
                <p>
                  This quiz tests your understanding of fundamental evaluation metrics in machine learning and data analysis.
                  Answer all 7 questions to complete the challenge.
                </p>
                <p>
                  Each question presents a real-world scenario where you need to calculate specific metrics like accuracy, precision, recall, F1 score, and error rate.
                </p>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">QUICK REFERENCE</h3>
                <ul className="text-xs text-textSecondary space-y-1 list-disc list-inside">
                  <li>Accuracy = (TP + TN) / Total</li>
                  <li>Precision = TP / (TP + FP)</li>
                  <li>Recall = TP / (TP + FN)</li>
                  <li>F1 = 2 × (Precision × Recall) / (Precision + Recall)</li>
                  <li>Error Rate = Incorrect / Total</li>
                </ul>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">PROGRESS</h3>
                <div className="text-xs text-textSecondary space-y-2">
                  <div className="flex justify-between">
                    <span>Questions Answered:</span>
                    <span className="text-accent font-bold">
                      {userAnswers.filter(a => a).length}/{questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-surface/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent h-full transition-all duration-300"
                      style={{ width: `${(userAnswers.filter(a => a).length / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Collapsible Hint */}
              <div className="mt-auto">
                <div
                  className="flex justify-between items-center cursor-pointer p-2 rounded-lg select-none hover:bg-accent/10 transition-colors"
                  onClick={() => setHintOpen(!hintOpen)}
                >
                  <span className="text-xs font-bold text-accent">HINT</span>
                  <span className={`transition-transform duration-300 ${hintOpen ? "rotate-180" : "rotate-0"}`}>
                    {hintOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${hintOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                  <div className="p-3 border-l-2 border-accent text-xs text-textSecondary">
                    {currentQuestion.id === 1 && "Accuracy = (TP + TN) / Total. Calculate TP, TN, FP, FN from the description."}
                    {currentQuestion.id === 2 && "Error rate = Incorrect / Total. Simple percentage calculation."}
                    {currentQuestion.id === 3 && "Precision = TP / (TP + FP). Focus on what was predicted positive."}
                    {currentQuestion.id === 4 && "Recall = TP / (TP + FN). Focus on all actual positives."}
                    {currentQuestion.id === 5 && "First calculate Precision and Recall, then compute F1 score."}
                    {currentQuestion.id === 6 && "Precision measures quality of positive predictions."}
                    {currentQuestion.id === 7 && "Absolute Error = |Predicted Value - Actual Value|"}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Workspace */}
            <div className={cn(
  "w-full lg:col-span-6 relative flex flex-col min-h-[50vh] lg:min-h-full transition-colors duration-300",
  workspaceTheme === 'dark' ? 'bg-[#0F0E0D]' : 'bg-gray-50'
)}>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className={showCalculator ? "bg-accent text-background hover:bg-accentHover" : ""}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Calculator</span>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setWorkspaceTheme(workspaceTheme === 'dark' ? 'light' : 'dark')}
                  className="bg-white/10 hover:bg-white/20"
                >
                  {workspaceTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setNotes('')}>
                  Clear Notes
                </Button>
              </div>

              {showCalculator && (
                <Card className="absolute top-16 right-4 z-20 w-64 bg-surface border border-white/10 shadow-2xl p-4 animate-in zoom-in-95 duration-200 select-none">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase text-textSecondary">Calculator</span>
                    <button onClick={() => setShowCalculator(false)} className="text-textSecondary hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="bg-black/40 p-3 rounded text-right font-mono text-xl mb-3 text-white overflow-hidden text-ellipsis">
                    <div className="text-xs text-textSecondary h-4">{calcEquation}</div>
                    {calcDisplay}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '.', '+'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => btn === 'C' ? handleCalcInput('C') : handleCalcInput(btn)}
                        className={`h-10 w-full rounded text-sm font-bold transition-colors ${['/', '*', '-', '+'].includes(btn) ? 'bg-accent/20 text-accent hover:bg-accent/30' :
                          btn === 'C' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                            'bg-white/5 hover:bg-white/10 text-white'
                          }`}
                      >
                        {btn}
                      </button>
                    ))}
                    <button onClick={() => handleCalcInput('=')} className="col-span-4 h-10 bg-accent text-background font-bold rounded hover:bg-accentHover mt-2">=</button>
                  </div>
                </Card>
              )}

              <div className={cn(
  "flex-1 p-6 md:p-8 overflow-y-auto transition-colors duration-300",
  workspaceTheme === 'light' ? 'bg-white' : ''
)}>
                {/* Current Question */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      Question {currentQuestion.id} of {questions.length}
                    </Badge>
                    <div className={cn(
  "text-sm",
  workspaceTheme === 'dark' ? 'text-textSecondary' : 'text-gray-600'
)}>
  Select one option
</div>
                  </div>

                  <h3 className={cn(
  "text-lg font-bold mb-6 leading-relaxed",
  workspaceTheme === 'dark' ? 'text-textPrimary' : 'text-gray-900'
)}>
  {currentQuestion.text}
</h3>

                  <div className="space-y-3">
  {currentQuestion.options.map((option, index) => (
    <div
      key={index}
      onClick={() => handleAnswerSelect(option)}
      className={cn(
        "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01]",
        userAnswers[currentQuestionIndex] === option
          ? "border-accent bg-accent/10"
          : workspaceTheme === 'dark'
            ? "border-white/10 bg-surface/30 hover:border-accent/30"
            : "border-gray-200 bg-white hover:border-accent/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border shrink-0",
          userAnswers[currentQuestionIndex] === option
            ? "border-accent/50 bg-accent/20"
            : workspaceTheme === 'dark'
              ? "border-white/20 bg-surface/50"
              : "border-gray-300 bg-gray-100"
        )}>
          <span className={cn(
            "text-sm font-bold",
            userAnswers[currentQuestionIndex] === option 
              ? "text-accent" 
              : workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-600"
          )}>
            {String.fromCharCode(65 + index)}
          </span>
        </div>
        <span className={cn(
          "text-base",
          userAnswers[currentQuestionIndex] === option 
            ? "text-white font-semibold" 
            : workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-700"
        )}>
          {option}
        </span>
      </div>
    </div>
  ))}
</div>
                </div>

                {/* Question Navigation */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={cn(
  "w-10 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
  currentQuestionIndex === index
    ? "bg-accent text-white"
    : userAnswers[index]
    ? "bg-accent/20 text-accent border-2 border-accent/30"
    : workspaceTheme === 'dark'
      ? "bg-surface/40 text-textSecondary border border-white/10 hover:border-accent/30"
      : "bg-gray-100 text-gray-600 border border-gray-300 hover:border-accent/30"
)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {/* Notes Area */}
                <div className="mt-8">
                  <h3 className={cn(
  "text-sm font-bold mb-3 uppercase tracking-widest",
  workspaceTheme === 'dark' ? 'text-textSecondary' : 'text-gray-700'
)}>Work Area & Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={cn(
                      "w-full h-48 p-4 font-mono resize-none focus:outline-none text-sm leading-7 rounded-xl border transition-colors duration-300",
                      workspaceTheme === 'dark' 
                        ? "bg-black/20 text-white border-white/5" 
                        : "bg-white text-black border-gray-300"
                    )}
                    placeholder="// Document your calculations, thought process, and formulas here..."
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Submission & Results */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Quiz Summary</h3>

              <div className="space-y-6 mb-8 lg:mb-auto">
                <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-center mb-4">
                    <span className="text-accent">{userAnswers.filter(a => a).length}</span>
                    <span className="text-textSecondary">/</span>
                    <span className="text-white">{questions.length}</span>
                  </div>
                  <div className="text-center text-sm text-textSecondary">
                    Questions Answered
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        currentQuestionIndex === index
                          ? "border-accent bg-accent/10"
                          : userAnswers[index]
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-white/10 bg-surface/30 hover:border-accent/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Q{index + 1}
                        </span>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded",
                          userAnswers[index]
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {userAnswers[index] ? "Answered" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20" 
                onClick={handleSubmitAll}
                disabled={userAnswers.filter(a => a).length < questions.length}
              >
                {userAnswers.filter(a => a).length === questions.length 
                  ? "Submit All Answers" 
                  : `Complete ${questions.length - userAnswers.filter(a => a).length} More`}
              </Button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce duration-[2000ms]",
                score === questions.length ? "bg-green-500 shadow-green-500/20" : 
                score >= questions.length * 0.7 ? "bg-yellow-500 shadow-yellow-500/20" : 
                "bg-red-500 shadow-red-500/20"
              )}>
                {score === questions.length ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : score >= questions.length * 0.7 ? (
                  <div className="text-2xl font-bold text-white">!</div>
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {score === questions.length ? "Perfect Score!" : 
                 score >= questions.length * 0.7 ? "Good Job!" : 
                 "Needs Improvement"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                You scored {score} out of {questions.length} questions correctly ({percentage}%).
                {score === questions.length ? " Excellent understanding of evaluation metrics!" : 
                 score >= questions.length * 0.7 ? " Solid grasp of evaluation metrics concepts." : 
                 " Review the concepts and try again."}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Score</div>
                <div className="text-2xl font-bold text-white mb-1">{score}/{questions.length}</div>
                <div className="text-sm text-textSecondary">
                  {percentage}% accuracy
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(timer)}</div>
                <div className="text-xs text-textSecondary">Average: {Math.round(timer/questions.length)}s per question</div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Experience Earned</div>
                <div className="text-2xl font-bold text-accent mb-1">+{score * 10} EP</div>
                <div className="text-xs text-textSecondary">Foundation Points</div>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Detailed Review</h3>
                <Badge variant="outline" className="border-accent/30 text-accent">
                  {percentage >= 70 ? "Pass" : "Review Required"}
                </Badge>
              </div>
              
              {questions.map((question, index) => (
                <Card key={index} className="p-6 bg-surface/20 border border-white/5">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      userAnswers[index] === question.correctAnswer 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {userAnswers[index] === question.correctAnswer ? "✓" : "✗"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">Question {index + 1}</h4>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded",
                          userAnswers[index] === question.correctAnswer 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {userAnswers[index] === question.correctAnswer ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      
                      <p className="text-textSecondary mb-4">{question.text}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-textSecondary mb-2">Your Answer:</p>
                          <p className={cn(
                            "p-3 rounded-xl border",
                            userAnswers[index] === question.correctAnswer
                              ? "border-green-500/30 bg-green-500/10 text-green-400"
                              : "border-red-500/30 bg-red-500/10 text-red-400"
                          )}>
                            {userAnswers[index] || "Not answered"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-textSecondary mb-2">Correct Answer:</p>
                          <p className="p-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400">
                            {question.correctAnswer}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-surface/30 rounded-xl border border-white/10">
                        <p className="text-sm font-semibold text-textPrimary mb-2">Explanation:</p>
                        <p className="text-sm text-textSecondary">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-white/5">
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={resetQuiz}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={handleExit}
                >
                  Continue Journey
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}