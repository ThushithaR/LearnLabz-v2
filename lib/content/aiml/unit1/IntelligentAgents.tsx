import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Brain, BookOpen, Award, Lightbulb, ArrowRight, Target, Zap, Database, TrendingUp, Scale } from 'lucide-react';

// Types
interface Answer {
    questionId: number;
    selected: string;
    correct: string;
    isCorrect: boolean;
}

interface AgentType {
    id: string;
    name: string;
    color: string;
    icon: any;
    description: string;
}

interface Scenario {
    id: number;
    scenario: string;
    question: string;
    correctAnswer: string;
    explanation: {
        correct: string;
        whyNotOthers: Record<string, string>;
    };
    examTip: string;
}

// Exportable content structure
export const intelligentAgentsContent = {
    overview:
        "Intelligent agents perceive their environment through sensors and act upon it through actuators. Different agent architectures provide varying levels of sophistication in decision-making and learning capabilities.",

    objectives: [
        "Understand the five types of intelligent agents",
        "Distinguish between agent architectures based on scenarios",
        "Apply agent classification in real-world contexts",
        "Master agent identification for technical interviews"
    ],

    sections: [
        {
            type: "text",
            title: "What is an Intelligent Agent?",
            content: "An agent is anything that perceives its environment through sensors and acts upon that environment through actuators. Examples include thermostats, robots, humans, and software agents."
        },
        {
            type: "text",
            title: "Simple Reflex Agents",
            content: "These agents select actions based only on the current percept, ignoring percept history. They use condition-action rules (IF-THEN). Example: A thermostat that turns heating ON when temperature drops below a threshold."
        },
        {
            type: "text",
            title: "Model-Based Reflex Agents",
            content: "These agents maintain an internal state that depends on percept history, tracking aspects of the world that are not currently visible. They handle partial observability by keeping a model of the world."
        },
        {
            type: "text",
            title: "Goal-Based Agents",
            content: "These agents act to achieve their goals by considering future consequences of actions. They search through possible action sequences to find paths that lead to goal states."
        },
        {
            type: "text",
            title: "Utility-Based Agents",
            content: "These agents use a utility function to evaluate how desirable different states are, allowing them to make trade-offs between conflicting goals and optimize overall performance."
        },
        {
            type: "text",
            title: "Learning Agents",
            content: "These agents improve their performance over time through experience. They consist of four components: performance element, learning element, critic, and problem generator."
        }
    ]
};

const AIAgentLesson = () => {
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [quizComplete, setQuizComplete] = useState<boolean>(false);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [activeTab, setActiveTab] = useState<'learn' | 'reference'>('learn');

    const agentTypes: AgentType[] = [
        {
            id: 'simple-reflex',
            name: 'Simple Reflex Agent',
            color: 'bg-red-500/10 border-red-500',
            icon: Zap,
            description: 'Condition-action rules, no memory'
        },
        {
            id: 'model-based',
            name: 'Model-Based Reflex Agent',
            color: 'bg-blue-500/10 border-blue-500',
            icon: Database,
            description: 'Maintains internal state/model'
        },
        {
            id: 'goal-based',
            name: 'Goal-Based Agent',
            color: 'bg-green-500/10 border-green-500',
            icon: Target,
            description: 'Plans actions to achieve goals'
        },
        {
            id: 'utility-based',
            name: 'Utility-Based Agent',
            color: 'bg-purple-500/10 border-purple-500',
            icon: Scale,
            description: 'Optimizes multiple objectives'
        },
        {
            id: 'learning',
            name: 'Learning Agent',
            color: 'bg-orange-500/10 border-orange-500',
            icon: TrendingUp,
            description: 'Improves over time from experience'
        }
    ];

    const scenarios: Scenario[] = [
        {
            id: 1,
            scenario: "A smoke detector in a building immediately sounds an alarm when it senses smoke particles in the air. It doesn't consider what caused the smoke or previous smoke incidents.",
            question: "What type of AI agent is this smoke detector?",
            correctAnswer: 'simple-reflex',
            explanation: {
                correct: "Correct! This is a Simple Reflex Agent. It uses a condition-action rule: IF smoke detected THEN sound alarm. It doesn't maintain any internal state, consider history, or think about consequences—it simply reacts to the current percept.",
                whyNotOthers: {
                    'model-based': "Not model-based because it doesn't maintain any internal model of the world or track previous states.",
                    'goal-based': "Not goal-based because it doesn't reason about different actions to achieve a specific goal—it just reacts immediately.",
                    'utility-based': "Not utility-based because it doesn't weigh different options or try to maximize any utility function.",
                    'learning': "Not learning because it doesn't improve its performance based on experience or past detections."
                }
            },
            examTip: "Remember: Simple reflex agents use condition-action rules (IF-THEN) based only on the current percept, with no memory or reasoning."
        },
        {
            id: 2,
            scenario: "A robot vacuum cleaner maps your home's layout, remembers which rooms it has already cleaned today, and avoids bumping into furniture by recalling their positions from its internal map.",
            question: "What type of AI agent is this vacuum cleaner?",
            correctAnswer: 'model-based',
            explanation: {
                correct: "Correct! This is a Model-Based Reflex Agent. It maintains an internal model (the map of your home) and keeps track of its internal state (which rooms are cleaned). It uses this model to make decisions about where to go next, handling partial observability.",
                whyNotOthers: {
                    'simple-reflex': "Not simple reflex because it maintains memory of the house layout and cleaned areas, not just reacting to current percepts.",
                    'goal-based': "Not purely goal-based because while it has a cleaning objective, its primary feature is using an internal model to track state.",
                    'utility-based': "Not utility-based because it doesn't optimize between multiple objectives or evaluate different cleaning strategies.",
                    'learning': "Not primarily learning because it doesn't improve its cleaning strategy over time based on experience."
                }
            },
            examTip: "Key phrase: 'maintains internal state' or 'keeps track of' = Model-Based Agent. They handle partial observability."
        },
        {
            id: 3,
            scenario: "A GPS navigation system considers your current location, traffic conditions, road closures, and calculates multiple possible routes to your destination. It then selects the route that will get you there fastest.",
            question: "What type of AI agent is this navigation system?",
            correctAnswer: 'goal-based',
            explanation: {
                correct: "Correct! This is a Goal-Based Agent. It has a clear goal (reach the destination) and searches through possible action sequences (different routes) to find one that achieves this goal. It reasons about the future consequences of taking different routes.",
                whyNotOthers: {
                    'simple-reflex': "Not simple reflex because it plans ahead and considers future states, not just reacting to current conditions.",
                    'model-based': "While it uses a model (map), the key feature is goal-directed planning, not just state tracking.",
                    'utility-based': "Close! But it's optimizing for a single criterion (fastest time) rather than balancing multiple competing objectives.",
                    'learning': "Not primarily learning because it doesn't adapt its routing algorithms based on your past trips."
                }
            },
            examTip: "Goal-based agents ask 'What will happen if I do X?' and 'Will this achieve my goal?' They search through action sequences."
        },
        {
            id: 4,
            scenario: "An automatic thermostat that turns heating ON when temperature drops below 20°C and turns it OFF when temperature exceeds 22°C. It only responds to the current temperature reading.",
            question: "What type of AI agent is this thermostat?",
            correctAnswer: 'simple-reflex',
            explanation: {
                correct: "Correct! This is a Simple Reflex Agent. It uses simple condition-action rules: IF temp < 20°C THEN heating ON; IF temp > 22°C THEN heating OFF. It only looks at the current percept (temperature) without any memory or planning.",
                whyNotOthers: {
                    'model-based': "Not model-based because it doesn't track temperature history or maintain an internal model of the room's thermal properties.",
                    'goal-based': "Not goal-based because it doesn't reason about achieving a comfortable temperature—it just reacts to thresholds.",
                    'utility-based': "Not utility-based because it doesn't balance multiple factors like comfort, energy cost, or environmental impact.",
                    'learning': "Not learning because it doesn't adjust its temperature thresholds based on your preferences over time."
                }
            },
            examTip: "Thermostats, smoke alarms, and automatic doors are classic examples of simple reflex agents in exams!"
        },
        {
            id: 5,
            scenario: "A self-driving car must decide whether to brake hard (uncomfortable but safe), swerve slightly (moderate discomfort, small risk), or maintain speed (comfortable but higher risk). It evaluates each option based on passenger comfort, safety, fuel efficiency, and legal compliance, then chooses the action with the highest overall value.",
            question: "What type of AI agent is this self-driving car?",
            correctAnswer: 'utility-based',
            explanation: {
                correct: "Correct! This is a Utility-Based Agent. It evaluates multiple conflicting objectives (safety, comfort, efficiency, legality) using a utility function that assigns a numerical value to each possible outcome. It then selects the action that maximizes expected utility.",
                whyNotOthers: {
                    'simple-reflex': "Not simple reflex because it reasons about consequences and balances multiple factors, not just reacting.",
                    'model-based': "While it uses a model, the key feature is optimizing across multiple competing objectives.",
                    'goal-based': "Not just goal-based because it's not simply achieving a goal—it's optimizing between conflicting objectives (safety vs comfort).",
                    'learning': "Not primarily learning, though advanced self-driving cars do learn. The scenario focuses on multi-objective optimization."
                }
            },
            examTip: "Utility-based agents use a 'utility function' to handle trade-offs between conflicting goals. Look for words like 'balance', 'optimize', 'trade-off', or 'maximize overall value'."
        },
        {
            id: 6,
            scenario: "A spam email filter initially uses basic rules to identify spam. Over time, it analyzes thousands of emails you mark as spam or not spam, continuously updating its detection patterns to become more accurate at filtering your specific types of spam.",
            question: "What type of AI agent is this spam filter?",
            correctAnswer: 'learning',
            explanation: {
                correct: "Correct! This is a Learning Agent. It improves its performance over time by learning from experience (your feedback on emails). It has a performance element (current spam detection), learning element (updates rules based on feedback), critic (evaluates if classification was correct), and problem generator (explores new patterns).",
                whyNotOthers: {
                    'simple-reflex': "Not simple reflex because it adapts and improves, rather than using fixed rules forever.",
                    'model-based': "Not just model-based because the key feature is learning and adaptation, not just maintaining state.",
                    'goal-based': "Not just goal-based because it doesn't search through action sequences—it learns patterns.",
                    'utility-based': "While it might use utility concepts, the defining feature is continuous learning and improvement."
                }
            },
            examTip: "Learning agents improve performance over time. Keywords: 'learns', 'adapts', 'improves', 'trains', 'feedback', 'experience'. They have 4 components: performance, learning, critic, problem generator."
        },
        {
            id: 7,
            scenario: "A chess-playing AI evaluates each possible move by considering not just whether it wins or loses, but also factors like piece control, board position, king safety, and pawn structure. It assigns a score to each potential board state and chooses the move leading to the highest-valued position.",
            question: "What type of AI agent is this chess AI?",
            correctAnswer: 'utility-based',
            explanation: {
                correct: "Correct! This is a Utility-Based Agent. It uses a utility function (evaluation function) that considers multiple factors (material, position, king safety) and assigns a numerical score to each board state. It then chooses moves that maximize this utility, handling the complexity of chess where there's no single 'goal' but rather better and worse positions.",
                whyNotOthers: {
                    'simple-reflex': "Not simple reflex because it evaluates future positions and multiple factors, not just reacting to current board state.",
                    'model-based': "While it models the game, the key is evaluating positions using a utility function with multiple weighted factors.",
                    'goal-based': "Not purely goal-based because chess isn't about reaching a single goal state—it's about continuous optimization of position quality.",
                    'learning': "Not primarily learning in this scenario (though modern chess AIs do learn). The focus here is on multi-factor evaluation."
                }
            },
            examTip: "When an agent evaluates multiple criteria simultaneously (material + position + safety), think utility-based. Chess, autonomous vehicles, and resource allocation are common utility-based examples."
        },
        {
            id: 8,
            scenario: "A medical diagnosis assistant starts with general medical knowledge. As doctors use it and provide feedback on diagnoses, it learns which symptom combinations are most indicative of specific diseases in the local population. Its diagnostic accuracy improves month by month.",
            question: "What type of AI agent is this medical assistant?",
            correctAnswer: 'learning',
            explanation: {
                correct: "Correct! This is a Learning Agent. It continuously improves its diagnostic performance based on experience and feedback from doctors. The performance element makes diagnoses, the learning element updates diagnostic patterns, the critic evaluates accuracy, and the problem generator explores new symptom-disease associations.",
                whyNotOthers: {
                    'simple-reflex': "Not simple reflex because it adapts and improves rather than following fixed diagnostic rules.",
                    'model-based': "Not just model-based because the emphasis is on learning and improvement over time, not just maintaining patient state.",
                    'goal-based': "Not just goal-based because it's not searching for a diagnosis—it's learning patterns to make better diagnoses.",
                    'utility-based': "While diagnosis might involve weighing evidence, the key feature here is continuous learning and improvement."
                }
            },
            examTip: "Medical diagnosis systems, recommendation engines, and game-playing AIs that improve over time are learning agents. They have explicit learning mechanisms that modify their behavior."
        }
    ];

    const handleAnswerSelect = (agentId: string) => {
        if (showFeedback) return;
        setSelectedAnswer(agentId);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        const isCorrect = selectedAnswer === scenarios[currentQuestion].correctAnswer;
        if (isCorrect) {
            setScore(score + 1);
        }

        const newAnswer: Answer = {
            questionId: scenarios[currentQuestion].id,
            selected: selectedAnswer,
            correct: scenarios[currentQuestion].correctAnswer,
            isCorrect
        };

        setAnswers([...answers, newAnswer]);
        setShowFeedback(true);
    };

    const handleNext = () => {
        if (currentQuestion < scenarios.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        } else {
            setQuizComplete(true);
        }
    };

    const handleReset = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setScore(0);
        setQuizComplete(false);
        setAnswers([]);
    };

    const currentScenario = scenarios[currentQuestion];
    const isCorrect = selectedAnswer === currentScenario?.correctAnswer;

    if (quizComplete) {
        const percentage = Math.round((score / scenarios.length) * 100);
        let performance = '';
        let performanceColor = '';
        if (percentage >= 90) { performance = 'Excellent! Interview Ready!'; performanceColor = 'text-green-500'; }
        else if (percentage >= 70) { performance = 'Good! Review wrong answers'; performanceColor = 'text-blue-500'; }
        else if (percentage >= 50) { performance = 'Keep Learning!'; performanceColor = 'text-yellow-500'; }
        else { performance = 'Practice More!'; performanceColor = 'text-red-500'; }

        return (
            <div className="min-h-screen bg-[#0B1120] text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <Award className="mx-auto mb-4 text-yellow-500" size={80} />
                        <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
                        <div className="bg-surface border-2 border-green-500 rounded-xl p-8 mb-6">
                            <p className="text-5xl font-bold text-green-500 mb-2">{score}/{scenarios.length}</p>
                            <p className="text-2xl font-bold mb-2">{percentage}%</p>
                            <p className={`text-xl ${performanceColor}`}>{performance}</p>
                        </div>

                        <div className="bg-surface border border-white/10 rounded-xl p-6 mb-6 text-left">
                            <h3 className="text-2xl font-bold mb-4 text-accent">Answer Review</h3>
                            <div className="space-y-3">
                                {answers.map((answer, idx) => {
                                    const scenario = scenarios.find(s => s.id === answer.questionId);
                                    if (!scenario) return null;
                                    const correctType = agentTypes.find(a => a.id === answer.correct);
                                    const selectedType = agentTypes.find(a => a.id === answer.selected);
                                    if (!correctType || !selectedType) return null;
                                    const CorrectIcon = correctType.icon;
                                    const SelectedIcon = selectedType.icon;

                                    return (
                                        <div key={idx} className={`p-4 rounded-lg border-2 ${answer.isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                                            <div className="flex items-start gap-3">
                                                {answer.isCorrect ?
                                                    <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} /> :
                                                    <XCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                                                }
                                                <div className="flex-1">
                                                    <p className="font-bold mb-1">Question {idx + 1}</p>
                                                    <p className="text-sm text-gray-400 mb-2">{scenario.scenario.substring(0, 100)}...</p>
                                                    {!answer.isCorrect && (
                                                        <>
                                                            <p className="text-sm text-red-400 flex items-center gap-2">
                                                                Your answer: <SelectedIcon size={16} /> {selectedType.name}
                                                            </p>
                                                            <p className="text-sm text-green-400 font-bold flex items-center gap-2">
                                                                Correct answer: <CorrectIcon size={16} /> {correctType.name}
                                                            </p>
                                                        </>
                                                    )}
                                                    {answer.isCorrect && (
                                                        <p className="text-sm text-green-400 font-bold flex items-center gap-2">
                                                            <CorrectIcon size={16} /> {correctType.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="px-10 py-4 bg-accent hover:bg-accent/80 text-white text-xl font-bold rounded-xl transition shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
                        >
                            <RotateCcw size={24} />
                            Take Quiz Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background flex flex-col overflow-hidden">
            {/* Main Content Only - Simplified Layout */}
            <div className="w-full h-full bg-[#0B1120] p-6 overflow-y-auto flex flex-col">
                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">

                    {/* Top Header & Tabs */}
                    <div className="bg-surface border border-white/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">AI Agent Types</h1>
                            <p className="text-xs text-gray-400 mt-1">Master Classification</p>
                        </div>
                        <div className="flex bg-black/40 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('learn')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'learn' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                LEARN & QUIZ
                            </button>
                            <button
                                onClick={() => setActiveTab('reference')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'reference' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                REFERENCE GUIDE
                            </button>
                        </div>
                    </div>

                    {activeTab === 'reference' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {agentTypes.map((agent) => {
                                const Icon = agent.icon;
                                return (
                                    <div key={agent.id} className={`${agent.color} border-2 rounded-xl p-4 transition-all hover:scale-105`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <Icon size={24} />
                                            </div>
                                            <p className="font-bold text-lg">{agent.name}</p>
                                        </div>
                                        <p className="text-sm text-gray-300">{agent.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'learn' && (
                        <>
                            {/* Progress Bar */}
                            <div className="bg-surface border border-white/10 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-white">
                                        Question {currentQuestion + 1} of {scenarios.length}
                                    </span>
                                    <span className="font-bold text-white">
                                        Score: {score}/{currentQuestion}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-accent h-3 rounded-full transition-all"
                                        style={{ width: `${((currentQuestion) / scenarios.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Scenario */}
                            <div className="bg-surface border border-white/10 rounded-xl p-6 mb-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <Brain className="text-purple-500 flex-shrink-0" size={32} />
                                    <div>
                                        <h2 className="text-2xl font-bold mb-3 text-white">Scenario:</h2>
                                        <p className="text-lg leading-relaxed mb-4 text-gray-300">
                                            {currentScenario.scenario}
                                        </p>
                                        <p className="text-xl font-bold text-accent">
                                            {currentScenario.question}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {agentTypes.map((agent) => {
                                    const Icon = agent.icon;
                                    return (
                                        <button
                                            key={agent.id}
                                            onClick={() => handleAnswerSelect(agent.id)}
                                            disabled={showFeedback}
                                            className={`p-5 rounded-xl border-2 transition-all text-left ${selectedAnswer === agent.id
                                                ? showFeedback
                                                    ? isCorrect
                                                        ? 'bg-green-500/20 border-green-500 scale-105'
                                                        : 'bg-red-500/20 border-red-500'
                                                    : `${agent.color} scale-105 shadow-lg`
                                                : showFeedback && agent.id === currentScenario.correctAnswer
                                                    ? 'bg-green-500/20 border-green-500 scale-105'
                                                    : `bg-surface border-gray-600 hover:scale-105 ${!showFeedback && 'hover:shadow-lg'}`
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={24} />
                                                <span className="font-bold text-lg text-white">{agent.name}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Section */}
                            {showFeedback && (
                                <div className={`${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'} border-2 rounded-xl p-6 mb-6`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle className="text-green-500" size={32} />
                                                <h3 className="text-2xl font-bold text-green-500">Correct!</h3>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="text-red-500" size={32} />
                                                <h3 className="text-2xl font-bold text-red-500">Not Quite!</h3>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`p-4 ${isCorrect ? 'bg-green-500/20' : 'bg-yellow-500/20'} rounded-lg border-2 ${isCorrect ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
                                            <p className="font-bold mb-2 text-white">
                                                Correct Answer: {agentTypes.find(a => a.id === currentScenario.correctAnswer)?.name || ''}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {currentScenario.explanation.correct}
                                            </p>
                                        </div>

                                        <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-lg p-4">
                                            <p className="font-bold mb-2 text-blue-400">Why not the other types?</p>
                                            <div className="space-y-2">
                                                {Object.entries(currentScenario.explanation.whyNotOthers).map(([key, reason]) => {
                                                    if (key === currentScenario.correctAnswer) return null;
                                                    const agent = agentTypes.find(a => a.id === key);
                                                    return (
                                                        <div key={key} className="text-sm text-gray-300">
                                                            <span className="font-semibold text-white">{agent?.name}:</span> {reason}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="bg-purple-500/10 border-2 border-purple-500/50 rounded-lg p-4 flex items-start gap-3">
                                            <Lightbulb className="text-purple-400 flex-shrink-0" size={24} />
                                            <div>
                                                <p className="font-bold text-purple-400 mb-1">Exam Tip:</p>
                                                <p className="text-sm text-gray-300">{currentScenario.examTip}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="mt-6 px-8 py-3 bg-accent hover:bg-accent/80 text-white font-bold rounded-lg transition shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
                                    >
                                        {currentQuestion < scenarios.length - 1 ? (
                                            <>
                                                Next Question
                                                <ArrowRight size={20} />
                                            </>
                                        ) : (
                                            <>
                                                View Results
                                                <Award size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            {!showFeedback && (
                                <div className="text-center">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={selectedAnswer === null}
                                        className="px-10 py-4 bg-accent hover:bg-accent/80 disabled:bg-gray-600 text-white text-xl font-bold rounded-xl transition shadow-lg hover:scale-105 disabled:scale-100"
                                    >
                                        Submit Answer
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAgentLesson;
