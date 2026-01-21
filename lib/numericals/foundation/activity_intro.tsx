"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, ArrowLeft, AlertCircle, Star, Brain, Target, Layers, Puzzle, Info, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { submitNumericalAttempt } from "@/lib/supabase/numericals";
import { getCurrentUserProfile } from "@/lib/supabase/profile";

// Technology examples with detailed explanations
const techExamples = [
  { 
    id: 1, 
    name: "Robot solving maze", 
    category: "ai", 
    icon: "🤖", 
    description: "Follows rules to navigate",
    basicExplanation: "A robot that uses programmed rules or algorithms to find its way through a maze.",
    categoryExplanation: "This is AI because it mimics human problem-solving intelligence using pre-defined rules, but doesn't learn from experience."
  },
  { 
    id: 2, 
    name: "Basic Chatbot", 
    category: "ai", 
    icon: "💬", 
    description: "Answers with pre-set rules",
    basicExplanation: "A program that responds to user queries using a fixed set of rules and responses.",
    categoryExplanation: "This is AI (specifically rule-based AI) because it mimics conversation but doesn't learn or improve from interactions."
  },
  { 
    id: 3, 
    name: "Recommendation System", 
    category: "ml", 
    icon: "📊", 
    description: "Suggests based on your history",
    basicExplanation: "System that suggests products/content based on your past behavior and preferences.",
    categoryExplanation: "This is ML because it learns patterns from your watch/buying history and improves suggestions over time."
  },
  { 
    id: 4, 
    name: "Spam Filter", 
    category: "ml", 
    icon: "🛡️", 
    description: "Learns from marked emails",
    basicExplanation: "Email system that identifies and filters out unwanted/spam messages.",
    categoryExplanation: "This is ML because it learns from user-marked spam emails and improves its detection accuracy."
  },
  { 
    id: 5, 
    name: "Facial Recognition", 
    category: "dl", 
    icon: "👁️", 
    description: "Identifies faces with neural networks",
    basicExplanation: "Technology that identifies or verifies individuals by analyzing facial features.",
    categoryExplanation: "This is DL because it uses deep neural networks with multiple layers to analyze pixel patterns in faces."
  },
  { 
    id: 6, 
    name: "Self-driving Car Vision", 
    category: "dl", 
    icon: "🚗", 
    description: "Processes video in real-time",
    basicExplanation: "Computer vision system that helps autonomous vehicles perceive and navigate their environment.",
    categoryExplanation: "This is DL because it processes video frames through multiple neural network layers to detect objects, lanes, and obstacles."
  },
  { 
    id: 7, 
    name: "Game Playing AI", 
    category: "ai", 
    icon: "♟️", 
    description: "Plays chess using algorithms",
    basicExplanation: "Computer program that plays games like chess using decision-making algorithms.",
    categoryExplanation: "This is AI (can be AI or ML) - simple versions use rule-based AI, advanced versions use ML to learn from games."
  },
  { 
    id: 8, 
    name: "Fraud Detection", 
    category: "ml", 
    icon: "🔍", 
    description: "Learns from transaction patterns",
    basicExplanation: "System that identifies suspicious or fraudulent transactions in banking/finance.",
    categoryExplanation: "This is ML because it learns patterns from historical transaction data to detect anomalies."
  },
  { 
    id: 9, 
    name: "Language Translation", 
    category: "dl", 
    icon: "🌐", 
    description: "Uses deep neural networks",
    basicExplanation: "System that translates text or speech from one language to another.",
    categoryExplanation: "This is DL because modern translators use deep neural networks (like transformers) to understand context and grammar."
  },
];

// Categories with descriptions from PDF
const categories = [
  { 
    id: "ai", 
    name: "Artificial Intelligence", 
    description: "Any technique that enables computers to mimic human intelligence",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400"
  },
  { 
    id: "ml", 
    name: "Machine Learning", 
    description: "Enables machines to improve at tasks with experience",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-400"
  },
  { 
    id: "dl", 
    name: "Deep Learning", 
    description: "Uses multiple ML algorithms to train itself with vast data",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400"
  },
];

export default function Activity_Intro({ params }: { params: { id: string; course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// AI/ML/DL Learning Notes:\n// Drag examples to categories, write observations here\n`);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [workingPenalty, setWorkingPenalty] = useState(0);
  const [isStarred, setIsStarred] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Game state
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, number[]>>({
    ai: [],
    ml: [],
    dl: []
  });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [placementHistory, setPlacementHistory] = useState<string[]>([]);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserProfile();
      if (user) {
        setUserId(user.user_id);
      }
    };
    fetchUser();
    
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    router.push(`/dashboard/${params.course}/numericals`);
  };

  const toggleStar = () => {
    setIsStarred(!isStarred);
  };

  // Function to handle example click
  const handleExampleClick = (itemId: number) => {
    const item = techExamples.find(t => t.id === itemId);
    if (!item) return;
    
    setSelectedExample(itemId);
  };

  // Function to add placement explanation to history
  const addPlacementExplanation = (itemId: number, categoryId: string, isCorrect: boolean) => {
    const item = techExamples.find(t => t.id === itemId);
    if (!item) return;
    
    const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
    
    if (isCorrect) {
      const explanation = `✓ Correctly placed "${item.name}" in ${categoryName}: ${item.categoryExplanation}`;
      setPlacementHistory(prev => [...prev, explanation]);
    } else {
      const correctCategory = categories.find(c => c.id === item.category)?.name || item.category;
      const explanation = `✗ Incorrect: "${item.name}" belongs in ${correctCategory}, not ${categoryName}. ${item.categoryExplanation}`;
      setPlacementHistory(prev => [...prev, explanation]);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    setDraggedItem(itemId);
    e.dataTransfer.setData('text/plain', itemId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const item = techExamples.find(t => t.id === draggedItem);
    if (!item) return;

    // Check if correct
    const isCorrect = item.category === categoryId;
    
    // Update placed items
    const newPlacedItems = { ...placedItems };
    
    // Remove from any previous category
    Object.keys(newPlacedItems).forEach(cat => {
      newPlacedItems[cat] = newPlacedItems[cat].filter(id => id !== draggedItem);
    });
    
    // Add to new category
    newPlacedItems[categoryId] = [...newPlacedItems[categoryId], draggedItem];
    setPlacedItems(newPlacedItems);

    // Add detailed placement explanation to history
    addPlacementExplanation(draggedItem, categoryId, isCorrect);

    // Provide immediate feedback with detailed explanation
    if (isCorrect) {
      setFeedback(`✅ Correct! "${item.name}" belongs in ${categoryId.toUpperCase()}: ${item.categoryExplanation}`);
    } else {
      setFeedback(`❌ "${item.name}" belongs in ${item.category.toUpperCase()}, not ${categoryId.toUpperCase()}. ${item.categoryExplanation}`);
    }

    // Check completion
    checkGameCompletion(newPlacedItems);
    setDraggedItem(null);
  };

  const checkGameCompletion = (items: Record<string, number[]>) => {
    let correct = 0;
    let total = 0;
    
    techExamples.forEach(tech => {
      const placedIn = Object.keys(items).find(cat => items[cat].includes(tech.id));
      if (placedIn === tech.category) {
        correct++;
      }
      total++;
    });

    const newScore = Math.round((correct / total) * 100);
    setScore(newScore);
    
    if (correct === total) {
      setGameCompleted(true);
      setFeedback("🎉 Perfect! All items sorted correctly! You've mastered the AI family tree!");
    }
  };

  const resetGame = () => {
    setPlacedItems({ ai: [], ml: [], dl: [] });
    setGameCompleted(false);
    setScore(0);
    setFeedback("");
    setSelectedExample(null);
    setPlacementHistory([]);
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

  const handleSubmit = async () => {
    setIsTimerRunning(false);

    // Check workspace content
    const content = solution.toLowerCase();
    const hasKeywords = ["ai", "ml", "deep learning", "machine learning", "artificial intelligence", "neural", "network", "algorithm", "data", "learn", "rules"].some(word => content.includes(word));
    const hasMeaningfulContent = solution.replace(/\/\/.*?\n/g, '').trim().length > 20;

    if (!hasMeaningfulContent || !hasKeywords) {
      setWorkingPenalty(15);
    } else {
      setWorkingPenalty(0);
    }

    // Determine if solution is correct
    const correctCount = placementHistory.filter(p => p.includes("✓")).length;
    const isCorrect = correctCount === 9; // Perfect score
    
    // Calculate XP
    const maxXp = 450;
    let finalScore = 0;
    
    if (correctCount === 9) {
      const base = 100;
      const penalized = Math.max(0, base - (hasMeaningfulContent && hasKeywords ? 0 : 15));
      finalScore = Math.floor((penalized / 100) * maxXp);
    } else if (correctCount >= 5) {
      const percent = (correctCount / 9) * 100;
      const base = Math.max(50, percent);
      const penalized = Math.max(0, base - (hasMeaningfulContent && hasKeywords ? 0 : 15));
      finalScore = Math.floor((penalized / 100) * maxXp * 0.8);
    } else {
      const percent = (correctCount / 9) * 100;
      finalScore = Math.floor((percent / 100) * maxXp * 0.5);
    }

    // Save to database if user is logged in
    if (userId) {
      try {
        await submitNumericalAttempt({
          user_id: userId,
          numerical_id: parseInt(params.id),
          is_correct: isCorrect,
          penalty_percent: hasMeaningfulContent && hasKeywords ? 0 : 15,
          cp: finalScore,
          time_taken: timer
        });
        console.log('AI Sorting activity attempt saved to database');
      } catch (error) {
        console.error('Error saving AI Sorting attempt:', error);
        localStorage.setItem(`ai-sorting-attempt-${params.id}-${Date.now()}`, JSON.stringify({
          userId,
          numericalId: params.id,
          isCorrect,
          finalScore,
          timeTaken: timer,
          score,
          correctCount,
          timestamp: new Date().toISOString()
        }));
      }
    }
    
    setShowResults(true);
  };

  // Correct solution for comparison
  const correctSolution = `// AI Family Tree - Correct Classification:
// 
// ARTIFICIAL INTELLIGENCE (AI):
// 1. Robot solving maze - Rule-based navigation system
// 2. Basic Chatbot - Pre-programmed responses
// 3. Game Playing AI - Algorithm-based decision making
// 
// MACHINE LEARNING (ML):
// 4. Recommendation System - Learns from user behavior
// 5. Spam Filter - Improves from marked emails
// 6. Fraud Detection - Learns transaction patterns
// 
// DEEP LEARNING (DL):
// 7. Facial Recognition - Multi-layer neural networks
// 8. Self-driving Car Vision - Real-time video processing
// 9. Language Translation - Deep neural networks (transformers)
// 
// Key Insight: AI is the umbrella term, ML is a subset that learns from data,
// DL is a subset of ML using neural networks. It's a funnel: AI → ML → DL`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header - EXACTLY SAME AS DFSGraphTraversal */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">AI Family Tree Sorting</h1>
          <p className="text-sm text-textSecondary">Introduction to AI, ML, DL • Click examples to learn, drag to categorize</p>
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
            {/* Column 1: Instructions & Items - SAME STRUCTURE */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
              <Badge variant="success" className="mb-4">Interactive Learning</Badge>
              <h2 className="text-xl font-bold mb-4 text-textPrimary flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" /> AI Family Tree Challenge
              </h2>
              
              <p className="text-sm text-textSecondary leading-relaxed mb-6">
                <span className="text-accent font-semibold">Click on examples</span> to learn about them. 
                <span className="text-accent font-semibold ml-2">Drag to categories</span> to sort them correctly.
              </p>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">LEARNING GOALS</h3>
                <ul className="text-xs text-textSecondary space-y-2">
                  <li className="flex items-start gap-2">
                    <div className={cn("w-1 h-1 rounded-full mt-1.5", score >= 33 ? "bg-green-500" : "bg-red-500")} />
                    Differentiate AI, ML, and DL clearly
                  </li>
                  <li className="flex items-start gap-2">
                    <div className={cn("w-1 h-1 rounded-full mt-1.5", score >= 66 ? "bg-green-500" : "bg-red-500")} />
                    Understand the subset relationship
                  </li>
                  <li className="flex items-start gap-2">
                    <div className={cn("w-1 h-1 rounded-full mt-1.5", score === 100 ? "bg-green-500" : "bg-red-500")} />
                    Classify real-world AI technologies
                  </li>
                </ul>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">CURRENT PROGRESS</h3>
                <div className="text-xs text-textSecondary space-y-2">
                  <div className="flex justify-between">
                    <span>Examples Clicked:</span>
                    <span className="text-white">{selectedExample ? "Yes" : "None yet"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Placements Made:</span>
                    <span className="text-white">{placementHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct Placements:</span>
                    <span className="text-white">
                      {placementHistory.filter(p => p.includes("✓")).length}/{placementHistory.length}
                    </span>
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
                  <div className="p-3 border-l-2 border-accent text-xs text-textSecondary space-y-3">
                    <div>
                      <span className="text-blue-400 font-bold">AI (Artificial Intelligence):</span>
                      <p>Any computer system that mimics human intelligence, even simple rule-based systems.</p>
                    </div>
                    <div>
                      <span className="text-green-400 font-bold">ML (Machine Learning):</span>
                      <p>Systems that learn and improve from data/experience without being explicitly programmed.</p>
                    </div>
                    <div>
                      <span className="text-purple-400 font-bold">DL (Deep Learning):</span>
                      <p>A type of ML that uses neural networks with many layers to learn from vast amounts of data.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Interactive Workspace - SAME STRUCTURE */}
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
                <Button size="sm" variant="secondary" onClick={resetGame}>
                  Reset Game
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

              {/* Main Interactive Area */}
              <div className={cn(
  "flex-1 p-6 overflow-y-auto transition-colors duration-300",
  workspaceTheme === 'light' ? 'bg-white' : ''
)}>
                <h3 className={cn(
  "text-lg font-bold mb-6 flex items-center gap-2",
  workspaceTheme === 'dark' ? 'text-white' : 'text-gray-900'
)}>
                  <Layers className="w-5 h-5 text-accent" /> Drag & Drop Categories
                </h3>

                {/* Feedback Area */}
                {feedback && (
                  <div className={cn(
                    "mb-4 p-3 rounded-lg border",
                    feedback.includes("✅") ? "border-green-500/30 bg-green-500/10" :
                    feedback.includes("❌") ? "border-red-500/30 bg-red-500/10" :
                    "border-accent/30 bg-accent/10"
                  )}>
                    <p className="text-sm">{feedback}</p>
                  </div>
                )}

                {/* Category Drop Zones - Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, category.id)}
                      className={cn(
                        "min-h-[200px] border-2 border-dashed rounded-xl p-4 transition-all",
                        category.borderColor,
                        category.bgColor,
                        "hover:border-solid hover:scale-[1.01] cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={cn(
  "font-bold text-lg", 
  category.textColor,
  workspaceTheme === 'light' && "brightness-75" // Darken colors in light mode
)}><p className={cn(
  "text-sm mb-4",
  workspaceTheme === 'dark' ? 'text-textSecondary' : 'text-gray-600'
)}>
  {category.description}
</p>
                          {category.name}
                        </h4>
                        <Badge variant="outline" className={cn("text-xs", category.textColor)}>
                          {placedItems[category.id].length} items
                        </Badge>
                      </div>
                      <p className="text-sm text-textSecondary mb-4">{category.description}</p>
                      
                      {/* Dropped Items in this Category */}
                      <div className="space-y-2">
                        {placedItems[category.id].map(itemId => {
                          const item = techExamples.find(t => t.id === itemId);
                          if (!item) return null;
                          const isCorrect = item.category === category.id;
                          return (
                            <div
                              key={itemId}
                              className={cn(
                                "p-2 rounded border text-sm flex items-center gap-2",
                                isCorrect ? "border-white/20 bg-white/5" : "border-red-500/50 bg-red-500/10"
                              )}
                              title={isCorrect ? item.categoryExplanation : `Should be in ${item.category.toUpperCase()}`}
                            >
                              <span>{item.icon}</span>
                              <span className={cn(
  "font-medium",
  workspaceTheme === 'dark' ? 'text-white' : 'text-gray-900'
)}>
  {item.name}
</span>
                              {!isCorrect && (
                                <span className="ml-auto text-xs text-red-400">✗</span>
                              )}
                            </div>
                          );
                        })}
                        {placedItems[category.id].length === 0 && (
                          <div className="text-center py-6 text-textSecondary/50 text-sm">
                            Drop {category.id.toUpperCase()} examples here
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items to Sort */}
                <div className="mb-6">
                  <h3 className={cn(
  "text-sm font-bold mb-3",
  workspaceTheme === 'dark' ? 'text-textPrimary' : 'text-gray-900'
)}>
  Click to Learn, Drag to Sort
</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {techExamples.map(tech => {
                      const isPlaced = Object.values(placedItems).some(arr => arr.includes(tech.id));
                      const isSelected = selectedExample === tech.id;
                      return (
                        <div
                          key={tech.id}
                          draggable={!isPlaced}
                          onDragStart={(e) => !isPlaced && handleDragStart(e, tech.id)}
                          onClick={() => handleExampleClick(tech.id)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            isSelected ? "ring-2 ring-accent ring-offset-1 ring-offset-surface/30" : "",
                            isPlaced ? "opacity-60" : "hover:scale-[1.02] active:scale-[0.98]",
                            tech.category === 'ai' ? "border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15" :
                            tech.category === 'ml' ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/15" :
                            "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{tech.icon}</span>
                            <div className="flex-1">
                              <div className={cn(
  "font-medium text-sm flex items-center gap-1",
  workspaceTheme === 'dark' ? 'text-white' : 'text-gray-900'
)}>
                                {tech.name}
                                <BookOpen className="w-3 h-3 text-textSecondary group-hover:text-accent transition-colors" />
                              </div>
                              <div className="text-xs text-textSecondary mt-1">{tech.description}</div>
                            </div>
                            {isPlaced && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                ✓ Placed
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes Area */}
                <div className="mt-6">
                  <h4 className={cn(
  "text-sm font-bold mb-3",
  workspaceTheme === 'dark' ? 'text-white' : 'text-gray-900'
)}>
  Learning Observations
</h4>
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
                    placeholder="// Write your observations about AI, ML, and DL differences here..."
                  />
                  <p className="text-xs text-textSecondary mt-2">
                    Include keywords like AI, ML, DL, neural networks, algorithms, data
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: Controls & Progress - SAME STRUCTURE */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0">
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">Activity Progress</h3>

              <div className="space-y-4 mb-auto">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Progress Status</div>
                  <div className="text-xl font-bold text-accent">{score}% Complete</div>
                  <div className="text-xs text-textSecondary mt-1">
                    {techExamples.filter(t => 
                      Object.values(placedItems).some(arr => arr.includes(t.id))
                    ).length}/{techExamples.length} examples placed
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Learning Summary</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Correct Placements:</span>
                      <span className="text-white">
                        {placementHistory.filter(p => p.includes("✓")).length}/9
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Accuracy:</span>
                      <span className={cn(
                        "font-bold",
                        score >= 80 ? "text-green-400" :
                        score >= 50 ? "text-yellow-400" :
                        "text-red-400"
                      )}>
                        {score}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Example Info */}
                {selectedExample && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-400 mb-2">Selected Example</h4>
                    <p className="text-sm text-white mb-1">
                      {techExamples.find(t => t.id === selectedExample)?.name}
                    </p>
                    <p className="text-xs text-blue-300">
                      {techExamples.find(t => t.id === selectedExample)?.basicExplanation}
                    </p>
                  </div>
                )}

                {/* Recent Placements */}
                {placementHistory.length > 0 && (
                  <div className="bg-surface/40 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-textSecondary mb-2">Recent Placements</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {placementHistory.slice(-3).map((entry, index) => (
                        <div key={index} className="text-xs p-2 bg-white/5 rounded">
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="mb-6 p-4 bg-accent/5 border border-accent/10 rounded-xl">
                  <p className="text-sm text-textSecondary text-center">
                    {gameCompleted 
                      ? "🎯 Perfect! Submit to see detailed analysis!"
                      : `Progress: ${score}% - ${score >= 50 ? "Ready to submit!" : "Keep going!"}`
                    }
                  </p>
                  {gameCompleted && (
                    <p className="text-xs text-center text-accent mt-2">
                      All examples correctly placed!
                    </p>
                  )}
                </div>
                
                <Button 
                  size="lg"
                  className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
                  onClick={handleSubmit}
                  disabled={!gameCompleted && score < 50}
                >
                  {gameCompleted 
                    ? "Submit & Analyze" 
                    : score >= 50 
                    ? "Submit Progress" 
                    : "Need 50% to Submit"}
                </Button>
                
                {!gameCompleted && (
                  <div className="mt-3 text-xs text-textSecondary text-center">
                    Complete at least 5 examples (50%) to submit
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Results View - SAME STRUCTURE AS DFSGraphTraversal */
          <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl",
                score === 100
                  ? "bg-green-500 shadow-green-500/20 animate-bounce duration-[2000ms]"
                  : score >= 70
                  ? "bg-yellow-500 shadow-yellow-500/20"
                  : "bg-orange-500 shadow-orange-500/20"
              )}>
                {score === 100 ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : score >= 70 ? (
                  <Brain className="w-10 h-10 text-white" />
                ) : (
                  <Puzzle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {score === 100
                  ? "AI Hierarchy Master!"
                  : score >= 70
                  ? "Good Understanding!"
                  : "Needs More Practice"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                {score === 100
                  ? `Perfect! ${placementHistory.filter(p => p.includes("✓")).length} correct placements with detailed explanations.`
                  : score >= 70
                  ? `Good job with ${score}%! ${placementHistory.filter(p => p.includes("✓")).length} correct placements.`
                  : `You made ${placementHistory.length} attempts. Review the explanations to improve.`}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(timer)}</div>
                <div className="text-xs text-green-400 font-medium">Activity completed</div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Accuracy Score</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.max(0, score - workingPenalty)}%
                </div>
                <div className={cn("text-xs font-medium", workingPenalty > 0 ? "text-red-400" : "text-textSecondary")}>
                  {workingPenalty > 0 ? `Penalty: -${workingPenalty}%` : "Well documented"}
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Examples Correct</div>
                <div className="text-2xl font-bold text-accent mb-1">
                  {placementHistory.filter(p => p.includes("✓")).length} / 9
                </div>
                <div className="text-xs text-accent/60 font-medium">
                  {score === 100 ? "All correct" : "Partial success"}
                </div>
              </Card>
            </div>

            {/* Side-by-Side Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Your Observations</h3>
                  <Badge variant="secondary" className="bg-white/5 border-white/10">
                    {solution.length > 0 ? "Documented" : "No notes"}
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
                  {workingPenalty > 0 && (
                    <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      <h4 className="text-xs font-bold text-red-400 mb-2 uppercase">Penalty Applied</h4>
                      <p className="text-xs text-red-300/80">
                        Insufficient notes or missing keywords about AI/ML/DL concepts.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Optimal Solution</h3>
                  <Badge variant="outline" className="border-accent/30 text-accent">Correct Classifications</Badge>
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
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Key Learning</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      AI is the umbrella term that includes all systems mimicking human intelligence.
                      ML is a subset that learns from data. DL is a specialized subset of ML using neural networks.
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
                  <Sun className="w-5 h-5 text-accent" /> Concept Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-textSecondary">
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Category Performance</h4>
                    {categories.map(category => {
                      const correctInCategory = placedItems[category.id].filter(id => 
                        techExamples.find(t => t.id === id)?.category === category.id
                      ).length;
                      const totalInCategory = placedItems[category.id].length;
                      const expectedInCategory = techExamples.filter(t => t.category === category.id).length;
                      
                      return (
                        <div key={category.id} className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn("font-medium", category.textColor)}>{category.name}</span>
                            <span className={correctInCategory === expectedInCategory ? "text-green-400" : "text-yellow-400"}>
                              {correctInCategory}/{expectedInCategory} correct
                            </span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full", category.textColor)}
                              style={{ width: `${(correctInCategory / expectedInCategory) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Learning Outcomes</h4>
                    <p className="mb-4">
                      You demonstrated <span className="font-bold text-accent">{score}%</span> understanding of the AI family tree.
                      {score === 100 ? " Perfect classification of all examples!" : " Review the missed classifications below."}
                    </p>
                    {placementHistory.filter(p => p.includes("✗")).length > 0 && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
                        <h5 className="text-xs font-bold text-orange-400 uppercase mb-1">
                          <AlertCircle className="w-3 h-3 inline mr-2" /> Areas to Improve
                        </h5>
                        <ul className="text-[11px] text-orange-300/80 space-y-1">
                          {placementHistory.filter(p => p.includes("✗")).slice(0, 3).map((mistake, idx) => (
                            <li key={idx}>{mistake.replace("✗ Incorrect: ", "")}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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