-- Gamification columns: streak, XP, onboarding state
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak          INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE,
  ADD COLUMN IF NOT EXISTS xp              INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarded       BOOLEAN   NOT NULL DEFAULT false;
