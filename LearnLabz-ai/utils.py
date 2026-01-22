import re
import torch
import requests
from typing import List
from io import BytesIO
import PyPDF2

def extract_text_from_pdf(file) -> str:
    """Extract text from PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"PDF error: {str(e)}")

def extract_text_from_txt(file) -> str:
    """Extract text from TXT"""
    try:
        return file.read().decode('utf-8')
    except Exception as e:
        raise Exception(f"TXT error: {str(e)}")

def chunk_text_into_concepts(text: str, chunk_size: int = 250) -> List[str]:
    """Break text into concept chunks"""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    concepts = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < chunk_size:
            current_chunk += sentence + ". "
        else:
            if current_chunk:
                concepts.append(current_chunk.strip())
            current_chunk = sentence + ". "
    
    if current_chunk:
        concepts.append(current_chunk.strip())
    
    concepts = [c for c in concepts if len(c) > 40]
    return concepts

def compute_similarity(emb1: torch.Tensor, emb2: torch.Tensor) -> torch.Tensor:
    """Compute cosine similarity"""
    emb1_norm = emb1 / emb1.norm(dim=-1, keepdim=True)
    emb2_norm = emb2 / emb2.norm(dim=-1, keepdim=True)
    return torch.mm(emb1_norm, emb2_norm.T)

def call_mistral_api(api_key: str, prompt: str, max_tokens: int = 512, temperature: float = 0.7) -> str:
    """Call Mistral API"""
    url = "https://api.mistral.ai/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        raise Exception(f"API error: {str(e)}")

def analyze_understanding_from_question(question: str, concepts: List[str], embedding_model) -> float:
    """Analyze understanding from question - returns score between 0.3 and 0.8"""
    question_lower = question.lower()
    words = question.split()
    word_count = len(words)
    
    complexity_score = min(0.5, 0.3 + (word_count / 50.0))
    
    question_type_score = 0.4
    
    if any(p in question_lower for p in [
        'why does', 'how does', 'how can', 'what causes', 
        'explain how', 'explain why', 'can you explain'
    ]):
        question_type_score = 0.7
    
    elif any(p in question_lower for p in [
        'how does this relate', 'difference between', 'compare',
        'what if', 'similar to', 'connected to'
    ]):
        question_type_score = 0.75
    
    elif any(p in question_lower for p in [
        'could you', 'can you', 'give me example', 
        'more about', 'elaborate'
    ]):
        question_type_score = 0.55
    
    elif any(p in question_lower for p in [
        'what is', 'what are', 'define', 'meaning'
    ]):
        question_type_score = 0.35
    
    technical_words = [w for w in words if len(w) > 7]
    vocab_score = min(0.2, len(technical_words) / 5.0)
    
    question_emb = embedding_model.encode([question], convert_to_tensor=True)
    concept_embs = embedding_model.encode(concepts, convert_to_tensor=True)
    similarities = compute_similarity(question_emb, concept_embs)
    max_similarity = float(similarities.max())
    
    if max_similarity > 0.85:
        similarity_signal = 0.4
    elif max_similarity > 0.65:
        similarity_signal = 0.55
    elif max_similarity > 0.45:
        similarity_signal = 0.65
    else:
        similarity_signal = 0.45
    
    understanding_score = (
        question_type_score * 0.50 +
        similarity_signal * 0.25 +
        complexity_score * 0.15 +
        vocab_score * 0.10
    )
    
    return max(0.3, min(0.8, understanding_score))