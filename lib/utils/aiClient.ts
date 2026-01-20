// lib/ai/aiClient.ts
const BACKEND_URL = "http://localhost:8000";

export interface KSVScore {
  knowledge: number;
  skills: number;
  values: number;
  overall: number;
  misconceptions?: string[];
  entropy?: number;
}

export interface SessionSummary {
  summary: string;
  preferred_style?: string;
  recommendations?: string[];
}

// Ask endpoint - for questions from students
export async function askAI(payload: {
  session_id: string;
  content: string;
  question: string;
}) {
  const res = await fetch(`${BACKEND_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`AI request failed: ${error}`);
  }

  return res.json();
}

// Chat endpoint - for conversational interactions
export async function chatAI(payload: {
  message: string;
  context?: any;
  conversation_history?: Array<{ role: string; content: string }>;
  conversation_id?: string;
}) {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Chat request failed: ${error}`);
  }

  return res.json();
}

// Explain endpoint - for detailed explanations with student input
export async function explainAI(payload: {
  session_id: string;
  content: string;
  student_explanation: string;
}) {
  const res = await fetch(`${BACKEND_URL}/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Explain request failed: ${error}`);
  }

  return res.json();
}

// Helper to detect intent from user message
export function detectIntent(message: string): 'ask' | 'explain' | 'chat' {
  const lowerMsg = message.toLowerCase();
  
  // Detect if user is asking a question
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can you explain'];
  const isQuestion = questionWords.some(word => lowerMsg.includes(word)) || lowerMsg.includes('?');
  
  // Detect if user is providing an explanation
  const explainPhrases = [
    'i think', 'i believe', 'my understanding', 'in my opinion',
    'i would say', 'let me explain', 'from what i know', 'as i understand',
    'i understand it as', 'my explanation'
  ];
  const isExplanation = explainPhrases.some(phrase => lowerMsg.includes(phrase));
  
  if (isExplanation) return 'explain';
  if (isQuestion) return 'ask';
  return 'chat';
}

// Helper to extract KSV-related requests
export function isKSVRequest(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  return lowerMsg.includes('ksv') || 
         lowerMsg.includes('score') || 
         lowerMsg.includes('evaluate') ||
         lowerMsg.includes('assess my understanding') ||
         lowerMsg.includes('how am i doing');
}

// Helper to extract summary requests
export function isSummaryRequest(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  return lowerMsg.includes('summary') || 
         lowerMsg.includes('summarize') || 
         lowerMsg.includes('what did we discuss') ||
         lowerMsg.includes('review our conversation') ||
         lowerMsg.includes('what have we covered');
}