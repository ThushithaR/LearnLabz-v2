"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight, 
  Sun, 
  Star, 
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tree structure for BFS
type TreeData = {
  [key: number]: number[];
};

const treeData: TreeData = {
  1: [2, 3, 4],
  2: [5, 6],
  3: [7, 8],
  4: [9, 10],
  5: [11, 12],
  6: [13],
  7: [14],
  8: [15],
  9: [],
  10: [],
  11: [],
  12: [],
  13: [],
  14: [],
  15: []
};

const correctPath = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Node positions type
type NodePositions = {
  [key: number]: { x: number; y: number };
};

const nodePositions: NodePositions = {
  1: { x: 400, y: 50 },
  2: { x: 200, y: 150 },
  3: { x: 400, y: 150 },
  4: { x: 600, y: 150 },
  5: { x: 100, y: 250 },
  6: { x: 300, y: 250 },
  7: { x: 400, y: 250 },
  8: { x: 500, y: 250 },
  9: { x: 550, y: 250 },
  10: { x: 650, y: 250 },
  11: { x: 50, y: 350 },
  12: { x: 150, y: 350 },
  13: { x: 300, y: 350 },
  14: { x: 400, y: 350 },
  15: { x: 500, y: 350 }
};

export default function BFSNumericalSolver() {
  const [timer, setTimer] = useState<number>(0);
  const [hintOpen, setHintOpen] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  
  // BFS specific states
  const [currentNode, setCurrentNode] = useState<number>(1);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([1]);
  const [queue, setQueue] = useState<number[]>([1]);
  const [selectedPath, setSelectedPath] = useState<number[]>([1]);
  const [availableNodes, setAvailableNodes] = useState<number[]>([]);
  const [foundGoal, setFoundGoal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    // Initialize available nodes with children of root
    setAvailableNodes(treeData[1] || []);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNodeSelect = (node: number): void => {
    // Check if node can be selected (must be in available nodes)
    if (!availableNodes.includes(node)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    // Add node to visited path
    const newPath = [...selectedPath, node];
    setSelectedPath(newPath);
    
    // Update queue (BFS logic)
    const newQueue = [...queue];
    newQueue.shift(); // Remove the current node being processed
    
    // Add children of the selected node to the queue if not visited
    const children = treeData[node] || [];
    children.forEach((child: number) => {
      if (!visitedNodes.includes(child) && !newQueue.includes(child)) {
        newQueue.push(child);
      }
    });
    
    setQueue(newQueue);
    
    // Update visited nodes
    const newVisited = [...visitedNodes, node];
    setVisitedNodes(newVisited);
    
    // Check if goal is reached
    if (node === 11) {
      setFoundGoal(true);
    }
    
    // Update available nodes (next nodes in queue)
    const nextAvailable = newQueue.filter(n => !newVisited.includes(n));
    setAvailableNodes(nextAvailable);
    
    setCurrentNode(node);
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = (): void => {
    setIsTimerRunning(false);
    setShowResults(true);
  };

  const handleReset = (): void => {
    setCurrentNode(1);
    setVisitedNodes([1]);
    setQueue([1]);
    setSelectedPath([1]);
    setAvailableNodes(treeData[1] || []);
    setFoundGoal(false);
    setCurrentStep(1);
    setShowResults(false);
    setTimer(0);
    setIsTimerRunning(true);
    setShowError(false);
  };

  const isCorrect = JSON.stringify(selectedPath) === JSON.stringify(correctPath);
  const accuracy = Math.round((selectedPath.filter((node, idx) => node === correctPath[idx]).length / correctPath.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 border-b border-white/10 px-4 md:px-6 py-4 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              BFS Path Discovery
              <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 text-xs">Interactive</Badge>
            </h1>
            <p className="text-sm text-textSecondary">Find the optimal path to Node 11 using Breadth-First Search</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {!showResults && (
            <>
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-cyan-400/10 transition-all group"
              >
                <Star className={`w-5 h-5 ${isStarred ? 'fill-cyan-400 text-cyan-400' : 'text-textSecondary group-hover:text-cyan-400'} transition-colors`} />
              </button>
              <div className="text-right">
                <div className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">Time Elapsed</div>
                <div className="font-mono text-2xl text-cyan-400 font-bold tabular-nums">{formatTime(timer)}</div>
              </div>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
            onClick={() => window.location.href = '/dashboard'}
          >
            Exit Challenge
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!showResults ? (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Panel - Instructions */}
            <div className="lg:col-span-3 bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-r border-white/5 p-6 overflow-y-auto backdrop-blur-sm">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 shadow-lg shadow-purple-500/20">
                Medium Difficulty
              </Badge>
              
              <h2 className="text-2xl font-black mb-4 text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-cyan-400" />
                Challenge Brief
              </h2>
              
              <div className="space-y-4 text-sm text-textSecondary leading-relaxed">
                <p className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-cyan-400 font-bold">🎯 Goal:</span> Traverse the tree using BFS algorithm to reach <span className="text-cyan-400 font-black text-lg px-2 py-0.5 bg-cyan-400/20 rounded">Node 11</span>
                </p>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-4 rounded-xl border border-purple-500/20">
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    How It Works
                  </h3>
                  <ol className="space-y-2 text-xs">
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">1.</span>
                      <span>Start from the root node (Node 1)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">2.</span>
                      <span>Select nodes from available options to add to queue</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">3.</span>
                      <span>Follow BFS order: explore level by level</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">4.</span>
                      <span>Continue until you reach the goal node</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-xs">Pro Tip</span>
                  </div>
                  <p className="text-xs">In BFS, always process nodes in the order they were added to the queue. Think of it like a line at a ticket counter - first in, first out!</p>
                </div>
              </div>

              {/* Collapsible Hint */}
              <div className="mt-6">
                <div
                  className="flex justify-between items-center cursor-pointer p-3 rounded-xl select-none bg-cyan-500/10 hover:bg-cyan-500/20 transition-all border border-cyan-500/20"
                  onClick={() => setHintOpen(!hintOpen)}
                >
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    STRATEGIC HINT
                  </span>
                  {hintOpen ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${hintOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                  <div className="p-4 border-l-2 border-cyan-400 bg-cyan-500/5 rounded-r-xl text-xs text-textSecondary leading-relaxed">
                    Node 11 is a child of Node 5. To reach Node 5, you need to traverse through Node 2 first. Remember: BFS explores all neighbors at the current depth before moving to nodes at the next depth level!
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Interactive Tree */}
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>

              <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    Step {currentStep}: {foundGoal ? 'Goal Reached! 🎉' : 'Select Next Node'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-textSecondary hover:text-white gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>

                {/* Error Message */}
                {showError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Invalid selection! Please select from available nodes.
                    </div>
                  </div>
                )}

                {/* Tree Visualization */}
                <div className="flex-1 relative bg-black/20 rounded-2xl border border-white/10 p-8 overflow-auto">
                  <svg width="800" height="400" className="mx-auto">
                    {/* Draw edges */}
                    {Object.entries(treeData).map(([parent, children]) => 
                      children.map(child => {
                        const parentNum = parseInt(parent);
                        const childNum = child;
                        const parentPos = nodePositions[parentNum];
                        const childPos = nodePositions[childNum];
                        const isInPath = visitedNodes.includes(parentNum) && visitedNodes.includes(childNum);
                        return (
                          <line
                            key={`${parent}-${child}`}
                            x1={parentPos.x}
                            y1={parentPos.y}
                            x2={childPos.x}
                            y2={childPos.y}
                            stroke={isInPath ? "#06b6d4" : "#ffffff20"}
                            strokeWidth={isInPath ? "3" : "1"}
                            className="transition-all duration-500"
                          />
                        );
                      })
                    )}

                    {/* Draw nodes */}
                    {Object.keys(nodePositions).map(nodeNum => {
                      const node = parseInt(nodeNum);
                      const pos = nodePositions[node];
                      const isVisited = visitedNodes.includes(node);
                      const isGoal = node === 11;
                      const isAvailable = availableNodes.includes(node);
                      
                      return (
                        <g key={node}>
                          {isGoal && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r="28"
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="2"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="24"
                            fill={
                              isGoal && foundGoal ? "#06b6d4" :
                              isVisited ? "#8b5cf6" :
                              isAvailable ? "#3b82f6" :
                              "#ffffff10"
                            }
                            stroke={
                              isGoal ? "#06b6d4" :
                              isVisited ? "#a78bfa" :
                              isAvailable ? "#60a5fa" :
                              "#ffffff30"
                            }
                            strokeWidth="2"
                            className={cn(
                              "transition-all duration-500 cursor-pointer",
                              isAvailable && "hover:fill-blue-400 hover:stroke-blue-300 animate-pulse"
                            )}
                            onClick={() => isAvailable && !foundGoal && handleNodeSelect(node)}
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 5}
                            textAnchor="middle"
                            fill="white"
                            fontSize="14"
                            fontWeight="bold"
                            className="pointer-events-none select-none"
                          >
                            {node}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-400"></div>
                    <span className="text-textSecondary">Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-400"></div>
                    <span className="text-textSecondary">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/10 border-2 border-white/30"></div>
                    <span className="text-textSecondary">Not Explored</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-cyan-300"></div>
                    <span className="text-textSecondary">Goal Node (11)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Queue & Controls */}
            <div className="lg:col-span-3 bg-gradient-to-br from-blue-950/30 to-cyan-950/30 border-l border-white/5 p-6 flex flex-col backdrop-blur-sm overflow-y-auto">
              <h3 className="font-black text-sm mb-4 uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
                BFS Queue
              </h3>

              <Card className="p-4 bg-black/40 border-cyan-500/20 mb-6 backdrop-blur-sm">
                <div className="text-[10px] text-cyan-400 font-bold mb-2 uppercase tracking-wider">Current Queue State</div>
                <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
                  {queue.length > 0 ? (
                    queue.map((node, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg animate-in zoom-in-95 duration-300 relative",
                          idx === 0 
                            ? "bg-gradient-to-br from-purple-600 to-cyan-600 ring-2 ring-cyan-400" 
                            : "bg-gradient-to-br from-purple-500 to-cyan-500"
                        )}
                        style={{animationDelay: `${idx * 50}ms`}}
                      >
                        {node}
                        {idx === 0 && (
                          <div className="absolute -top-2 -right-2 text-[8px] bg-cyan-500 text-white px-1.5 py-0.5 rounded-full">
                            Next
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-textSecondary italic text-sm">Queue is empty</div>
                  )}
                </div>
              </Card>

              <h3 className="font-black text-sm mb-4 uppercase text-purple-400 tracking-widest flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                Your Path
              </h3>

              <Card className="p-4 bg-black/40 border-purple-500/20 mb-6 backdrop-blur-sm">
                <div className="text-[10px] text-purple-400 font-bold mb-2 uppercase tracking-wider">Nodes Visited: {selectedPath.length}</div>
                <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
                  {selectedPath.map((node, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "px-3 py-1.5 rounded-lg font-bold text-sm shadow-md animate-in slide-in-from-left duration-300 relative",
                        node === 11 ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : 
                        node === currentNode ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white" : 
                        "bg-white/10 text-white border border-white/20"
                      )}
                      style={{animationDelay: `${idx * 30}ms`}}
                    >
                      {node}
                      {idx < selectedPath.length - 1 && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-cyan-400">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {availableNodes.length > 0 && !foundGoal && (
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-cyan-500/30 mb-6 backdrop-blur-sm">
                  <div className="text-[10px] text-cyan-400 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Available Nodes (Select Next)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableNodes.map(node => (
                      <button
                        key={node}
                        onClick={() => handleNodeSelect(node)}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm hover:from-blue-400 hover:to-cyan-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 animate-pulse"
                      >
                        Node {node}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              <div className="mt-auto space-y-3">
                {foundGoal && (
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-1">
                      <CheckCircle className="w-5 h-5" />
                      Goal Reached!
                    </div>
                    <p className="text-xs text-green-300/80">You've found Node 11. Ready to submit?</p>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full gap-2 font-bold py-6 text-base shadow-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 border-0"
                  onClick={handleSubmit}
                  disabled={!foundGoal}
                >
                  <Trophy className="w-5 h-5" />
                  Submit Solution
                </Button>

                {!foundGoal && (
                  <div className="text-xs text-center text-textSecondary pt-2">
                    Reach Node 11 to submit your solution
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Result Hero */}
              <div className="flex flex-col items-center text-center mb-16">
                <div className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce",
                  isCorrect ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/50" : "bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/50"
                )}>
                  {isCorrect ? (
                    <CheckCircle className="w-12 h-12 text-white" />
                  ) : (
                    <XCircle className="w-12 h-12 text-white" />
                  )}
                </div>
                <h2 className="text-5xl font-black text-white mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {isCorrect ? "Perfect Traversal!" : "Almost There!"}
                </h2>
                <p className="text-textSecondary text-lg max-w-2xl">
                  {isCorrect
                    ? "Outstanding! You've mastered the BFS algorithm and found the optimal path to the goal node. Your systematic approach is exemplary!"
                    : "You've demonstrated good understanding, but the path isn't quite optimal. Let's review the correct BFS traversal order below."}
                </p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-md border border-purple-500/20 hover:border-purple-400/40 transition-all group">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-2">Time Performance</div>
                  <div className="text-3xl font-black text-white mb-2">{formatTime(timer)}</div>
                  <div className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Excellent speed!
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-cyan-400 mb-2">Path Accuracy</div>
                  <div className="text-3xl font-black text-white mb-2">{accuracy}%</div>
                  <div className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    isCorrect ? "text-green-400" : "text-orange-400"
                  )}>
                    <Target className="w-3 h-3" />
                    {isCorrect ? "Optimal path!" : "Review needed"}
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 hover:border-green-400/40 transition-all">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-green-400 mb-2">XP Earned</div>
                  <div className="text-3xl font-black text-white mb-2">+{isCorrect ? 500 : 250}</div>
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {isCorrect ? "Bonus applied!" : "Partial credit"}
                  </div>
                </Card>
              </div>

              {/* Path Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">Your Path</h3>
                    <Badge className={cn(
                      "border-0",
                      isCorrect ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                    )}>
                      {selectedPath.length} nodes
                    </Badge>
                  </div>
                  <Card className="p-6 bg-purple-500/5 border-purple-500/20 min-h-[200px]">
                    <div className="flex flex-wrap gap-3 items-center">
                      {selectedPath.map((node, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "relative px-4 py-3 rounded-xl font-bold text-lg shadow-lg transition-all",
                            node === correctPath[idx] 
                              ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white" 
                              : "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                          )}
                        >
                          {node}
                          {idx < selectedPath.length - 1 && (
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-white/30">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">Optimal BFS Path</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-0">
                      {correctPath.length} nodes
                    </Badge>
                  </div>
                  <Card className="p-6 bg-cyan-500/5 border-cyan-500/20 min-h-[200px]">
                    <div className="flex flex-wrap gap-3 items-center">
                      {correctPath.map((node, idx) => (
                        <div
                          key={idx}
                          className="relative px-4 py-3 rounded-xl font-bold text-lg shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                        >
                          {node}
                          {idx < correctPath.length - 1 && (
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-white/30">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Feedback Message */}
              <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border-purple-500/20 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0">
                    {isCorrect ? (
                      <Trophy className="w-6 h-6 text-white" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">
                      {isCorrect ? "🎉 Perfect Score!" : "📚 Learning Opportunity"}
                    </h4>
                    <p className="text-textSecondary text-sm leading-relaxed">
                      {isCorrect
                        ? "Your BFS traversal followed the correct level-order sequence. This is essential for many real-world applications like network routing, web crawling, and social network analysis."
                        : "Remember: BFS explores all nodes at the current depth before moving to the next level. The optimal sequence should be: Level 1 → Level 2 → Level 3, etc."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gap-3 px-8 py-6 text-base font-bold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 border-0"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-3 px-8 py-6 text-base font-bold border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}