import React, { useState, useEffect } from 'react';
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

export const TuringTestSimulator = () => {
    const [gameState, setGameState] = useState<GameState>('chatting'); // Start directly in game
    const [messages, setMessages] = useState<Messages>({ A: [], B: [] });
    const [currentInput, setCurrentInput] = useState('');
    const [messageCount, setMessageCount] = useState(0);
    const [userGuess, setUserGuess] = useState<Entity | null>(null);
    const [actualHuman, setActualHuman] = useState<Entity | null>(null);
    const [activeTab, setActiveTab] = useState<TabState>('intro');

    // Auto-start game on mount
    useEffect(() => {
        startGame();
    }, []);

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
        <div className="w-full h-[80vh] min-h-[600px] bg-surface rounded-lg border border-white/10 flex flex-col">
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">

                {/* Main Game Area Only */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/40 backdrop-blur-sm">

                    {gameState === 'chatting' && (
                        <div className="flex-1 flex flex-col">

                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Brain className="text-accent" /> Turing Test Simulation
                                    </h2>
                                    <p className="text-xs text-textSecondary">Interact with both entities. Identify the AI.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-accent font-mono font-bold">Exchange {messageCount}/5</p>
                                    <div className="w-32 h-1.5 bg-white/10 rounded-full mt-1">
                                        <div
                                            className="h-full bg-accent rounded-full transition-all duration-300"
                                            style={{ width: `${(messageCount / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Chat Windows */}
                            <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0">
                                {(['A', 'B'] as Entity[]).map(entity => (
                                    <div key={entity} className="flex flex-col bg-surface/50 rounded-xl border border-white/10 overflow-hidden shadow-inner">
                                        <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-white">Entity {entity}</h3>
                                            <Bot className="w-4 h-4 text-white/20" />
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {messages[entity].map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[90%] p-3 rounded-2xl ${msg.sender === 'user'
                                                            ? 'bg-accent text-white rounded-tr-sm'
                                                            : 'bg-white/10 text-white border border-white/5 rounded-tl-sm'
                                                            }`}
                                                    >
                                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Dummy scroll anchor if needed */}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-surface border-t border-white/10 backdrop-blur-md">
                                <div className="flex gap-3 max-w-4xl mx-auto">
                                    <input
                                        type="text"
                                        value={currentInput}
                                        onChange={(e) => setCurrentInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Ask a question to both entities..."
                                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!currentInput.trim()}
                                        className="bg-accent hover:bg-accent/90 disabled:bg-white/5 disabled:text-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-accent/20 flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                        <span>Send</span>
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