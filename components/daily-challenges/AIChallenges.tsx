import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, Trophy, CheckCircle, XCircle, AlertCircle, Lightbulb, Code, BookOpen, RotateCcw, Send } from 'lucide-react';
interface AIChallengesProps {
  courseId?: number;
}


// Type Definitions
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizChallenge {
  type: 'quiz';
  title: string;
  description: string;
  questions: QuizQuestion[];
  fun_fact?: string;
}

interface PuzzleChallenge {
  type: 'puzzle';
  title: string;
  description: string;
  task: string;
  example_input?: string;
  example_output?: string;
  constraints?: string[];
  hints?: string[];
  starter_code?: string;
}

interface LogicChallenge {
  type: 'logic';
  title: string;
  scenario: string;
  question: string;
  given?: string[];
  hints?: string[];
}

interface VisualChallenge {
  type: 'visual';
  title: string;
  description: string;
  components?: string[];
  questions?: string[];
  example?: string;
}

interface CreativeChallenge {
  type: 'creative';
  title: string;
  scenario: string;
  objective: string;
  requirements?: string[];
  considerations?: string[];
}

type Challenge = QuizChallenge | PuzzleChallenge | LogicChallenge | VisualChallenge | CreativeChallenge;

interface Evaluation {
  score: number;
  verdict: 'Pass' | 'Fail' | 'Partial' | 'Error';
  correct_count?: number;
  total_count?: number;
  feedback: string;
  improvements?: string[];
  correct_approach?: string;
  learning_resources?: string[];
}

interface ChallengeType {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
}

interface QuizAnswers {
  [key: number]: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;


const AIChallenges: React.FC = () => {

  const [userInput, setUserInput] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('surprise');
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  
  const challengeTypes: ChallengeType[] = [
    { id: 'surprise', name: 'Surprise Me', desc: 'AI picks best format', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'quiz', name: 'Quiz Master', desc: 'Test knowledge', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'puzzle', name: 'Code Puzzle', desc: 'Solve challenges', icon: <Code className="w-4 h-4" /> },
    { id: 'logic', name: 'Logic Brain', desc: 'Math & reasoning', icon: <Brain className="w-4 h-4" /> },
    { id: 'visual', name: 'Visual Explorer', desc: 'Diagrams & arch', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'creative', name: 'Creative Design', desc: 'Design systems', icon: <Zap className="w-4 h-4" /> }
  ];

  const getTodaySeed = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const generateSuggestions = async (): Promise<void> => {
    setLoadingSuggestions(true);
    const seed = getTodaySeed();
    
    const prompt = `You are an AI/ML learning expert. Generate 6 interesting, diverse, and specific AI/ML topics for daily challenges.

TODAY'S SEED: ${seed}

Requirements:
- Cover different areas: Deep Learning, NLP, Computer Vision, Reinforcement Learning, ML Fundamentals, AI Ethics/Applications
- Be specific (e.g., "Transformer attention mechanism" not just "transformers")
- Mix theoretical and practical topics
- Make them engaging and relevant to current AI/ML trends
- Each should be 3-8 words

Return ONLY a JSON array of 6 strings, nothing else:
["topic 1", "topic 2", "topic 3", "topic 4", "topic 5", "topic 6"]`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const topics: string[] = JSON.parse(jsonMatch[0]);
        setSuggestions(topics);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([
        'Backpropagation algorithm',
        'BERT vs GPT architecture',
        'Convolutional Neural Networks',
        'Q-Learning in RL',
        'Bias in ML models',
        'GANs for image generation'
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestions();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const generateChallenge = async (): Promise<void> => {
    if (!userInput.trim()) return;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      setChallenge({
        type: 'quiz',
        title: '⚠️ API Key Required',
        description: 'Please add your OpenAI API key at the top of the code. Get your key from https://platform.openai.com/api-keys',
        questions: [{
          question: 'To use this app, you need to:',
          options: [
            "1. Go to https://platform.openai.com/api-keys",
            "2. Create a new API key",
            "3. Copy it and paste it in the code",
            "4. Save and the app will work!"
          ],
          correct: 0,
          explanation: "Once you add your API key, you'll be able to generate and evaluate AI/ML challenges!"
        }]
      });
      return;
    }
    
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minDelay = 2000;
    
    if (timeSinceLastRequest < minDelay) {
      const waitTime = Math.ceil((minDelay - timeSinceLastRequest) / 1000);
      setChallenge({
        type: 'quiz',
        title: '⏱️ Please Wait',
        description: `To avoid rate limits, please wait ${waitTime} more second${waitTime > 1 ? 's' : ''} before generating another challenge.`,
        questions: [{
          question: 'Why do we have rate limits?',
          options: [
            "To prevent overwhelming the API servers",
            "To ensure fair usage for all users",
            "To avoid hitting OpenAI's rate limits",
            "All of the above"
          ],
          correct: 3,
          explanation: "Rate limits help ensure stable service and fair access for everyone!"
        }]
      });
      return;
    }
    
    setLastRequestTime(now);
    setLoading(true);
    setChallenge(null);
    setEvaluation(null);
    setUserAnswer('');
    setQuizAnswers({});

    const seed = getTodaySeed();
    
    const difficultyGuidelines: Record<Difficulty, string> = {
      'Easy': 'Beginner-friendly with clear explanations. Suitable for someone new to this concept. Provide hints and examples.',
      'Medium': 'Intermediate level requiring basic AI/ML knowledge. Balance challenge with accessibility. Some problem-solving needed.',
      'Hard': 'Advanced level for experienced ML practitioners. Include edge cases, mathematical depth, or implementation details.'
    };
    
    const formatInstruction = selectedType === 'surprise' 
      ? `Analyze the topic and choose ONE of these EXACT types: "quiz", "puzzle", "logic", "visual", or "creative". Use ONLY these exact type names.`
      : `You MUST use EXACTLY the type "${selectedType}". Do not use any other type name.`;

    const prompt = `You are an expert AI/ML educator creating engaging learning challenges.

TOPIC: "${userInput}"
DIFFICULTY: ${difficulty} - ${difficultyGuidelines[difficulty]}
TODAY'S SEED: ${seed}
FORMAT: ${formatInstruction}

CRITICAL: Your response MUST have a "type" field with ONLY one of these exact values: "quiz", "puzzle", "logic", "visual", or "creative"

Create a FUN, INTERACTIVE, and SPECIFIC challenge about this topic.

FORMAT SELECTION GUIDE:
- "quiz": Use for concepts, comparisons, definitions, theory questions
- "puzzle": Use for algorithms, coding problems, implementations
- "logic": Use for math problems, derivations, reasoning challenges
- "visual": Use for architectures, diagrams, system design workflows
- "creative": Use for applications, ethics discussions, system design

Respond with JSON in one of these EXACT formats:

FOR QUIZ (concepts/theory):
{
  "type": "quiz",
  "title": "Engaging quiz title",
  "description": "Brief context about why this matters",
  "questions": [
    {
      "question": "Specific, detailed question with context",
      "options": ["Option A with details", "Option B with details", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "fun_fact": "An interesting related fact"
}

FOR PUZZLE (coding/implementation):
{
  "type": "puzzle",
  "title": "Specific puzzle title",
  "description": "Detailed problem with real-world context",
  "task": "What needs to be implemented",
  "example_input": "Concrete example",
  "example_output": "Expected result",
  "constraints": ["Constraint 1", "Constraint 2"],
  "hints": ["Hint 1", "Hint 2"],
  "starter_code": "# Optional starter code template"
}

FOR LOGIC (math/reasoning):
{
  "type": "logic",
  "title": "Problem title",
  "scenario": "Mathematical/logical setup with specific values",
  "question": "What needs to be solved/proven",
  "given": ["Given fact 1", "Given fact 2"],
  "hints": ["Hint 1", "Hint 2"]
}

FOR VISUAL (architecture/diagrams):
{
  "type": "visual",
  "title": "Architecture/diagram challenge",
  "description": "What needs to be explained/designed",
  "components": ["Component 1 to describe", "Component 2", "Component 3"],
  "questions": ["Specific question 1", "Question 2"],
  "example": "An example to reference"
}

FOR CREATIVE (design/application):
{
  "type": "creative",
  "title": "Design challenge",
  "scenario": "Real-world problem context",
  "objective": "What needs to be designed/solved",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "considerations": ["Thing to consider 1", "Thing to consider 2"]
}

IMPORTANT:
- Make it highly specific to "${userInput}"
- Include real numbers, actual examples, concrete details
- Make questions thought-provoking, not just recall
- Adjust complexity for ${difficulty} level
- Make it engaging and fun, not dry
- Use today's seed ${seed} to ensure uniqueness

Respond ONLY with valid JSON, no other text. Make sure the "type" field is EXACTLY one of: "quiz", "puzzle", "logic", "visual", or "creative"`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Response Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API Key - Please check your OpenAI API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded - Please wait a moment and try again');
        } else if (response.status === 403) {
          throw new Error('API Key permission denied - Check if your key has the required permissions');
        } else {
          throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        const validTypes = ['quiz', 'puzzle', 'logic', 'visual', 'creative'];
        if (!parsed.type || !validTypes.includes(parsed.type)) {
          console.warn(`Invalid or missing type "${parsed.type}" received from API, defaulting to quiz`);
          parsed.type = 'quiz';
          
          if (!parsed.questions) {
            parsed.questions = [{
              question: `What do you know about ${userInput}?`,
              options: [
                "I understand the basic concept",
                "I can explain it to others",
                "I can implement it",
                "I'm still learning"
              ],
              correct: 0,
              explanation: "This is a placeholder quiz. Please try generating again."
            }];
            parsed.description = "There was an error generating the challenge. This is a placeholder.";
          }
        }

        setChallenge(parsed as Challenge);
      } else {
        throw new Error('No valid JSON found in response');
      }

    } catch (error) {
      console.error('Error generating challenge:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setChallenge({
        type: 'quiz',
        title: '❌ Challenge Generation Failed',
        description: `Error: ${errorMessage}`,
        questions: [{
          question: errorMessage.includes('API Key') 
            ? 'How to fix API Key issues:' 
            : 'What should you try?',
          options: errorMessage.includes('API Key') ? [
            "1. Get a valid API key from https://platform.openai.com/api-keys",
            "2. Make sure you have credits in your OpenAI account",
            "3. Copy the key and paste it in the code",
            "4. Refresh the page after updating the key"
          ] : [
            "Try a different topic",
            "Wait a moment and try again",
            "Check your internet connection",
            "Simplify your topic name"
          ],
          correct: 0,
          explanation: "Common issues: Invalid/expired API key, no credits, rate limits, or network problems."
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async (): Promise<void> => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      setEvaluation({
        score: 0,
        verdict: 'Error',
        feedback: 'Cannot evaluate without an API key. Please add your OpenAI API key to use this feature.'
      });
      return;
    }
    
    setEvaluating(true);
    
    let answerText = '';
    if (challenge?.type === 'quiz') {
      answerText = JSON.stringify(quizAnswers);
    } else {
      answerText = userAnswer;
    }

    const evalPrompt = `You are a knowledgeable AI/ML educator evaluating a student's response.

CHALLENGE:
${JSON.stringify(challenge, null, 2)}

STUDENT'S ANSWER:
${answerText}

DIFFICULTY LEVEL: ${difficulty}

Evaluate thoroughly:
1. For QUIZ: Check each answer against correct options, count correct answers
2. For CODE/PUZZLE: Check logic, syntax, efficiency, edge cases
3. For LOGIC/MATH: Check reasoning, steps, final answer
4. For CREATIVE: Check completeness, thoughtfulness, feasibility

Adjust grading strictness based on difficulty:
- Easy: Be encouraging, accept partially correct answers, give 7-10 for good attempts
- Medium: Be fair, require correctness but allow minor errors, give 5-8 for solid work  
- Hard: Be rigorous, expect precision and depth, give 3-7 even for good attempts

Respond in JSON:
{
  "score": <number 0-10>,
  "verdict": "Pass/Fail/Partial",
  "correct_count": <for quiz: number correct>,
  "total_count": <for quiz: total questions>,
  "feedback": "Specific feedback on what was right/wrong",
  "improvements": ["Specific improvement 1", "Specific improvement 2"],
  "correct_approach": "Detailed explanation of the correct solution/approach",
  "learning_resources": ["Resource 1", "Resource 2"]
}

Be constructive, specific, and educational. Respond ONLY with valid JSON.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1500,
          messages: [{ role: 'user', content: evalPrompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evalData: Evaluation = JSON.parse(jsonMatch[0]);
        setEvaluation(evalData);
      }
    } catch (error) {
      console.error('Error evaluating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setEvaluation({
        score: 0,
        verdict: 'Error',
        feedback: `Evaluation failed: ${errorMessage}. Please check your API key and try again.`
      });
    } finally {
      setEvaluating(false);
    }
  };

  const renderChallengeContent = () => {
    if (!challenge) return null;

    switch (challenge.type) {
      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-bold text-textPrimary mb-2">{challenge.title}</h3>
              <p className="text-sm text-textSecondary">{challenge.description}</p>
              {challenge.fun_fact && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-accent font-semibold">Fun Fact</p>
                  <p className="text-xs text-textSecondary mt-1">{challenge.fun_fact}</p>
                </div>
              )}
            </div>
            
            {challenge.questions?.map((q, idx) => (
              <div key={idx} className="bg-surface border border-white/10 p-4 rounded-lg">
                <p className="font-semibold text-textPrimary mb-3">
                  <span className="text-accent mr-2">Q{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => (
                    <label 
                      key={optIdx} 
                      className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/10"
                    >
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        value={optIdx}
                        checked={quizAnswers[idx] === optIdx}
                        onChange={() => setQuizAnswers({...quizAnswers, [idx]: optIdx})}
                        className="mt-0.5 accent-accent"
                      />
                      <span className="text-sm text-textSecondary">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'puzzle':
        return (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-bold text-textPrimary mb-2">{challenge.title}</h3>
              <p className="text-sm text-textSecondary whitespace-pre-wrap mb-3">{challenge.description}</p>
              <p className="text-sm"><span className="font-semibold text-accent">Task:</span> <span className="text-textSecondary">{challenge.task}</span></p>
            </div>
            
            {challenge.example_input && (
              <div className="bg-black/40 border border-white/10 p-4 rounded-lg">
                <p className="text-xs font-semibold text-accent mb-2">Example Input</p>
                <code className="text-sm text-green-400 block mb-3">{challenge.example_input}</code>
                <p className="text-xs font-semibold text-accent mb-2">Expected Output</p>
                <code className="text-sm text-blue-400 block">{challenge.example_output}</code>
              </div>
            )}
            
            {challenge.hints && challenge.hints.length > 0 && (
              <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                <p className="text-xs font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" /> Hints
                </p>
                {challenge.hints.map((h, i) => (
                  <p key={i} className="text-xs text-textSecondary mb-1">• {h}</p>
                ))}
              </div>
            )}
            
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your solution here..."
              className="w-full h-48 p-4 bg-black/20 border border-white/10 rounded-lg font-mono text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent resize-none"
            />
          </div>
        );

      case 'logic':
        return (
          <div className="space-y-4">
            <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-bold text-textPrimary mb-2">{challenge.title}</h3>
              <p className="text-sm text-textSecondary whitespace-pre-wrap mb-3">{challenge.scenario}</p>
              <p className="font-semibold text-accent text-sm">{challenge.question}</p>
            </div>
            
            {challenge.given && challenge.given.length > 0 && (
              <div className="bg-surface border border-white/10 p-4 rounded-lg">
                <p className="font-semibold text-accent text-sm mb-2">Given</p>
                {challenge.given.map((g, i) => (
                  <p key={i} className="text-sm text-textSecondary mb-1">• {g}</p>
                ))}
              </div>
            )}
            
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Show your work and reasoning..."
              className="w-full h-40 p-4 bg-black/20 border border-white/10 rounded-lg text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent resize-none"
            />
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-4">
            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-bold text-textPrimary mb-2">{challenge.title}</h3>
              <p className="text-sm text-textSecondary">{challenge.description}</p>
            </div>
            
            {challenge.components && (
              <div className="bg-surface border border-white/10 p-4 rounded-lg">
                <p className="font-semibold text-accent text-sm mb-3">Components to explain</p>
                <div className="space-y-2">
                  {challenge.components.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent font-bold text-sm">{i + 1}.</span>
                      <span className="text-sm text-textSecondary">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Describe the architecture/diagram..."
              className="w-full h-48 p-4 bg-black/20 border border-white/10 rounded-lg text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent resize-none"
            />
          </div>
        );

      case 'creative':
        return (
          <div className="space-y-4">
            <div className="bg-pink-500/10 border-l-4 border-pink-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-bold text-textPrimary mb-2">{challenge.title}</h3>
              <p className="text-sm text-textSecondary mb-2">{challenge.scenario}</p>
              <p className="font-semibold text-accent text-sm">{challenge.objective}</p>
            </div>
            
            {challenge.requirements && (
              <div className="bg-surface border border-white/10 p-4 rounded-lg">
                <p className="font-semibold text-accent text-sm mb-2">Requirements</p>
                {challenge.requirements.map((r, i) => (
                  <p key={i} className="text-sm text-textSecondary mb-1">• {r}</p>
                ))}
              </div>
            )}
            
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Design your solution..."
              className="w-full h-56 p-4 bg-black/20 border border-white/10 rounded-lg text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent resize-none"
            />
          </div>
        );

      default:
        return (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h3 className="text-lg font-bold text-red-400 mb-2">Unexpected Challenge Type</h3>
            <p className="text-sm text-red-300">
              The challenge type was not recognized. Please try generating a new challenge.
            </p>
          </div>
        );
    }
  };

  const canSubmit = (): boolean => {
    if (challenge?.type === 'quiz') {
      return Object.keys(quizAnswers).length === (challenge as QuizChallenge).questions?.length;
    }
    return userAnswer.trim().length > 10;
  };

  return (
    <div className="w-full h-full min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12 overflow-hidden border border-white/10 rounded-xl relative">
      
      {/* Sidebar */}
      <div className="lg:col-span-3 bg-surface border-r border-white/10 flex flex-col z-10 shadow-xl overflow-hidden h-full">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-surface to-black/20">
          <h1 className="text-xl font-black text-textPrimary tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" />
            AI/ML Challenges
          </h1>
          <p className="text-xs text-textSecondary mt-1">Test Your Knowledge</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          
          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent uppercase">Topic</label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && generateChallenge()}
              placeholder="e.g., transformers, gradient descent..."
              className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-accent uppercase">Suggestions</label>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setUserInput(s)}
                    className="px-3 py-2 bg-black/20 hover:bg-white/5 border border-white/10 hover:border-accent rounded-lg text-xs text-left text-textSecondary hover:text-textPrimary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Challenge Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent uppercase">Challenge Type</label>
            <div className="grid grid-cols-2 gap-2">
              {challengeTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`p-3 rounded-lg text-xs transition-all border ${
                    selectedType === t.id 
                      ? 'bg-accent/20 text-accent border-accent' 
                      : 'bg-black/20 text-textSecondary border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {t.icon}
                    <span className="font-bold">{t.name}</span>
                  </div>
                  <p className="text-[10px] opacity-70">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent uppercase">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-2 rounded-lg text-sm font-bold transition-all border ${
                    difficulty === d 
                      ? 'bg-accent text-white border-accent' 
                      : 'bg-black/20 text-textSecondary border-white/10 hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateChallenge}
            disabled={loading || !userInput.trim()}
            className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Challenge
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 relative bg-[#0B1120] flex flex-col h-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-center pointer-events-none" />

        {/* Challenge Display */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          
          {/* No Challenge State */}
          {!challenge && !evaluation && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <Brain className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-textPrimary mb-2">Ready to Challenge Yourself?</h2>
                <p className="text-sm text-textSecondary">
                  Enter a topic, select your preferences, and generate an AI/ML challenge to test your knowledge.
                </p>
              </div>
            </div>
          )}

          {/* Challenge Content */}
          {challenge && !evaluation && (
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* Header Bar */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full border border-accent/30">
                    {difficulty}
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-textSecondary text-xs font-bold rounded-full border border-white/10">
                    {challenge.type.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setChallenge(null);
                    setUserAnswer('');
                    setQuizAnswers({});
                  }}
                  className="text-xs text-textSecondary hover:text-accent transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  New Challenge
                </button>
              </div>

              {/* Challenge Body */}
              <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-2xl">
                {renderChallengeContent()}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={evaluateAnswer}
                  disabled={!canSubmit() || evaluating}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
                >
                  {evaluating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Evaluation Results */}
          {evaluation && (
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* Score Card */}
              <div className="bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/30 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-textPrimary flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-accent" />
                    Results
                  </h2>
                  <div className="text-right">
                    <div className="text-4xl font-black text-accent">{evaluation.score}<span className="text-2xl text-textSecondary">/10</span></div>
                    <div className={`text-xs font-bold uppercase mt-1 ${
                      evaluation.verdict === 'Pass' ? 'text-green-500' :
                      evaluation.verdict === 'Partial' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {evaluation.verdict === 'Pass' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {evaluation.verdict === 'Fail' && <XCircle className="w-4 h-4 inline mr-1" />}
                      {evaluation.verdict === 'Partial' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                      {evaluation.verdict}
                    </div>
                  </div>
                </div>

                {evaluation.correct_count !== undefined && evaluation.total_count !== undefined && (
                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <p className="text-sm text-textSecondary">
                      <span className="font-bold text-accent">{evaluation.correct_count}</span> out of{' '}
                      <span className="font-bold text-textPrimary">{evaluation.total_count}</span> correct
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-textPrimary mb-2">Feedback</h3>
                    <p className="text-sm text-textSecondary leading-relaxed">{evaluation.feedback}</p>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-textPrimary mb-3">Areas for Improvement</h3>
                      <div className="space-y-2">
                        {evaluation.improvements.map((imp, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-textSecondary">
                            <span className="text-yellow-500 font-bold">•</span>
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Correct Approach */}
              {evaluation.correct_approach && (
                <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-textPrimary mb-2">Correct Approach</h3>
                      <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">{evaluation.correct_approach}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={() => {
                    setChallenge(null);
                    setEvaluation(null);
                    setUserAnswer('');
                    setQuizAnswers({});
                  }}
                  className="px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  New Challenge
                </button>
                <button
                  onClick={() => {
                    setEvaluation(null);
                    setUserAnswer('');
                    setQuizAnswers({});
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChallenges;