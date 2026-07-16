-- ─────────────────────────────────────────────────────────────────────────────
-- Remove literal backslash-n escape sequences from lesson content.
--
-- Some lesson text was saved containing the two characters  \  n  rather than an
-- actual line break. Markdown only treats a backslash as an escape before
-- punctuation, so the sequence survives and renders to the student as the
-- visible text "\n" at the end of a line.
--
-- Scope, measured against the live DB (amarfzhlbhzchmeqkbyg) on 2026-07-16:
--   112 lessons scanned -> 3 occurrences, all in "What Is Artificial Intelligence?"
--   (id f352ae89-059d-4a66-bd40-b69326b9eb7a), at the end of its ✅ takeaways.
--   No other backslash escape sequences exist in any lesson.
--
-- Each affected line already ends with a REAL newline directly after the literal
-- "\n", so deleting the escape keeps the line break intact — the takeaways still
-- render one per line.
--
-- Safe to re-run: only rows still containing the sequence are touched.
-- Run in the Supabase SQL Editor.
--
-- IMPORTANT — why chr(92) and strpos() instead of LIKE '%\n%':
--   * In Postgres, LIKE uses backslash as its DEFAULT escape character, so
--     LIKE '%\n%' actually means "contains the letter n" — it would match almost
--     every lesson and update all of them. Never use LIKE here.
--   * chr(92) is a backslash built without writing one, so neither this file's
--     encoding nor the standard_conforming_strings setting can change its meaning.
--   * strpos() and replace() take plain strings, not patterns — no escaping.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Before: which rows contain the literal escape, and how many each ─────
SELECT id,
       title,
       (length(content) - length(replace(content, chr(92) || 'n', ''))) / 2
         AS literal_escape_count
FROM lessons
WHERE strpos(content, chr(92) || 'n') > 0
ORDER BY title;
-- Expect exactly 1 row: "What Is Artificial Intelligence?" with count 3.
-- If you see many rows, STOP — do not run step 2, and re-check the query.

-- ─── 2. Fix: delete the escape, leaving the real line break in place ─────────
UPDATE lessons
SET content = replace(content, chr(92) || 'n', '')
WHERE strpos(content, chr(92) || 'n') > 0;
-- Expect: UPDATE 1

-- ─── 3. After: expect zero rows ──────────────────────────────────────────────
SELECT id, title
FROM lessons
WHERE strpos(content, chr(92) || 'n') > 0;

-- ─── 4. Spot-check the affected lesson's takeaways read cleanly ──────────────
SELECT substring(content from position('Key takeaways' in content) for 290)
         AS takeaways
FROM lessons
WHERE id = 'f352ae89-059d-4a66-bd40-b69326b9eb7a';
