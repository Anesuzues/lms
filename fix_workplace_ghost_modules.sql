-- ─────────────────────────────────────────────────────────────────────────────
-- Remove empty "ghost" modules from the Get Workplace Ready course.
-- The real content lives in modules wwr-m1..wwr-m4 (3 lessons each). Four extra
-- modules (module-1..module-4) were created with 0 lessons and collide on the
-- same position numbers, showing as blank sections.
--
-- This deletes ONLY modules of this course that have zero lessons, so the four
-- real modules are never at risk. Run in the Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Preview: what will be deleted (should be the 0-lesson rows only) ──────
SELECT m.id, m.title, m.position,
       (SELECT COUNT(*) FROM lessons l WHERE l.module_id = m.id)        AS lessons,
       (SELECT COUNT(*) FROM quiz_questions q WHERE q.module_id = m.id) AS quizzes
FROM modules m
WHERE m.course_id = (SELECT id::text FROM courses WHERE title ILIKE '%workplace%' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id = m.id)
ORDER BY m.position;

-- ─── 2. Delete the empty modules (scoped to this course, lessons = 0) ─────────
DELETE FROM modules m
WHERE m.course_id = (SELECT id::text FROM courses WHERE title ILIKE '%workplace%' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id = m.id);

-- ─── 3. Verify: should now show exactly the 4 real modules, each with lessons ─
SELECT m.id, m.title, m.position,
       (SELECT COUNT(*) FROM lessons l WHERE l.module_id = m.id) AS lessons
FROM modules m
WHERE m.course_id = (SELECT id::text FROM courses WHERE title ILIKE '%workplace%' LIMIT 1)
ORDER BY m.position;
