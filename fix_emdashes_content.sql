-- ─────────────────────────────────────────────────────────────────────────────
-- Strip em-dashes (—, U+2014) and en-dashes (–, U+2013) from all user-facing
-- DB content, replacing each with a plain hyphen (-).
-- Run in the Supabase SQL Editor for the LMS project (amarfzhlbhzchmeqkbyg).
-- Safe to re-run: only touches rows that still contain a fancy dash.
--
-- Uses translate(str, chr(8212)||chr(8211), '--') so the file's encoding can
-- never mangle the target characters:  chr(8212) = —   chr(8211) = –
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Before: how many rows still contain a fancy dash ─────────────────────
SELECT 'courses.title'        AS field, COUNT(*) FROM courses        WHERE title       ~ '[—–]'
UNION ALL SELECT 'courses.description',  COUNT(*) FROM courses        WHERE description ~ '[—–]'
UNION ALL SELECT 'modules.title',        COUNT(*) FROM modules        WHERE title       ~ '[—–]'
UNION ALL SELECT 'lessons.title',        COUNT(*) FROM lessons        WHERE title       ~ '[—–]'
UNION ALL SELECT 'lessons.description',  COUNT(*) FROM lessons        WHERE description ~ '[—–]'
UNION ALL SELECT 'lessons.content',      COUNT(*) FROM lessons        WHERE content     ~ '[—–]'
UNION ALL SELECT 'quiz_questions.question', COUNT(*) FROM quiz_questions WHERE question ~ '[—–]'
UNION ALL SELECT 'quiz_questions.options',  COUNT(*) FROM quiz_questions WHERE options::text ~ '[—–]';

-- ─── 2. Courses ──────────────────────────────────────────────────────────────
UPDATE courses SET title = translate(title, chr(8212)||chr(8211), '--')
  WHERE title ~ '[—–]';
UPDATE courses SET description = translate(description, chr(8212)||chr(8211), '--')
  WHERE description ~ '[—–]';

-- ─── 3. Modules ──────────────────────────────────────────────────────────────
UPDATE modules SET title = translate(title, chr(8212)||chr(8211), '--')
  WHERE title ~ '[—–]';

-- ─── 4. Lessons ──────────────────────────────────────────────────────────────
UPDATE lessons SET title = translate(title, chr(8212)||chr(8211), '--')
  WHERE title ~ '[—–]';
UPDATE lessons SET description = translate(description, chr(8212)||chr(8211), '--')
  WHERE description ~ '[—–]';
UPDATE lessons SET content = translate(content, chr(8212)||chr(8211), '--')
  WHERE content ~ '[—–]';

-- ─── 5. Quiz questions (question text + JSONB options) ───────────────────────
UPDATE quiz_questions SET question = translate(question, chr(8212)||chr(8211), '--')
  WHERE question ~ '[—–]';
UPDATE quiz_questions
  SET options = translate(options::text, chr(8212)||chr(8211), '--')::jsonb
  WHERE options::text ~ '[—–]';

-- ─── 6. After: every count below should now be 0 ─────────────────────────────
SELECT 'courses.title'        AS field, COUNT(*) FROM courses        WHERE title       ~ '[—–]'
UNION ALL SELECT 'courses.description',  COUNT(*) FROM courses        WHERE description ~ '[—–]'
UNION ALL SELECT 'modules.title',        COUNT(*) FROM modules        WHERE title       ~ '[—–]'
UNION ALL SELECT 'lessons.title',        COUNT(*) FROM lessons        WHERE title       ~ '[—–]'
UNION ALL SELECT 'lessons.description',  COUNT(*) FROM lessons        WHERE description ~ '[—–]'
UNION ALL SELECT 'lessons.content',      COUNT(*) FROM lessons        WHERE content     ~ '[—–]'
UNION ALL SELECT 'quiz_questions.question', COUNT(*) FROM quiz_questions WHERE question ~ '[—–]'
UNION ALL SELECT 'quiz_questions.options',  COUNT(*) FROM quiz_questions WHERE options::text ~ '[—–]';
