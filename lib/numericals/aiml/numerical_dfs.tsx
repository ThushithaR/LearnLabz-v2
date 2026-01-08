"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calculator, X, CheckCircle, XCircle, ChevronDown, ChevronRight, Sun, ArrowLeft, AlertCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

// Graph structure
interface GraphNode {
  id: number;
  x: number;
  y: number;
  neighbors: number[];
}

// Updated graph: 0 connected to 1 and 2, 1 connected to 0 and 2, 2 connected to 1, 3, 4
const GRAPH: Record<number, GraphNode> = {
  0: { id: 0, x: 300, y: 100, neighbors: [1, 2] },     // Top center
  1: { id: 1, x: 200, y: 200, neighbors: [0, 2] },    // Left middle
  2: { id: 2, x: 400, y: 200, neighbors: [1, 3, 4] }, // Right middle
  3: { id: 3, x: 400, y: 300, neighbors: [2] },       // Bottom right
  4: { id: 4, x: 200, y: 300, neighbors: [2] },       // Bottom left
};

const EDGES = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
];

const START_NODE = 0;

export default function DFSGraphTraversal({ params }: { params: { id: string; course: string } }) {
  const router = useRouter();
  const [solution, setSolution] = useState<string>(`// DFS Traversal Notes:\n// Start: Node ${START_NODE}\n// Algorithm: Depth-First Search\n`);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [timer, setTimer] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [workspaceTheme] = useState<'dark' | 'light'>('dark');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [workingPenalty, setWorkingPenalty] = useState(0);
  const [isStarred, setIsStarred] = useState(false);

  // DFS State
  const [stack, setStack] = useState<number[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [traversalComplete, setTraversalComplete] = useState<boolean>(false);
  const [userTraversalOrder, setUserTraversalOrder] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [step, setStep] = useState<'select' | 'explore' | 'backtrack'>('select');

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleExit = () => {
    router.push(`/dashboard/${params.course}/numericals`);
  };

  const toggleStar = () => {
    setIsStarred(!isStarred);
  };

  // Initialize DFS with start node
  const initializeDFS = () => {
    if (isInitialized) {
      setErrorMessage("DFS already initialized. Please continue exploring.");
      return;
    }

    // Step 1: Select source node and mark as visited, push to stack
    setStack([START_NODE]);
    setVisitedNodes([START_NODE]);
    setCurrentNode(START_NODE);
    setUserTraversalOrder([START_NODE]);
    setIsInitialized(true);
    setStep('explore');
    setErrorMessage("");
    
    // Update solution notes
    setSolution(prev => prev + `\n// Step 1: Selected source node ${START_NODE}, marked visited, pushed to stack\n// Stack: [${START_NODE}], Visited: [${START_NODE}]`);
  };

  const handleNodeClick = (nodeId: number) => {
    if (traversalComplete) return;
    
    if (!isInitialized) {
      setErrorMessage("Please initialize DFS first by clicking 'Initialize DFS'.");
      return;
    }

    if (step !== 'explore') {
      setErrorMessage(`Current step is ${step}. Please complete this step first.`);
      return;
    }

    // Check if node is already visited
    if (visitedNodes.includes(nodeId)) {
      setErrorMessage(`Node ${nodeId} is already visited. Select an unvisited neighbor.`);
      return;
    }

    // Check if node is a neighbor of current node
    if (currentNode === null || !GRAPH[currentNode].neighbors.includes(nodeId)) {
      setErrorMessage(`Node ${nodeId} is not a neighbor of current node ${currentNode}. Please select an adjacent unvisited node.`);
      return;
    }

    // Valid selection - go deeper
    const newStack = [nodeId, ...stack]; // Push to stack (LIFO)
    const newVisited = [...visitedNodes, nodeId];
    const newTraversalOrder = [...userTraversalOrder, nodeId];
    
    setStack(newStack);
    setVisitedNodes(newVisited);
    setCurrentNode(nodeId);
    setUserTraversalOrder(newTraversalOrder);
    setStep('explore');
    setErrorMessage("");
    
    // Update solution notes
    setSolution(prev => prev + `\n// Step ${userTraversalOrder.length + 1}: Selected neighbor ${nodeId}, marked visited, pushed to stack\n// Stack: [${newStack.join(', ')}], Visited: [${newVisited.join(', ')}]`);
  };

  const handleBacktrack = () => {
    if (!isInitialized) {
      setErrorMessage("Please initialize DFS first.");
      return;
    }

    if (stack.length === 0) {
      setErrorMessage("Stack is empty. Traversal complete.");
      setTraversalComplete(true);
      return;
    }

    // Pop from stack (LIFO - remove first element)
    const [poppedNode, ...remainingStack] = stack;
    
    // Check if popped node has unvisited neighbors
    const poppedNodeNeighbors = GRAPH[poppedNode].neighbors;
    const hasUnvisitedNeighbors = poppedNodeNeighbors.some(neighbor => !visitedNodes.includes(neighbor));
    
    if (hasUnvisitedNeighbors && poppedNode === currentNode) {
      setErrorMessage(`Node ${poppedNode} still has unvisited neighbors. Explore them first before backtracking.`);
      return;
    }

    // Backtrack - pop current node
    setStack(remainingStack);
    
    // If stack is not empty, set new current node (top of stack)
    const newCurrentNode = remainingStack.length > 0 ? remainingStack[0] : null;
    setCurrentNode(newCurrentNode);
    
    setStep(remainingStack.length > 0 ? 'explore' : 'select');
    
    // Check if traversal is complete
    const allNodes = Object.keys(GRAPH).map(Number);
    const allVisited = allNodes.every(node => visitedNodes.includes(node));
    
    if (allVisited && remainingStack.length === 0) {
      setTraversalComplete(true);
      setErrorMessage("DFS traversal complete! All nodes have been visited.");
    } else if (remainingStack.length === 0) {
      setErrorMessage("Stack is empty but not all nodes are visited. Some nodes may be unreachable.");
    } else {
      setErrorMessage(`Backtracked from node ${poppedNode}. Current node is ${newCurrentNode}.`);
    }
    
    // Update solution notes
    setSolution(prev => prev + `\n// Backtrack: Popped ${poppedNode} from stack\n// New stack: [${remainingStack.join(', ')}], Current node: ${newCurrentNode}`);
  };

  const handleSubmit = () => {
    setIsTimerRunning(false);

    // Check workspace content
    const content = solution.toLowerCase();
    const hasKeywords = ["dfs", "stack", "depth", "backtrack", "neighbor"].some(word => content.includes(word));
    const hasMeaningfulContent = solution.replace(/\/\/ DFS Traversal Notes:[\s\S]*?Algorithm: Depth-First Search\n/g, '').trim().length > 20;

    if (!hasMeaningfulContent || !hasKeywords) {
      setWorkingPenalty(15);
    } else {
      setWorkingPenalty(0);
    }

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

  const resetTraversal = () => {
    setStack([]);
    setVisitedNodes([]);
    setCurrentNode(null);
    setTraversalComplete(false);
    setUserTraversalOrder([]);
    setIsInitialized(false);
    setStep('select');
    setErrorMessage("");
    setSolution(`// DFS Traversal Notes:\n// Start: Node ${START_NODE}\n// Algorithm: Depth-First Search\n`);
  };

  // Correct DFS order from starting at node 0
  const correctDFSOrders = [
    [0, 1, 2, 3, 4],   // 0 → 1 → 2 → 3 → 4
    [0, 1, 2, 4, 3],   // 0 → 1 → 2 → 4 → 3
    [0, 2, 1, 3, 4],   // 0 → 2 → 1 → 3 → 4
    [0, 2, 1, 4, 3],   // 0 → 2 → 1 → 4 → 3
    [0, 2, 3, 4, 1],   // 0 → 2 → 3 → 4 → 1
    [0, 2, 4, 3, 1],   // 0 → 2 → 4 → 3 → 1
  ];

  const isTraversalCorrect = correctDFSOrders.some(order => 
    userTraversalOrder.length === order.length &&
    userTraversalOrder.every((val, idx) => val === order[idx])
  );

  const correctSolution = `// DFS Algorithm Steps:
// 1. Start: Initialize with source node 0
//    - Mark 0 as visited
//    - Push 0 onto stack: [0]
//    - Current node: 0
//
// 2. Explore unvisited neighbors of current node (0):
//    Neighbors: 1, 2 (both unvisited)
//    Choose one to go deeper (e.g., 1)
//    - Mark 1 as visited
//    - Push 1 onto stack: [1, 0]
//    - Current node: 1
//
// 3. Explore unvisited neighbors of current node (1):
//    Neighbors: 0 (visited), 2 (unvisited)
//    - Mark 2 as visited
//    - Push 2 onto stack: [2, 1, 0]
//    - Current node: 2
//
// 4. Explore unvisited neighbors of current node (2):
//    Neighbors: 1 (visited), 3 (unvisited), 4 (unvisited)
//    Choose one to go deeper (e.g., 3)
//    - Mark 3 as visited
//    - Push 3 onto stack: [3, 2, 1, 0]
//    - Current node: 3
//
// 5. Node 3 has no unvisited neighbors (dead end)
//    - Backtrack: Pop 3 from stack: [2, 1, 0]
//    - Current node: 2
//
// 6. Continue exploring unvisited neighbors of current node (2):
//    Remaining unvisited neighbor: 4
//    - Mark 4 as visited
//    - Push 4 onto stack: [4, 2, 1, 0]
//    - Current node: 4
//
// 7. Node 4 has no unvisited neighbors (dead end)
//    - Backtrack: Pop 4 from stack: [2, 1, 0]
//    - Current node: 2
//
// 8. Node 2 has no more unvisited neighbors
//    - Backtrack: Pop 2 from stack: [1, 0]
//    - Current node: 1
//
// 9. Node 1 has no more unvisited neighbors
//    - Backtrack: Pop 1 from stack: [0]
//    - Current node: 0
//
// 10. Node 0 has no more unvisited neighbors
//     - Backtrack: Pop 0 from stack: []
//     - Stack empty → Traversal complete
//
// Final visited order: [0, 1, 2, 3, 4]
// (Order may vary based on neighbor selection)`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
        <div>
          <h1 className="text-lg font-bold text-textPrimary">DFS Graph Traversal</h1>
          <p className="text-sm text-textSecondary">Depth-First Search Algorithm Implementation</p>
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
              <h2 className="text-xl font-bold mb-4 text-textPrimary">DFS Algorithm Implementation</h2>
              <p className="text-sm text-textSecondary leading-relaxed mb-6">
                Implement Depth-First Search traversal starting from node 0. Follow the DFS algorithm steps carefully.
              </p>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">DFS ALGORITHM STEPS</h3>
                <ol className="text-xs text-textSecondary space-y-2 list-decimal list-inside">
                  <li>Select source node (0) and mark as visited. Push onto stack.</li>
                  <li>Explore unvisited adjacent nodes of current node.</li>
                  <li>Go deeper: For each unvisited neighbor, recursively apply DFS.</li>
                  <li>Backtrack: If dead end (no unvisited neighbors), pop from stack.</li>
                  <li>Return to previous node to explore other unvisited branches.</li>
                  <li>Repeat until stack is empty and all nodes visited.</li>
                </ol>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-accent mb-3">CURRENT STATUS</h3>
                <div className="text-xs text-textSecondary space-y-2">
                  <div><span className="text-white">Step:</span> {step.toUpperCase()}</div>
                  <div><span className="text-white">Current Node:</span> {currentNode !== null ? currentNode : "None"}</div>
                  <div><span className="text-white">Stack Size:</span> {stack.length}</div>
                  <div><span className="text-white">Visited Nodes:</span> {visitedNodes.length} / 5</div>
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
                    DFS uses a stack (LIFO). Always explore the most recently added node first.
                    Remember to backtrack when you reach a dead end (node with no unvisited neighbors).
                    Multiple valid traversal orders exist.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Interactive Workspace */}
            <div className="w-full lg:col-span-6 bg-[#0F0E0D] relative flex flex-col min-h-[50vh] lg:min-h-full overflow-auto">
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
                <Button size="sm" variant="secondary" onClick={resetTraversal}>
                  Reset Traversal
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
              <div className="flex-1 p-8 overflow-auto">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-accent mb-4">
                    Graph Visualization {!isInitialized && "(Click 'Initialize DFS' to start)"}
                    {isInitialized && `(Current node: ${currentNode}, Step: ${step})`}
                  </h3>
                  <svg width="600" height="350" className="border border-white/5 rounded-lg bg-black/20 mx-auto">
                    {/* Draw edges */}
                    {EDGES.map(([from, to], idx) => {
                      const fromNode = GRAPH[from];
                      const toNode = GRAPH[to];
                      return (
                        <line
                          key={idx}
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="rgba(250, 204, 21, 0.3)"
                          strokeWidth="3"
                        />
                      );
                    })}
                    
                    {/* Draw nodes */}
                    {Object.values(GRAPH).map(node => {
                      const isVisited = visitedNodes.includes(node.id);
                      const isCurrent = currentNode === node.id;
                      const isInStack = stack.includes(node.id);
                      const isClickable = isInitialized && step === 'explore' && 
                                         currentNode !== null && 
                                         GRAPH[currentNode].neighbors.includes(node.id) && 
                                         !isVisited;
                      
                      return (
                        <g key={node.id}>
                          {/* Node circle */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="30"
                            fill={
                              isCurrent ? "#f59e0b" :        // Orange for current node
                              isVisited ? "#22c55e" :        // Green for visited
                              "#374151"                      // Gray for unvisited
                            }
                            stroke={
                              isCurrent ? "#facc15" :
                              isClickable ? "#facc15" :
                              isInStack ? "#3b82f6" :        // Blue for nodes in stack
                              "rgba(250, 204, 21, 0.3)"
                            }
                            strokeWidth={isCurrent ? "4" : "2"}
                            className={isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                            onClick={() => isClickable && handleNodeClick(node.id)}
                          />
                          {/* Node label */}
                          <text
                            x={node.x}
                            y={node.y + 8}
                            textAnchor="middle"
                            fill="white"
                            fontSize="18"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {node.id}
                          </text>
                          {/* Stack indicator */}
                          {isInStack && !isCurrent && (
                            <circle
                              cx={node.x + 20}
                              cy={node.y - 20}
                              r="8"
                              fill="#3b82f6"
                              stroke="#1d4ed8"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Stack Visualization */}
                <div className="bg-surface/30 rounded-xl border border-white/5 p-6 mb-4">
                  <h3 className="text-sm font-bold text-textSecondary mb-3">STACK (LIFO) - Top → Bottom</h3>
                  <div className="flex flex-col gap-2 min-h-[100px] items-center">
                    {stack.length === 0 ? (
                      <div className="text-textSecondary text-sm py-10">Stack is empty</div>
                    ) : (
                      <>
                        <div className="text-xs text-accent mb-2 w-full text-center">
                          Top of stack (will be popped first)
                        </div>
                        {stack.map((node, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "px-6 py-4 rounded-lg font-mono font-bold border-2 text-center w-48 transition-all",
                              idx === 0 
                                ? "bg-accent/30 border-accent text-accent shadow-lg" 
                                : "bg-white/5 border-white/10 text-white opacity-80"
                            )}
                            style={{
                              transform: `translateX(${idx * 10}px)`,
                              zIndex: stack.length - idx
                            }}
                          >
                            <div className="text-lg">Node {node}</div>
                            {idx === 0 && (
                              <div className="text-xs mt-2 text-accent">Current Node</div>
                            )}
                            {idx > 0 && (
                              <div className="text-xs mt-2 text-textSecondary">Waiting for backtrack</div>
                            )}
                          </div>
                        ))}
                        <div className="text-xs text-textSecondary mt-2 w-full text-center">
                          Bottom of stack (first pushed)
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Visited Nodes */}
                <div className="bg-surface/30 rounded-xl border border-white/5 p-6 mb-4">
                  <h3 className="text-sm font-bold text-textSecondary mb-3">VISITED NODES</h3>
                  <div className="flex items-center gap-2 flex-wrap min-h-[60px]">
                    {visitedNodes.length === 0 ? (
                      <span className="text-textSecondary text-sm">No nodes visited yet</span>
                    ) : (
                      visitedNodes.map((node, idx) => (
                        <div 
                          key={idx} 
                          className="px-4 py-3 rounded-lg font-mono font-bold bg-green-500/20 border-2 border-green-500 text-green-400"
                        >
                          Node {node}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className={cn(
                    "rounded-xl p-4 mb-4 flex items-start gap-3 animate-in slide-in-from-top-2",
                    errorMessage.includes("Error") || errorMessage.includes("not") 
                      ? "bg-red-500/10 border border-red-500/30" 
                      : "bg-blue-500/10 border border-blue-500/30"
                  )}>
                    <AlertCircle className={cn(
                      "w-5 h-5 shrink-0 mt-0.5",
                      errorMessage.includes("Error") || errorMessage.includes("not") 
                        ? "text-red-400" 
                        : "text-blue-400"
                    )} />
                    <p className={cn(
                      "text-sm",
                      errorMessage.includes("Error") || errorMessage.includes("not") 
                        ? "text-red-300" 
                        : "text-blue-300"
                    )}>{errorMessage}</p>
                  </div>
                )}

                {/* Completion Message */}
                {traversalComplete && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-bold text-green-400">DFS Traversal Complete!</span>
                    </div>
                    <p className="text-xs text-green-300">
                      All nodes have been visited. The stack is empty. You can submit your solution.
                    </p>
                  </div>
                )}

                {/* Notes Area */}
                <textarea
                  ref={textAreaRef}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full h-32 p-4 font-mono resize-none focus:outline-none text-sm leading-7 bg-black/20 text-white rounded-xl border border-white/5"
                  placeholder="// Document your DFS traversal steps, stack operations, and observations..."
                />
              </div>
            </div>

            {/* Column 3: Controls */}
            <div className="w-full lg:col-span-3 bg-surface/30 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col shrink-0">
              <h3 className="font-bold text-sm mb-6 uppercase text-textSecondary tracking-widest">DFS Controls</h3>

              <div className="space-y-4 mb-auto">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Current Step</div>
                  <div className="text-xl font-bold text-accent capitalize">{step}</div>
                  <div className="text-xs text-textSecondary mt-1">
                    {step === 'select' && "Select source node to start DFS"}
                    {step === 'explore' && "Explore unvisited neighbors of current node"}
                    {step === 'backtrack' && "Backtrack from current node"}
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-textSecondary mb-2">Progress</div>
                  <div className="text-2xl font-bold text-white">{visitedNodes.length} / 5 nodes</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-accent rounded-full h-2 transition-all duration-300"
                      style={{ width: `${(visitedNodes.length / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {!isInitialized ? (
                  <Button 
                    size="lg" 
                    className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
                    onClick={initializeDFS}
                  >
                    Initialize DFS
                    <span className="text-xs opacity-80">(Start with node 0)</span>
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full gap-2 font-bold py-6 text-base hover:scale-[1.02] transition-transform"
                      onClick={handleBacktrack}
                      disabled={stack.length === 0 || step !== 'explore'}
                    >
                      Backtrack
                      <span className="text-xs opacity-80">(Pop from stack)</span>
                    </Button>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-400 mb-2">Instructions</h4>
                      <p className="text-xs text-blue-300">
                        {step === 'explore' && "Click on adjacent unvisited nodes (highlighted in yellow) to go deeper."}
                        {step === 'backtrack' && "Click 'Backtrack' when current node has no unvisited neighbors."}
                      </p>
                    </div>
                  </>
                )}

                {isInitialized && currentNode !== null && (
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-accent mb-2">Current Node: {currentNode}</h4>
                    <p className="text-xs text-textSecondary">
                      Unvisited neighbors: {
                        GRAPH[currentNode].neighbors
                          .filter(neighbor => !visitedNodes.includes(neighbor))
                          .join(', ') || 'None'
                      }
                    </p>
                  </div>
                )}
              </div>

              <Button 
                size="lg" 
                className="w-full gap-2 font-bold py-6 text-base shadow-lg shadow-accent/20 mt-6 hover:scale-[1.02] transition-transform"
                onClick={handleSubmit}
                disabled={!traversalComplete}
              >
                {traversalComplete ? "Submit Solution" : "Complete Traversal First"}
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
                isTraversalCorrect 
                  ? "bg-green-500 shadow-green-500/20 animate-bounce duration-[2000ms]" 
                  : "bg-orange-500 shadow-orange-500/20"
              )}>
                {isTraversalCorrect ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                {isTraversalCorrect 
                  ? "DFS Algorithm Correctly Implemented!" 
                  : "DFS Traversal Completed"}
              </h2>
              <p className="text-textSecondary text-lg max-w-xl">
                {isTraversalCorrect
                  ? "You've correctly implemented the Depth-First Search algorithm with proper stack usage!"
                  : "You completed the traversal. Review the optimal solution to understand DFS better."}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Time Taken</div>
                <div className="text-2xl font-bold text-white mb-1">{formatTime(timer)}</div>
                <div className="text-xs text-green-400 font-medium">DFS traversal completed</div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Accuracy Score</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.max(0, (isTraversalCorrect ? 100 : 70) - workingPenalty)}%
                </div>
                <div className={cn("text-xs font-medium", workingPenalty > 0 ? "text-red-400" : "text-textSecondary")}>
                  {workingPenalty > 0 ? "Penalty: Insufficient notes" : "Well documented"}
                </div>
              </Card>
              <Card className="p-6 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase tracking-widest font-bold text-textSecondary mb-1">Nodes Visited</div>
                <div className="text-2xl font-bold text-accent mb-1">{visitedNodes.length} / 5</div>
                <div className="text-xs text-accent/60 font-medium">
                  {visitedNodes.length === 5 ? "All nodes visited" : "Partial traversal"}
                </div>
              </Card>
            </div>

            {/* Side-by-Side Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Your Implementation</h3>
                  <Badge variant="secondary" className="bg-white/5 border-white/10">
                    {visitedNodes.length} nodes visited
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
                  {!isTraversalCorrect && (
                    <div className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <h4 className="text-xs font-bold text-orange-400 mb-2 uppercase">Note</h4>
                      <p className="text-xs text-orange-300/80">
                        Your traversal is valid if you followed DFS correctly. 
                        Multiple valid orders exist depending on the order you explored neighbors.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Optimal Solution</h3>
                  <Badge variant="outline" className="border-accent/30 text-accent">Algorithm Steps</Badge>
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
                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">DFS Key Concepts</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      DFS uses a stack (LIFO) to explore depth-first. Always go deeper into unvisited neighbors before backtracking.
                      The algorithm completes when the stack is empty and all reachable nodes are visited.
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
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Stack Usage Analysis</h4>
                    <p className="mb-4">
                      You used the stack correctly by pushing nodes when going deeper and popping when backtracking.
                      Maximum stack depth: <span className="font-bold text-accent">{Math.max(0, ...stack.map((_, idx) => stack.length - idx))}</span>
                    </p>
                    {isTraversalCorrect ? (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-300">
                          ✓ Correct stack operations! You properly implemented LIFO behavior for DFS.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <p className="text-orange-300">
                          Review stack operations. Remember: push when going deeper, pop when backtracking.
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-textPrimary mb-3 underline decoration-accent/30 underline-offset-4">Traversal Completeness</h4>
                    <p className="mb-4">
                      You visited <span className="font-bold text-accent">{visitedNodes.length}</span> out of 5 nodes.
                      {visitedNodes.length === 5 ? " All nodes were reached!" : " Some nodes may be unreachable."}
                    </p>
                    {workingPenalty > 0 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                        <h5 className="text-xs font-bold text-red-400 uppercase mb-1">
                          <XCircle className="w-3 h-3 inline mr-2" /> Documentation Penalty
                        </h5>
                        <p className="text-[11px] text-red-300/80">
                          Include more detailed notes about your stack operations and backtracking decisions.
                        </p>
                      </div>
                    )}
                    <p className="text-xs">
                      <strong className="text-white">DFS Time Complexity:</strong> O(V + E) where V = vertices, E = edges
                      <br />
                      <strong className="text-white">Space Complexity:</strong> O(V) for the stack
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