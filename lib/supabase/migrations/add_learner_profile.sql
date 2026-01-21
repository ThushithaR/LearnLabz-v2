-- Add learner_profile column to user_courses table
ALTER TABLE user_courses 
ADD COLUMN IF NOT EXISTS learner_profile JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN user_courses.learner_profile IS 'Stores the digital twin learner profile metrics including quiz patterns, time analysis, and weak concepts.';
