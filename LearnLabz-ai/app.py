from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any, Dict
from datetime import datetime
from sentence_transformers import SentenceTransformer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GLOBAL: Load embedding model ONCE at startup
print("📄 Loading embedding model globally...")
GLOBAL_EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Embedding model loaded!")

# Store active tutoring sessions
sessions: Dict[str, Any] = {}

# Your Mistral API key
MISTRAL_API_KEY = ""

# ========== REQUEST MODELS ==========
class AskRequest(BaseModel):
    session_id: str
    content: str
    question: str
    style: Optional[str] = "adaptive"

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    session_id: Optional[str] = None

class ExplainBackRequest(BaseModel):
    session_id: str
    explanation: str

class QuickActionRequest(BaseModel):
    session_id: str
    action: str
    context: Optional[Dict[str, Any]] = None

# ========== RESPONSE MODELS ==========
class AskResponse(BaseModel):
    answer: str
    ksv_score: float
    adaptive_style: str
    concepts: List[str]
    misconception_detected: bool
    misconception_confidence: float
    is_repeat: bool
    backend_summary: str
    entropy_score: float
    mastery_scores: Dict[str, float]
    style_rankings: Dict[str, List[str]]
    user_best_style: str
    style_performance: Dict[str, float]

class ChatResponse(BaseModel):
    response: str
    summary: Optional[str] = None
    ksv_score: Optional[Dict[str, float]] = None

class ExplainBackResponse(BaseModel):
    similarity_score: float
    feedback: str
    updated_mastery: Dict[str, float]

# ========== HELPER FUNCTIONS ==========

def extract_lesson_content(context: Dict[str, Any]) -> str:
    """Extract text content from lesson/unit structure (for modules)"""
    content_parts = []
    
    for key, value in context.items():
        if key == "title":
            content_parts.append(f"Title: {value}")
        elif key == "description":
            content_parts.append(f"Description: {value}")
        elif key == "overview":
            content_parts.append(f"Overview: {value}")
        elif key == "strategies" and isinstance(value, list):
            content_parts.append("\nStrategies:")
            for item in value:
                content_parts.append(f"- {item}")
        elif key == "challenges" and isinstance(value, list):
            content_parts.append("\nChallenges:")
            for item in value:
                content_parts.append(f"- {item}")
        elif key == "objectives" and isinstance(value, list):
            content_parts.append("\nObjectives:")
            for item in value:
                content_parts.append(f"- {item}")
        elif key == "lessons" and isinstance(value, list):
            for lesson in value:
                content_parts.append(f"\n\nLesson: {lesson.get('title', 'Untitled')}")
                if "content" in lesson and isinstance(lesson["content"], dict):
                    lesson_content = lesson["content"]
                    if "overview" in lesson_content:
                        content_parts.append(lesson_content["overview"])
                    if "objectives" in lesson_content:
                        content_parts.append("Objectives:")
                        for obj in lesson_content["objectives"]:
                            content_parts.append(f"- {obj}")
                    if "sections" in lesson_content:
                        for section in lesson_content["sections"]:
                            if "title" in section:
                                content_parts.append(f"\n{section['title']}")
                            if "content" in section and isinstance(section["content"], str):
                                content_parts.append(section["content"])
        elif isinstance(value, dict):
            nested_content = extract_lesson_content(value)
            if nested_content:
                content_parts.append(nested_content)
    
    return "\n".join(content_parts)

def call_mistral_simple(prompt: str, max_tokens: int = 500) -> str:
    """Simple Mistral API call"""
    import requests
    
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MISTRAL_API_KEY}"
    }
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"Error calling Mistral API: {str(e)}"

def get_or_create_session(session_id: str, content: str = None):
    """Get existing session or create new one"""
    if session_id not in sessions:
        if not content:
            raise HTTPException(status_code=400, detail="Content required for new session")
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="Content cannot be empty")
        
        try:
            from core import TutoringEngine
            engine = TutoringEngine(MISTRAL_API_KEY, embedding_model=GLOBAL_EMBEDDING_MODEL)
            engine.load_document(content)
            
            if len(engine.concepts) == 0:
                raise HTTPException(status_code=400, detail="No concepts extracted from content. Please provide more detailed text.")
            
            sessions[session_id] = engine
            print(f"✓ Created new session: {session_id} ({len(engine.concepts)} concepts)")
        except HTTPException:
            raise
        except Exception as e:
            print(f"✗ Failed to create session: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize tutoring engine: {str(e)}")
    
    return sessions[session_id]

# ========== ENDPOINTS ==========

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...), session_id: str = None):
    """Upload a document (PDF/TXT) and create a tutoring session"""
    try:
        from utils import extract_text_from_pdf, extract_text_from_txt
        
        if not session_id:
            session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if file.filename.endswith('.pdf'):
            content = extract_text_from_pdf(file.file)
        elif file.filename.endswith('.txt'):
            content = extract_text_from_txt(file.file)
        else:
            raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="Extracted content is empty")
        
        engine = get_or_create_session(session_id, content)
        
        return {
            "message": "Document uploaded successfully",
            "session_id": session_id,
            "content_length": len(content),
            "concepts_extracted": len(engine.concepts)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask", response_model=AskResponse)
def ask_ai(req: AskRequest):
    """Main endpoint: Accepts content from BOTH modules AND uploaded documents"""
    try:
        print(f"\n{'='*60}")
        print(f"ASK REQUEST - Session: {req.session_id}")
        print(f"Question: {req.question}")
        print(f"Requested style: {req.style}")
        print(f"Content length: {len(req.content) if req.content else 0}")
        print(f"{'='*60}\n")
        
        engine = get_or_create_session(req.session_id, req.content)
        
        if len(engine.concepts) == 0:
            raise HTTPException(status_code=400, detail="No concepts available. Please provide content first.")
        
        result = engine.process_question(req.question, style=req.style)
        
        stats = engine.get_ksv_stats()
        
        mastery_scores = {}
        style_rankings = {}
        
        for concept in result['concepts']:
            if concept in engine.ksv_rich:
                ksv = engine.ksv_rich[concept]
                mastery_scores[concept] = ksv.mastery_score
                style_rankings[concept] = ksv.style_ranking
        
        avg_entropy = stats.get('mean_entropy', 0.0)
        
        user_style_stats = engine.get_user_style_performance()
        
        response = AskResponse(
            answer=result['explanation'],
            ksv_score=stats.get('mean_mastery', 0.0),
            adaptive_style=result['style'],
            concepts=result['concepts'],
            misconception_detected=result.get('misconception_detected', False),
            misconception_confidence=result.get('misconception_confidence', 0.0),
            is_repeat=result.get('is_repeat', False),
            backend_summary=result.get('backend_summary', ''),
            entropy_score=avg_entropy,
            mastery_scores=mastery_scores,
            style_rankings=style_rankings,
            user_best_style=user_style_stats['best_style'],
            style_performance=user_style_stats['style_scores']
        )
        
        print(f"\n✓ RESPONSE GENERATED:")
        print(f"  KSV Score: {response.ksv_score:.2f}")
        print(f"  Entropy: {response.entropy_score:.2f}")
        print(f"  Style: {response.adaptive_style}")
        print(f"  User Best Style: {response.user_best_style}")
        print(f"  Style Performance: {response.style_performance}")
        print(f"{'='*60}\n")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ ERROR in /ask: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def chat_ai(req: ChatRequest):
    """Enhanced chat endpoint with KSV tracking and conversation history"""
    try:
        print(f"\n{'='*60}")
        print(f"CHAT REQUEST")
        print(f"Message: {req.message}")
        print(f"Has context: {req.context is not None}")
        print(f"Has history: {req.conversation_history is not None}")
        print(f"Session ID: {req.session_id}")
        print(f"{'='*60}\n")
        
        if not req.session_id:
            req.session_id = f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        content_text = ""
        if req.context:
            content_text = extract_lesson_content(req.context)
        
        message_lower = req.message.lower()
        is_ksv_request = any(phrase in message_lower for phrase in [
            'ksv score', 'ksv', 'knowledge skill', 'my score', 'understanding score'
        ])
        
        is_summary_request = any(phrase in message_lower for phrase in [
            'summary', 'summarize', 'what did we learn', 'session summary'
        ])
        
        is_style_report = any(phrase in message_lower for phrase in [
            'style report', 'best style', 'learning style', 'which style works'
        ])
        
        if content_text and len(content_text) > 50:
            try:
                engine = get_or_create_session(req.session_id, content_text)
                
                if is_style_report:
                    style_stats = engine.get_user_style_performance()
                    
                    style_prompt = f"""Generate a personalized learning style report for the student.

Their performance by style:
{chr(10).join([f"- {style}: {score:.1%} understanding" for style, score in style_stats['style_scores'].items()])}

Best style: {style_stats['best_style']}
Total interactions: {style_stats['total_interactions']}

Provide encouraging insights about their learning preferences and recommendations."""
                    
                    response_text = call_mistral_simple(style_prompt, max_tokens=400)
                    
                    return ChatResponse(
                        response=response_text,
                        summary=f"Best style: {style_stats['best_style']}",
                        ksv_score=style_stats['style_scores']
                    )
                
                if is_ksv_request:
                    stats = engine.get_ksv_stats()
                    ksv_breakdown = {
                        'overall': stats.get('mean_mastery', 0.0) * 100,
                        'knowledge': min(100, stats.get('mean_mastery', 0.0) * 100 * 1.1),
                        'skills': min(100, stats.get('mean_mastery', 0.0) * 100 * 0.95),
                        'values': min(100, stats.get('mean_mastery', 0.0) * 100 * 1.05)
                    }
                    
                    ksv_prompt = f"""Based on the student's learning session with {len(engine.question_history)} interactions:

Overall Mastery: {stats.get('mean_mastery', 0.0):.2f}
Weak Concepts: {stats.get('weak_count', 0)}
Strong Concepts: {stats.get('strong_count', 0)}

Provide a detailed KSV (Knowledge, Skills, Values) breakdown explaining:
1. Their knowledge retention
2. Their practical skills development  
3. Their learning engagement and values

Be encouraging and specific."""
                    
                    response_text = call_mistral_simple(ksv_prompt, max_tokens=400)
                    
                    return ChatResponse(
                        response=response_text,
                        summary=f"Session stats: {len(engine.question_history)} questions, {stats.get('mean_mastery', 0.0):.1%} mastery",
                        ksv_score=ksv_breakdown
                    )
                
                if is_summary_request:
                    summaries = engine.get_all_summaries()
                    stats = engine.get_ksv_stats()
                    
                    summary_prompt = f"""Generate a comprehensive learning session summary.

Session Details:
- Total concepts learned: {len(engine.concepts)}
- Questions asked: {len(engine.question_history)}
- Average mastery: {stats.get('mean_mastery', 0.0):.1%}

Top concepts and their style performance:
"""
                    for summary in summaries[:3]:
                        summary_prompt += f"\n{summary['concept']}: Best style = {summary.get('best_style', 'N/A')}"
                    
                    summary_prompt += "\n\nProvide an encouraging summary of their learning progress and recommendations."
                    
                    response_text = call_mistral_simple(summary_prompt, max_tokens=500)
                    
                    return ChatResponse(
                        response=response_text,
                        summary="Learning session completed successfully"
                    )
                
                result = engine.process_question(req.message, style='adaptive')
                stats = engine.get_ksv_stats()
                
                return ChatResponse(
                    response=result['explanation'],
                    summary=result.get('backend_summary', ''),
                    ksv_score={
                        'overall': stats.get('mean_mastery', 0.0) * 100,
                        'knowledge': min(100, stats.get('mean_mastery', 0.0) * 100 * 1.1),
                        'skills': min(100, stats.get('mean_mastery', 0.0) * 100 * 0.95),
                        'values': min(100, stats.get('mean_mastery', 0.0) * 100 * 1.05)
                    }
                )
                
            except HTTPException:
                raise
            except Exception as e:
                print(f"Engine error, falling back to simple chat: {e}")
        
        conversation_context = ""
        if req.conversation_history:
            for msg in req.conversation_history[-5:]:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                conversation_context += f"{role}: {content}\n"
        
        prompt = f"""You are an expert AI tutor. 

{"Conversation history:" if conversation_context else ""}
{conversation_context}

{"Content to review:" if content_text else ""}
{content_text[:1000] if content_text else ""}

Student: {req.message}

Provide a helpful, educational response."""
        
        ai_response = call_mistral_simple(prompt, max_tokens=800)
        
        return ChatResponse(
            response=ai_response,
            summary="Response generated"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ ERROR in /chat: {str(e)}")
        import traceback
        traceback.print_exc()
        return ChatResponse(
            response=f"I encountered an error: {str(e)}",
            summary="Error occurred"
        )

@app.post("/explain-back", response_model=ExplainBackResponse)
def explain_back(req: ExplainBackRequest):
    """Evaluate student's explanation and update KSV"""
    try:
        if req.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found. Please use /ask first.")
        
        engine = sessions[req.session_id]
        result = engine.evaluate_explain_back(req.explanation)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        updated_mastery = {}
        for concept in result.get('updated_concepts', []):
            if concept in engine.ksv_rich:
                updated_mastery[concept] = engine.ksv_rich[concept].mastery_score
        
        return ExplainBackResponse(
            similarity_score=result['similarity_score'],
            feedback=result['feedback'],
            updated_mastery=updated_mastery
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quick-action")
def quick_action(req: QuickActionRequest):
    """Handle quick action buttons"""
    try:
        if req.session_id not in sessions:
            if req.context:
                content = extract_lesson_content(req.context)
                engine = get_or_create_session(req.session_id, content)
            else:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            engine = sessions[req.session_id]
        
        if req.action == "ksv_score":
            stats = engine.get_ksv_stats()
            return {
                "action": "ksv_score",
                "data": {
                    "overall": stats.get('mean_mastery', 0.0) * 100,
                    "knowledge": min(100, stats.get('mean_mastery', 0.0) * 100 * 1.1),
                    "skills": min(100, stats.get('mean_mastery', 0.0) * 100 * 0.95),
                    "values": min(100, stats.get('mean_mastery', 0.0) * 100 * 1.05)
                },
                "message": f"Current mastery: {stats.get('mean_mastery', 0.0):.1%}"
            }
        
        elif req.action == "summary":
            summaries = engine.get_all_summaries()
            return {
                "action": "summary",
                "data": summaries[:5],
                "message": "Learning summary generated"
            }
        
        elif req.action == "key_concepts":
            return {
                "action": "key_concepts",
                "data": engine.concepts[:10],
                "message": f"Top {min(10, len(engine.concepts))} concepts"
            }
        
        elif req.action == "style_report":
            style_stats = engine.get_user_style_performance()
            return {
                "action": "style_report",
                "data": {
                    "best_style": style_stats['best_style'],
                    "style_scores": style_stats['style_scores'],
                    "total_interactions": style_stats['total_interactions'],
                    "ranked_styles": style_stats['ranked_styles']
                },
                "message": f"Your best learning style is: {style_stats['best_style']}"
            }
        
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/session/{session_id}/stats")
def get_session_stats(session_id: str):
    """Get detailed statistics for a learning session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = sessions[session_id]
    stats = engine.get_ksv_stats()
    summaries = engine.get_all_summaries()
    style_stats = engine.get_user_style_performance()
    
    return {
        "stats": stats,
        "total_concepts": len(engine.concepts),
        "total_interactions": len(engine.intervention_history),
        "misconception_count": engine.misconception_count,
        "concept_summaries": summaries[:5],
        "user_best_style": style_stats['best_style'],
        "style_performance": style_stats['style_performance']
    }

@app.delete("/session/{session_id}")
def delete_session(session_id: str):
    """Delete a learning session"""
    if session_id in sessions:
        del sessions[session_id]
        return {"message": f"Session {session_id} deleted"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "FastAPI backend running (personalized adaptive learning)",
        "active_sessions": len(sessions),
        "api_key_configured": bool(MISTRAL_API_KEY),
        "embedding_model_loaded": GLOBAL_EMBEDDING_MODEL is not None,
        "features": [
            "Adaptive style selection based on user performance",
            "Style performance tracking",
            "Accepts module content AND uploaded documents",
            "Personalized learning insights"
        ]
    }

@app.get("/")
def root():
    """Root endpoint with API documentation"""
    return {
        "message": "LearnLabz AI Backend v3.2 - Personalized Adaptive Learning",
        "status": "online",
        "endpoints": {
            "POST /upload-document": "Upload PDF/TXT file",
            "POST /chat": "Chat with adaptive style learning",
            "POST /ask": "Ask questions (adapts to YOUR best style)",
            "POST /explain-back": "Evaluate student explanations",
            "POST /quick-action": "Quick actions (includes style_report)",
            "GET /session/{id}/stats": "Get session statistics with style performance",
            "DELETE /session/{id}": "Delete session",
            "GET /health": "Health check"
        },
        "active_sessions": len(sessions),
        "features": {
            "adaptive_learning": "Automatically selects YOUR best learning style",
            "style_tracking": "Tracks which style works best for YOU",
            "content_sources": "Accepts BOTH module content AND uploaded documents",
            "personalization": "Learns and adapts to YOUR understanding level"
        }
    }
@app.get("/session/{session_id}/content")
def get_session_content(session_id: str):
    """Get the content from a session (for retrieving uploaded document content)"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = sessions[session_id]
    
    # Return the concepts as content (they contain the document text)
    return {
        "session_id": session_id,
        "content": "\n\n".join(engine.concepts),
        "total_concepts": len(engine.concepts)
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 LearnLabz AI - Personalized Adaptive Learning")
    print("="*60)
    print("✅ Embedding model pre-loaded globally")
    print("🎯 Adaptive style selection enabled")
    print("📊 Style performance tracking enabled")
    print("📚 Accepts module content AND uploaded documents")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)