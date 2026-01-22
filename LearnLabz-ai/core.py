import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime
from sentence_transformers import SentenceTransformer
from utils import chunk_text_into_concepts, compute_similarity, call_mistral_api, analyze_understanding_from_question
import json

class StylePerformance:
    """Track style performance"""
    __slots__ = ['style', 'attempts', 'total_understanding', 'avg_understanding', 
                 'last_used', 'effectiveness_rank', 'scores']
    
    def __init__(self, style: str):
        self.style = style
        self.attempts = 0
        self.total_understanding = 0.0
        self.avg_understanding = 0.0
        self.last_used = None
        self.effectiveness_rank = 0
        self.scores = []
        
    def add_signal(self, understanding_score: float):
        """Add understanding signal"""
        self.attempts += 1
        self.scores.append(understanding_score)
        self.total_understanding += understanding_score
        self.avg_understanding = self.total_understanding / self.attempts
        self.last_used = datetime.now()
    
    def to_dict(self):
        return {
            'style': self.style,
            'attempts': self.attempts,
            'avg_understanding': self.avg_understanding,
            'rank': self.effectiveness_rank
        }


class ConceptKSV:
    """Rich KSV with style learning"""
    __slots__ = ['concept', 'mastery_score', 'confidence_score', 'style_performance',
                 'style_ranking', 'best_style', 'worst_style', 'total_interactions',
                 'interaction_count', 'last_asked', 'entropy', 'entropy_score',
                 'repetition_count', 'created_at', 'last_updated']
    
    def __init__(self, concept: str):
        self.concept = concept
        self.mastery_score = 0.3
        self.confidence_score = 0.3
        
        self.style_performance = {
            'bullet_points': StylePerformance('bullet_points'),
            'mnemonic': StylePerformance('mnemonic'),
            'stepwise': StylePerformance('stepwise'),
            'story': StylePerformance('story')
        }
        
        self.style_ranking = []
        self.best_style = None
        self.worst_style = None
        
        self.total_interactions = 0
        self.interaction_count = 0
        self.last_asked = None
        self.entropy = 0.5
        self.entropy_score = 0.5
        self.repetition_count = 0
        
        self.created_at = datetime.now()
        self.last_updated = datetime.now()
    
    def update_style_ranking(self):
        """Rank styles by effectiveness in ASCENDING order (worst to best)"""
        ranked = sorted(
            [(style, perf) for style, perf in self.style_performance.items() if perf.attempts > 0],
            key=lambda x: x[1].avg_understanding,
            reverse=False
        )
        
        if not ranked:
            self.style_ranking = ['bullet_points', 'mnemonic', 'stepwise', 'story']
            return
        
        self.style_ranking = [style for style, perf in ranked]
        
        for rank, (style, perf) in enumerate(ranked, 1):
            perf.effectiveness_rank = rank
        
        if ranked:
            self.best_style = ranked[-1][0]
            self.worst_style = ranked[0][0]
    
    def get_best_style(self) -> str:
        """Get best performing style"""
        if not self.style_ranking:
            self.update_style_ranking()
        
        for style in reversed(self.style_ranking):
            if self.style_performance[style].attempts > 0:
                return style
        
        return 'story'


class TutoringEngine:
    """Enhanced tutoring engine with USER-LEVEL style adaptation"""
    
    def __init__(self, mistral_api_key: str, embedding_model: SentenceTransformer = None):
        self.api_key = mistral_api_key
        
        if embedding_model is not None:
            print("✅ Using pre-loaded embedding model")
            self.embedding_model = embedding_model
        else:
            print("📄 Loading embedding model...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        self.concepts = []
        self.concept_embeddings = None
        self.ksv_rich = {}
        self.ksv = {}
        self.misconceptions = {}
        self.misconception_count = 0
        
        self.question_history = []
        self.current_context = {
            'last_question': None,
            'last_concepts': [],
            'last_style': None,
            'awaiting_feedback': False
        }
        
        self.intervention_history = []
        
        self.user_style_performance = {
            'bullet_points': StylePerformance('bullet_points'),
            'mnemonic': StylePerformance('mnemonic'),
            'stepwise': StylePerformance('stepwise'),
            'story': StylePerformance('story')
        }
        
        self.alpha = 0.2
        self.good_boost = 0.15
        self.medium_boost = 0.10
        self.small_boost = 0.05
        self.poor_penalty = 0.05
    
    def load_document(self, text: str):
        """Load document and initialize KSV"""
        if not text or not text.strip():
            raise ValueError("Document text is empty")
        
        print("Extracting concepts...")
        self.concepts = chunk_text_into_concepts(text)
        
        if not self.concepts or len(self.concepts) == 0:
            raise ValueError("No concepts could be extracted from the document. Please provide more detailed content.")
        
        print(f"Generating embeddings for {len(self.concepts)} concepts...")
        self.concept_embeddings = self.embedding_model.encode(
            self.concepts,
            show_progress_bar=False,
            convert_to_tensor=True
        )
        
        for concept in self.concepts:
            self.ksv_rich[concept] = ConceptKSV(concept)
            self.ksv[concept] = 0.3
        
        self._extract_misconceptions()
        
        print(f"✓ Ready! {len(self.concepts)} concepts loaded.")
    
    def _extract_misconceptions(self):
        """Extract misconceptions"""
        sample_concepts = self.concepts[:min(5, len(self.concepts))]
        
        for concept in sample_concepts:
            prompt = f"""List 2 common misconceptions about: "{concept}"
Return JSON array: ["misconception 1", "misconception 2"]"""
            try:
                response = call_mistral_api(self.api_key, prompt, max_tokens=150)
                start = response.find('[')
                end = response.rfind(']') + 1
                if start != -1 and end > start:
                    misconceptions = json.loads(response[start:end])
                    if isinstance(misconceptions, list):
                        self.misconceptions[concept] = misconceptions
            except:
                self.misconceptions[concept] = []
    
    def retrieve_relevant_concepts(self, query: str, top_k: int = 3) -> List[str]:
        """Retrieve relevant concepts"""
        if self.concept_embeddings is None or len(self.concepts) == 0:
            return []
        
        query_embedding = self.embedding_model.encode([query], convert_to_tensor=True)
        similarities = compute_similarity(query_embedding, self.concept_embeddings)
        top_indices = similarities[0].argsort(descending=True)[:top_k].cpu().numpy()
        
        retrieved = [self.concepts[i] for i in top_indices]
        
        for concept in retrieved:
            if concept in self.ksv_rich:
                self.ksv_rich[concept].last_asked = datetime.now()
        
        return retrieved
    
    def detect_question_repetition(self, question: str) -> Tuple[bool, Optional[Dict]]:
        """Detect repeated questions"""
        if not self.question_history:
            return False, None
        
        current_emb = self.embedding_model.encode([question], convert_to_tensor=True)
        
        recent = self.question_history[-5:]
        for past_q, _, past_concepts in recent:
            past_emb = self.embedding_model.encode([past_q], convert_to_tensor=True)
            similarity = compute_similarity(current_emb, past_emb)[0][0].item()
            
            if similarity > 0.75:
                print(f"⚠️ Repeated question (sim: {similarity:.2f})")
                return True, {'question': past_q, 'concepts': past_concepts}
        
        return False, None
    
    def get_user_best_style(self) -> str:
        """Get USER's overall best learning style (across all interactions)"""
        ranked = sorted(
            self.user_style_performance.items(),
            key=lambda x: x[1].avg_understanding if x[1].attempts > 0 else 0,
            reverse=True
        )
        
        for style, perf in ranked:
            if perf.attempts > 0:
                print(f"🎯 User's best style: {style} ({perf.avg_understanding:.2f} avg, {perf.attempts} uses)")
                return style
        
        return 'story'
    
    def select_adaptive_style(self, concepts: List[str]) -> str:
        """Select style adaptively based on USER's learning history"""
        if not concepts:
            return 'story'
        
        print("\n🎯 Adaptive Style Selection (USER-PERSONALIZED):")
        
        user_best = self.get_user_best_style()
        
        print(f"  ✅ Selected USER's best style: '{user_best}'")
        
        return user_best
    
    def generate_explanation(self, question: str, concepts: List[str], style: str) -> str:
        """Generate explanation in the specified style"""
        if not concepts:
            return "I couldn't find relevant concepts. Please provide more context."
        
        context = "\n\n".join([f"Concept {i+1}: {c}" for i, c in enumerate(concepts)])
        
        style_instructions = {
            'story': "Explain using an engaging story or narrative example with real-world context (3-4 sentences).",
            'bullet_points': """Explain using clear bullet points format:
- Main point 1 with brief explanation
- Main point 2 with brief explanation  
- Main point 3 with brief explanation
Keep each bullet concise and focused.""",
            'mnemonic': "Explain the concept and then provide a memorable mnemonic device, acronym, or vivid analogy to help remember it.",
            'stepwise': "Explain step-by-step in numbered sequential parts, breaking down the concept into simple logical stages."
        }
        
        prompt = f"""You are an AI tutor. Answer using ONLY these concepts.

Concepts:
{context}

Question: {question}

Style: {style_instructions.get(style, style_instructions['story'])}

Answer (be concise, educational, and follow the style EXACTLY):"""

        try:
            response = call_mistral_api(self.api_key, prompt, max_tokens=400)
            return response
        except Exception as e:
            return f"Based on: {concepts[0][:100]}..."
    
    def detect_misconception(self, question: str, concepts: List[str]) -> Tuple[bool, Optional[str], float]:
        """Detect misconceptions"""
        for concept in concepts:
            if concept in self.misconceptions:
                for misc in self.misconceptions[concept]:
                    misc_emb = self.embedding_model.encode([misc], convert_to_tensor=True)
                    ques_emb = self.embedding_model.encode([question], convert_to_tensor=True)
                    sim = compute_similarity(ques_emb, misc_emb)[0][0].item()
                    
                    if sim > 0.6:
                        correction = f"Common misconception detected. The correct understanding is: {concept[:200]}"
                        return True, correction, sim
        
        return False, None, 0.0
    
    def _generate_natural_summary(self, question: str, concepts: List[str], selected_style: str, 
                                   understanding: float, is_adaptive: bool, is_repeat: bool,
                                   mastery_changes: List[Dict]) -> str:
        """Generate natural language summary explaining the decision and performance"""
        
        # Build the summary in natural language
        summary_parts = []
        
        # 1. Style selection explanation
        if is_adaptive:
            user_style_perf = self.get_user_style_performance()
            best_style = user_style_perf['best_style']
            
            if user_style_perf['total_interactions'] > 0:
                summary_parts.append(
                    f"I chose the '{selected_style}' teaching style for you because it's your best-performing style with "
                    f"{user_style_perf['style_scores'].get(selected_style, 0):.1%} average understanding across "
                    f"{self.user_style_performance[selected_style].attempts} previous interactions."
                )
            else:
                summary_parts.append(
                    f"I started with the '{selected_style}' style as we're building your learning profile. "
                    f"As we continue, I'll adapt to the style that works best for you."
                )
        else:
            summary_parts.append(
                f"You specifically requested the '{selected_style}' style for this explanation."
            )
        
        # 2. Understanding assessment
        if understanding >= 0.6:
            level = "high"
            description = "excellent grasp of the material"
        elif understanding >= 0.4:
            level = "moderate"
            description = "decent understanding with room to grow"
        else:
            level = "developing"
            description = "foundational understanding that needs reinforcement"
        
        summary_parts.append(
            f"Based on your question, I detected a {level} level of understanding ({understanding:.1%}), "
            f"showing {description}."
        )
        
        # 3. Repetition detection
        if is_repeat:
            summary_parts.append(
                "I noticed this question is similar to one you asked recently, which suggests you might need "
                "a different approach or more practice with this concept."
            )
        
        # 4. Mastery changes explanation
        if mastery_changes:
            positive_changes = [m for m in mastery_changes if m['change'] > 0]
            negative_changes = [m for m in mastery_changes if m['change'] < 0]
            
            if positive_changes:
                avg_improvement = np.mean([m['change'] for m in positive_changes])
                summary_parts.append(
                    f"Great progress! Your mastery increased by an average of {avg_improvement:.1%} across "
                    f"{len(positive_changes)} concept{'s' if len(positive_changes) > 1 else ''} because of your "
                    f"{level} understanding demonstrated in this question."
                )
            
            if negative_changes:
                avg_decrease = np.mean([abs(m['change']) for m in negative_changes])
                reason = "asking a similar question again" if is_repeat else "showing lower comprehension on this attempt"
                summary_parts.append(
                    f"Your mastery decreased by {avg_decrease:.1%} on some concepts due to {reason}. "
                    f"Don't worry - this helps me identify areas where you need more support."
                )
        
        # 5. Style performance tracking
        concept_style_info = []
        for concept in concepts[:2]:  # Top 2 concepts
            if concept in self.ksv_rich:
                ksv = self.ksv_rich[concept]
                if ksv.style_ranking:
                    best = ksv.style_ranking[-1] if ksv.style_ranking else 'N/A'
                    worst = ksv.style_ranking[0] if ksv.style_ranking else 'N/A'
                    concept_style_info.append(
                        f"For '{concept[:40]}...', you learn best with '{best}' style and "
                        f"struggle more with '{worst}' style."
                    )
        
        if concept_style_info:
            summary_parts.append(" ".join(concept_style_info))
        
        # 6. Next steps recommendation
        stats = self.get_ksv_stats()
        if stats['mean_mastery'] >= 0.7:
            summary_parts.append(
                f"You're doing excellent overall with {stats['mean_mastery']:.1%} average mastery! "
                f"Keep up the great work."
            )
        elif stats['mean_mastery'] >= 0.5:
            summary_parts.append(
                f"You're making good progress with {stats['mean_mastery']:.1%} average mastery. "
                f"Focus on the {stats['weak_count']} weaker concept{'s' if stats['weak_count'] > 1 else ''} "
                f"to improve further."
            )
        else:
            summary_parts.append(
                f"You're building your foundation with {stats['mean_mastery']:.1%} average mastery. "
                f"Keep practicing - I'm adapting my teaching style to help you learn better."
            )
        
        return " ".join(summary_parts)
    
    def process_question(self, question: str, style: Optional[str] = None) -> Dict:
        """Main pipeline with USER-LEVEL style adaptation"""
        is_repeat, _ = self.detect_question_repetition(question)
        concepts = self.retrieve_relevant_concepts(question)
        
        if not concepts:
            return {
                'explanation': "I need more context to answer this question. Please provide additional information.",
                'concepts': [],
                'style': 'story',
                'misconception_detected': False,
                'misconception_correction': None,
                'misconception_confidence': 0.0,
                'is_repeat': False,
                'is_adaptive': False,
                'backend_summary': 'No concepts found. Unable to generate explanation.',
                'overall_summary': 'No learning data available for this question.'
            }
        
        is_adaptive = (style == 'adaptive' or style is None)
        
        if is_adaptive:
            selected_style = self.select_adaptive_style(concepts)
        else:
            selected_style = style if style in ['story', 'bullet_points', 'mnemonic', 'stepwise'] else 'story'
        
        has_misc, correction, misc_conf = self.detect_misconception(question, concepts)
        
        explanation = self.generate_explanation(question, concepts, selected_style)
        
        understanding = analyze_understanding_from_question(question, concepts, self.embedding_model)
        
        print(f"\n📊 Understanding Analysis:")
        print(f"  Question understanding: {understanding:.2f}")
        print(f"  Style used: {selected_style}")
        
        self.user_style_performance[selected_style].add_signal(understanding)
        
        mastery_changes = []
        
        for concept in concepts:
            if concept in self.ksv_rich:
                ksv = self.ksv_rich[concept]
                
                ksv.style_performance[selected_style].add_signal(understanding)
                ksv.update_style_ranking()
                
                old_mastery = ksv.mastery_score
                
                # IMPROVED: More granular mastery updates based on understanding
                if is_repeat:
                    # Repeated questions indicate confusion - small penalty
                    ksv.mastery_score = max(0.1, old_mastery - self.poor_penalty)
                    ksv.entropy_score = min(1.0, ksv.entropy_score + 0.15)
                    ksv.repetition_count += 1
                else:
                    # Progressive rewards based on understanding level
                    if understanding >= 0.7:
                        # Excellent understanding
                        ksv.mastery_score = min(1.0, old_mastery + self.good_boost)
                        ksv.entropy_score = max(0.0, ksv.entropy_score - 0.1)
                    elif understanding >= 0.55:
                        # Good understanding
                        ksv.mastery_score = min(1.0, old_mastery + self.medium_boost)
                        ksv.entropy_score = max(0.0, ksv.entropy_score - 0.05)
                    elif understanding >= 0.4:
                        # Moderate understanding - ALWAYS INCREASE (no penalty)
                        ksv.mastery_score = min(1.0, old_mastery + self.small_boost)
                        ksv.entropy_score = max(0.0, ksv.entropy_score - 0.02)
                    elif understanding >= 0.25:
                        # Slight understanding - small increase (engagement is positive)
                        ksv.mastery_score = min(1.0, old_mastery + (self.small_boost * 0.5))
                    else:
                        # Poor understanding - NO PENALTY, just no increase
                        # Asking questions is still learning, don't punish
                        ksv.mastery_score = old_mastery
                        ksv.entropy_score = min(1.0, ksv.entropy_score + 0.05)

                ksv.total_interactions += 1
                ksv.interaction_count += 1
                ksv.confidence_score = understanding
                ksv.last_updated = datetime.now()
                ksv.entropy = ksv.entropy_score
                
                self.ksv[concept] = ksv.mastery_score
                
                change = ksv.mastery_score - old_mastery
                mastery_changes.append({
                    'concept': concept[:50],
                    'old': old_mastery,
                    'new': ksv.mastery_score,
                    'change': change
                })
                
                print(f"  {concept[:40]}:")
                print(f"    Mastery: {old_mastery:.2f} → {ksv.mastery_score:.2f} (Δ{change:+.2f})")
                print(f"    Style Ranking (worst→best): {' → '.join(ksv.style_ranking)}")
                print(f"    Style Performance: {[(s, f'{ksv.style_performance[s].avg_understanding:.2f}') for s in ksv.style_ranking if ksv.style_performance[s].attempts > 0]}")
        
        # Print USER-LEVEL style comparison BEFORE generating summary
        print(f"\n{'='*80}")
        print(f"🎯 USER-LEVEL STYLE PERFORMANCE COMPARISON")
        print(f"{'='*80}")
        
        for style_name, style_perf in sorted(
            self.user_style_performance.items(), 
            key=lambda x: x[1].avg_understanding if x[1].attempts > 0 else 0,
            reverse=True
        ):
            if style_perf.attempts > 0:
                marker = "✅ BEST" if style_name == self.get_user_best_style() else "  "
                print(f"{marker} {style_name:15s}: {style_perf.avg_understanding:.2%} understanding ({style_perf.attempts} attempts)")
            else:
                print(f"   {style_name:15s}: Not yet used")
        
        print(f"\n📊 Current Question Analysis:")
        print(f"  - Style used this time: {selected_style}")
        print(f"  - Understanding detected: {understanding:.2%}")
        print(f"  - Is adaptive mode: {'Yes' if is_adaptive else 'No (user-requested style)'}")
        if is_adaptive:
            print(f"  - Why this style? It's your best performing style overall")
        print(f"{'='*80}\n")
        
        # Generate natural language summary
        natural_summary = self._generate_natural_summary(
            question, concepts, selected_style, understanding, 
            is_adaptive, is_repeat, mastery_changes
        )
        
        self.question_history.append((question, datetime.now(), concepts))
        
        self.current_context = {
            'last_question': question,
            'last_concepts': concepts,
            'last_style': selected_style,
            'awaiting_feedback': True
        }
        
        self.intervention_history.append({
            'question': question,
            'concepts': concepts,
            'style': selected_style,
            'understanding': understanding,
            'timestamp': datetime.now().isoformat()
        })
        
        # Print comprehensive summary to backend console
        print("\n" + "="*80)
        print("📝 BACKEND SUMMARY (Natural Language)")
        print("="*80)
        print(natural_summary)
        print("\n" + "-"*80)
        print("📈 MASTERY CHANGES THIS INTERACTION:")
        for change_info in mastery_changes:
            direction = "⬆️" if change_info['change'] > 0 else ("⬇️" if change_info['change'] < 0 else "➡️")
            print(f"{direction} {change_info['concept']}: {change_info['old']:.2f} → {change_info['new']:.2f} ({change_info['change']:+.3f})")
        print("="*80 + "\n")
        
        return {
            'explanation': explanation,
            'concepts': concepts,
            'style': selected_style,
            'misconception_detected': has_misc,
            'misconception_correction': correction,
            'misconception_confidence': misc_conf,
            'is_repeat': is_repeat,
            'is_adaptive': is_adaptive,
            'backend_summary': natural_summary,
            'overall_summary': natural_summary
        }
    
    def evaluate_explain_back(self, student_explanation: str) -> Dict:
        """Evaluate student explanation"""
        if not self.current_context['awaiting_feedback']:
            return {'error': 'No active explanation'}
        
        concepts = self.current_context['last_concepts']
        style_used = self.current_context['last_style']
        
        student_emb = self.embedding_model.encode([student_explanation], convert_to_tensor=True)
        concept_embs = self.embedding_model.encode(concepts, convert_to_tensor=True)
        
        similarities = compute_similarity(student_emb, concept_embs)
        performance = float(similarities.mean())
        
        print(f"\n=== Explain-Back Evaluation ===")
        print(f"Performance: {performance:.2f}")
        
        self.user_style_performance[style_used].add_signal(performance)
        
        mastery_changes = []
        
        for concept in concepts:
            if concept in self.ksv_rich:
                ksv = self.ksv_rich[concept]
                
                ksv.style_performance[style_used].add_signal(performance)
                ksv.update_style_ranking()
                
                old_mastery = ksv.mastery_score
                
                if performance >= 0.7:
                    ksv.mastery_score = min(1.0, old_mastery + 0.20)
                    ksv.confidence_score = performance
                    ksv.entropy_score = max(0.0, ksv.entropy_score - 0.15)
                    ksv.repetition_count = 0
                elif performance >= 0.5:
                    ksv.mastery_score = min(1.0, old_mastery + 0.10)
                    ksv.confidence_score = performance
                elif performance >= 0.35:
                    ksv.mastery_score = min(1.0, old_mastery + 0.05)
                else:
                    ksv.mastery_score = max(0.1, old_mastery - 0.08)
                    ksv.entropy_score = min(1.0, ksv.entropy_score + 0.10)
                
                ksv.last_updated = datetime.now()
                ksv.entropy = ksv.entropy_score
                self.ksv[concept] = ksv.mastery_score
                
                change = ksv.mastery_score - old_mastery
                mastery_changes.append({
                    'concept': concept[:50],
                    'old': old_mastery,
                    'new': ksv.mastery_score,
                    'change': change
                })
                
                print(f"  {concept[:40]}:")
                print(f"    Mastery: {old_mastery:.2f} → {ksv.mastery_score:.2f} (Δ{change:+.2f})")
                print(f"    Style Ranking (worst→best): {' → '.join(ksv.style_ranking)}")
        
        self.current_context['awaiting_feedback'] = False
        
        # Generate natural feedback
        if performance >= 0.75:
            feedback = f"Excellent! You demonstrated strong understanding with {performance:.1%} accuracy. The '{style_used}' style clearly worked well for you on this topic."
        elif performance >= 0.55:
            feedback = f"Good work! You grasped the main ideas with {performance:.1%} accuracy. Your understanding using the '{style_used}' style is solid."
        elif performance >= 0.35:
            feedback = f"You're on the right track with {performance:.1%} accuracy. Let's review the key points using the '{style_used}' style to strengthen your understanding."
        else:
            feedback = f"Let's work through this together again. Your explanation showed {performance:.1%} accuracy, which suggests we should try a different teaching approach."
        
        # Add mastery change context
        avg_change = np.mean([m['change'] for m in mastery_changes]) if mastery_changes else 0
        if avg_change > 0:
            feedback += f" Your mastery improved by an average of {avg_change:.1%} across these concepts!"
        
        return {
            'similarity_score': performance,
            'feedback': feedback,
            'updated_concepts': concepts
        }
    
    def get_user_style_performance(self) -> Dict:
        """Get USER's overall style performance statistics"""
        ranked = sorted(
            self.user_style_performance.items(),
            key=lambda x: x[1].avg_understanding if x[1].attempts > 0 else 0,
            reverse=True
        )
        
        style_scores = {}
        ranked_styles = []
        
        for style, perf in ranked:
            if perf.attempts > 0:
                style_scores[style] = perf.avg_understanding
                ranked_styles.append({
                    'style': style,
                    'avg_understanding': perf.avg_understanding,
                    'attempts': perf.attempts,
                    'rank': perf.effectiveness_rank
                })
        
        best_style = ranked[0][0] if ranked[0][1].attempts > 0 else 'story'
        
        total_interactions = sum(perf.attempts for perf in self.user_style_performance.values())
        
        return {
            'best_style': best_style,
            'style_scores': style_scores,
            'ranked_styles': ranked_styles,
            'total_interactions': total_interactions,
            'style_performance': style_scores
        }
    
    def get_concept_summary(self, concept: str) -> Dict:
        """Get concept summary"""
        if concept not in self.ksv_rich:
            return {}
        
        ksv = self.ksv_rich[concept]
        
        return {
            'concept': concept[:60],
            'mastery': ksv.mastery_score,
            'best_style': ksv.best_style,
            'worst_style': ksv.worst_style,
            'interactions': ksv.total_interactions,
            'style_ranking': ksv.style_ranking
        }
    
    def get_all_summaries(self) -> List[Dict]:
        """Get all summaries"""
        return [self.get_concept_summary(c) for c in self.ksv_rich]
    
    def get_ksv_stats(self) -> Dict:
        """Get KSV statistics"""
        if not self.ksv_rich:
            return {
                'mean_mastery': 0.0,
                'std_mastery': 0.0,
                'mean_entropy': 0.0,
                'weak_count': 0,
                'strong_count': 0
            }
        
        scores = [ksv.mastery_score for ksv in self.ksv_rich.values()]
        entropies = [ksv.entropy_score for ksv in self.ksv_rich.values()]
        
        return {
            'mean_mastery': np.mean(scores),
            'std_mastery': np.std(scores),
            'mean_entropy': np.mean(entropies),
            'weak_count': len([s for s in scores if s < 0.5]),
            'strong_count': len([s for s in scores if s >= 0.7])
        }