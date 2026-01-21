"use client";

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    Play,
    Pause,
    RotateCcw,
    ChevronRight,
    Info,
    BookOpen,
    Target,
    Zap,
    TrendingUp,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';

// --- Types ---
interface Point {
    x: number;
    y: number;
}

export const hillClimbingContent = {
    title: "Hill Climbing Search",
    objectives: [
        "Understand the intuition behind local search algorithms",
        "Identify different variants of Hill Climbing",
        "Recognize common pitfalls like local maxima and plateaus",
        "Learn about random restart as a solution to local optima"
    ],
    sections: [
        {
            type: "text",
            title: "The Greedy Climber",
            content: "Hill Climbing is a mathematical optimization technique which belongs to the family of local search. It is an iterative algorithm that starts with an arbitrary solution to a problem, then attempts to find a better solution by making an incremental change to the solution."
        },
        {
            type: "text",
            title: "How it Works",
            content: "Imagine you are dropped in a hilly terrain at night with only a small flashlight. You can see the ground around your feet. To find the highest peak, you simply move in the direction that goes up. You stop when every direction around you goes down."
        }
    ],
    interactiveMarker: "HILL_CLIMBING"
};

const HillClimbingVisualizer: React.FC = () => {
    const [activeInstructionTab, setActiveInstructionTab] = useState<'guide' | 'math'>('guide');
    const [variant, setVariant] = useState<'simple' | 'steepest' | 'stochastic'>('steepest');

    // Simulation State
    const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
    const [path, setPath] = useState<Point[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [iteration, setIteration] = useState(0);
    const [status, setStatus] = useState<string>("Ready to climb");

    // Landscape Constants
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 400;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const landscapeRef = useRef<number[]>([]);
    const currentPointRef = useRef<Point | null>(null);
    const isRunningRef = useRef(false);
    const iterationRef = useRef(0);

    const generateLandscape = () => {
        const points: number[] = [];
        const seed = Math.random();
        for (let x = 0; x <= CANVAS_WIDTH; x++) {
            const y =
                Math.sin(x * 0.01 + seed) * 50 +
                Math.sin(x * 0.03) * 20 +
                Math.sin(x * 0.005) * 80 +
                200;
            points.push(y);
        }
        landscapeRef.current = points;
        resetSimulation();
    };

    const resetSimulation = () => {
        const startX = Math.floor(Math.random() * CANVAS_WIDTH);
        const startY = landscapeRef.current[startX] || 200;
        const startPoint = { x: startX, y: startY };
        setCurrentPoint(startPoint);
        currentPointRef.current = startPoint;
        setPath([startPoint]);
        setIsRunning(false);
        isRunningRef.current = false;
        setIteration(0);
        iterationRef.current = 0;
        setStatus("Ready to climb");
    };

    useEffect(() => {
        generateLandscape(); // Fixed from generateTree
    }, []);

    const step = () => {
        const curr = currentPointRef.current;
        if (!curr) return;

        let nextPoint: Point | null = null;
        const x = curr.x;

        if (variant === 'steepest' || variant === 'simple') {
            const neighbors = [
                { x: Math.max(0, x - 5), y: landscapeRef.current[Math.max(0, x - 5)] },
                { x: Math.min(CANVAS_WIDTH, x + 5), y: landscapeRef.current[Math.min(CANVAS_WIDTH, x + 5)] }
            ];

            const bestNeighbor = neighbors.reduce((prev, curr) => (curr.y < prev.y ? curr : prev));

            if (bestNeighbor.y < curr.y) {
                nextPoint = bestNeighbor;
            } else {
                // No better neighbor found
                setIsRunning(false);
                isRunningRef.current = false;
                setStatus("Reached a local optimum!");
                return;
            }
        } else if (variant === 'stochastic') {
            const dir = Math.random() > 0.5 ? 5 : -5;
            const targetX = Math.min(Math.max(0, x + dir), CANVAS_WIDTH);
            const neighbor = { x: targetX, y: landscapeRef.current[targetX] };

            if (neighbor.y < curr.y) {
                nextPoint = neighbor;
            } else {
                // In stochastic, if we pick a worse neighbor, we just stay put and try again next tick
                // No need to stop unless we are really stuck (but simplified here)
                setStatus("Trying random neighbor...");
                return;
            }
        }

        if (nextPoint) {
            setCurrentPoint(nextPoint);
            currentPointRef.current = nextPoint;
            setPath(prev => [...prev, nextPoint!]);
            iterationRef.current += 1;
            setIteration(iterationRef.current);
            setStatus(`Climbing... (Iteration ${iterationRef.current})`);
        }
    };

    useEffect(() => {
        let timer: any;
        if (isRunning) {
            timer = setInterval(step, 100);
        }
        return () => clearInterval(timer);
    }, [isRunning, variant]);

    // Proper Animation Loop for Canvas (including the pulse)
    useEffect(() => {
        let animationFrameId: number;

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw Landscape
            ctx.beginPath();
            ctx.moveTo(0, landscapeRef.current[0]);
            for (let i = 1; i < landscapeRef.current.length; i++) {
                ctx.lineTo(i, landscapeRef.current[i]);
            }
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Fill area
            ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.lineTo(0, CANVAS_HEIGHT);
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw Path
            if (path.length > 1) {
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(i < path.length ? path[i].x : path[path.length - 1].x, i < path.length ? path[i].y : path[path.length - 1].y); // Safety
                }
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw Current Point
            if (currentPoint) {
                ctx.beginPath();
                ctx.arc(currentPoint.x, currentPoint.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#facc15';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Pulsing effect
                ctx.beginPath();
                ctx.arc(currentPoint.x, currentPoint.y, 12 + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [currentPoint, path]);

    return (
        <div className="w-full h-full min-h-[600px] bg-background grid grid-cols-1 lg:grid-cols-12 overflow-auto border border-white/10 rounded-xl relative">

            {/* Sidebar Controls (Col Span 3) */}
            <div className="lg:col-span-3 border-r border-white/10 flex flex-col bg-surface/50 backdrop-blur-md z-10">
                <div className="p-4 border-b border-white/10 shrink-0">
                    <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Hill Climbing
                    </h2>
                    <p className="text-[10px] text-textSecondary uppercase tracking-widest mt-1">Local Optimization Search</p>
                </div>

                {/* Tab Navigation */}
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

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                    {activeInstructionTab === 'guide' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                                    <Info className="w-4 h-4 text-accent" /> How to Play
                                </h3>
                                <ul className="text-xs text-textSecondary space-y-2">
                                    <li className="flex gap-2">
                                        <span className="text-accent font-bold">1.</span>
                                        <span>The blue line is your <strong>Fitness Landscape</strong>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-accent font-bold">2.</span>
                                        <span>The yellow dot is your <strong>Current State</strong>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-accent font-bold">3.</span>
                                        <span>The goal is to reach the <strong>Global Maximum</strong> (highest point).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-accent font-bold">4.</span>
                                        <span>Choose a variant and click <strong>Run</strong> to start climbing!</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                    <span className="text-[10px] font-bold text-red-400 uppercase">Warning</span>
                                </div>
                                <p className="text-[10px] text-textSecondary">
                                    Notice how the algorithm gets stuck on smaller hills (local maxima) and cannot see the higher ones!
                                </p>
                            </div>

                            <div className="space-y-2 pt-4">
                                <h3 className="text-sm font-bold text-textPrimary">Algorithm Variant</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['steepest', 'simple', 'stochastic'] as const).map(v => (
                                        <button
                                            key={v}
                                            onClick={() => { setVariant(v); resetSimulation(); }}
                                            className={`p-2 text-left rounded border transition-all ${variant === v ? 'bg-accent/20 border-accent text-accent' : 'bg-black/20 border-white/5 text-textSecondary hover:border-white/20'}`}
                                        >
                                            <div className="font-bold capitalize text-[10px]">{v} Ascent</div>
                                            <div className="text-[9px] opacity-70">
                                                {v === 'steepest' && "Moves to the best neighbor."}
                                                {v === 'simple' && "Moves to the first better neighbor."}
                                                {v === 'stochastic' && "Moves to random better neighbor."}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeInstructionTab === 'math' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                                <h4 className="font-bold text-accent mb-1 text-xs uppercase italic tracking-tighter">Evaluation Function</h4>
                                <p className="text-xs text-textSecondary leading-relaxed">
                                    Objective: Maximize $f(s)$ where $s$ is the state.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <span className="text-xs font-bold text-textPrimary">The Local Condition</span>
                                    </div>
                                    <p className="text-[10px] text-textSecondary">
                                        Move to state $s'$ only if $f(s') &gt; f(s)$.
                                    </p>
                                </div>

                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs font-bold text-textPrimary">Local Optima</span>
                                    </div>
                                    <p className="text-[10px] text-textSecondary">
                                        Algorithm terminates if for all neighbors $n$, $f(n) &le; f(s)$.
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

                {/* Status Overlay */}
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                    <div className="bg-surface/80 backdrop-blur p-3 rounded-xl border border-white/10 shadow-xl min-w-[120px]">
                        <div className="text-[10px] text-textSecondary uppercase font-bold tracking-widest mb-1">Status</div>
                        <div className={`text-xs font-bold ${status.includes('optimum') ? 'text-green-400' : 'text-accent'}`}>{status}</div>
                        <div className="mt-2 text-[10px] text-textSecondary">Iteration: <span className="text-white font-mono">{iteration}</span></div>
                    </div>
                </div>

                {/* Floating Toolbar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-surface/90 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-2">

                    <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
                        <Button
                            size="sm"
                            variant={isRunning ? "secondary" : "primary"}
                            className="rounded-full w-24 h-9 font-bold transition-all shadow-lg active:scale-95"
                            onClick={() => {
                                const nextValue = !isRunning;
                                setIsRunning(nextValue);
                                isRunningRef.current = nextValue;
                            }}
                        >
                            {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Run</>}
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full w-9 h-9 border-white/10 hover:bg-white/5 active:rotate-180 transition-all duration-500" onClick={resetSimulation}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full w-9 h-9 border-white/10 hover:bg-white/5" onClick={generateLandscape}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-xs h-9 px-4 rounded-full text-textSecondary hover:text-white" onClick={step}>
                            <ChevronRight className="w-4 h-4 mr-1" /> Single Step
                        </Button>
                    </div>
                </div>

                {/* Simulation Canvas */}
                <div className="flex-1 flex items-center justify-center p-8 mt-12 overflow-hidden">
                    <div className="relative w-full max-w-4xl aspect-[2/1] bg-black/40 rounded-2xl border border-white/10 shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            className="w-full h-full rounded-2xl cursor-crosshair"
                        />

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/5 text-[9px] flex gap-4 pointer-events-none">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-0.5 bg-blue-500"></div>
                                <span className="text-textSecondary uppercase tracking-widest">Fitness Function</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span className="text-textSecondary uppercase tracking-widest">Global State</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-0.5 bg-yellow-400 opacity-50 border-dashed border-t"></div>
                                <span className="text-textSecondary uppercase tracking-widest">Path Taken</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info area */}
                <div className="p-4 grid grid-cols-3 gap-4 border-t border-white/5 bg-surface/20 shrink-0">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">State space</div>
                        <div className="text-sm font-bold text-white">Full 1D Range</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">Local Optima Hit</div>
                        <div className="text-sm font-bold text-white italic">{status.includes('optimum') ? 'Yes' : 'Scanning...'}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-[9px] text-textSecondary uppercase font-black mb-1 opacity-50">Strategy</div>
                        <div className="text-sm font-bold text-accent uppercase tracking-tighter">{variant}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HillClimbingVisualizer;
