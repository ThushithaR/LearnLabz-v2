"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { courses, CourseId } from "@/lib/courses";

export default function NumericalsSolvePage({ params }: { params: { id: string, course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// Workspace Step 1: `);
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved timer on mount
  useEffect(() => {
    const savedTime = localStorage.getItem(`timer_${params.id}`);
    if (savedTime) {
      setTimer(parseInt(savedTime, 10));
    }

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [params.id]);

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
  const handleSubmit = () => {
    setShowResults(true);
    setShowModal(true);
  };

  // Check if answers are correct
  const isRootNodeCorrect = parseInt(rootNodeValue as string) === 5;
  const isNodesPrunedCorrect = parseInt(nodesPruned as string) === 0;

  // Fetch the course data dynamically based on the course param
  const courseData = courses[params.course.toLowerCase() as CourseId];

  // If the course is invalid, we can redirect them to an error page or show a message
  if (!courseData) {
    return <div>Course not found!</div>;
  }

  // If numericals are not available for this course
  if (!courseData.numericals) {
    return <div>Numericals not available for this course!</div>;
  }

  // Fetch the numerical data based on the id param
  const numerical = courseData.numericals.find(n => n.id.toString() === params.id);

  // If the numerical is not found, show an error
  if (!numerical) {
    return <div>Numerical not found!</div>;
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
          <div className="text-right">
            <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">Time Elapsed</div>
            <div className="font-mono text-xl text-accent font-bold tabular-nums">{formatTime(timer)}</div>
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
        {/* Column 1: Problem Statement */}
        <div className="w-full lg:col-span-3 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
          <Badge variant="warning" className="mb-4">Hard</Badge>
          <h2 className="text-xl font-bold mb-4 text-textPrimary">Optimal Move Calculation</h2>
          <p className="text-sm text-textSecondary leading-relaxed mb-6">
            Given the following game tree with leaf node values, determine the value of the root node using the Minimax algorithm. Assume the root player is a Maximizer.
          </p>
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
            className="flex-1 w-full bg-transparent p-6 md:p-8 text-white font-mono resize-none focus:outline-none text-sm leading-7"
            placeholder="// step-by-step scratchpad..."
          />
        </div>

        {/* Column 3: Submission & Results */}
        <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto">
          {!showResults ? (
            <>
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Final Answer</h3>

              <div className="space-y-6 mb-8 lg:mb-auto">
                <div>
                  <label className="text-xs font-medium text-textSecondary mb-2 block">Root Node Value</label>
                  <input
                    type="number"
                    value={rootNodeValue}
                    onChange={(e) => setRootNodeValue(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent text-lg font-mono transition-all focus:ring-1 ring-accent/50"
                    placeholder="?"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-textSecondary mb-2 block">Nodes Pruned</label>
                  <input
                    type="number"
                    value={nodesPruned}
                    onChange={(e) => setNodesPruned(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent text-lg font-mono transition-all focus:ring-1 ring-accent/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <Button size="lg" className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20" onClick={handleSubmit}>
                Submit Solution
              </Button>
            </>
          ) : (
            // Results view
            <div className="space-y-6">
              <h3 className="font-bold text-sm mb-4 uppercase text-textSecondary tracking-widest">Results</h3>
              <div className="p-4 bg-surface/20 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  {isRootNodeCorrect ? (
                    <>
                      <CheckCircle className="text-green-400" /> Root Node Value correct
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-400" /> Root Node Value incorrect (Expected: 5)
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isNodesPrunedCorrect ? (
                    <>
                      <CheckCircle className="text-green-400" /> Nodes Pruned correct
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-400" /> Nodes Pruned incorrect (Expected: 0)
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <Button size="sm" onClick={() => setShowResults(false)}>Close Results</Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-surface/80 flex items-center justify-center p-6">
            <Card className="max-w-3xl w-full p-8 bg-surface border border-white/10 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-textSecondary hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-textPrimary mb-4">Solution Comparison</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-textSecondary mb-1">Your Solution</h3>
                  <pre className="bg-black/20 p-4 rounded-lg text-sm overflow-x-auto">{solution}</pre>
                </div>
                <div>
                  <h3 className="font-semibold text-textSecondary mb-1">Correct Solution</h3>
                  <pre className="bg-black/20 p-4 rounded-lg text-sm overflow-x-auto">{correctSolution}</pre>
                </div>
              </div>

              {/* Navigation Button */}
              <Button
                className="mt-6 w-full"
                onClick={() => router.push(`/dashboard/${params.course}/numericals`)} // Navigate back to numericals page
              >
                Go Back to Numericals
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
