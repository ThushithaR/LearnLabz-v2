"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, Moon, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { courses, CourseId } from "@/lib/courses";
import { getNumericalById, submitNumericalAttempt } from "@/lib/supabase/numericals";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import BFSTreeTraversal from "@/lib/numericals/aiml/numericals";
import DFSGraphTraversal from "@/lib/numericals/aiml/numerical_dfs";
import CodingChallengePageOne from "@/lib/numericals/nlp/numericals_code1";
import TFIDFNumericalPage from "@/lib/numericals/nlp/numericals_tfidf";

export default function NumericalsSolvePage({ params }: { params: { id: string, course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// Numerical Workspace\n// Loading problem...\n`);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [correctSolution, setCorrectSolution] = useState<string>(`// Correct Solution Step 1: `); // This is the solution you want to compare against
  const [rootNodeValue, setRootNodeValue] = useState<number | string>('');
  const [nodesPruned, setNodesPruned] = useState<number | string>('');
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Load starred state on mount
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

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.id, params.course, isTimerRunning]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    localStorage.setItem(`timer_${params.id}`, timer.toString());
    router.push(`/dashboard/${params.course}/numericals`);
  };

  // Calculator Logic
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

  // Handle submission (show results on same page)
  const handleSubmit = async () => {
    setIsTimerRunning(false);

    // Calculate score/correctness 
    const isCorrect = isAnswerCorrect;
    const cpEarned = isCorrect ? numerical.xp : 0;

    if (userId) {
      await submitNumericalAttempt({
        user_id: userId,
        numerical_id: numerical.id,
        is_correct: isCorrect,
        penalty_percent: 0, // Logic for penalty?
        cp: cpEarned,
        time_taken: timer
      });
    }

    setShowResults(true);
    setShowModal(true);
  };

  // Fetch numerical data
  const [numerical, setNumerical] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Check if answer is correct
  const isAnswerCorrect = rootNodeValue.toString().trim() === (numerical?.solution?.toString() || "").trim();
  const isAdditionalCorrect = true; // For now, only one answer field for generic numericals

  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch Numerical
      const numData = await getNumericalById(parseInt(params.id));
      if (!numData) {
        // Fallback for static dev or redirect
        console.error("Numerical not found");
        // router.push("/404");
        return;
      }
      setNumerical(numData);
      setSolution(`// Numerical Workspace\n// Solve "${numData.title}" here\n`);

      // 2. Fetch User for submission
      const user = await getCurrentUserProfile();
      if (user) setUserId(user.user_id);
    };
    loadData();
  }, [params.id]);

  if (!numerical) {
    return <div className="p-8 text-center text-textSecondary">Loading numerical data...</div>;
  }

  // Route to specific solvers based on ID
  if (numerical.id === 404) {
    return <BFSTreeTraversal params={params} />;
  }

  if (numerical.id === 403) {
    return <DFSGraphTraversal params={params} />;
  }

  if (numerical.id === 101) {
    return <BFSTreeTraversal params={params} />;
  }

  if (numerical.id === 102) {
    return <DFSGraphTraversal params={params} />;
  }

  if (numerical.id === 401) {
    return <CodingChallengePageOne params={params} />;
  }

  if (numerical.id === 402) {
    return <TFIDFNumericalPage params={params} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">{numerical.title}</h1>
          <p className="text-sm text-textSecondary">Numerical Challenge #{numerical.id}   • {numerical.description}</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {!showResults && (
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
            {showResults ? "Done" : "Exit"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!showResults ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 h-fit lg:h-full">
            {/* Column 1: Problem Statement */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
              <Badge
                variant={
                  numerical.difficulty === "Hard" ? "warning" :
                    numerical.difficulty === "Medium" ? "secondary" : "outline" // Changed variants to match Badge component
                }
                className="mb-4"
              >
                {numerical.difficulty}
              </Badge>
              <h2 className="text-xl font-bold mb-4 text-textPrimary">{numerical.title}</h2>
              <div className="text-sm text-textSecondary leading-relaxed mb-6 space-y-4">
                {numerical.description.split('\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {numerical.id < 200 && (
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 mb-6 flex justify-center">
                  {/* Mock Tree Visual */}
                  <svg width="200" height="150" viewBox="0 0 200 150" fill="none" stroke="currentColor">
                    <circle cx="100" cy="20" r="10" stroke="#facc15" strokeWidth="2" />
                    <line x1="100" y1="30" x2="60" y2="70" strokeOpacity="0.3" />
                    <line x1="100" y1="30" x2="140" y2="70" strokeOpacity="0.3" />
                    <circle cx="60" cy="80" r="10" strokeOpacity="0.5" />
                    <circle cx="140" cy="80" r="10" strokeOpacity="0.5" />
                    <text x="50" y="110" fill="white" fontSize="12">3</text>
                    <text x="130" y="110" fill="white" fontSize="12">5</text>
                  </svg>
                </div>
              )}

              {/* Collapsible Hint */}
              <div className="mt-auto">
                <div
                  className="flex justify-between items-center cursor-pointer p-2 rounded-lg select-none hover:bg-accent/10 transition-colors"
                  onClick={() => setHintOpen(!hintOpen)}
                >
                  <span className="text-xs font-bold text-accent">HINT</span>
                  <span
                    className={`transition-transform duration-300 ease-in-out transform ${hintOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    {hintOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </div>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${hintOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}`}
                >
                  <div className="p-3 border-l-2 border-accent text-xs text-textSecondary">
                    Remember that the root is a Maximizer, so it will choose the child with the highest value.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Workspace */}
            <div className="w-full lg:col-span-6 bg-[#0F0E0D] relative flex flex-col min-h-[50vh] lg:min-h-full">
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
                <Button size="sm" variant="secondary" onClick={() => setSolution('')}>
                  Clear
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

              <textarea
                ref={textAreaRef}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className={cn(
                  "flex-1 w-full p-6 md:p-8 font-mono resize-none focus:outline-none text-sm leading-7 transition-colors duration-300",
                  workspaceTheme === 'dark' ? "bg-transparent text-white" : "bg-white text-black"
                )}
                placeholder="// step-by-step scratchpad..."
              />
            </div>

            {/* Column 3: Submission & Results */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Final Answer</h3>

              <div className="space-y-6 mb-8 lg:mb-auto">
                <div>
                  <label className="text-xs font-medium text-textSecondary mb-2 block">Final Answer</label>
                  <input
                    type="text"
                    value={rootNodeValue}
                    onChange={(e) => setRootNodeValue(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent text-lg font-mono transition-all focus:ring-1 ring-accent/50"
                    placeholder="Enter your result..."
                  />
                </div>
              </div>

              <Button size="lg" className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20" onClick={handleSubmit}>
                Submit Solution
              </Button>
            </div>
          </div>
        ) : (
          /* Unified Analysis View */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce duration-[2000ms]",
                isAnswerCorrect && true ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
              )}>
                {isAnswerCorrect && true ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {isAnswerCorrect && true ? "Masterfully Solved!" : "Concept Check Required"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                {isAnswerCorrect && true
                  ? "You've accurately calculated the optimal moves and pruning points. Your understanding of the Minimax algorithm is solid."
                  : "Some calculations didn't quite match the optimal solution. Let's break down the logic below to refine your approach."}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Performance tapped</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(timer)}</div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Calculation Accuracy</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {isAnswerCorrect ? 100 : 0}%
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Experience Earned</div>
                <div className="text-2xl font-bold text-accent mb-1">+{isAnswerCorrect ? numerical.xp : 0} XP</div>
              </Card>
            </div>

            {/* Side-by-Side Solution Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Your Workspace Analysis</h3>
                  <Badge variant="secondary" className="bg-white/5 border-white/10">Input</Badge>
                </div>
                <div className="bg-surface/30 rounded-2xl border border-white/5 p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 font-mono text-sm leading-relaxed text-textSecondary relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  </div>
                  {solution.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="w-4 text-textSecondary/30 text-[10px] pt-1">{i + 1}</span>
                      <span>{line || ' '}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Optimal Solution Walkthrough</h3>
                  <Badge variant="outline" className="border-accent/30 text-accent">Verified</Badge>
                </div>
                <div className="bg-accent/5 rounded-2xl border border-accent/10 p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/10 font-mono text-sm leading-relaxed text-textPrimary">
                  {correctSolution.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="w-4 text-accent/30 text-[10px] pt-1">{i + 1}</span>
                      <span>{line || ' '}</span>
                    </div>
                  ))}
                  <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Key Takeaway</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      Review the steps above to understand the core concepts. Practice consistently to master these numerical patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Depth Feedback Section */}
            <Card className="p-8 bg-surface/20 border border-white/5 mb-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-accent/10 transition-colors duration-1000" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sun className="w-5 h-5 text-accent" /> Concept Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-textSecondary">
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Performance Analysis</h4>
                    <p className="mb-4">
                      Your answer was <span className={cn("font-bold px-1.5 py-0.5 rounded", isAnswerCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>{isAnswerCorrect ? "Correct" : "Incorrect"}</span>.
                    </p>
                    <p>
                      The expected solution involves applying the specific formulas and logic for this topic. Ensure you've followed each step carefully in your workspace.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Efficiency & Accuracy</h4>
                    <p className="mb-4">
                      Time taken: {formatTime(timer)}. Accuracy is key to mastering these challenges.
                    </p>
                    <p>
                      Double-check your calculations and ensure you're using the correct units or state space representations.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-white/5">
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none"
                  onClick={() => window.location.reload()}
                >
                  Clear & Try Again
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
