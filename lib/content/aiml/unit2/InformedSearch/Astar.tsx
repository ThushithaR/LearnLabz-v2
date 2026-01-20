import React, { useState, useRef } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: string | null;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

type NodeState = 'normal' | 'start' | 'goal' | 'open' | 'closed' | 'path' | 'current';

export const astarLessonContent = {
  overview:
    "A* (A-star) is an informed search algorithm that combines the actual path cost and a heuristic estimate to efficiently find the shortest path between a start and a goal node.",

  objectives: [
    "Understand the role of g(n), h(n), and f(n)",
    "Learn how heuristics guide informed search",
    "Visualize OPEN and CLOSED sets in A*",
    "Observe optimal path reconstruction"
  ],

  sections: [
    {
      type: "text" as const,
      title: "A* Search Algorithm",
      content:
        "A* search evaluates nodes using the function f(n) = g(n) + h(n), where g(n) represents the cost from the start node to node n, and h(n) is a heuristic estimate of the cost from n to the goal."
    },
    {
      type: "text" as const,
      title: "Key Properties of A*",
      content:
        "A* is complete and optimal when the heuristic function is admissible. It expands nodes with the lowest estimated total cost first, reducing unnecessary exploration."
    },
    {
      type: "steps" as const,
      title: "Algorithm Steps",
      steps: [
        "Initialize the OPEN set with the start node",
        "Select the node with the lowest f(n) from OPEN",
        "Move the node to the CLOSED set",
        "Expand neighbors and update costs",
        "Repeat until the goal is reached"
      ]
    }
  ],
  interactiveMarker: "A_STAR"
};

const AStarVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Map<string, Node>>(new Map());
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNode, setStartNode] = useState<string | null>(null);
  const [goalNode, setGoalNode] = useState<string | null>(null);
  const [nodeStates, setNodeStates] = useState<Map<string, NodeState>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'node' | 'edge' | 'start' | 'goal'>('node');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [currentWeight, setCurrentWeight] = useState<string>('1');
  const [pathEdges, setPathEdges] = useState<Set<string>>(new Set());

  const NODE_RADIUS = 20;

  const manhattanDistance = (n1: Node, n2: Node): number => {
    return Math.abs(n1.x - n2.x) + Math.abs(n1.y - n2.y);
  };

  const getNeighbors = (nodeId: string): string[] => {
    return edges
      .filter(e => e.from === nodeId || e.to === nodeId)
      .map(e => e.from === nodeId ? e.to : e.from);
  };

  const getEdgeWeight = (from: string, to: string): number => {
    const edge = edges.find(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    return edge ? edge.weight : 1;
  };

  const getNodeAtPosition = (x: number, y: number): string | null => {
    const node = Array.from(nodes.values()).find(n => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      return dist <= NODE_RADIUS;
    });
    return node ? node.id : null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRunning) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickedNodeId = getNodeAtPosition(x, y);

    if (mode === 'node' && !clickedNodeId) {
      const id = `node-${Date.now()}`;
      const newNode: Node = { id, x, y, g: 0, h: 0, f: 0, parent: null };
      setNodes(new Map(nodes.set(id, newNode)));
      setNodeStates(new Map(nodeStates.set(id, 'normal')));
    } else if (mode === 'edge' && clickedNodeId) {
      setIsDragging(true);
      const node = nodes.get(clickedNodeId);
      if (node) {
        setDragStart({ x: node.x, y: node.y, nodeId: clickedNodeId });
        setDragCurrent({ x: node.x, y: node.y });
      }
    } else if (mode === 'start' && clickedNodeId) {
      if (clickedNodeId !== goalNode) {
        setStartNode(clickedNodeId);
        const newStates = new Map(nodeStates);
        if (startNode) newStates.set(startNode, 'normal');
        newStates.set(clickedNodeId, 'start');
        setNodeStates(newStates);
      }
    } else if (mode === 'goal' && clickedNodeId) {
      if (clickedNodeId !== startNode) {
        setGoalNode(clickedNodeId);
        const newStates = new Map(nodeStates);
        if (goalNode) newStates.set(goalNode, 'normal');
        newStates.set(clickedNodeId, 'goal');
        setNodeStates(newStates);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragCurrent({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const endNodeId = getNodeAtPosition(x, y);

    if (endNodeId && endNodeId !== dragStart.nodeId) {
      const edgeExists = edges.some(
        e => (e.from === dragStart.nodeId && e.to === endNodeId) ||
          (e.from === endNodeId && e.to === dragStart.nodeId)
      );
      if (!edgeExists) {
        const weight = parseFloat(currentWeight) || 1;
        setEdges([...edges, { from: dragStart.nodeId, to: endNodeId, weight }]);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runAStar = async () => {
    if (!startNode || !goalNode || isRunning) return;

    setIsRunning(true);
    const openSet = new Set<string>([startNode]);
    const closedSet = new Set<string>();
    const newNodes = new Map(nodes);
    const newStates = new Map(nodeStates);

    const start = newNodes.get(startNode)!;
    const goal = newNodes.get(goalNode)!;
    start.g = 0;
    start.h = manhattanDistance(start, goal);
    start.f = start.h;
    start.parent = null;

    while (openSet.size > 0) {
      let current = Array.from(openSet.values())[0];
      for (const nodeId of Array.from(openSet.values())) {
        if (newNodes.get(nodeId)!.f < newNodes.get(current)!.f) {
          current = nodeId;
        }
      }

      newStates.set(current, 'current');
      setNodes(new Map(newNodes));
      setNodeStates(new Map(newStates));
      await sleep(500);

      if (current === goalNode) {
        let pathNode: string | null = current;
        const pathNodes = new Set<string>();
        while (pathNode) {
          pathNodes.add(pathNode);
          if (pathNode !== startNode && pathNode !== goalNode) {
            newStates.set(pathNode, 'path');
          }
          pathNode = newNodes.get(pathNode)!.parent;
        }
        setNodes(new Map(newNodes));
        setNodeStates(new Map(newStates));

        const pathEdgeSet = new Set<string>();
        pathNode = current;
        while (pathNode) {
          const parentNode: string | null = newNodes.get(pathNode)!.parent;
          if (parentNode) {
            pathEdgeSet.add(`${parentNode}-${pathNode}`);
            pathEdgeSet.add(`${pathNode}-${parentNode}`);
          }
          pathNode = parentNode;
        }
        setPathEdges(pathEdgeSet);

        setIsRunning(false);
        return;
      }

      openSet.delete(current);
      closedSet.add(current);
      if (current !== startNode && current !== goalNode) {
        newStates.set(current, 'closed');
      }

      const neighbors = getNeighbors(current);
      for (const neighborId of neighbors) {
        if (closedSet.has(neighborId)) continue;

        const currentNode = newNodes.get(current)!;
        const neighbor = newNodes.get(neighborId)!;
        const edgeWeight = getEdgeWeight(current, neighborId);
        const tentativeG = currentNode.g + edgeWeight;

        if (!openSet.has(neighborId)) {
          openSet.add(neighborId);
          if (neighborId !== goalNode) {
            newStates.set(neighborId, 'open');
          }
        } else if (tentativeG >= neighbor.g) {
          continue;
        }

        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = manhattanDistance(neighbor, goal);
        neighbor.f = neighbor.g + neighbor.h;
      }

      setNodes(new Map(newNodes));
      setNodeStates(new Map(newStates));
      await sleep(500);
    }

    setIsRunning(false);
  };

  const reset = () => {
    setNodes(new Map());
    setEdges([]);
    setStartNode(null);
    setGoalNode(null);
    setNodeStates(new Map());
    setIsRunning(false);
    setMode('node');
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
    setPathEdges(new Set());
  };

  const getNodeColor = (state: NodeState): string => {
    switch (state) {
      case 'start': return '#22c55e';
      case 'goal': return '#ef4444';
      case 'open': return '#60a5fa';
      case 'closed': return '#94a3b8';
      case 'path': return '#fbbf24';
      case 'current': return '#a855f7';
      default: return '#fff';
    }
  };

  const [activeInstructionTab, setActiveInstructionTab] = useState<'guide' | 'math'>('guide');

  return (
    <div className="w-full h-full min-h-[600px] bg-background grid grid-cols-1 lg:grid-cols-12 overflow-hidden border border-white/10 rounded-xl relative">

      {/* Sidebar - Instructions & Info (Col Span 3) */}
      <div className="lg:col-span-3 bg-surface border-r border-white/10 flex flex-col z-10 shadow-xl overflow-hidden h-full">

        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-surface to-black/20">
          <h1 className="text-xl font-black text-textPrimary tracking-tight">A* Visualizer</h1>
          <p className="text-xs text-textSecondary mt-1">Interactive Pathfinding</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 shrink-0">
          <button
            onClick={() => setActiveInstructionTab('guide')}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${activeInstructionTab === 'guide' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
          >
            Guide
          </button>
          <button
            onClick={() => setActiveInstructionTab('math')}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${activeInstructionTab === 'math' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
          >
            Math
          </button>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">

          {activeInstructionTab === 'guide' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <h3 className="text-xs font-bold text-accent mb-2 uppercase">How to Use</h3>
                <ul className="text-xs text-textSecondary space-y-2 list-disc list-inside">
                  <li><strong>Add Node:</strong> Click on empty space.</li>
                  <li><strong>Draw Edge:</strong> Drag from one node to another.</li>
                  <li><strong>Set Start/Goal:</strong> Assign the Start (Green) and Goal (Red) nodes.</li>
                  <li><strong>Run:</strong> Watch A* find the shortest path!</li>
                </ul>
              </div>

              <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <h3 className="text-xs font-bold text-accent mb-2 uppercase">Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-textSecondary">
                  <div>N: Add Node</div>
                  <div>E: Draw Edge</div>
                  <div>S: Set Start</div>
                  <div>G: Set Goal</div>
                </div>
              </div>
            </div>
          )}

          {activeInstructionTab === 'math' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-500/10 border-l-2 border-blue-500 p-3 rounded-r-lg">
                <code className="block text-sm font-bold text-blue-400 mb-1">f(n) = g(n) + h(n)</code>
                <p className="text-xs text-textSecondary">
                  Total Cost = Actual Cost + Heuristic
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-purple-400 text-xs">g(n)</span>
                    <span className="text-xs font-bold text-textPrimary">Actual Cost</span>
                  </div>
                  <p className="text-[10px] text-textSecondary">
                    Distance from Start {'->'} Node n.
                  </p>
                </div>

                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-orange-400 text-xs">h(n)</span>
                    <span className="text-xs font-bold text-textPrimary">Heuristic</span>
                  </div>
                  <p className="text-[10px] text-textSecondary">
                    Manhattan Distance: <code className="bg-black/40 px-1 rounded">|x1-x2| + |y1-y2|</code>
                  </p>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Main Canvas Area (Col Span 9) */}
      <div className="lg:col-span-9 relative bg-[#0B1120] flex flex-col h-full">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-center pointer-events-none" />

        {/* Floating Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-surface/90 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-2">

          <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
            <button
              onClick={() => setMode('node')}
              disabled={isRunning}
              className={`p-2 rounded-full transition-all ${mode === 'node' ? 'bg-accent text-white' : 'text-textSecondary hover:bg-white/10 hover:text-white'}`}
              title="Add Node"
            >
              <div className="w-5 h-5 font-bold flex items-center justify-center text-xs">N</div>
            </button>
            <button
              onClick={() => setMode('edge')}
              disabled={isRunning}
              className={`p-2 rounded-full transition-all ${mode === 'edge' ? 'bg-accent text-white' : 'text-textSecondary hover:bg-white/10 hover:text-white'}`}
              title="Draw Edge"
            >
              <div className="w-5 h-5 font-bold flex items-center justify-center text-xs">E</div>
            </button>
          </div>

          <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
            <button
              onClick={() => setMode('start')}
              disabled={isRunning}
              className={`p-2 rounded-full transition-all ${mode === 'start' ? 'bg-green-600 text-white' : 'text-textSecondary hover:bg-green-600/20 hover:text-green-500'}`}
              title="Set Start"
            >
              <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-current"></div>
            </button>
            <button
              onClick={() => setMode('goal')}
              disabled={isRunning}
              className={`p-2 rounded-full transition-all ${mode === 'goal' ? 'bg-red-600 text-white' : 'text-textSecondary hover:bg-red-600/20 hover:text-red-500'}`}
              title="Set Goal"
            >
              <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-current"></div>
            </button>
          </div>

          <div className="flex gap-2 pl-1">
            <button
              onClick={runAStar}
              disabled={!startNode || !goalNode || isRunning}
              className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {isRunning ? <span className="animate-spin">⚡</span> : "▶"} Run
            </button>
            <button
              onClick={reset}
              disabled={isRunning}
              className="px-4 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/50 rounded-full hover:bg-red-500/20 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Weight Input (Conditional) */}
        {mode === 'edge' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-textSecondary uppercase">Weight:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-mono text-sm font-bold w-6 text-center">{currentWeight}</span>
          </div>
        )}

        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (isDragging) {
              setIsDragging(false);
              setDragStart(null);
              setDragCurrent(null);
            }
          }}
          className="relative w-full h-full cursor-crosshair z-0"
        >
          <svg className="w-full h-full text-white pointer-events-none">
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodes.get(edge.from);
              const to = nodes.get(edge.to);
              if (!from || !to) return null;
              const isPathEdge = pathEdges.has(`${edge.from}-${edge.to}`) || pathEdges.has(`${edge.to}-${edge.from}`);

              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;

              return (
                <g key={i}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isPathEdge ? '#EAB308' : '#334155'}
                    strokeWidth={isPathEdge ? '8' : '2'}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Weight Box */}
                  <rect
                    x={midX - 12}
                    y={midY - 12}
                    width="24"
                    height="24"
                    rx="6"
                    fill="#0F172A"
                    className="stroke-1 stroke-slate-700"
                  />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="#94A3B8"
                    fontWeight="bold"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Drag Line */}
            {isDragging && dragStart && dragCurrent && (
              <line
                x1={dragStart.x}
                y1={dragStart.y}
                x2={dragCurrent.x}
                y2={dragCurrent.y}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            )}

            {/* Nodes */}
            {Array.from(nodes.values()).map(node => {
              const state = nodeStates.get(node.id) || 'normal';
              const isCurrent = state === 'current';

              // Dynamic colors based on state
              let fillColor = '#1E293B';
              let strokeColor = '#475569';
              let textColor = '#CBD5E1';

              if (state === 'start') { fillColor = '#166534'; strokeColor = '#22C55E'; textColor = '#FFFFFF'; }
              else if (state === 'goal') { fillColor = '#991B1B'; strokeColor = '#EF4444'; textColor = '#FFFFFF'; }
              else if (state === 'open') { fillColor = '#1E3A8A'; strokeColor = '#3B82F6'; textColor = '#93C5FD'; }
              else if (state === 'closed') { fillColor = '#334155'; strokeColor = '#64748B'; textColor = '#94A3B8'; }
              else if (state === 'path') { fillColor = '#854D0E'; strokeColor = '#EAB308'; textColor = '#FEF08A'; }
              else if (state === 'current') { fillColor = '#6B21A8'; strokeColor = '#A855F7'; textColor = '#E9D5FF'; }

              return (
                <g key={node.id} className="transition-all duration-300">
                  {/* Outer Glow for Current */}
                  {isCurrent && (
                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 8} fill="none" stroke={strokeColor} strokeWidth="2" opacity="0.5" className="animate-ping" />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isCurrent ? '3' : '2'}
                    className="drop-shadow-lg"
                  />

                  {/* Data Labels - Only show cost when relevant */}
                  {(state !== 'normal' && state !== 'start' && state !== 'goal') && (
                    <g pointerEvents="none">
                      <rect
                        x={node.x - 50}
                        y={node.y - NODE_RADIUS - 70}
                        width="100"
                        height="64"
                        rx="6"
                        fill="rgba(0,0,0,0.9)"
                        stroke={strokeColor}
                        strokeWidth="1.5"
                      />
                      {/* Title */}
                      <text x={node.x} y={node.y - NODE_RADIUS - 56} textAnchor="middle" fontSize="9" fill="#94A3B8" fontWeight="bold">Cost Breakdown</text>

                      {/* f(n) = g(n) + h(n) */}
                      <text x={node.x} y={node.y - NODE_RADIUS - 42} textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="bold">
                        f({node.f.toFixed(1)}) = g({node.g.toFixed(1)}) + h({node.h.toFixed(0)})
                      </text>

                      {/* Explanation */}
                      <text x={node.x} y={node.y - NODE_RADIUS - 28} textAnchor="middle" fontSize="8" fill="#10b981">
                        g: Path cost from start
                      </text>
                      <text x={node.x} y={node.y - NODE_RADIUS - 18} textAnchor="middle" fontSize="8" fill="#f59e0b">
                        h: Distance to goal
                      </text>
                      <text x={node.x} y={node.y - NODE_RADIUS - 8} textAnchor="middle" fontSize="8" fill="#3b82f6">
                        f: Total estimated cost
                      </text>
                    </g>
                  )}

                  {/* Node Label (Optional, maybe ID?) */}
                  {/* <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="10" fontWeight="bold">N</text> */}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Calculation Explanation Panel */}
        {Array.from(nodes.values()).some(n => (nodeStates.get(n.id) || 'normal') !== 'normal' && (nodeStates.get(n.id) || 'normal') !== 'start' && (nodeStates.get(n.id) || 'normal') !== 'goal') && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
            <h3 className="text-xs font-bold text-accent mb-2 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              How f(n) is Calculated
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                <div className="font-bold text-green-400 mb-1">g(n) - Actual Cost</div>
                <div className="text-[10px] text-textSecondary">
                  Sum of edge weights from start node to current node. This is the <strong>actual</strong> distance traveled so far.
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2">
                <div className="font-bold text-orange-400 mb-1">h(n) - Heuristic</div>
                <div className="text-[10px] text-textSecondary">
                  Manhattan Distance = |x₁-x₂| + |y₁-y₂|. This is an <strong>estimate</strong> of remaining distance to goal.
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                <div className="font-bold text-blue-400 mb-1">f(n) = g(n) + h(n)</div>
                <div className="text-[10px] text-textSecondary">
                  Total estimated cost. A* picks the node with the <strong>lowest f(n)</strong> value to explore next!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AStarVisualizer;