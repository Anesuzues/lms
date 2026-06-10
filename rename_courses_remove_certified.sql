-- Remove the word "Certified" and replace em-dashes with a colon in course titles.
-- Run this in the Supabase SQL editor for the LMS project (amarfzhlbhzchmeqkbyg).
--
-- Example: "Certified AI Digital Professional — Final Exam"
--       -> "AI Digital Professional: Final Exam"

-- Preview what will change (run this first to check):
SELECT id, title AS old_title,
       REPLACE(REPLACE(REPLACE(title, 'Certified ', ''), ' — ', ': '), '—', ':') AS new_title
FROM courses
WHERE title LIKE '%Certified%' OR title LIKE '%—%';

-- Apply the change:
UPDATE courses
SET title = REPLACE(REPLACE(REPLACE(title, 'Certified ', ''), ' — ', ': '), '—', ':')
WHERE title LIKE '%Certified%' OR title LIKE '%—%';
