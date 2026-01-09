"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, Star, AlertCircle, Code, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function CodingChallengePageOne({ params }: { params: { id: string, course: string } }) {
  const [solution, setSolution] = useState<string>("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // New state for Try It Yourself feature
  const [showTryItYourself, setShowTryItYourself] = useState(false);
  const [userTypedCode, setUserTypedCode] = useState<string[]>([""]);
  const [currentTypingLine, setCurrentTypingLine] = useState(0);
  const [typingFeedback, setTypingFeedback] = useState<{line: number, correct: boolean, message: string}[]>([]);
  const [typingComplete, setTypingComplete] = useState(false);

  // Coding challenge state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [codeVariables, setCodeVariables] = useState<{[key: string]: any}>({});
  // Add this new state at the top with other states
const [correctAttempts, setCorrectAttempts] = useState(0);
const [totalAttempts, setTotalAttempts] = useState(0);
  // Define the complete correct answer
  const correctAnswer = `from nltk.corpus import brown
news_text = brown.words(categories='news')
fdist = nltk.FreqDist(w.lower() for w in news_text)
modals = ['can', 'could', 'may', 'might', 'must', 'will']
for m in modals:
    print(m + ':', fdist[m], end=' ')`;

  const correctAnswerLines = correctAnswer.split('\n');

  // Define steps with options
  const steps = [
    {
      prompt: "Import the corpus module:",
      options: ["from nltk.corpus import brown", "import nltk.corpus.brown", "from nltk import corpus", "import brown"],
      correct: "from nltk.corpus import brown",
      variables: {}
    },
    {
      prompt: "Get words from the news category:",
      options: ["news_text = brown.words(categories='news')", "news_text = brown.get('news')", "news_text = brown.news()", "news_text = brown.words('news')"],
      correct: "news_text = brown.words(categories='news')",
      variables: { news_text: "brown.words(categories='news')" }
    },
    {
      prompt: "Create a frequency distribution:",
      options: ["fdist = nltk.FreqDist(w.lower() for w in news_text)", "fdist = FreqDist(news_text.lower())", "fdist = nltk.frequency(news_text)", "fdist = nltk.FreqDist(news_text)"],
      correct: "fdist = nltk.FreqDist(w.lower() for w in news_text)",
      variables: { fdist: "nltk.FreqDist(...)" }
    },
    {
      prompt: "Define the modal words list:",
      options: ["modals = ['can', 'could', 'may', 'might', 'must', 'will']", "modals = ('can', 'could', 'may', 'might', 'must', 'will')", "modals = {'can', 'could', 'may', 'might', 'must', 'will'}"],
      correct: "modals = ['can', 'could', 'may', 'might', 'must', 'will']",
      variables: { modals: "['can', 'could', 'may', 'might', 'must', 'will']" }
    },
    {
      prompt: "Loop through the modals:",
      options: ["for m in modals:", "for modal in modals:", "for m in modal:", "foreach m in modals:"],
      correct: "for m in modals:",
      variables: { m: "current_modal" }
    },
    {
      prompt: "Print the frequency with formatting:",
      options: ["print(m + ':', fdist[m], end=' ')", "print(m, fdist[m])", "print(f'{m}: {fdist[m]}')", "    print(m + ':', fdist.get(m))"],
      correct: "print(m + ':', fdist[m], end=' ')",
      variables: {}
    }
  ];
  useEffect(() => {
  if (showTryItYourself) {
    // Small delay to ensure modal is rendered
    setTimeout(() => {
      const activeInput = document.querySelector('input:not([disabled])');
      if (activeInput) {
        (activeInput as HTMLInputElement).focus();
      }
    }, 100);
  }
}, [showTryItYourself, currentTypingLine]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    // Update workspace with selected code
    const code = selectedOptions.join('\n');
    setSolution(code);
  }, [selectedOptions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    window.history.back();
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

  const handleOptionSelect = (option: string) => {
    const step = steps[currentStep];
    
    if (option === step.correct) {
      // Correct selection
      setErrorMessage("");
      setSelectedOptions([...selectedOptions, option]);
      
      // Update variables
      setCodeVariables({...codeVariables, ...step.variables});
      
      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Incorrect selection
      setErrorMessage(`Incorrect! Expected: ${step.correct}`);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const calculateMatchPercentage = () => {
    const userCode = solution.trim();
    const correctCode = correctAnswer.trim();
    
    // Simple line-by-line comparison
    const userLines = userCode.split('\n').filter(l => l.trim());
    const correctLines = correctCode.split('\n').filter(l => l.trim());
    
    let matches = 0;
    const minLength = Math.min(userLines.length, correctLines.length);
    
    for (let i = 0; i < minLength; i++) {
      if (userLines[i].trim() === correctLines[i].trim()) {
        matches++;
      }
    }
    
    return Math.round((matches / correctLines.length) * 100);
  };

  const handleSubmit = () => {
  setIsTimerRunning(false);
  
  // Show alert with Try it yourself option
  const userWantsToTry = window.confirm(
    "Great job completing the challenge!\n\nWould you like to try typing the code yourself line by line?\n\nClick OK for 'Try it yourself' or Cancel to see results."
  );
  
  if (userWantsToTry) {
    setShowTryItYourself(true);
    setUserTypedCode([""]);
    setCurrentTypingLine(0);
    setTypingFeedback([]);
    setTypingComplete(false);
  } else {
    setShowResults(true);
  }
};

  // New functions for Try It Yourself feature
  const handleTryItYourself = () => {
  setShowTryItYourself(true);
  setUserTypedCode([""]);
  setCurrentTypingLine(0);
  setTypingFeedback([]);
  setTypingComplete(false);
  setCorrectAttempts(0);  // Add this
  setTotalAttempts(0);    // Add this
};

  const handleCodeLineChange = (value: string, lineIndex: number) => {
  const newCode = [...userTypedCode];
  newCode[lineIndex] = value;
  setUserTypedCode(newCode);
};

const handleVerifyLine = () => {
  const correctAnswerLines = correctAnswer.split('\n');
  const userLine = userTypedCode[currentTypingLine].trim();
  const correctLine = correctAnswerLines[currentTypingLine].trim();
  
  setTotalAttempts(prev => prev + 1);
  
  if (userLine === correctLine) {
    setCorrectAttempts(prev => prev + 1);
    setTypingFeedback([
      {
        line: currentTypingLine + 1,
        correct: true,
        message: "✓ Line is correct!"
      }
    ]);
    
    if (currentTypingLine < correctAnswerLines.length - 1) {
      setUserTypedCode([...userTypedCode, ""]);
      setCurrentTypingLine(currentTypingLine + 1);
    } else {
      setTypingComplete(true);
      setTypingFeedback([
        {
          line: currentTypingLine + 1,
          correct: true,
          message: "✓ All lines completed! Code is perfect!"
        }
      ]);
    }
  } else {
    setTypingFeedback([
      {
        line: currentTypingLine + 1,
        correct: false,
        message: `✗ Incorrect. Expected: ${correctLine}`
      }
    ]);
  }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    handleVerifyLine();
  }
};

const calculateTypingAccuracy = () => {
  if (totalAttempts === 0) return 0;
  return Math.round((correctAttempts / totalAttempts) * 100);
};

  const matchPercentage = calculateMatchPercentage();
  const isComplete = selectedOptions.length === steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">NLTK Modal Words Frequency</h1>
          <p className="text-sm text-textSecondary">Coding Challenge • Step-by-Step Building</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {!showResults && (
            <>
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="p-2 rounded-lg border border-white/10 bg-surface/40 hover:border-accent/40 hover:bg-accent/10 transition-all group"
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
              <h2 className="text-xl font-bold mb-4 text-textPrimary">Print Frequency of Modal Words</h2>
              <p className="text-sm text-textSecondary leading-relaxed mb-6">
                Write a Python program using NLTK to print the frequency of modal words (can, could, may, might, must, will) in the news category of the Brown corpus.
              </p>
              
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-2">Expected Output:</h3>
                <pre className="text-xs text-textSecondary font-mono">
can: 94 could: 87 may: 93{'\n'}
might: 38 must: 53 will: 389
                </pre>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-bold text-accent mb-2">Progress:</h3>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/20 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-accent h-full transition-all duration-300"
                        style={{ width: `${(selectedOptions.length / steps.length) * 100}%` }}
                    />
                    </div>
                    <span className="text-xs font-mono text-textPrimary">{selectedOptions.length}/{steps.length}</span>
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
                    Use brown.words() with the categories parameter to get news text. FreqDist needs lowercase words for accurate counting.
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
                  className={showCalculator ? "bg-accent text-background" : ""}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Calculator</span>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setWorkspaceTheme(workspaceTheme === 'dark' ? 'light' : 'dark')}
                >
                  {workspaceTheme === 'dark' ? 'Light' : 'Dark'}
                </Button>
                <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => {
                    setSolution('');
                    setSelectedOptions([]);
                    setCurrentStep(0);
                    setCodeVariables({});
                    setErrorMessage('');
                    setTimer(0);
                    setIsTimerRunning(true);
                }}
                className={workspaceTheme === 'dark' ? "" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}
                >
                Reset
                </Button>
              </div>

              {showCalculator && (
                <Card className="absolute top-16 right-4 z-20 w-64 bg-surface border border-white/10 shadow-2xl p-4 animate-in zoom-in-95 duration-200 select-none">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase text-textSecondary">Calculator</span>
                    <button onClick={() => setShowCalculator(false)} className="text-textSecondary hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-black/40 p-3 rounded text-right font-mono text-xl mb-3 text-white">
                    <div className="text-xs text-textSecondary h-4">{calcEquation}</div>
                    {calcDisplay}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '.', '+'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => handleCalcInput(btn)}
                        className={`h-10 rounded text-sm font-bold transition-colors ${
                          ['/', '*', '-', '+'].includes(btn) ? 'bg-accent/20 text-accent hover:bg-accent/30' :
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

              <div className="flex-1 p-6 md:p-8 font-mono text-sm leading-7 overflow-y-auto">
                {solution ? (
                    solution.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4 text-white">
                        <span className="w-6 text-textSecondary/30 text-right">{i + 1}</span>
                        <span>{line || ' '}</span>
                    </div>
                    ))
                ) : (
                    <div className="flex gap-4 text-white">
                    <span className="w-6 text-textSecondary/30 text-right">1</span>
                    <span className="text-textSecondary/50">// Select options to build your code...</span>
                    </div>
                )}
                {!isComplete && (
                    <div className="flex gap-4 mt-2">
                    <span className="w-6 text-accent/50 text-right">{solution ? solution.split('\n').length + 1 : 1}</span>
                    <span className="text-accent/50 animate-pulse">▊</span>
                    </div>
                )}
                </div>
            </div>

            {/* Column 3: Step Selection */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
              <h3 className="font-bold text-sm mb-4 uppercase text-textSecondary tracking-widest">
                {isComplete ? "Challenge Complete!" : `Step ${selectedOptions.length + 1}`}
                </h3>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400">{errorMessage}</p>
                </div>
              )}

              {!isComplete ? (
                <div className="space-y-4 mb-auto">
                  <p className="text-sm text-textPrimary font-medium mb-4">
                    {steps[currentStep].prompt}
                  </p>
                  
                  {/* Display active variables */}
                  {Object.keys(codeVariables).length > 0 && (
                    <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <h4 className="text-xs font-bold text-accent mb-2">Active Variables:</h4>
                      <div className="space-y-1">
                        {Object.entries(codeVariables).map(([key, value]) => (
                          <div key={key} className="text-xs font-mono text-textSecondary">
                            <span className="text-accent">{key}</span> = {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {steps[currentStep].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        className="w-full text-left p-3 bg-black/20 border border-white/10 rounded-lg hover:border-accent/40 hover:bg-accent/5 transition-all text-sm font-mono text-textPrimary"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-auto">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-sm text-green-400 font-medium">
                      You've completed all steps! Review your code and submit when ready.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <h4 className="text-xs font-bold text-accent mb-2">Code Match:</h4>
                    <div className="text-2xl font-bold text-white">{matchPercentage}%</div>
                    <p className="text-xs text-textSecondary mt-1">of correct solution</p>
                  </div>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20 mt-4" 
                onClick={handleSubmit}
                disabled={!isComplete}
                >
                Submit Solution
                </Button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce duration-[2000ms]",
                matchPercentage === 100 ? "bg-green-500 shadow-green-500/20" : "bg-yellow-500 shadow-yellow-500/20"
              )}>
                {matchPercentage === 100 ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Sun className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {matchPercentage === 100 ? "Perfect Solution!" : "Great Attempt!"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                {matchPercentage === 100
                  ? "You've successfully built the complete NLTK frequency analysis code!"
                  : `You completed ${matchPercentage}% of the solution. Review the comparison below.`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-white">{formatTime(timer)}</div>
            </Card>
            <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Experience</div>
                <div className="text-2xl font-bold text-accent">+{matchPercentage * 5} XP</div>
            </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button onClick={handleExit}>
                Continue Learning
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Try It Yourself Modal */}
      {showTryItYourself && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-4xl bg-surface border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">Try It Yourself</h2>
                <p className="text-sm text-textSecondary">Type the code line by line. Press Ctrl+Enter or click Verify Line to check each line.</p>
              </div>
              <button
                onClick={() => setShowTryItYourself(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-accent">Progress: Line {currentTypingLine + 1} of {correctAnswerLines.length}</span>
                <span className="text-xs font-mono text-textPrimary">
                  Accuracy: {calculateTypingAccuracy()}%
                </span>
              </div>
              <div className="flex-1 bg-black/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${((currentTypingLine) / correctAnswerLines.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Content */}
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Left: Code Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Type Here</h3>
                    <div className="text-xs text-textSecondary">
                      Line {currentTypingLine + 1}
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl border border-white/10 p-4 max-h-[300px] overflow-y-auto font-mono">
                    {userTypedCode.map((line, index) => (
                      <div key={index} className="flex items-start gap-3 mb-2">
                        <span className={`w-6 text-right text-sm pt-1 ${
                          index === currentTypingLine ? 'text-accent' : 'text-textSecondary/50'
                        }`}>
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => handleCodeLineChange(e.target.value, index)}
                          onKeyDown={handleKeyDown}
                          className={`flex-1 bg-transparent outline-none text-sm font-mono py-1 px-2 rounded ${
                            index === currentTypingLine 
                              ? 'border border-accent/30 bg-accent/5' 
                              : 'border-transparent'
                          } ${typingFeedback.find(f => f.line === index + 1)?.correct ? 'text-green-400' : 'text-white'}`}
                          disabled={index !== currentTypingLine || typingComplete}
                          ref={index === currentTypingLine ? (el) => { if (el) el.focus(); } : undefined}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleVerifyLine}
                      disabled={typingComplete}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify Line {currentTypingLine + 1} (Ctrl+Enter)
                    </Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        setUserTypedCode([""]);
                        setCurrentTypingLine(0);
                        setTypingFeedback([]);
                        setTypingComplete(false);
                        setCorrectAttempts(0);
                        setTotalAttempts(0);
                    }}
                    >
                    Reset
                    </Button>
                  </div>
                </div>

                {/* Right: Feedback & Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Feedback</h3>
                    {typingComplete && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Complete!
                      </Badge>
                    )}
                  </div>
                  <div className="bg-black/40 rounded-xl border border-white/10 p-4 max-h-[300px] overflow-y-auto">
                    {typingFeedback.length === 0 ? (
                      <div className="text-center text-textSecondary h-full flex items-center justify-center">
                        <div>
                          <Code className="w-12 h-12 mx-auto mb-3 text-textSecondary/50" />
                          <p className="text-sm">Start typing the first line of code.</p>
                          <p className="text-xs mt-1">Press Ctrl+Enter to verify each line.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {typingFeedback.map((feedback, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              feedback.correct
                                ? 'bg-green-500/10 border-green-500/20'
                                : 'bg-red-500/10 border-red-500/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {feedback.correct ? (
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-white">
                                  Line {feedback.line}: {feedback.correct ? 'Correct' : 'Needs Correction'}
                                </div>
                                <div className="text-xs text-textSecondary mt-1">
                                  {feedback.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-accent/5 rounded-xl border border-accent/10 p-4">
                    <h4 className="text-xs font-bold text-accent mb-2">Instructions:</h4>
                    <ul className="text-xs text-textSecondary space-y-1">
                      <li>• Type each line exactly as shown in the correct solution</li>
                      <li>• Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl + Enter</kbd> or click "Verify Line" to check</li>
                      <li>• Correct lines will turn green and you'll move to the next line</li>
                      <li>• Complete all {correctAnswerLines.length} lines to finish</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  {typingComplete ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">All lines completed successfully!</span>
                    </div>
                  ) : (
                    <div className="text-sm text-textSecondary">
                      {typingFeedback.length > 0 ? `${typingFeedback.filter(f => f.correct).length} of ${correctAnswerLines.length} lines correct` : 'Start typing...'}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTryItYourself(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                        setShowTryItYourself(false);
                        setShowResults(true);
                    }}
                    disabled={!typingComplete}
                    className={typingComplete ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    View Full Results
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}