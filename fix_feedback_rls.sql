-- Fix feedback table: drop FK constraint so user_id is just a plain UUID
-- (prevents insert failures when profile row doesn't exist yet)
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;

-- Update RLS: allow authenticated users to insert with either their ID or null
DROP POLICY IF EXISTS "auth_users_insert_feedback" ON feedback;
DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback;

CREATE POLICY "insert_feedback" ON feedback
  FOR INSERT
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );
