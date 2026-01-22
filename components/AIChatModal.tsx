"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, BarChart3, Sparkles, MessageCircle, AlertCircle, Settings2, TrendingUp, Upload, FileText } from "lucide-react";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  ksv_score?: any;
  misconceptions?: string[];
  style?: string | null;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitTitle: string;
  unitContent: any;
}

const BACKEND_URL = 'http://localhost:8000';

const LEARNING_STYLES = [
  { value: 'adaptive', label: 'Adaptive (AI Decides)', description: 'AI will determine the best style for you' },
  { value: 'story', label: 'Story-Based', description: 'Learn through narratives and examples' },
  { value: 'mnemonic', label: 'Mnemonics', description: 'Memory aids and acronyms' },
  { value: 'visual', label: 'Visual', description: 'Diagrams and charts' },
  { value: 'stepbystep', label: 'Step-by-Step', description: 'Detailed breakdowns' },
];

export function AIChatModal({ isOpen, onClose, unitTitle, unitContent }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ksvScore, setKsvScore] = useState<any>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [preferredStyle, setPreferredStyle] = useState<string>('adaptive');
  const [detectedStyle, setDetectedStyle] = useState<string | null>(null);
  const [misconceptions, setMisconceptions] = useState<string[]>([]);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [showKSVPanel, setShowKSVPanel] = useState(false);
  const [showMasteryPanel, setShowMasteryPanel] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showMisconceptionsPanel, setShowMisconceptionsPanel] = useState(false);
  const [entropyScore, setEntropyScore] = useState<number | null>(null);
  const [masteryScores, setMasteryScores] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      handleInitialContext();
      inputRef.current?.focus();
    } else {
      setMessages([]);
      setInput("");
      setKsvScore(null);
      setSessionSummary(null);
      setMisconceptions([]);
      setDetectedStyle(null);
      setEntropyScore(null);
      setMasteryScores(null);
    }
  }, [isOpen]);

  const formatResponse = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/###\s/g, '')
      .replace(/##\s/g, '')
      .replace(/#\s/g, '')
      .replace(/---/g, '')
      .replace(/\n{3,}/g, '\n\n');
  };

  const handleInitialContext = async () => {
    setIsLoading(true);
    try {
      const styleInstruction = preferredStyle === 'adaptive' 
        ? 'Please determine the best learning style for me based on my responses.'
        : `Please teach me using ${LEARNING_STYLES.find(s => s.value === preferredStyle)?.label} approach.`;

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Hi! I want to learn about: ${unitTitle}. ${styleInstruction} Please give me a brief introduction.`,
          context: unitContent,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error('Failed to connect');

      const data = await response.json();
      const formattedContent = formatResponse(data.response || data.message || "Hello! I'm ready to help you learn.");

      setMessages([{
        role: 'assistant',
        content: formattedContent,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Initial context error:', error);
      setMessages([{
        role: 'system',
        content: 'Failed to connect to AI backend. Please ensure the server is running on http://localhost:8000',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isQuestion = (text: string): boolean => {
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can you', 'could you', 'explain'];
    const lowerText = text.toLowerCase();
    return questionWords.some(word => lowerText.includes(word)) || text.includes('?');
  };

  const isExplanation = (text: string): boolean => {
    const explanationPhrases = ['i think', 'i believe', 'my understanding', 'in my opinion', 'from what i know', 'i would say', 'let me explain', 'as i understand'];
    const lowerText = text.toLowerCase();
    return explanationPhrases.some(phrase => lowerText.includes(phrase));
  };

  const isKSVRequest = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return lowerText.includes('ksv') || lowerText.includes('score') || 
           lowerText.includes('my progress') || lowerText.includes('how am i doing');
  };

  const isSummaryRequest = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return lowerText.includes('summary') || lowerText.includes('summarize') || 
           lowerText.includes('what did we') || lowerText.includes('session summary');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      let endpoint = '/chat';
      let payload: any = {};

      // Route to appropriate endpoint based on message type
      if (isExplanation(currentInput)) {
        endpoint = '/explain-back';
        payload = {
          session_id: sessionId,
          explanation: currentInput
        };
      } else if (isQuestion(currentInput) && !isKSVRequest(currentInput) && !isSummaryRequest(currentInput)) {
        endpoint = '/ask';
        payload = {
          session_id: sessionId,
          content: JSON.stringify(unitContent),
          question: currentInput,
          style: preferredStyle
        };
      } else {
        // Use chat for KSV requests, summary requests, and general conversation
        endpoint = '/chat';
        payload = {
          message: currentInput,
          context: unitContent,
          session_id: sessionId,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        };
      }

      console.log('📤 Using endpoint:', endpoint, 'Payload:', payload);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);

      // Extract response text based on endpoint
      let responseText = '';
      let updatedKSV: any = null;
      let updatedStyle: string | null = null;
      let updatedMisconceptions: string[] = [];
      let updatedEntropy: number | null = null;
      let updatedMastery: any = null;

      if (endpoint === '/ask') {
        // /ask endpoint returns: answer, ksv_score, adaptive_style, concepts, misconception_detected, entropy_score, mastery_scores
        responseText = data.answer || '';
        updatedKSV = {
          overall: Math.round((data.ksv_score || 0) * 100),
          knowledge: Math.round((data.ksv_score || 0) * 110),
          skills: Math.round((data.ksv_score || 0) * 95),
          values: Math.round((data.ksv_score || 0) * 105)
        };
        updatedStyle = data.adaptive_style;
        updatedEntropy = data.entropy_score;
        updatedMastery = data.mastery_scores;
        
        if (data.misconception_detected) {
          updatedMisconceptions = ['Potential misconception detected - review the explanation carefully'];
        }
      } else if (endpoint === '/explain-back') {
        // /explain-back returns: similarity_score, feedback, updated_mastery
        responseText = data.feedback || '';
        const similarityPercent = Math.round((data.similarity_score || 0) * 100);
        updatedKSV = {
          overall: similarityPercent,
          knowledge: Math.min(100, Math.round(similarityPercent * 1.1)),
          skills: Math.min(100, Math.round(similarityPercent * 0.95)),
          values: Math.min(100, Math.round(similarityPercent * 1.05))
        };
        updatedMastery = data.updated_mastery;
      } else {
        // /chat endpoint returns: response, summary, ksv_score
        responseText = data.response || data.message || '';
        if (data.ksv_score) {
          updatedKSV = data.ksv_score;
        }
        if (data.summary) {
          setSessionSummary(data.summary);
        }
      }

      // Update all state with new data
      if (updatedKSV) {
        setKsvScore(updatedKSV);
        setShowKSVPanel(true);
      }
      
      if (updatedStyle && preferredStyle === 'adaptive') {
        setDetectedStyle(updatedStyle);
      }
      
      if (updatedMisconceptions.length > 0) {
        setMisconceptions(prev => {
          const combined = [...prev, ...updatedMisconceptions];
          return Array.from(new Set(combined));
        });
        setShowMisconceptionsPanel(true);
      }
      
      if (updatedEntropy !== null) {
        setEntropyScore(updatedEntropy);
      }
      
      if (updatedMastery) {
        setMasteryScores(updatedMastery);
        setShowMasteryPanel(true);
      }

      const formattedResponse = formatResponse(responseText);

      const assistantMessage: Message = {
        role: 'assistant',
        content: formattedResponse,
        timestamp: new Date(),
        ksv_score: updatedKSV,
        misconceptions: updatedMisconceptions,
        style: updatedStyle
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('❌ Send message error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const requestKSVScore = () => {
    if (isLoading) return;
    setInput("What is my current KSV score and learning progress?");
    setShowKSVPanel(true);
    setTimeout(() => handleSendMessage(), 100);
  };

  const requestSummary = async () => {
  if (isLoading) return;
  setIsLoading(true);
  setShowSummaryPanel(true);
  
  try {
    // Request session stats which includes summaries
    const response = await fetch(`${BACKEND_URL}/session/${sessionId}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to get session stats');
    }
    
    const data = await response.json();
    console.log('📊 Session stats:', data);
    
    // Build a comprehensive summary
    let summaryText = ` Learning Session Summary\n\n`;
    summaryText += `Overall Progress: ${Math.round((data.stats?.mean_mastery || 0) * 100)}% mastery\n`;
    summaryText += ` Total Interactions: ${data.total_interactions || 0}\n`;
    summaryText += `Concepts Learned: ${data.total_concepts || 0}\n\n`;
    
    if (data.user_best_style) {
      summaryText += `Your Best Learning Style: ${data.user_best_style}\n\n`;
    }
    
    if (data.concept_summaries && data.concept_summaries.length > 0) {
      summaryText += `Top Concepts:\n`;
      data.concept_summaries.slice(0, 3).forEach((concept: any, idx: number) => {
        summaryText += `${idx + 1}. ${concept.concept} (${Math.round(concept.mastery * 100)}% mastery)\n`;
        if (concept.best_style) {
          summaryText += `   Best style: ${concept.best_style}\n`;
        }
      });
    }
    
    setSessionSummary(summaryText);
    
    // Also update KSV if available
    if (data.stats?.mean_mastery !== undefined) {
      const masteryPercent = Math.round(data.stats.mean_mastery * 100);
      setKsvScore({
        overall: masteryPercent,
        knowledge: masteryPercent,
        skills: masteryPercent,
        values: masteryPercent
      });
      setShowKSVPanel(true);
    }
    
    // Show as a message too
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: summaryText,
      timestamp: new Date()
    }]);
    
  } catch (error) {
    console.error('Summary error:', error);
    
    // Fallback to chat endpoint
    setInput("Can you provide a summary of our learning session with my progress and best learning style?");
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  } finally {
    setIsLoading(false);
  }
};

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      const response = await fetch(`${BACKEND_URL}/upload-document`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('📄 Document uploaded:', data);

      setMessages(prev => [...prev, {
        role: 'system',
        content: `✅ Document "${file.name}" uploaded successfully! (${data.concepts_extracted} concepts extracted)`,
        timestamp: new Date()
      }]);

      setUploadedFile(file);

    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        setMessages(prev => [...prev, {
          role: 'system',
          content: '❌ Please upload only PDF or TXT files',
          timestamp: new Date()
        }]);
        return;
      }
      handleFileUpload(file);
    }
  };

  if (!isOpen) return null;

  const activeStyle = detectedStyle || preferredStyle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-5xl mx-4 h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-blue-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg relative">
              <Bot className="w-5 h-5 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Learning Assistant</h2>
              <p className="text-xs text-gray-400 truncate max-w-md">{unitTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-xs hover:bg-green-500/30 transition-colors text-green-300 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Doc</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedFile && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                <FileText className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-300 truncate max-w-[100px]">{uploadedFile.name}</span>
              </div>
            )}

            {/* Learning Style Selector */}
            <div className="relative">
              <button
                onClick={() => setShowStylePicker(!showStylePicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-xs hover:bg-gray-700 transition-colors text-white"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>{LEARNING_STYLES.find(s => s.value === activeStyle)?.label || 'Adaptive'}</span>
              </button>
              
              {showStylePicker && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                  {LEARNING_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => {
                        setPreferredStyle(style.value);
                        setShowStylePicker(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                        preferredStyle === style.value ? 'bg-blue-500/20' : ''
                      }`}
                    >
                      <div className="font-medium text-sm text-white">{style.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{style.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {ksvScore && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-blue-300 text-sm">{ksvScore.overall}%</span>
              </div>
            )}
            
            {detectedStyle && preferredStyle === 'adaptive' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-purple-300">{detectedStyle}</span>
              </div>
            )}

           {typeof entropyScore === "number" && (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
    <TrendingUp className="w-3 h-3 text-green-400" />
    <span className="text-[10px] text-green-300">
      H: {entropyScore.toFixed(2)}
    </span>
  </div>
)}

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
                    : message.role === 'system'
                    ? 'bg-orange-500/10 border border-orange-500/20 text-orange-200'
                    : 'bg-gray-800 border border-gray-700 text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === 'assistant' && (
                    <div className="p-1.5 bg-blue-500/20 rounded-lg flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  {message.role === 'system' && (
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    
                    {message.misconceptions && message.misconceptions.length > 0 && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs font-bold text-red-400 mb-2">⚠️ Areas for Review:</p>
                        <ul className="text-xs text-red-300 space-y-1">
                          {message.misconceptions.map((m, i) => (
                            <li key={i}>• {m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {message.style && (
                      <div className="mt-2 text-xs text-gray-400">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        Style: {message.style}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 max-w-[85%]">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Misconceptions Alert - Collapsible */}
        {misconceptions.length > 0 && showMisconceptionsPanel && (
          <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-400 mb-1">Common Misconceptions Detected</h4>
                  <ul className="text-xs text-red-300 space-y-1">
                    {misconceptions.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowMisconceptionsPanel(false)}
                className="p-1 hover:bg-red-500/20 rounded text-red-400 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* KSV Score Display - Collapsible */}
        {ksvScore && showKSVPanel && (
          <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Your Learning Progress</h3>
              </div>
              <button
                onClick={() => setShowKSVPanel(false)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-blue-400 font-medium mb-1">KNOWLEDGE</div>
                <div className="text-xl font-bold text-blue-300">{Math.min(100, ksvScore.knowledge)}%</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-green-400 font-medium mb-1">SKILLS</div>
                <div className="text-xl font-bold text-green-300">{Math.min(100, ksvScore.skills)}%</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-purple-400 font-medium mb-1">VALUES</div>
                <div className="text-xl font-bold text-purple-300">{Math.min(100, ksvScore.values)}%</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-orange-400 font-medium mb-1">OVERALL</div>
                <div className="text-xl font-bold text-orange-300">{ksvScore.overall}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Mastery Scores - Collapsible */}
        {masteryScores && Object.keys(masteryScores).length > 0 && showMasteryPanel && (
          <div className="px-4 py-3 bg-purple-500/5 border-t border-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-purple-300">Concept Mastery</h4>
              </div>
              <button
                onClick={() => setShowMasteryPanel(false)}
                className="p-1 hover:bg-purple-500/20 rounded text-purple-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(masteryScores).slice(0, 4).map(([concept, score]: [string, any]) => (
                <div key={concept} className="bg-gray-800/50 border border-gray-700 rounded p-2">
                  <div className="text-xs text-gray-400 truncate">{concept}</div>
                  <div className="text-sm font-bold text-purple-300">{Math.round(score * 100)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Summary - Collapsible */}
        {sessionSummary && showSummaryPanel && (
          <div className="px-4 py-3 bg-blue-500/5 border-t border-blue-500/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <Sparkles className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Session Summary</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{sessionSummary}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryPanel(false)}
                className="p-1 hover:bg-blue-500/20 rounded text-blue-400 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 py-2 bg-gray-800/30 border-t border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={requestKSVScore}
              disabled={isLoading}
              className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
              Get KSV Score
            </button>
            <button
              onClick={requestSummary}
              disabled={isLoading}
              className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              Get Summary
            </button>
            <button
              onClick={() => setInput("What are the key concepts I should focus on?")}
              disabled={isLoading}
              className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-medium text-green-400 hover:bg-green-500/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-3.5 h-3.5 inline mr-1.5" />
              Key Concepts
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className="px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-3.5 h-3.5 inline mr-1.5" />
              Upload PDF/TXT
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or share your understanding..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Share your explanations to get detailed KSV scores
          </p>
        </div>
      </div>
    </div>
  );
}