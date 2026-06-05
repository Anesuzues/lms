-- Remove duplicate quiz questions (keep one copy of each, delete duplicates)
-- This uses ctid to keep the first inserted row for each duplicate

DELETE FROM quiz_questions
WHERE ctid NOT IN (
  SELECT MIN(ctid)
  FROM quiz_questions
  GROUP BY course_id, module_id, question
);
