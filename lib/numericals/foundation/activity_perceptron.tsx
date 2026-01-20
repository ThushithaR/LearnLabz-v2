"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, ArrowLeft, AlertCircle, Star, Brain, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { submitNumericalAttempt } from "@/lib/supabase/numericals";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { getNumericalById } from "@/lib/supabase/numericals";

interface TestCase {
  id: number;
  scenario: string;
  factors: {
    remotePerformance: number;
    teamCollaboration: number;
    policySupport: number;
    mutualBenefit: number;
  };
  expectedDecision: "APPROVE" | "DENY";
  explanation: string;
}

interface Factor {
  id: string;
  name: string;
  description: string;
  weight: number;
}

const testCases: TestCase[] = [
  {
    id: 1,
    scenario: "High performer, no meetings, full policy support, high mutual benefit",
    factors: {
      remotePerformance: 90,
      teamCollaboration: 10,
      policySupport: 100,
      mutualBenefit: 95
    },
    expectedDecision: "APPROVE",
    explanation: "Strong remote performance, no team conflicts, full policy support, and high mutual benefit make this an easy approval."
  },
  {
    id: 2,
    scenario: "Average performer, critical team project this week, partial policy support",
    factors: {
      remotePerformance: 60,
      teamCollaboration: 90,
      policySupport: 40,
      mutualBenefit: 50
    },
    expectedDecision: "DENY",
    explanation: "Team collaboration needs outweigh remote work benefits, especially with upcoming critical projects."
  },
  {
    id: 3,
    scenario: "Excellent remote worker, important client meeting, strong mutual benefits",
    factors: {
      remotePerformance: 95,
      teamCollaboration: 70,
      policySupport: 80,
      mutualBenefit: 85
    },
    expectedDecision: "APPROVE",
    explanation: "Despite important meeting, exceptional remote performance and strong mutual benefits justify approval."
  },
  {
    id: 4,
    scenario: "Poor remote history, no policy support, minimal benefits",
    factors: {
      remotePerformance: 30,
      teamCollaboration: 20,
      policySupport: 10,
      mutualBenefit: 25
    },
    expectedDecision: "DENY",
    explanation: "Multiple negative factors with no compelling reason to approve."
  }
];

export default function DecisionSimulatorPage({ params }: { params: { id: string; course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// Manager's Decision Log:\n// Adjust weights and see how your perception affects decisions.\n`);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [numerical, setNumerical] = useState<any>(null);

  // Initial factors
  const initialFactors: Factor[] = [
    { id: "remotePerformance", name: "Remote Performance", description: "Does the employee perform well when working remotely?", weight: 25 },
    { id: "teamCollaboration", name: "Team Collaboration", description: "Are there upcoming team meetings or collaborative projects?", weight: 25 },
    { id: "policySupport", name: "Policy Support", description: "Does the company's policy support remote work?", weight: 25 },
    { id: "mutualBenefit", name: "Mutual Benefit", description: "Is it beneficial for both employee and company?", weight: 25 }
  ];

  const [factors, setFactors] = useState<Factor[]>([...initialFactors]);
  const [currentTestCaseIndex, setCurrentTestCaseIndex] = useState<number>(0);
  const [userDecisions, setUserDecisions] = useState<("APPROVE" | "DENY" | null)[]>(Array(testCases.length).fill(null));
  const [errorMessage, setErrorMessage] = useState<string>("");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserProfile();
      if (user) {
        setUserId(user.user_id);
      }
    };
    fetchUser();

    const fetchNumerical = async () => {
      const numData = await getNumericalById(parseInt(params.id));
      if (numData) {
        setNumerical(numData);
      }
    };
    fetchNumerical();

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
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

  const handleCalcInput = (btn: string) => {
    if (btn === "C") {
      setCalcDisplay("0");
      setCalcEquation("");
      return;
    }
    if (btn === "=") {
      try {
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

  const handleFactorWeightChange = (factorId: string, value: number) => {
    setFactors(prev => {
      const newFactors = prev.map(factor => 
        factor.id === factorId ? { ...factor, weight: value } : factor
      );
      
      const totalWeight = newFactors.reduce((sum, f) => sum + f.weight, 0);
      if (totalWeight !== 100) {
        const scale = 100 / totalWeight;
        return newFactors.map(f => ({ ...f, weight: Math.round(f.weight * scale) }));
      }
      
      return newFactors;
    });
  };

  const calculateDecisionScore = (testCase: TestCase): number => {
    let score = 0;
    factors.forEach(factor => {
      const factorValue = testCase.factors[factor.id as keyof typeof testCase.factors];
      score += (factorValue * factor.weight) / 100;
    });
    return Math.round(score);
  };

  const getDecision = (score: number): "APPROVE" | "DENY" => {
    return score > 65 ? "APPROVE" : "DENY";
  };

  const handleTestCaseDecision = (decision: "APPROVE" | "DENY") => {
    const newDecisions = [...userDecisions];
    newDecisions[currentTestCaseIndex] = decision;
    setUserDecisions(newDecisions);
    
    // Calculate if decision is correct
    const currentTestCase = testCases[currentTestCaseIndex];
    const score = calculateDecisionScore(currentTestCase);
    const expectedDecision = getDecision(score);
    
    if (decision === expectedDecision) {
      setErrorMessage("✓ Correct decision! Move to next case.");
    } else {
      setErrorMessage(`✗ Incorrect. Expected ${expectedDecision} based on your weights.`);
    }
    
    // Update solution notes
    setSolution(prev => prev + `\n// Case ${currentTestCase.id}: ${decision} (Expected: ${expectedDecision}, Score: ${score}/100)\n`);
    
    // Move to next test case after delay
    setTimeout(() => {
      if (currentTestCaseIndex < testCases.length - 1) {
        setCurrentTestCaseIndex(currentTestCaseIndex + 1);
        setErrorMessage("");
      } else {
        setErrorMessage("All test cases completed! Click 'Submit Solution' to finish.");
      }
    }, 1500);
  };

  const resetSimulation = () => {
    setFactors([...initialFactors]);
    setCurrentTestCaseIndex(0);
    setUserDecisions(Array(testCases.length).fill(null));
    setErrorMessage("");
    setSolution(`// Manager's Decision Log:\n// Adjust weights and see how your perception affects decisions.\n`);
  };

  const handleSubmit = async () => {
  setIsTimerRunning(false);

  // Calculate results
  const results = testCases.map((testCase, index) => {
    const score = calculateDecisionScore(testCase);
    const expectedDecision = getDecision(score);
    return userDecisions[index] === expectedDecision;
  });

  const correctCount = results.filter(r => r).length;
  const isCorrect = correctCount === testCases.length;

  // Check workspace content for penalty calculation
  const content = solution.toLowerCase();
  const hasKeywords = ["perceptron", "weights", "factors", "threshold", "score", "decision", "algorithm", "manager", "performance", "collaboration"].some(word => content.includes(word));
  const hasMeaningfulContent = solution.replace(/\/\/.*?\n/g, '').trim().length > 20;

  let penalty = 0;
  if (!hasMeaningfulContent || !hasKeywords) {
    penalty = 15;
  }

  // Calculate XP similar to AI Family Tree activity
  const maxXp = 450; // Maximum XP for this activity
  let finalScore = 0;
  
  if (correctCount === testCases.length) {
    // Perfect score - all test cases correct
    const base = 100;
    const penalized = Math.max(0, base - (hasMeaningfulContent && hasKeywords ? 0 : 15));
    finalScore = Math.floor((penalized / 100) * maxXp);
  } else if (correctCount >= Math.ceil(testCases.length / 2)) {
    // At least half correct
    const percent = (correctCount / testCases.length) * 100;
    const base = Math.max(50, percent);
    const penalized = Math.max(0, base - (hasMeaningfulContent && hasKeywords ? 0 : 15));
    finalScore = Math.floor((penalized / 100) * maxXp * 0.8);
  } else {
    // Less than half correct
    const percent = (correctCount / testCases.length) * 100;
    finalScore = Math.floor((percent / 100) * maxXp * 0.5);
  }

  // Ensure minimum XP of 1 if any correct
  if (correctCount > 0 && finalScore === 0) {
    finalScore = 1;
  }

  if (userId) {
    await submitNumericalAttempt({
      user_id: userId,
      numerical_id: parseInt(params.id),
      is_correct: isCorrect,
      penalty_percent: penalty,
      cp: finalScore,
      time_taken: timer
    });
  }
  setShowResults(true);
};

  const currentTestCase = testCases[currentTestCaseIndex];
  const correctSolution = `// Optimal Manager Decision Framework:

1. Remote Performance (40% weight)
   - Most important factor
   - Directly impacts productivity
   
2. Team Collaboration (30% weight)
   - Critical for project success
   - Affects team morale
   
3. Policy Support (20% weight)
   - Legal and company policy
   - Sets precedence
   
4. Mutual Benefit (10% weight)
   - Win-win situations preferred
   - Long-term relationship

Threshold Calculation:
Score = Σ(factor_value × factor_weight) / 100
Decision: Score > 65 = APPROVE, Score ≤ 65 = DENY

Key Insight:
The perceptron algorithm mimics how managers weigh different factors.
Adjusting weights changes which factors dominate the decision.`;

  if (!numerical) {
    return <div className="p-8 text-center text-textSecondary">Loading numerical data...</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header - Matching DFS header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">Decision Simulator - Manager Perceptron</h1>
          <p className="text-sm text-textSecondary">Perceptron-based Decision Making Algorithm</p>
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
              <Badge variant="warning" className="mb-4">Interactive</Badge>
              <h2 className="text-xl font-bold mb-4 text-textPrimary">Manager Decision Simulator</h2>
              <p className="text-sm text-textSecondary leading-relaxed mb-6">
                Adjust factor weights to match your managerial priorities. Your "perceptron" will make work-from-home decisions based on your weights.
              </p>

              {currentTestCase && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">Test Case #{currentTestCase.id}</Badge>
                    <Badge variant="outline">{currentTestCaseIndex + 1}/{testCases.length}</Badge>
                  </div>
                  <p className="text-sm text-textSecondary mb-4">{currentTestCase.scenario}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Remote Performance</span>
                      <span className="text-accent">{currentTestCase.factors.remotePerformance}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Team Collaboration</span>
                      <span className="text-accent">{currentTestCase.factors.teamCollaboration}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Policy Support</span>
                      <span className="text-accent">{currentTestCase.factors.policySupport}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Mutual Benefit</span>
                      <span className="text-accent">{currentTestCase.factors.mutualBenefit}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTestCaseDecision("APPROVE")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTestCaseDecision("DENY")}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">PERCEPTRON ALGORITHM</h3>
                <ol className="text-xs text-textSecondary space-y-2 list-decimal list-inside">
                  <li>Set weights for each decision factor</li>
                  <li>Calculate weighted sum: Σ(weight × input)</li>
                  <li>Apply threshold: &gt;65 = APPROVE, ≤65 = DENY</li>
                  <li>Compare with expected decision</li>
                  <li>Adjust weights to improve accuracy</li>
                </ol>
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
                    Think like a manager: which factors are most important? Remote performance usually has highest weight.
                    The perceptron learns by adjusting weights to minimize wrong decisions.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Interactive Workspace */}
            <div className={cn(
  "w-full lg:col-span-6 relative flex flex-col min-h-[50vh] lg:min-h-full overflow-hidden transition-colors duration-300",
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
  <Button size="sm" variant="secondary" onClick={resetSimulation}>
    Reset Simulation
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
                        onClick={() => handleCalcInput(btn)}
                        className={`h-10 w-full rounded text-sm font-bold transition-colors ${['/', '*', '-', '+'].includes(btn) ? 'bg-accent/20 text-accent hover:bg-accent/30' :
                          btn === 'C' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                            'bg-white/5 hover:bg-white/10 text-white'}`}
                      >
                        {btn}
                      </button>
                    ))}
                    <button onClick={() => handleCalcInput('=')} className="col-span-4 h-10 bg-accent text-background font-bold rounded hover:bg-accentHover mt-2">=</button>
                  </div>
                </Card>
              )}

              {/* Main Visualization Area */}
              <div className={cn(
  "flex-1 p-6 md:p-8 overflow-y-auto transition-colors duration-300",
  workspaceTheme === 'light' ? 'bg-white' : ''
)}>
                <div className="flex items-center gap-3 mb-6">
  <Brain className="w-5 h-5 text-accent" />
  <h3 className={cn(
    "text-lg font-bold",
    workspaceTheme === 'dark' ? 'text-textPrimary' : 'text-gray-900'
  )}>Perceptron Weight Configuration</h3>
</div>
                
                <div className="space-y-6 mb-8">
                  {factors.map((factor) => (
                    <div key={factor.id} className={cn(
  "p-4 rounded-xl border transition-colors duration-300",
  workspaceTheme === 'dark' 
    ? 'bg-surface/20 border-white/10' 
    : 'bg-white border-gray-200 shadow-sm'
)}>
  <div className="flex justify-between items-center mb-3">
    <div>
      <h4 className={cn(
        "font-semibold",
        workspaceTheme === 'dark' ? 'text-textPrimary' : 'text-gray-900'
      )}>{factor.name}</h4>
      <p className={cn(
        "text-xs",
        workspaceTheme === 'dark' ? 'text-textSecondary' : 'text-gray-600'
      )}>{factor.description}</p>
    </div>
    <span className="font-mono text-accent text-xl">{factor.weight}%</span>
  </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={factor.weight}
                        onChange={(e) => handleFactorWeightChange(factor.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                      />
                      
                      <div className={cn(
  "flex justify-between text-xs mt-2",
  workspaceTheme === 'dark' ? 'text-textSecondary' : 'text-gray-600'
)}>
  <span>Low Priority</span>
  <span>High Priority</span>
</div>
                    </div>
                  ))}
                </div>

                {/* Decision Score Visualization */}
                {currentTestCase && (
                  <div className={cn(
  "rounded-xl border border-accent/20 p-6 mb-6 transition-colors duration-300",
  workspaceTheme === 'dark' ? 'bg-surface/30' : 'bg-white shadow-sm'
)}>
  <div className="flex justify-between items-center mb-4">
    <h4 className={cn(
      "font-semibold",
      workspaceTheme === 'dark' ? 'text-textPrimary' : 'text-gray-900'
    )}>Current Decision Score</h4>
                      <Badge variant={getDecision(calculateDecisionScore(currentTestCase)) === "APPROVE" ? "success" : "destructive"}>
                        {getDecision(calculateDecisionScore(currentTestCase))}
                      </Badge>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-accent mb-2">{calculateDecisionScore(currentTestCase)}/100</div>
                      <div className={cn(
  "text-sm",
  workspaceTheme === 'dark' ? 'text-textSecondary' : 'text-gray-600'
)}>
  Threshold: &gt;65 = APPROVE, ≤65 = DENY
</div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-accent rounded-full h-3 transition-all duration-300"
                        style={{ width: `${calculateDecisionScore(currentTestCase)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className={cn(
                    "rounded-xl p-4 mb-4 flex items-start gap-3 animate-in slide-in-from-top-2",
                    errorMessage.includes("✓") 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : errorMessage.includes("✗")
                      ? "bg-red-500/10 border border-red-500/30"
                      : "bg-blue-500/10 border border-blue-500/30"
                  )}>
                    <AlertCircle className={cn(
                      "w-5 h-5 shrink-0 mt-0.5",
                      errorMessage.includes("✓") ? "text-green-400" :
                      errorMessage.includes("✗") ? "text-red-400" : "text-blue-400"
                    )} />
                    <p className={cn(
                      "text-sm",
                      errorMessage.includes("✓") ? "text-green-300" :
                      errorMessage.includes("✗") ? "text-red-300" : "text-blue-300"
                    )}>{errorMessage}</p>
                  </div>
                )}

                {/* Notes Area */}
                <textarea
  ref={textAreaRef}
  value={solution}
  onChange={(e) => setSolution(e.target.value)}
  className={cn(
    "w-full h-32 p-4 font-mono resize-none focus:outline-none text-sm leading-7 rounded-xl border transition-colors duration-300",
    workspaceTheme === 'dark' 
      ? "bg-black/20 text-white border-white/5" 
      : "bg-white text-black border-gray-300"
  )}
  placeholder="// Document your decision-making process, weight adjustments, and observations..."
/>
              </div>
            </div>

            {/* Column 3: Controls */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0">
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Simulation Controls</h3>

              <div className="space-y-4 mb-auto">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Current Progress</div>
                  <div className="text-xl font-bold text-accent">{currentTestCaseIndex + 1} / {testCases.length}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all duration-300"
                      style={{ width: `${((currentTestCaseIndex) / testCases.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Current Test Case</div>
                  <div className="text-lg font-bold text-white mb-2">Case {currentTestCase.id}</div>
                  <div className="text-xs text-textSecondary line-clamp-2">{currentTestCase.scenario}</div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Weight Distribution</div>
                  <div className="space-y-2">
                    {factors.map(factor => (
                      <div key={factor.id} className="flex justify-between items-center">
                        <span className="text-xs text-textSecondary">{factor.name}</span>
                        <span className="text-sm text-accent font-mono">{factor.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Case Progress */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-textSecondary mb-3">TEST CASE RESULTS</h4>
                  <div className="space-y-2">
                    {testCases.map((testCase, index) => (
                      <div key={testCase.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            index === currentTestCaseIndex ? "bg-accent animate-pulse" :
                            userDecisions[index] === null ? "bg-white/20" :
                            userDecisions[index] === getDecision(calculateDecisionScore(testCase)) ? "bg-green-500" : "bg-red-500"
                          )} />
                          <span className="text-xs text-textSecondary">Case {testCase.id}</span>
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          userDecisions[index] === null ? "text-textSecondary" :
                          userDecisions[index] === getDecision(calculateDecisionScore(testCase)) ? "text-green-400" : "text-red-400"
                        )}>
                          {userDecisions[index] === null ? "Pending" : userDecisions[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20 mt-6 hover:scale-[1.02] transition-transform"
                onClick={handleSubmit}
                disabled={userDecisions.some(d => d === null)}
              >
                {userDecisions.some(d => d === null) ? "Complete All Cases First" : "Submit Solution"}
              </Button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl",
                userDecisions.every((d, i) => d === getDecision(calculateDecisionScore(testCases[i])))
                  ? "bg-green-500 shadow-green-500/20 animate-bounce duration-[2000ms]"
                  : userDecisions.filter((d, i) => d === getDecision(calculateDecisionScore(testCases[i]))).length >= testCases.length * 0.7
                  ? "bg-yellow-500 shadow-yellow-500/20"
                  : "bg-red-500 shadow-red-500/20"
              )}>
                {userDecisions.every((d, i) => d === getDecision(calculateDecisionScore(testCases[i]))) ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {userDecisions.every((d, i) => d === getDecision(calculateDecisionScore(testCases[i])))
                  ? "Perfect Managerial Judgment!"
                  : "Decision Making Analysis"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                You matched {userDecisions.filter((d, i) => d === getDecision(calculateDecisionScore(testCases[i]))).length} out of {testCases.length} test cases correctly.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(timer)}</div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Accuracy Score</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round((userDecisions.filter((d, i) => d === getDecision(calculateDecisionScore(testCases[i]))).length / testCases.length) * 100)}%
                </div>
                <div className="text-xs text-textSecondary">
                  {userDecisions.filter((d, i) => d === getDecision(calculateDecisionScore(testCases[i]))).length}/{testCases.length} correct
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Final Weights</div>
                <div className="text-2xl font-bold text-accent mb-1">{factors.reduce((sum, f) => sum + f.weight, 0)}%</div>
                <div className="text-xs text-accent/60 font-medium">
                  Weight distribution complete
                </div>
              </Card>
            </div>

            {/* Side-by-Side Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Your Decision Log</h3>
                  <Badge variant="secondary" className="bg-white/5 border-white/10">
                    {factors.length} factors configured
                  </Badge>
                </div>
                <div className="bg-surface/30 rounded-2xl border border-white/5 p-6 h-[400px] overflow-y-auto">
                  <div className="space-y-2">
                    {solution.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="w-4 text-textSecondary/30 text-[10px] pt-1">{i + 1}</span>
                        <span className="text-sm text-textSecondary font-mono">{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-surface/40 rounded-xl border border-white/10">
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Your Final Weights</h4>
                    <div className="space-y-1">
                      {factors.map(factor => (
                        <div key={factor.id} className="flex justify-between text-xs">
                          <span className="text-textSecondary">{factor.name}</span>
                          <span className="text-accent">{factor.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Optimal Perceptron</h3>
                  <Badge variant="outline" className="border-accent/30 text-accent">Algorithm Guide</Badge>
                </div>
                <div className="bg-accent/5 rounded-2xl border border-accent/10 p-6 h-[400px] overflow-y-auto">
                  <div className="space-y-2 mb-6">
                    {correctSolution.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="w-4 text-accent/30 text-[10px] pt-1">{i + 1}</span>
                        <span className="text-sm text-textPrimary font-mono">{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Perceptron Learning</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      The perceptron adjusts weights based on errors. If a decision is wrong, it increases weights for factors that would have led to the correct decision and decreases others.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Case Analysis */}
            <Card className="p-8 bg-surface/20 border border-white/5 mb-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-accent/10 transition-colors duration-1000" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-accent" /> Test Case Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {testCases.map((testCase, index) => {
                    const score = calculateDecisionScore(testCase);
                    const expectedDecision = getDecision(score);
                    const isCorrect = userDecisions[index] === expectedDecision;
                    
                    return (
                      <div key={testCase.id} className="bg-surface/30 p-6 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-textPrimary">Case {testCase.id}</h4>
                          <Badge variant={isCorrect ? "success" : "destructive"}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                        <p className="text-sm text-textSecondary mb-4">{testCase.scenario}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-textSecondary">Your decision:</span>
                            <span className={isCorrect ? "text-green-400" : "text-red-400"}>{userDecisions[index]}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-textSecondary">Expected decision:</span>
                            <span className="text-accent">{expectedDecision}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-textSecondary">Score:</span>
                            <span className="text-accent">{score}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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