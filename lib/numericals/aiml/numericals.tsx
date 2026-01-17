"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, Moon, Star, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { courses, CourseId } from "@/lib/courses";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { submitNumericalAttempt } from "@/lib/supabase/numericals";

// Tree Node Structure
interface TreeNode {
  value: number;
  x: number;
  y: number;
  children: number[];
}

// Generate tree nodes for values 1-15
const generateTreeNodes = (): Record<number, TreeNode> => {
  const nodes: Record<number, TreeNode> = {};
  const levelGaps = [200, 100, 50, 25];
  const startX = 400;

  const positions: Record<number, { x: number; y: number }> = {
    1: { x: startX, y: 40 },
    2: { x: startX - 200, y: 120 },
    3: { x: startX + 200, y: 120 },
    4: { x: startX - 300, y: 200 },
    5: { x: startX - 100, y: 200 },
    6: { x: startX + 100, y: 200 },
    7: { x: startX + 300, y: 200 },
    8: { x: startX - 350, y: 280 },
    9: { x: startX - 250, y: 280 },
    10: { x: startX - 150, y: 280 },
    11: { x: startX - 50, y: 280 },
    12: { x: startX + 50, y: 280 },
    13: { x: startX + 150, y: 280 },
    14: { x: startX + 250, y: 280 },
    15: { x: startX + 350, y: 280 },
  };

  for (let i = 1; i <= 15; i++) {
    const children = [];
    if (2 * i <= 15) children.push(2 * i);
    if (2 * i + 1 <= 15) children.push(2 * i + 1);

    nodes[i] = {
      value: i,
      x: positions[i].x,
      y: positions[i].y,
      children
    };
  }

  return nodes;
};

const GOAL_NODE = 11;
const CORRECT_BFS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function BFSTreeTraversal({ params, }: { params: { id: string; course: string }; }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// BFS Traversal Notes:\n// Start: Node 1\n// Goal: Node 11\n`);
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

  // BFS State
  const [queue, setQueue] = useState<number[]>([1]);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([1]); // Start with node 1 visited
  const [currentFront, setCurrentFront] = useState<number>(1);
  const [expandedNodes, setExpandedNodes] = useState<number[]>([1]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userTraversalOrder, setUserTraversalOrder] = useState<number[]>([1]); // Start with node 1
  const [goalReached, setGoalReached] = useState<boolean>(false);

  const treeNodes = generateTreeNodes();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserProfile();
      if (user) setUserId(user.user_id);
    };
    fetchUser();
  }, []);

  // Load starred state on mount
  useEffect(() => {
    const storageKey = `starred_numericals_${params.course}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const starred = new Set(JSON.parse(saved));
      setIsStarred(starred.has(params.id));
    }
  }, [params.id, params.course]);

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


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNodeClick = (nodeValue: number) => {
    if (goalReached) return;

    // Check if node is already visited
    if (visitedNodes.includes(nodeValue)) {
      setErrorMessage(`Node ${nodeValue} is already visited.`);
      return;
    }

    // Check if node is already in queue
    if (queue.includes(nodeValue)) {
      setErrorMessage(`Node ${nodeValue} is already in the queue.`);
      return;
    }

    // Check if this node is a child of the current front node
    const frontNode = treeNodes[currentFront];
    if (!frontNode.children.includes(nodeValue)) {
      setErrorMessage(`Error: Node ${nodeValue} is not a direct child of the current front node ${currentFront}. Please select a valid child.`);
      return;
    }

    // Add to queue and traversal order
    setQueue(prev => [...prev, nodeValue]);
    setUserTraversalOrder(prev => [...prev, nodeValue]);
    setErrorMessage("");

    // Check if goal is reached
    if (nodeValue === GOAL_NODE) {
      setGoalReached(true);
    }
  };

  const handleDequeue = () => {
    if (queue.length === 0) {
      setErrorMessage("Queue is empty. Add nodes to the queue first.");
      return;
    }

    const dequeuedNode = queue[0];
    const newQueue = queue.slice(1);

    setQueue(newQueue);
    setVisitedNodes(prev => [...prev, dequeuedNode]);
    setExpandedNodes(prev => [...prev, dequeuedNode]);

    // Update current front if queue is not empty
    if (newQueue.length > 0) {
      setCurrentFront(newQueue[0]);
    }

    setErrorMessage("");
  };

  const handleSubmit = async () => {
    setIsTimerRunning(false);
    
    // Check if goal node is in traversal order
    const hasGoalNode = userTraversalOrder.includes(GOAL_NODE);
    
    // Determine if traversal is correct
    const isCorrectTraversal = userTraversalOrder.includes(GOAL_NODE) && isTraversalCorrect();
    const isCorrect = isCorrectTraversal; // This determines is_correct in database

    // Submit to DB
    const submit = async () => {
      if (!userId) return;

      // Calculate XP based on correctness only (no penalty)
      const maxXp = 450; // Get this from numericals table or use a default
      let finalScore = 0;
      
      if (userTraversalOrder.includes(GOAL_NODE)) {
        // Base score - no penalty applied
        const base = isTraversalCorrect() ? 100 : 70;
        // Scale to XP
        finalScore = Math.floor((base / 100) * maxXp);
      } else {
        // Partial completion
        const percentComplete = (userTraversalOrder.length / CORRECT_BFS_ORDER.length) * 100;
        finalScore = Math.floor((percentComplete / 100) * maxXp * 0.5); // 50% of max for partial
      }

      await submitNumericalAttempt({
        user_id: userId,
        numerical_id: parseInt(params.id),
        is_correct: isCorrect,
        penalty_percent: 0, // Always 0, no penalty
        cp: finalScore,
        time_taken: timer
      });
    };
    await submit();

    setShowResults(true);
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

  const isTraversalCorrect = () => {
    // Find the position of goal node in user traversal
    const goalIndex = userTraversalOrder.indexOf(GOAL_NODE);
    if (goalIndex === -1) return false;

    // Get the traversal up to the goal node
    const userTraversalUpToGoal = userTraversalOrder.slice(0, goalIndex + 1);

    // Check if it matches the correct BFS order
    return userTraversalUpToGoal.every((val, idx) => val === CORRECT_BFS_ORDER[idx]);
  };

  const correctSolution = `// Optimal BFS Solution:
// Step 1: Initialize queue with start node [1]
// Step 2: Dequeue 1, enqueue children [2, 3]
// Step 3: Dequeue 2, enqueue children [4, 5]
//         Queue: [3, 4, 5]
// Step 4: Dequeue 3, enqueue children [6, 7]
//         Queue: [4, 5, 6, 7]
// Step 5: Dequeue 4, enqueue children [8, 9]
//         Queue: [5, 6, 7, 8, 9]
// Step 6: Dequeue 5, enqueue children [10, 11]
//         Queue: [6, 7, 8, 9, 10, 11]
// Step 7: Dequeue 6, enqueue children [12, 13]
//         Queue: [7, 8, 9, 10, 11, 12, 13]
// Step 8: Dequeue 7, enqueue children [14, 15]
//         Queue: [8, 9, 10, 11, 12, 13, 14, 15]
// Step 9: Dequeue 8 (leaf node)
// Step 10: Dequeue 9 (leaf node)
// Step 11: Dequeue 10 (leaf node)
// Step 12: Dequeue 11 (GOAL REACHED!)
//
// Final BFS Order: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">BFS Tree Traversal</h1>
          <p className="text-sm text-textSecondary">
            Breadth-First Search • Goal Node 11
          </p>
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
                <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">
                  Time Elapsed
                </div>
                <div className="font-mono text-xl text-accent font-bold tabular-nums">
                  {formatTime(timer)}
                </div>
              </div>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            onClick={handleExit}
          >
            {showResults ? "Done" : "Exit"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden h-full">
        {!showResults ? (
          <>
            {/* Column 1: Problem Statement */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-r border-white/5 p-6 overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
              <Badge variant="warning" className="mb-4">Medium</Badge>
              <h2 className="text-xl font-bold mb-4 text-textPrimary">BFS State Space Search</h2>
              <p className="text-sm text-textSecondary leading-relaxed mb-6">
                Consider a state space where the start state is 1 and each state k has 2 successors: 2k and 2k+1.
                The goal state is 11. List the order in which nodes will be visited using breadth-first search.
              </p>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">INSTRUCTIONS</h3>
                <ol className="text-xs text-textSecondary space-y-2 list-decimal list-inside">
                  <li>You can click on ANY node in the tree</li>
                  <li>If selected node is not a child of current front node, you'll get an error</li>
                  <li>Keep trying until you select valid children of the front node</li>
                  <li>Click "Dequeue" to process the front node</li>
                  <li>Continue until you reach node 11</li>
                  <li>You can submit at any point to check your progress</li>
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
                    BFS explores level by level. Process nodes in FIFO order using a queue. For node k, children are 2k and 2k+1.
                    You can click any node, but only children of the current front node will be accepted.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Interactive Tree Workspace */}
            <div className={cn(
              "w-full lg:col-span-6 relative flex flex-col min-h-[50vh] lg:min-h-full overflow-auto transition-colors duration-300",
              workspaceTheme === 'dark' ? "bg-[#0F0E0D]" : "bg-gray-50"
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
                  className={cn(
                    "transition-colors duration-300",
                    workspaceTheme === 'dark' ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-100"
                  )}
                >
                  {workspaceTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="hidden md:inline ml-2">{workspaceTheme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setSolution(`// BFS Traversal Notes:\n// Start: Node 1\n// Goal: Node 11\n`)}
                  className={workspaceTheme === 'dark' ? "" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}
                >
                  Clear Notes
                </Button>
              </div>

              {showCalculator && (
                <Card className={cn(
                  "absolute top-16 right-4 z-20 w-64 shadow-2xl p-4 animate-in zoom-in-95 duration-200 select-none border transition-colors",
                  workspaceTheme === 'dark' ? "bg-surface border-white/10" : "bg-white border-gray-300"
                )}>
                  <div className={cn("flex justify-between items-center mb-4 pb-2",
                    workspaceTheme === 'dark' ? "border-b border-white/5" : "border-b border-gray-200"
                  )}>
                    <span className={cn("text-xs font-bold uppercase", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-600")}>
                      Calculator
                    </span>
                    <button onClick={() => setShowCalculator(false)} className={workspaceTheme === 'dark' ? "text-textSecondary hover:text-white" : "text-gray-600 hover:text-gray-900"}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={cn(
                    "p-3 rounded text-right font-mono text-xl mb-3 overflow-hidden text-ellipsis",
                    workspaceTheme === 'dark' ? "bg-black/40 text-white" : "bg-gray-100 text-gray-900"
                  )}>
                    <div className={cn("text-xs h-4", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-500")}>
                      {calcEquation}
                    </div>
                    {calcDisplay}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '.', '+'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => handleCalcInput(btn)}
                        className={cn(
                          "h-10 w-full rounded text-sm font-bold transition-colors",
                          workspaceTheme === 'dark' ?
                            ['/', '*', '-', '+'].includes(btn) ? 'bg-accent/20 text-accent hover:bg-accent/30' :
                              btn === 'C' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                'bg-white/5 hover:bg-white/10 text-white'
                            :
                            ['/', '*', '-', '+'].includes(btn) ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' :
                              btn === 'C' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                                'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        )}
                      >
                        {btn}
                      </button>
                    ))}
                    <button onClick={() => handleCalcInput('=')} className={cn(
                      "col-span-4 h-10 font-bold rounded hover:brightness-110 mt-2 transition-colors",
                      workspaceTheme === 'dark' ? "bg-accent text-background hover:bg-accentHover" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}>=</button>
                  </div>
                </Card>
              )}

              {/* Tree Visualization */}
              <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                <div className="mb-6 flex flex-col items-center">
                  <h3 className={cn("text-sm font-bold mb-4 self-start", workspaceTheme === 'dark' ? "text-accent" : "text-blue-600")}>
                    Interactive Tree (Click ANY node to try adding to queue)
                  </h3>
                  <svg viewBox="0 0 800 350" className={cn("w-full h-auto max-h-[300px] lg:max-h-[350px]", workspaceTheme === 'light' && "opacity-80")}>
                    {/* Draw edges */}
                    {Object.values(treeNodes).map(node =>
                      node.children.map(childValue => {
                        const child = treeNodes[childValue];
                        return (
                          <line
                            key={`${node.value}-${childValue}`}
                            x1={node.x}
                            y1={node.y}
                            x2={child.x}
                            y2={child.y}
                            stroke={workspaceTheme === 'dark' ? "rgba(250, 204, 21, 0.2)" : "rgba(59, 130, 246, 0.3)"}
                            strokeWidth="2"
                          />
                        );
                      })
                    )}

                    {/* Draw nodes - ALL nodes are now clickable */}
                    {Object.values(treeNodes).map(node => {
                      const isVisited = visitedNodes.includes(node.value);
                      const isInQueue = queue.includes(node.value);
                      const isFront = currentFront === node.value;
                      const isGoal = node.value === GOAL_NODE;
                      const isSelectable = !isVisited && !isInQueue;

                      return (
                        <g key={node.value}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="20"
                            fill={
                              isGoal && goalReached ? "#22c55e" :
                                isVisited ? "#facc15" :
                                  isFront ? "#f59e0b" :
                                    isInQueue ? "#3b82f6" :
                                      workspaceTheme === 'dark' ? "#1f2937" : "#e5e7eb"
                            }
                            stroke={
                              isGoal ? "#22c55e" :
                                isFront ? "#facc15" :
                                  isSelectable ? "#facc15" :
                                    workspaceTheme === 'dark' ? "rgba(250, 204, 21, 0.3)" : "rgba(250, 204, 21, 0.5)"
                            }
                            strokeWidth={isFront ? "3" : "2"}
                            className={isSelectable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}
                            onClick={() => isSelectable && handleNodeClick(node.value)}
                          />
                          <text
                            x={node.x}
                            y={node.y + 5}
                            textAnchor="middle"
                            fill={workspaceTheme === 'dark' ? "white" : "#1f2937"}
                            fontSize="14"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {node.value}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Queue Visualization */}
                <div className={cn(
                  "rounded-xl border p-6 mb-4 transition-colors",
                  workspaceTheme === 'dark' ? "bg-surface/30 border-white/5" : "bg-gray-100 border-gray-300"
                )}>
                  <h3 className={cn("text-sm font-bold mb-3", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-700")}>
                    QUEUE (FIFO)
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {queue.length === 0 ? (
                      <span className={cn("text-sm", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-600")}>
                        Empty
                      </span>
                    ) : (
                      queue.map((node, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "px-4 py-2 rounded-lg font-mono font-bold border-2 transition-colors",
                            idx === 0 ?
                              (workspaceTheme === 'dark' ? "bg-accent/20 border-accent text-accent" : "bg-blue-200 border-blue-600 text-blue-600")
                              :
                              (workspaceTheme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-gray-200 border-gray-400 text-gray-800")
                          )}
                        >
                          {node}
                          {idx === 0 && <span className="ml-2 text-xs">(front)</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* User Traversal Order */}
                <div className={cn(
                  "rounded-xl border p-6 mb-4 transition-colors",
                  workspaceTheme === 'dark' ? "bg-surface/30 border-white/5" : "bg-gray-100 border-gray-300"
                )}>
                  <h3 className={cn("text-sm font-bold mb-3", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-700")}>
                    YOUR TRAVERSAL ORDER
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {userTraversalOrder.length === 0 ? (
                      <span className={cn("text-sm", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-600")}>
                        No nodes selected yet
                      </span>
                    ) : (
                      userTraversalOrder.map((node, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "px-4 py-2 rounded-lg font-mono font-bold border-2 transition-colors",
                            node === GOAL_NODE ? "bg-green-500/20 border-green-500 text-green-400" :
                              workspaceTheme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-gray-200 border-gray-400 text-gray-800"
                          )}
                        >
                          {node}
                          {node === GOAL_NODE && <span className="ml-2 text-xs">(goal)</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className={cn(
                    "rounded-xl p-4 mb-4 flex items-start gap-3 animate-in slide-in-from-top-2 border transition-colors",
                    workspaceTheme === 'dark' ? "bg-red-500/10 border-red-500/30" : "bg-red-100 border-red-300"
                  )}>
                    <AlertCircle className={cn("w-5 h-5 shrink-0 mt-0.5", workspaceTheme === 'dark' ? "text-red-400" : "text-red-600")} />
                    <p className={cn("text-sm", workspaceTheme === 'dark' ? "text-red-300" : "text-red-700")}>{errorMessage}</p>
                  </div>
                )}

                {/* Current Front Node Info */}
                <div className={cn(
                  "rounded-xl border p-4 mb-4 transition-colors",
                  workspaceTheme === 'dark' ? "bg-accent/5 border-accent/20" : "bg-blue-50 border-blue-200"
                )}>
                  <h3 className={cn("text-sm font-bold mb-2", workspaceTheme === 'dark' ? "text-accent" : "text-blue-600")}>
                    Current Front Node: {currentFront}
                  </h3>
                  <p className={cn("text-xs", workspaceTheme === 'dark' ? "text-textSecondary" : "text-gray-600")}>
                    Valid children to select: {treeNodes[currentFront]?.children.filter(child =>
                      !visitedNodes.includes(child) && !queue.includes(child)
                    ).join(', ') || 'None (all children already in queue or visited)'}
                  </p>
                </div>

                <textarea
                  ref={textAreaRef}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className={cn(
                    "flex-1 w-full p-6 md:p-8 font-mono resize-none focus:outline-none text-sm leading-7 transition-colors duration-300",
                    workspaceTheme === 'dark' ? "bg-transparent text-white" : "bg-white text-black"
                  )}
                  placeholder="// Take notes about your BFS traversal..."
                />
              </div>
            </div>

            {/* Column 3: Controls - Made scrollable */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-hidden">
              {/* Make the content area scrollable */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest sticky top-0 bg-surface/30 backdrop-blur-sm py-2 -mt-6 -mx-6 px-6 z-10">Controls</h3>

                <div className="space-y-4 mb-auto">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-textSecondary mb-2">Current Front Node</div>
                    <div className="text-3xl font-bold text-accent">{currentFront}</div>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-textSecondary mb-2">Nodes in Queue</div>
                    <div className="text-3xl font-bold text-white">{queue.length}</div>
                  </div>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 font-bold py-6 text-base"
                    onClick={handleDequeue}
                    disabled={queue.length === 0 || goalReached}
                  >
                    Dequeue & Next Step →
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full gap-2 font-bold py-6 text-base"
                    onClick={handleDequeue}
                    disabled={queue.length === 0 || goalReached}
                  >
                    Dequeue Only
                  </Button>

                  {goalReached && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">Goal Reached!</span>
                      </div>
                      <p className="text-xs text-green-300">You've successfully found node 11 using BFS.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit button stays at bottom, not scrollable */}
              <div className="p-6 border-t border-white/5 bg-surface/30">
                <Button
                  size="lg"
                  className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20"
                  onClick={handleSubmit}
                >
                  Submit Solution
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Results View */
          <div className="lg:col-span-12 max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500 w-full overflow-y-auto">
            {/* Result Hero */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl",
                userTraversalOrder.includes(GOAL_NODE) && isTraversalCorrect() ? "bg-green-500 shadow-green-500/20 animate-bounce duration-[2000ms]" :
                  userTraversalOrder.includes(GOAL_NODE) ? "bg-orange-500 shadow-orange-500/20" : "bg-red-500 shadow-red-500/20"
              )}>
                {userTraversalOrder.includes(GOAL_NODE) ? (
                  isTraversalCorrect() ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-white" />
                  )
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {userTraversalOrder.includes(GOAL_NODE)
                  ? (isTraversalCorrect() ? "Perfect BFS Execution!" : "Goal Reached with Learning Points")
                  : "Goal Not Reached"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                {userTraversalOrder.includes(GOAL_NODE)
                  ? (isTraversalCorrect()
                    ? "You've correctly implemented the breadth-first search algorithm with perfect node ordering."
                    : "You successfully reached the goal node! Review the optimal solution below to refine your BFS understanding.")
                  : "You didn't reach the goal node (11). Your traversal stopped before finding the goal."}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(timer)}</div>
                <div className="text-xs text-green-400 font-medium">Efficient traversal</div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Accuracy Score</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {userTraversalOrder.includes(GOAL_NODE) ? (isTraversalCorrect() ? 100 : 70) : 50}%
                </div>
                <div className="text-xs text-textSecondary">
                  {isTraversalCorrect() ? "Perfect BFS order" : userTraversalOrder.includes(GOAL_NODE) ? "Goal reached" : "Goal not reached"}
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Nodes in Traversal</div>
                <div className="text-2xl font-bold text-accent mb-1">{userTraversalOrder.length}</div>
                <div className="text-xs text-accent/60 font-medium">
                  {userTraversalOrder.includes(GOAL_NODE) ? "Goal reached" : "Goal not reached"}
                </div>
              </Card>
            </div>

            {/* Side-by-Side Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Your Traversal Order</h3>
                  <Badge variant="secondary" className="bg-white/5 border-white/10">
                    {userTraversalOrder.length} nodes
                  </Badge>
                </div>
                <div className="bg-surface/30 rounded-2xl border border-white/5 p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 relative group">
                  <div className="text-xs text-textSecondary mb-3 font-mono">
                    Traversal Order: [{userTraversalOrder.join(', ')}]
                  </div>
                  <div className="space-y-2">
                    {solution.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="w-4 text-textSecondary/30 text-[10px] pt-1">{i + 1}</span>
                        <span className="text-sm text-textSecondary font-mono">{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                  {!userTraversalOrder.includes(GOAL_NODE) && (
                    <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      <h4 className="text-xs font-bold text-red-400 mb-2 uppercase">Goal Not Reached</h4>
                      <p className="text-xs text-red-300/80">
                        Your traversal doesn't include the goal node (11). You stopped at node {userTraversalOrder[userTraversalOrder.length - 1]}.
                      </p>
                    </div>
                  )}
                  {userTraversalOrder.includes(GOAL_NODE) && !isTraversalCorrect() && (
                    <div className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <h4 className="text-xs font-bold text-orange-400 mb-2 uppercase">Difference Detected</h4>
                      <p className="text-xs text-orange-300/80">
                        Your traversal order differs from the optimal BFS sequence. Compare carefully with the solution on the right.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Optimal Solution Walkthrough</h3>
                  <Badge variant="outline" className="border-accent/30 text-accent">Verified</Badge>
                </div>
                <div className="bg-accent/5 rounded-2xl border border-accent/10 p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/10">
                  <div className="text-xs text-accent mb-4 font-mono">
                    Correct BFS Order: [{CORRECT_BFS_ORDER.join(', ')}]
                  </div>
                  <div className="space-y-2 mb-6">
                    {correctSolution.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="w-4 text-accent/30 text-[10px] pt-1">{i + 1}</span>
                        <span className="text-sm text-textPrimary font-mono">{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Key Takeaway</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      BFS explores nodes level by level using a queue (FIFO). For each node k, its children are 2k and 2k+1.
                      The algorithm processes nodes in the exact order they're added to the queue, ensuring all nodes at depth d
                      are visited before any node at depth d+1.
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
                  <Sun className="w-5 h-5 text-accent" /> Algorithm Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-textSecondary">
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Traversal Status</h4>
                    <p className="mb-4">
                      Your BFS traversal visited <span className="font-bold text-accent">{userTraversalOrder.length}</span> nodes
                      in the order: <span className="font-mono text-white">[{userTraversalOrder.join(', ')}]</span>.
                    </p>
                    {userTraversalOrder.includes(GOAL_NODE) ? (
                      isTraversalCorrect() ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <p className="text-green-300">
                            ✓ Your traversal matches the optimal BFS order perfectly! You correctly implemented the
                            level-order exploration pattern.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <p className="text-orange-300">
                            You reached the goal but your traversal order differs from the optimal BFS sequence.
                            Remember: BFS explores all nodes at the current level before moving to the next level.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-300">
                          Your traversal didn't reach the goal node (11). You stopped at node {userTraversalOrder[userTraversalOrder.length - 1]}.
                          In BFS, you should continue processing the queue until you find the goal.
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Algorithm Properties</h4>
                    <p className="mb-4">
                      BFS guarantees the shortest path in unweighted graphs. Time complexity is O(V + E) where V is vertices
                      and E is edges. Space complexity is O(V) for the queue.
                    </p>
                    <p className="text-xs">
                      <strong className="text-white">State Space:</strong> Each node k generates successors 2k and 2k+1,
                      creating a binary tree structure where BFS naturally explores by levels.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Visual Comparison */}
            <Card className="p-8 bg-surface/20 border border-white/5 mb-12">
              <h3 className="text-lg font-bold text-white mb-6">BFS Execution Visualization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-accent mb-3 uppercase">Level 0 (Root)</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-accent/30 text-accent">1</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-accent mb-3 uppercase">Level 1</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-accent/30 text-accent">2</Badge>
                    <Badge variant="outline" className="border-accent/30 text-accent">3</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-accent mb-3 uppercase">Level 2</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="border-accent/30 text-accent">4</Badge>
                    <Badge variant="outline" className="border-accent/30 text-accent">5</Badge>
                    <Badge variant="outline" className="border-accent/30 text-accent">6</Badge>
                    <Badge variant="outline" className="border-accent/30 text-accent">7</Badge>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <h4 className="text-xs font-bold text-accent mb-3 uppercase">Level 3 (Goal Level)</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="border-accent/30 text-accent">8</Badge>
                    <Badge variant="outline" className="border-accent/30 text-accent">9</Badge>
                    <Badge variant="outline" className="border-accent/30 text-accent">10</Badge>
                    <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">11 (Goal)</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/40">12-15 (not visited)</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  <strong>BFS Strategy:</strong> The algorithm stops when the goal (11) is dequeued, which occurs after
                  exploring all nodes at levels 0, 1, 2, and the first four nodes of level 3. This demonstrates BFS's
                  level-by-level exploration pattern.
                </p>
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