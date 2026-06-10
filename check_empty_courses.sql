-- Find all courses with zero lessons
SELECT
  c.id,
  c.title,
  c.level,
  COUNT(l.id) AS lesson_count
FROM public.courses c
LEFT JOIN public.lessons l ON l.course_id = c.id
GROUP BY c.id, c.title, c.level
HAVING COUNT(l.id) = 0
ORDER BY c.title;
