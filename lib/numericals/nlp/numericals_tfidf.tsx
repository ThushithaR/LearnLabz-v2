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

export default function TFIDFNumericalPage({ params }: { params: { id: string, course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// Workspace Step 1: Calculate TF (Term Frequency)\n// Step 2: Calculate IDF (Inverse Document Frequency)\n// Step 3: Calculate TF-IDF`);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [correctSolution, setCorrectSolution] = useState<string>(
    `// Step 1: Calculate TF (Term Frequency)\n// TF = (Number of times term appears in document) / (Total number of words in document)\n// TF = 20 / 100 = 0.2\n\n// Step 2: Calculate IDF (Inverse Document Frequency)\n// IDF = log10(Total documents / Documents containing term)\n// IDF = log10(10000 / 100) = log10(100) = 2\n\n// Step 3: Calculate TF-IDF\n// TF-IDF = TF * IDF\n// TF-IDF = 0.2 * 2 = 0.4\n\n// Final Answer: TF-IDF = 0.4`
  );
  
  const [tfValue, setTfValue] = useState<string>('');
  const [idfValue, setIdfValue] = useState<string>('');
  const [tfidfValue, setTfidfValue] = useState<string>('');
  
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentStep, setCurrentStep] = useState<'tf' | 'idf' | 'tfidf' | 'verify'>('tf');
  
  // Problem data
  const problemData = {
    termFrequency: 20,
    totalWords: 100,
    totalDocuments: 10000,
    documentsWithTerm: 100
  };

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

  // Calculate expected values
  const expectedTF = problemData.termFrequency / problemData.totalWords; // 0.2
  const expectedIDF = Math.log10(problemData.totalDocuments / problemData.documentsWithTerm); // 2
  const expectedTFIDF = expectedTF * expectedIDF; // 0.4

  // Check if answers are correct (with tolerance for floating point)
  const isTfCorrect = Math.abs(parseFloat(tfValue) - expectedTF) < 0.001;
  const isIdfCorrect = Math.abs(parseFloat(idfValue) - expectedIDF) < 0.001;
  const isTfidfCorrect = Math.abs(parseFloat(tfidfValue) - expectedTFIDF) < 0.001;

  // Handle step progression
  const handleNextStep = () => {
    switch (currentStep) {
      case 'tf':
        if (tfValue) setCurrentStep('idf');
        break;
      case 'idf':
        if (idfValue) setCurrentStep('tfidf');
        break;
      case 'tfidf':
        if (tfidfValue) setCurrentStep('verify');
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'idf':
        setCurrentStep('tf');
        break;
      case 'tfidf':
        setCurrentStep('idf');
        break;
      case 'verify':
        setCurrentStep('tfidf');
        break;
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    setIsTimerRunning(false);
    
    const isCorrect = isTfCorrect && isIdfCorrect && isTfidfCorrect;
    const cpEarned = isCorrect ? 450 : 0;

    // Fetch user for submission
    const user = await getCurrentUserProfile();
    
    if (user) {
      await submitNumericalAttempt({
        user_id: user.user_id,
        numerical_id: parseInt(params.id),
        is_correct: isCorrect,
        penalty_percent: 0,
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

  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch Numerical
      const numData = await getNumericalById(parseInt(params.id));
      if (!numData) {
        // Fallback static data for TF-IDF problem
        const staticData = {
          id: parseInt(params.id),
          title: "TF-IDF Calculation Challenge",
          description: "Information Retrieval • Text Mining",
          xp: 450,
          difficulty: "Hard"
        };
        setNumerical(staticData);
      } else {
        setNumerical(numData);
      }

      // 2. Fetch User for submission
      const user = await getCurrentUserProfile();
      if (user) setUserId(user.user_id);
    };
    loadData();
  }, [params.id]);

  if (!numerical) {
    return <div className="p-8 text-center text-textSecondary">Loading numerical data...</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">{numerical.title}</h1>
          <p className="text-sm text-textSecondary">Numerical Challenge #{numerical.id} • {numerical.description}</p>
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
              <Badge variant="warning" className="mb-4">Medium</Badge>
              <h2 className="text-xl font-bold mb-4 text-textPrimary">TF-IDF Calculation</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <h4 className="text-sm font-semibold text-accent mb-2">Problem Statement:</h4>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    Calculate the TF-IDF score for a term in a document collection.
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <h4 className="text-sm font-semibold text-accent mb-2">Given Data:</h4>
                  <ul className="space-y-2 text-sm text-textSecondary">
                    <li className="flex justify-between">
                      <span>Term appears in document:</span>
                      <span className="font-mono text-white">{problemData.termFrequency} times</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total words in document:</span>
                      <span className="font-mono text-white">{problemData.totalWords}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total documents in collection:</span>
                      <span className="font-mono text-white">{problemData.totalDocuments.toLocaleString()}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Documents containing the term:</span>
                      <span className="font-mono text-white">{problemData.documentsWithTerm}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <h4 className="text-sm font-semibold text-accent mb-2">Formulas:</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-textSecondary mb-1">TF (Term Frequency):</p>
                      <code className="text-accent bg-black/30 p-2 rounded block font-mono">
                        TF = (Term count in document) / (Total words in document)
                      </code>
                    </div>
                    <div>
                      <p className="text-textSecondary mb-1">IDF (Inverse Document Frequency):</p>
                      <code className="text-accent bg-black/30 p-2 rounded block font-mono">
                        IDF = log₁₀(Total documents / Documents containing term)
                      </code>
                    </div>
                    <div>
                      <p className="text-textSecondary mb-1">TF-IDF:</p>
                      <code className="text-accent bg-black/30 p-2 rounded block font-mono">
                        TF-IDF = TF × IDF
                      </code>
                    </div>
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
                    Remember: Use base-10 logarithm (log₁₀) for IDF calculation. TF-IDF helps determine how important a word is to a document in a collection.
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
                  {workspaceTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setSolution('// Workspace Step 1: Calculate TF (Term Frequency)\n// Step 2: Calculate IDF (Inverse Document Frequency)\n// Step 3: Calculate TF-IDF')}>
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
                placeholder="// Step 1: Calculate TF (Term Frequency)..."
              />
            </div>

            {/* Column 3: Step-by-Step Calculation */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Step-by-Step Calculation</h3>

              <div className="space-y-8 mb-8 lg:mb-auto">
                {/* Step 1: TF Calculation */}
                <div className={cn("space-y-4 transition-all duration-300", currentStep === 'tf' ? 'opacity-100' : 'opacity-60')}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", 
                      currentStep === 'tf' ? 'bg-accent text-black' : 'bg-white/5 text-white')}>
                      1
                    </div>
                    <h4 className="text-sm font-semibold">Term Frequency (TF)</h4>
                    {currentStep === 'tf' && tfValue && (
                      <Badge variant={isTfCorrect ? "success" : "destructive"} className="ml-auto">
                        {isTfCorrect ? "Correct" : "Check"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs text-textSecondary">
                      <p>TF = (Term count) / (Total words)</p>
                      <p className="font-mono mt-1">= {problemData.termFrequency} / {problemData.totalWords}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-textSecondary mb-2 block">Enter TF value:</label>
                      <input
                        type="number"
                        step="0.001"
                        value={tfValue}
                        onChange={(e) => setTfValue(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent text-lg font-mono transition-all focus:ring-1 ring-accent/50"
                        placeholder="0.000"
                        disabled={currentStep !== 'tf'}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: IDF Calculation */}
                <div className={cn("space-y-4 transition-all duration-300", currentStep === 'idf' ? 'opacity-100' : 'opacity-60')}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", 
                      currentStep === 'idf' ? 'bg-accent text-black' : 'bg-white/5 text-white')}>
                      2
                    </div>
                    <h4 className="text-sm font-semibold">Inverse Document Frequency (IDF)</h4>
                    {currentStep === 'idf' && idfValue && (
                      <Badge variant={isIdfCorrect ? "success" : "destructive"} className="ml-auto">
                        {isIdfCorrect ? "Correct" : "Check"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs text-textSecondary">
                      <p>IDF = log₁₀(Total docs / Docs with term)</p>
                      <p className="font-mono mt-1">= log₁₀({problemData.totalDocuments} / {problemData.documentsWithTerm})</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-textSecondary mb-2 block">Enter IDF value:</label>
                      <input
                        type="number"
                        step="0.001"
                        value={idfValue}
                        onChange={(e) => setIdfValue(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent text-lg font-mono transition-all focus:ring-1 ring-accent/50"
                        placeholder="0.000"
                        disabled={currentStep !== 'idf'}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: TF-IDF Calculation */}
                <div className={cn("space-y-4 transition-all duration-300", currentStep === 'tfidf' ? 'opacity-100' : 'opacity-60')}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", 
                      currentStep === 'tfidf' ? 'bg-accent text-black' : 'bg-white/5 text-white')}>
                      3
                    </div>
                    <h4 className="text-sm font-semibold">TF-IDF Score</h4>
                    {currentStep === 'tfidf' && tfidfValue && (
                      <Badge variant={isTfidfCorrect ? "success" : "destructive"} className="ml-auto">
                        {isTfidfCorrect ? "Correct" : "Check"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs text-textSecondary">
                      <p>TF-IDF = TF × IDF</p>
                      {tfValue && idfValue && (
                        <p className="font-mono mt-1">= {tfValue} × {idfValue}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-textSecondary mb-2 block">Enter TF-IDF value:</label>
                      <input
                        type="number"
                        step="0.001"
                        value={tfidfValue}
                        onChange={(e) => setTfidfValue(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent text-lg font-mono transition-all focus:ring-1 ring-accent/50"
                        placeholder="0.000"
                        disabled={currentStep !== 'tfidf'}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Verification */}
                <div className={cn("space-y-4 transition-all duration-300", currentStep === 'verify' ? 'opacity-100' : 'opacity-60')}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", 
                      currentStep === 'verify' ? 'bg-accent text-black' : 'bg-white/5 text-white')}>
                      4
                    </div>
                    <h4 className="text-sm font-semibold">Verification & Submit</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-xs text-textSecondary bg-black/20 p-3 rounded-lg">
                      <p className="font-semibold mb-2">Your Calculations:</p>
                      <div className="space-y-1 font-mono">
                        <p>TF: <span className="text-white">{tfValue || '—'}</span></p>
                        <p>IDF: <span className="text-white">{idfValue || '—'}</span></p>
                        <p>TF-IDF: <span className="text-white">{tfidfValue || '—'}</span></p>
                      </div>
                    </div>
                    
                    {tfValue && idfValue && tfidfValue && (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-textSecondary">TF Status:</span>
                          <span className={isTfCorrect ? "text-green-400" : "text-red-400"}>
                            {isTfCorrect ? "✓ Correct" : "✗ Needs review"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-textSecondary">IDF Status:</span>
                          <span className={isIdfCorrect ? "text-green-400" : "text-red-400"}>
                            {isIdfCorrect ? "✓ Correct" : "✗ Needs review"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-textSecondary">TF-IDF Status:</span>
                          <span className={isTfidfCorrect ? "text-green-400" : "text-red-400"}>
                            {isTfidfCorrect ? "✓ Correct" : "✗ Needs review"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-4 mt-auto">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevStep}
                    disabled={currentStep === 'tf'}
                  >
                    Previous Step
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 'tf' && !tfValue) ||
                      (currentStep === 'idf' && !idfValue) ||
                      (currentStep === 'tfidf' && !tfidfValue) ||
                      currentStep === 'verify'
                    }
                  >
                    Next Step
                  </Button>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20"
                  onClick={handleSubmit}
                  disabled={currentStep !== 'verify'}
                >
                  Submit Final Solution
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Unified Analysis View */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce duration-[2000ms]",
                isTfCorrect && isIdfCorrect && isTfidfCorrect ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
              )}>
                {isTfCorrect && isIdfCorrect && isTfidfCorrect ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {isTfCorrect && isIdfCorrect && isTfidfCorrect ? "Excellent Calculation!" : "Review Required"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                {isTfCorrect && isIdfCorrect && isTfidfCorrect
                  ? "You've accurately calculated all components of TF-IDF. Your understanding of information retrieval metrics is solid."
                  : "Some calculations need adjustment. Review the breakdown below to identify where improvements can be made."}
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
                  {((isTfCorrect ? 33 : 0) + (isIdfCorrect ? 33 : 0) + (isTfidfCorrect ? 34 : 0)).toFixed(0)}%
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Experience Earned</div>
                <div className="text-2xl font-bold text-accent mb-1">+{isTfCorrect && isIdfCorrect && isTfidfCorrect ? "450" : "150"} EP</div>
              </Card>
            </div>

            {/* Side-by-Side Solution Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Your Calculations</h3>
                  <Badge variant="secondary" className="bg-white/5 border-white/10">Input</Badge>
                </div>
                <div className="bg-surface/30 rounded-2xl border border-white/5 p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 font-mono text-sm leading-relaxed text-textSecondary relative group">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-accent mb-2">TF Calculation:</h4>
                      <div className="pl-4">
                        <p className={isTfCorrect ? "text-green-400" : "text-red-400"}>
                          {tfValue || 'Not calculated'}
                        </p>
                        {!isTfCorrect && tfValue && (
                          <p className="text-xs text-red-300 mt-1">Expected: {expectedTF.toFixed(3)}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-accent mb-2">IDF Calculation:</h4>
                      <div className="pl-4">
                        <p className={isIdfCorrect ? "text-green-400" : "text-red-400"}>
                          {idfValue || 'Not calculated'}
                        </p>
                        {!isIdfCorrect && idfValue && (
                          <p className="text-xs text-red-300 mt-1">Expected: {expectedIDF.toFixed(3)}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-accent mb-2">TF-IDF Calculation:</h4>
                      <div className="pl-4">
                        <p className={isTfidfCorrect ? "text-green-400" : "text-red-400"}>
                          {tfidfValue || 'Not calculated'}
                        </p>
                        {!isTfidfCorrect && tfidfValue && (
                          <p className="text-xs text-red-300 mt-1">Expected: {expectedTFIDF.toFixed(3)}</p>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-accent mb-2">Workspace Notes:</h4>
                      <div className="text-textSecondary text-sm whitespace-pre-wrap">
                        {solution}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Optimal Solution</h3>
                  <Badge variant="outline" className="border-accent/30 text-accent">Verified</Badge>
                </div>
                <div className="bg-accent/5 rounded-2xl border border-accent/10 p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/10 font-mono text-sm leading-relaxed text-textPrimary">
                  {correctSolution.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4 mb-2">
                      <span className="w-4 text-accent/30 text-[10px] pt-1">{i + 1}</span>
                      <span className={line.includes('//') ? 'text-textSecondary' : 'text-white'}>{line || ' '}</span>
                    </div>
                  ))}
                  <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Key Takeaway</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      TF-IDF is a fundamental metric in information retrieval. TF measures local importance within a document, 
                      while IDF measures global importance across the collection. The product balances both aspects.
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
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">TF Insights</h4>
                    <p className="mb-4">
                      Term Frequency measures how often a term appears in a document relative to its length. 
                      Your calculation: <span className={cn("font-bold px-1.5 py-0.5 rounded", 
                        isTfCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                        {tfValue || 'Not provided'}
                      </span>
                    </p>
                    <p>
                      Formula: TF = 20 / 100 = 0.2<br/>
                      This means the term appears in 20% of the document's words.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">IDF Insights</h4>
                    <p className="mb-4">
                      Inverse Document Frequency measures how unique a term is across the collection. 
                      Your calculation: <span className={cn("font-bold px-1.5 py-0.5 rounded", 
                        isIdfCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                        {idfValue || 'Not provided'}
                      </span>
                    </p>
                    <p>
                      Formula: IDF = log₁₀(10000 / 100) = log₁₀(100) = 2<br/>
                      Higher IDF means the term is rarer across documents.
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">TF-IDF Significance</h4>
                  <p className="text-textSecondary">
                    Final TF-IDF score: <span className={cn("font-bold px-1.5 py-0.5 rounded text-lg", 
                      isTfidfCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                      {tfidfValue || 'Not provided'}
                    </span>
                    <br/>
                    The score 0.4 indicates moderate importance - the term is somewhat common in this document 
                    but relatively rare in the collection.
                  </p>
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