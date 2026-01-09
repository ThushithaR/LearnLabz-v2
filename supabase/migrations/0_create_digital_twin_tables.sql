-- Digital Twin Learning Profile Tables
-- This schema tracks user behavior metrics per unit per course

-- User Learning Profile - aggregated metrics per unit
CREATE TABLE IF NOT EXISTS user_learning_profile (
  ulp_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  unit_id BIGINT NOT NULL REFERENCES units(unit_id) ON DELETE CASCADE,
  
  -- Quiz performance metrics
  quiz_score_latest INTEGER,
  quiz_best_score INTEGER,
  quiz_attempt_count INTEGER DEFAULT 0,
  
  -- Time behavior
  total_time_spent_sec INTEGER DEFAULT 0,
  expected_time_sec INTEGER, -- instructor-defined expected time
  
  -- Digital Twin JSONB (behavioral patterns)
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "quiz_patterns": {
  --     "accuracy_trend": [0.6, 0.65, 0.72],      // last 5 scores
  --     "difficulty": {
  --       "easy": 0.9,
  --       "medium": 0.7,
  --       "hard": 0.4
  --     },
  --     "topic_accuracy": {
  --       "topic1": 0.8,
  --       "topic2": 0.5
  --     }
  --   },
  --   "time_behavior": {
  --     "avg_time_ratio": 1.6,
  --     "flag": "over_struggling"   // "rushing", "ideal", "over_struggling"
  --   },
  --   "mistake_consistency": {
  --     "concept1": 3,
  --     "concept2": 1,
  --     "repeated_mistakes": ["concept1"]
  --   },
  --   "attempt_behavior": {
  --     "first_attempt_accuracy": 0.55,
  --     "avg_retries": 2.3,
  --     "avg_time_per_attempt_sec": 45
  --   }
  -- }
  
  -- Recommendation tracking
  last_recommendation TEXT,
  recommendation_generated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, course_id, unit_id)
);

-- Quiz attempt details with concept tracking
-- Extends quiz_attempts with mistake tracking
CREATE TABLE IF NOT EXISTS quiz_attempt_details (
  qad_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  qa_id BIGINT NOT NULL REFERENCES quiz_attempts(qa_id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  
  -- Question-level metrics
  question_concept TEXT, -- e.g., "Backpropagation", "Gradient Descent"
  selected_option INTEGER,
  is_correct BOOLEAN NOT NULL,
  time_taken_sec INTEGER,
  
  created_at TIMESTAMP DEFAULT now()
);

-- Numerical attempt tracking with concept mapping
-- Extends numerical_attempts with detailed tracking
CREATE TABLE IF NOT EXISTS numerical_attempt_details (
  nad_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  na_id BIGINT NOT NULL REFERENCES numerical_attempts(na_id) ON DELETE CASCADE,
  
  -- Attempt details
  concept TEXT, -- e.g., "DFS", "BFS", "Graph Theory"
  difficulty_level TEXT, -- "easy", "medium", "hard"
  
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ulp_user_course ON user_learning_profile(user_id, course_id);
CREATE INDEX idx_ulp_user_unit ON user_learning_profile(user_id, unit_id);
CREATE INDEX idx_qad_qa_id ON quiz_attempt_details(qa_id);
CREATE INDEX idx_nad_na_id ON numerical_attempt_details(na_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_learning_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ulp_timestamp
BEFORE UPDATE ON user_learning_profile
FOR EACH ROW
EXECUTE FUNCTION update_user_learning_profile_timestamp();
