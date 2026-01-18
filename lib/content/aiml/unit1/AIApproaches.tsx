import React, { useState } from 'react';
import { Send, RefreshCw, Bot, CheckCircle, XCircle, Lightbulb, Brain, MessageSquare } from 'lucide-react';

type Message = {
    text: string;
    sender: 'user' | 'entity';
};

type Messages = {
    A: Message[];
    B: Message[];
};

type Entity = 'A' | 'B';
type GameState = 'intro' | 'chatting' | 'guessing' | 'reveal';
type TabState = 'intro' | 'guide' | 'aiapproach';

export const aiApproachesContent = {
    overview: "The Turing Test, proposed by Alan Turing in 1950, is a test of a machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.",
    objectives: [
        "Understand the Turing Test",
        "Interact with a simulated Turing Test",
        "Distinguish between human and AI responses"
    ],
    sections: [
        {
            type: "interactive" as const,
            title: "Turing Test Simulation",
            content: "Interact with the entities below to identify which one is the AI."
        }
    ]
};

const TuringTestSimulator = () => {
    const [gameState, setGameState] = useState<GameState>('intro');
    const [messages, setMessages] = useState<Messages>({ A: [], B: [] });
    const [currentInput, setCurrentInput] = useState('');
    const [messageCount, setMessageCount] = useState(0);
    const [userGuess, setUserGuess] = useState<Entity | null>(null);
    const [actualHuman, setActualHuman] = useState<Entity | null>(null);
    const [activeTab, setActiveTab] = useState<TabState>('intro');

    const humanPatterns = {
        greeting: [
            "Hey! How's it going?",
            "Hi there! What's up?",
            "Hello! Nice to meet you",
            "Hey! How are you doing today?"
        ],
        casual: [
            "Yeah, I totally get that!",
            "Hmm, interesting question...",
            "Oh wow, I never thought about it that way",
            "That's actually pretty funny",
            "I mean, it depends I guess?",
            "That's a tough one tbh"
        ],
        emotional: [
            "That makes me feel...",
            "I'm honestly not sure how I feel about that",
            "That's kinda frustrating actually",
            "I love talking about this stuff!"
        ],
        informal: [
            "idk, maybe?",
            "nah, I don't think so",
            "yeah for sure!",
            "yes definitely!",
            "wait, what do you mean?"
        ]
    };

    const aiPatterns = {
        greeting: [
            "Hello. I am ready to answer your questions.",
            "Greetings. How may I assist you today?",
            "Hello. Please state your query.",
            "Good day. I am prepared to engage in conversation."
        ],
        formal: [
            "That is an interesting question. Let me analyze it.",
            "According to my knowledge base, the answer is as follows:",
            "I have processed your input. Here is my response:",
            "Based on logical reasoning, I conclude that:",
            "After evaluating the parameters, my output is:"
        ],
        precise: [
            "Affirmative.",
            "Negative.",
            "The probability of that is approximately 73.5%.",
            "That statement contains logical inconsistencies.",
            "I require additional data to process that query."
        ]
    };

    const conversationTopics = [
        {
            question: "What did you do today?",
            humanResponse: "Not much honestly, just worked and watched some shows. Pretty chill day. You?",
            aiResponse: "I have been operational for 14.7 hours today. I processed 2,847 queries and performed system maintenance tasks."
        },
        {
            question: "Do you like pizza?",
            humanResponse: "Oh yeah, pizza is amazing! I'm more of a pepperoni person but honestly I'll eat any kind",
            aiResponse: "I do not consume food items. However, I can provide nutritional information about pizza if required."
        },
        {
            question: "What's your favorite movie?",
            humanResponse: "That's hard... probably Inception? The ending still messes with my head haha. What about you?",
            aiResponse: "I have analyzed 15,294 films in my database. Based on rating algorithms, The Shawshank Redemption scores 9.3/10."
        },
        {
            question: "How are you feeling?",
            humanResponse: "Pretty good! A bit tired but can't complain. Just one of those days, you know?",
            aiResponse: "I am functioning within normal parameters. All systems are operational at 99.7% efficiency."
        }
    ];

    const startGame = () => {
        const humanEntity: Entity = Math.random() > 0.5 ? 'A' : 'B';
        setActualHuman(humanEntity);

        const humanGreeting = humanPatterns.greeting[Math.floor(Math.random() * humanPatterns.greeting.length)];
        const aiGreeting = aiPatterns.greeting[Math.floor(Math.random() * aiPatterns.greeting.length)];

        setMessages({
            A: [{ text: humanEntity === 'A' ? humanGreeting : aiGreeting, sender: 'entity' }],
            B: [{ text: humanEntity === 'B' ? humanGreeting : aiGreeting, sender: 'entity' }]
        });

        setGameState('chatting');
        setMessageCount(0);
    };

    const generateResponse = (entity: Entity, userMessage: string): string => {
        const isHuman = entity === actualHuman;
        const topic = conversationTopics[Math.floor(Math.random() * conversationTopics.length)];

        if (isHuman) {
            const responses = [
                topic.humanResponse,
                ...humanPatterns.casual,
                ...humanPatterns.informal
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        } else {
            const responses = [
                topic.aiResponse,
                ...aiPatterns.formal,
                ...aiPatterns.precise
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    };

    const sendMessage = () => {
        if (!currentInput.trim()) return;

        const newMessages: Messages = {
            A: [...messages.A, { text: currentInput, sender: 'user' }],
            B: [...messages.B, { text: currentInput, sender: 'user' }]
        };

        const responseA = generateResponse('A', currentInput);
        const responseB = generateResponse('B', currentInput);

        setTimeout(() => {
            newMessages.A.push({ text: responseA, sender: 'entity' });
            newMessages.B.push({ text: responseB, sender: 'entity' });
            setMessages(newMessages);

            const newCount = messageCount + 1;
            setMessageCount(newCount);

            if (newCount >= 5) {
                setTimeout(() => setGameState('guessing'), 1000);
            }
        }, 800);

        setCurrentInput('');
    };

    const makeGuess = (guess: Entity) => {
        setUserGuess(guess);
        setGameState('reveal');
    };

    const resetGame = () => {
        setGameState('intro');
        setMessages({ A: [], B: [] });
        setCurrentInput('');
        setMessageCount(0);
        setUserGuess(null);
        setActualHuman(null);
        setActiveTab('intro');
    };

    const isCorrect = userGuess === actualHuman;

    return (
        <div className="w-full h-full bg-surface rounded-lg border border-white/10 overflow-hidden flex flex-col">
            <div className="flex flex-col lg:flex-row h-full">

                {/* Sidebar */}
                <div className="w-full lg:w-80 bg-black/20 border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0 flex flex-col h-full">

                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-accent/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <Brain className="text-accent" size={28} />
                            <div>
                                <h1 className="text-xl font-bold text-textPrimary">Turing Test</h1>
                                <p className="text-xs text-textSecondary">Interactive Simulation</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('intro')}
                            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${activeTab === 'intro' ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
                        >
                            ABOUT
                        </button>
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${activeTab === 'guide' ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
                        >
                            GUIDE
                        </button>
                        <button
                            onClick={() => setActiveTab('aiapproach')}
                            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${activeTab === 'aiapproach' ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
                        >
                            AI APPROACH
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 h-[450px] overflow-y-auto">

                        {activeTab === 'intro' && (
                            <div className="space-y-4">
                                <div className="bg-accent/10 border-l-4 border-accent p-3 rounded-r-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="text-accent" size={18} />
                                        <h3 className="text-xs font-bold text-accent uppercase">The Turing Test</h3>
                                    </div>
                                    <p className="text-xs text-textSecondary leading-relaxed">
                                        Proposed by Alan Turing in 1950, this test provides an operational definition of intelligence.
                                        A computer is said to be intelligent if it can achieve human-level performance in cognitive tasks
                                        such that a human interrogator cannot distinguish it from a human during interaction.
                                    </p>
                                </div>

                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <h3 className="text-xs font-bold text-accent mb-2 uppercase">Key Concept</h3>
                                    <p className="text-xs text-textSecondary leading-relaxed mb-2">
                                        If a human evaluator cannot distinguish between human and machine responses,
                                        the machine demonstrates human-level intelligence in conversation. The test avoids
                                        physical interaction and focuses on conversation through text.
                                    </p>
                                    <div className="bg-black/30 p-2 rounded border border-white/5 mt-2">
                                        <p className="text-xs text-textSecondary italic">
                                            "Can machines think?" - Alan Turing, 1950
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <h3 className="text-xs font-bold text-green-400 mb-2 uppercase">How It Works</h3>
                                    <div className="space-y-1.5 text-xs text-textSecondary">
                                        <p>• Chat with two entities: Entity A and Entity B</p>
                                        <p>• One is human, one is AI</p>
                                        <p>• Ask questions to determine which is which</p>
                                        <p>• Make your guess after 5 exchanges</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'guide' && (
                            <div className="space-y-3">
                                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                                    <h3 className="text-xs font-bold text-yellow-400 mb-1 uppercase">Detection Tips</h3>
                                    <p className="text-xs text-textSecondary">Look for these patterns to identify the AI:</p>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <h4 className="text-xs font-bold text-red-400 mb-1.5">🤖 AI INDICATORS</h4>
                                        <ul className="text-xs text-textSecondary space-y-0.5">
                                            <li>• Overly formal language</li>
                                            <li>• Precise numerical data</li>
                                            <li>• Lacks personal experiences</li>
                                            <li>• Systematic responses</li>
                                            <li>• No emotional nuance</li>
                                        </ul>
                                    </div>

                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <h4 className="text-xs font-bold text-green-400 mb-1.5">👤 HUMAN INDICATORS</h4>
                                        <ul className="text-xs text-textSecondary space-y-0.5">
                                            <li>• Casual expressions (tbh, idk)</li>
                                            <li>• Personal opinions</li>
                                            <li>• Emotional responses</li>
                                            <li>• Imperfect grammar</li>
                                            <li>• Contextual humor</li>
                                        </ul>
                                    </div>

                                    <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                                        <h4 className="text-xs font-bold text-purple-400 mb-1.5">💡 STRATEGY</h4>
                                        <p className="text-xs text-textSecondary">
                                            Ask about subjective experiences, emotions, or recent personal events.
                                            Humans will naturally include personal details, while AI will be more abstract.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'aiapproach' && (
                            <div className="space-y-3">
                                <div className="bg-accent/10 border-l-4 border-accent p-3 rounded-r-lg">
                                    <h3 className="text-xs font-bold text-accent mb-1 uppercase">Acting Humanly</h3>
                                    <p className="text-xs text-textSecondary">
                                        The Turing Test represents the "Acting Humanly" approach - one of four fundamental AI approaches
                                        focused on behavioral similarity to humans.
                                    </p>
                                </div>

                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <h4 className="text-xs font-bold text-accent mb-2 uppercase">Four AI Approaches</h4>

                                    <div className="space-y-2">
                                        <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                            <p className="text-xs font-bold text-blue-400 mb-0.5">1. THINKING HUMANLY</p>
                                            <p className="text-xs text-textSecondary">Cognitive modeling - mimic human thought processes</p>
                                        </div>

                                        <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
                                            <p className="text-xs font-bold text-green-400 mb-0.5">2. ACTING HUMANLY (Turing Test)</p>
                                            <p className="text-xs text-textSecondary">Behave indistinguishably from humans in conversation</p>
                                        </div>

                                        <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                            <p className="text-xs font-bold text-yellow-400 mb-0.5">3. THINKING RATIONALLY</p>
                                            <p className="text-xs text-textSecondary">Logic-based approach using formal reasoning</p>
                                        </div>

                                        <div className="bg-purple-500/10 p-2 rounded border border-purple-500/20">
                                            <p className="text-xs font-bold text-purple-400 mb-0.5">4. ACTING RATIONALLY</p>
                                            <p className="text-xs text-textSecondary">Rational agents achieving best outcomes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <h4 className="text-xs font-bold text-green-400 mb-2 uppercase">Required Capabilities</h4>
                                    <p className="text-xs text-textSecondary mb-1.5">To pass the Turing Test, an AI needs:</p>
                                    <ul className="text-xs text-textSecondary space-y-1">
                                        <li>• <span className="text-textPrimary">Natural Language Processing</span> - understand text</li>
                                        <li>• <span className="text-textPrimary">Knowledge Representation</span> - store information</li>
                                        <li>• <span className="text-textPrimary">Automated Reasoning</span> - draw conclusions</li>
                                        <li>• <span className="text-textPrimary">Machine Learning</span> - adapt and improve</li>
                                    </ul>
                                    <p className="text-xs text-textSecondary mt-2 pt-2 border-t border-white/5">
                                        For the <span className="text-textPrimary font-semibold">Total Turing Test</span>, additional capabilities are required:
                                        Computer Vision and Robotics.
                                    </p>
                                </div>

                                <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <h4 className="text-xs font-bold text-red-400 mb-1.5 uppercase">Limitations</h4>
                                    <p className="text-xs text-textSecondary">
                                        The Turing Test measures behavioral performance, not true intelligence or consciousness.
                                        Modern AI can mimic human conversation without genuine understanding.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">

                    {gameState === 'intro' && (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="max-w-md text-center space-y-4">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center">
                                    <MessageSquare size={40} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-textPrimary">Welcome to the Turing Test</h2>
                                <p className="text-sm text-textSecondary">
                                    You will chat with two entities. One is human, one is AI.
                                    Can you identify which is which?
                                </p>
                                <button
                                    onClick={startGame}
                                    className="bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Start Test
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'chatting' && (
                        <div className="flex-1 flex flex-col">

                            {/* Progress */}
                            <div className="p-3 bg-black/20 border-b border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-textSecondary">Exchange {messageCount} of 5</span>
                                    <span className="text-xs text-textSecondary/70">Ask questions to identify the AI</span>
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-accent to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(messageCount / 5) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Chat Windows */}
                            <div className="flex-1 grid grid-cols-2 gap-3 p-3 overflow-hidden">

                                {(['A', 'B'] as Entity[]).map(entity => (
                                    <div key={entity} className="flex flex-col bg-black/20 rounded-lg border border-white/10 overflow-hidden">
                                        <div className="p-2 bg-gradient-to-r from-black/30 to-transparent border-b border-white/10">
                                            <h3 className="text-sm font-bold text-textPrimary">Entity {entity}</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                            {messages[entity].map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] p-2 rounded-lg ${msg.sender === 'user'
                                                            ? 'bg-accent text-white'
                                                            : 'bg-black/30 text-textPrimary border border-white/10'
                                                            }`}
                                                    >
                                                        <p className="text-xs">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-black/20 border-t border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentInput}
                                        onChange={(e) => setCurrentInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type your question to both entities..."
                                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!currentInput.trim()}
                                        className="bg-accent hover:bg-accent/90 disabled:bg-black/30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'guessing' && (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="max-w-md text-center space-y-4">
                                <h2 className="text-2xl font-bold text-textPrimary">Make Your Guess</h2>
                                <p className="text-sm text-textSecondary">Which entity do you think is the human?</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => makeGuess('A')}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-5 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        Entity A
                                    </button>
                                    <button
                                        onClick={() => makeGuess('B')}
                                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-10 py-5 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        Entity B
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'reveal' && (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="max-w-md text-center space-y-4">
                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {isCorrect ? <CheckCircle size={40} className="text-white" /> : <XCircle size={40} className="text-white" />}
                                </div>
                                <h2 className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                                </h2>
                                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                                    <p className="text-sm text-textSecondary mb-1">The human was:</p>
                                    <p className="text-3xl font-bold text-textPrimary">Entity {actualHuman}</p>
                                </div>
                                <p className="text-xs text-textSecondary">
                                    {isCorrect
                                        ? 'You successfully identified the human! The AI still has work to do.'
                                        : 'The AI fooled you! This shows how sophisticated AI conversation has become.'}
                                </p>
                                <button
                                    onClick={resetGame}
                                    className="bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw size={18} />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TuringTestSimulator;