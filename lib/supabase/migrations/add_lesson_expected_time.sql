-- Add lesson_expected_time column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS lesson_expected_time INTEGER DEFAULT 3600;

-- Comment on column
COMMENT ON COLUMN lessons.lesson_expected_time IS 'Expected time to complete the lesson in seconds.';
