import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/Button";
import {
    Play,
    Pause,
    RotateCcw,
    ChevronRight,
    Info,
    Target,
    Zap,
    Scissors,
    Eye,
    Settings,
    ShieldCheck,
    RefreshCw,
    Trophy
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Types ---
interface Node {
    id: string;
    value: number | null;
    type: 'max' | 'min';
    children: Node[];
    depth: number;
    alpha?: number;
    beta?: number;
    isPruned?: boolean;
}

export const alphabetaContent = {
    title: "Alpha-Beta Pruning",
    objectives: [
        "Understand how pruning reduces the search space",
        "Learn the meaning of Alpha and Beta parameters",
        "Identify when a branch can be safely pruned",
        "Compare the efficiency of Alpha-Beta with standard Minimax"
    ],
    sections: [
        {
            type: "text",
            title: "Optimized Decision Making",
            content: "Alpha-beta pruning is a search algorithm that seeks to decrease the number of nodes that are evaluated by the minimax algorithm in its search tree."
        },
        {
            type: "text",
            title: "Pruning Intuition",
            content: "It stops evaluating a move when at least one possibility has been found that proves the move to be worse than a previously examined move. Such moves need not be further evaluated."
        }
    ],
    interactiveMarker: "ALPHA_BETA"
};

const AlphaBetaVisualizer: React.FC = () => {
    const [activeInstructionTab, setActiveInstructionTab] = useState<'guide' | 'math'>('guide');
    const [tree, setTree] = useState<Node | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState("Ready to prune");

    // Animation state
    const [steps, setSteps] = useState<any[]>([]);
    const [visitedNodes, setVisitedNodes] = useState<Map<string, { alpha: number, beta: number, value: number | null }>>(new Map());
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [prunedNodes, setPrunedNodes] = useState<Set<string>>(new Set());

    const generateTree = () => {
        let nodeCount = 0;
        const createNode = (depth: number, type: 'max' | 'min'): Node => {
            const id = (nodeCount++).toString();
            if (depth === 2) {
                return { id, value: Math.floor(Math.random() * 20) - 10, type, children: [], depth };
            }
            return {
                id,
                value: null,
                type,
                depth,
                children: [
                    createNode(depth + 1, type === 'max' ? 'min' : 'max'),
                    createNode(depth + 1, type === 'max' ? 'min' : 'max')
                ]
            };
        };
        const root = createNode(0, 'max');
        setTree(root);

        // Pre-calculate steps
        const calculatedSteps: any[] = [];
        const runAlphaBeta = (node: Node, alpha: number, beta: number): number => {
            calculatedSteps.push({ type: 'visit', nodeId: node.id, alpha, beta, value: null });

            if (node.children.length === 0) {
                const val = node.value || 0;
                calculatedSteps.push({ type: 'return', nodeId: node.id, alpha, beta, value: val });
                return val;
            }

            let v = node.type === 'max' ? -Infinity : Infinity;
            for (const child of node.children) {
                const childVal = runAlphaBeta(child, alpha, beta);

                if (node.type === 'max') {
                    v = Math.max(v, childVal);
                    alpha = Math.max(alpha, v);
                } else {
                    v = Math.min(v, childVal);
                    beta = Math.min(beta, v);
                }

                calculatedSteps.push({ type: 'update', nodeId: node.id, alpha, beta, value: v });

                if (alpha >= beta) {
                    // Prune remaining children
                    const pruneChildren = (n: Node) => {
                        n.children.forEach(c => {
                            calculatedSteps.push({ type: 'prune', nodeId: c.id });
                            pruneChildren(c);
                        });
                    };
                    const currentIndex = node.children.indexOf(child);
                    for (let i = currentIndex + 1; i < node.children.length; i++) {
                        calculatedSteps.push({ type: 'prune', nodeId: node.children[i].id });
                        pruneChildren(node.children[i]);
                    }
                    break;
                }
            }
            calculatedSteps.push({ type: 'finish', nodeId: node.id, alpha, beta, value: v });
            return v;
        };

        runAlphaBeta(root, -Infinity, Infinity);
        setSteps(calculatedSteps);
        resetSimulation();
    };

    const resetSimulation = () => {
        setVisitedNodes(new Map());
        setPrunedNodes(new Set());
        setActiveNodeId(null);
        setCurrentStep(0);
        setIsRunning(false);
        setStatus("Ready to start traversal");
    };

    useEffect(() => {
        generateTree();
    }, []);

    const nextStep = () => {
        if (currentStep >= steps.length) {
            setIsRunning(false);
            setStatus("Traversal complete!");
            return;
        }

        const step = steps[currentStep];
        const newVisited = new Map(visitedNodes);
        const newPruned = new Set(prunedNodes);

        if (step.type === 'visit' || step.type === 'update' || step.type === 'return' || step.type === 'finish') {
            newVisited.set(step.nodeId, { alpha: step.alpha, beta: step.beta, value: step.value });
            setActiveNodeId(step.nodeId);
            setStatus(`${step.type.toUpperCase()}: Node ${step.nodeId} (α:${step.alpha === -Infinity ? '-∞' : step.alpha}, β:${step.beta === Infinity ? '∞' : step.beta})`);
        } else if (step.type === 'prune') {
            newPruned.add(step.nodeId);
            setStatus(`PRUNE: Skipping Node ${step.nodeId} because α ≥ β`);
        }

        setVisitedNodes(newVisited);
        setPrunedNodes(newPruned);
        setCurrentStep(prev => prev + 1);
    };

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(nextStep, 800);
        }
        return () => clearInterval(interval);
    }, [isRunning, currentStep, steps]);

    const renderNode = (node: Node, x: number, y: number, spread: number) => {
        const metadata = visitedNodes.get(node.id);
        const isVisited = !!metadata;
        const isActive = activeNodeId === node.id;
        const isPruned = prunedNodes.has(node.id);

        const displayValue = metadata?.value !== null && metadata?.value !== undefined ? metadata.value : (node.children.length === 0 ? node.value : '?');

        return (
            <g key={node.id}>
                {/* Child Connections */}
                {!isPruned && node.children.map((child, i) => {
                    const childX = x - spread / 2 + spread * i;
                    const childY = y + 80;
                    return (
                        <line
                            key={`${node.id}-${child.id}`}
                            x1={x} y1={y} x2={childX} y2={childY}
                            stroke={visitedNodes.has(child.id) ? "#3b82f6" : (prunedNodes.has(child.id) ? "rgba(239, 68, 68, 0.1)" : "rgba(255,255,255,0.1)")}
                            strokeWidth={visitedNodes.has(child.id) ? 2 : 1}
                            className="transition-all duration-500"
                        />
                    );
                })}

                {/* Node Shape */}
                <circle
                    cx={x} cy={y} r={22}
                    fill={isPruned ? "rgba(239, 68, 68, 0.05)" : (isActive ? "#3b82f6" : (isVisited ? "#1e293b" : "#0f172a"))}
                    stroke={isPruned ? "rgba(239, 68, 68, 0.2)" : (isActive ? "#60a5fa" : (isVisited ? "#3b82f6" : "rgba(255,255,255,0.2)"))}
                    strokeWidth={2}
                    className={cn("transition-all duration-500", isActive && "filter drop-shadow-[0_0_8px_#3b82f6]")}
                />

                {/* Node Type Label */}
                <text x={x} y={y - 30} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" className="uppercase font-bold tracking-tighter">
                    {node.type}
                </text>

                {/* Value */}
                <text x={x} y={y + 5} textAnchor="middle" fill={isPruned ? "rgba(255,255,255,0.1)" : "#fff"} fontSize={14} fontWeight="bold">
                    {displayValue !== null ? displayValue : '?'}
                </text>

                {/* Alpha Beta Tags */}
                {isVisited && (
                    <g transform={`translate(${x + 25}, ${y - 10})`}>
                        <text fontSize="9" fill="#10b981">α: {metadata.alpha === -Infinity ? '-∞' : metadata.alpha}</text>
                        <text fontSize="9" fill="#ef4444" y="10">β: {metadata.beta === Infinity ? '∞' : metadata.beta}</text>
                    </g>
                )}

                {/* Pruning Indicator */}
                {isPruned && (
                    <g transform={`translate(${x - 15}, ${y - 15})`}>
                        <line x1="0" y1="0" x2="30" y2="30" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.5" />
                        <line x1="30" y1="0" x2="0" y2="30" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.5" />
                    </g>
                )}

                {/* Children Recursion */}
                {node.children.map((child, i) => (
                    renderNode(child, x - spread / 2 + spread * i, y + 80, spread / 2)
                ))}
            </g>
        );
    };

    return (
        <div className="w-full h-full min-h-[600px] bg-background grid grid-cols-1 lg:grid-cols-12 overflow-hidden border border-white/10 rounded-xl relative">

            {/* Sidebar Controls */}
            <div className="lg:col-span-3 border-r border-white/10 flex flex-col bg-surface/50 backdrop-blur-md z-10">
                <div className="p-4 border-b border-white/10 shrink-0">
                    <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-accent" />
                        Alpha-Beta Pruning
                    </h2>
                    <p className="text-[10px] text-textSecondary uppercase tracking-widest mt-1">Adversarial Search Optimization</p>
                </div>

                <div className="flex border-b border-white/10 shrink-0">
                    <button onClick={() => setActiveInstructionTab('guide')} className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${activeInstructionTab === 'guide' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}>Guide</button>
                    <button onClick={() => setActiveInstructionTab('math')} className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${activeInstructionTab === 'math' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}>Theory</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                    {activeInstructionTab === 'guide' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                                <h3 className="text-sm font-bold text-accent mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Goal
                                </h3>
                                <p className="text-xs text-textSecondary">Decrease the number of nodes evaluated by standard Minimax using α and β bounds.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] uppercase font-black text-textSecondary mb-2">Parameters</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                                            <span className="text-xs text-green-400 font-bold">α (Alpha)</span>
                                            <p className="text-[10px] text-textSecondary">The best value found for MAX along the path.</p>
                                        </div>
                                        <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                                            <span className="text-xs text-red-400 font-bold">β (Beta)</span>
                                            <p className="text-[10px] text-textSecondary">The best value found for MIN along the path.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="w-3 h-3 text-accent" />
                                        <span className="text-[10px] font-bold text-accent uppercase">Pruning Rule</span>
                                    </div>
                                    <p className="text-[10px] text-textSecondary">
                                        If <strong>α ≥ β</strong>, we stop exploring this branch!
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-textSecondary overflow-x-auto">
                                <pre>{`procedure alpha_beta(node, α, β)
  if node is leaf: return value
  if MAX:
    for each child:
      α = max(α, alpha_beta(child, α, β))
      if α >= β: return α // PRUNE
    return α
  if MIN:
    for each child:
      β = min(β, alpha_beta(child, α, β))
      if α >= β: return β // PRUNE
    return β`}</pre>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-accent">Efficiency</h4>
                                <p className="text-[10px] text-textSecondary leading-relaxed italic">
                                    In the best case, Alpha-Beta can search down to twice as deep as Minimax with the same processing power.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="lg:col-span-9 relative bg-[#0B1120] flex flex-col h-full">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-center pointer-events-none" />

                {/* Toolbar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-surface/90 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-2">
                    <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                        <Button
                            size="sm"
                            className="rounded-full w-24 h-9 font-bold"
                            variant={isRunning ? "secondary" : "default"}
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Play</>}
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full w-9 h-9" onClick={nextStep} disabled={isRunning || currentStep >= steps.length}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full w-9 h-9" onClick={resetSimulation}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full w-9 h-9" onClick={generateTree}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 px-4">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] text-textPrimary font-bold uppercase tracking-tight truncate max-w-[200px]">{status}</span>
                    </div>
                </div>

                {/* Tree Canvas */}
                <div className="flex-1 flex items-center justify-center p-8 mt-12 overflow-hidden">
                    <svg width="800" height="400" viewBox="0 0 800 400" className="w-full h-full max-w-4xl drop-shadow-2xl">
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {tree && renderNode(tree, 400, 50, 200)}
                    </svg>
                </div>

                {/* Legend / Metrics */}
                <div className="p-4 grid grid-cols-4 gap-4 border-t border-white/5 bg-surface/20 shrink-0">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">Pruned Branches</div>
                        <div className="text-sm font-bold text-red-400">{prunedNodes.size}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">Nodes Explored</div>
                        <div className="text-sm font-bold text-blue-400">{visitedNodes.size}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">Current Progress</div>
                        <div className="text-sm font-bold text-accent italic">{Math.round((currentStep / (steps.length || 1)) * 100)}%</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">Optimal Value</div>
                        <div className="text-sm font-bold text-white uppercase tracking-tighter">
                            {visitedNodes.get('0')?.value !== null && visitedNodes.get('0')?.value !== undefined ? visitedNodes.get('0')?.value : '?'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlphaBetaVisualizer;
