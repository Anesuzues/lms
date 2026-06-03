-- Mark all users who signed up before the onboarding feature as already onboarded
-- so the welcome modal never fires for existing accounts.
-- Run this once after deploying the gamification migration.
UPDATE public.profiles
SET onboarded = true
WHERE created_at < '2026-06-05 00:00:00+00';
