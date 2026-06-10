-- Fix: admin panel cannot see users who signed up before the profile trigger
-- Run in the Supabase SQL editor for the LMS project (amarfzhlbhzchmeqkbyg).
-- Safe to re-run.

-- ─── 1. Backfill profiles for auth users that have no profile row ────────────
-- Preserves each user's original signup date so the admin list sorts correctly.
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    COALESCE(u.raw_user_meta_data->>'role', 'student'),
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ─── 2. Ensure admins can read ALL profiles ──────────────────────────────────
-- The schema drops "Admins can view all profiles" but never recreates it.
-- A direct self-referencing policy on profiles causes infinite recursion,
-- so use a SECURITY DEFINER helper that bypasses RLS for the role check.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- ─── 3. Verify ────────────────────────────────────────────────────────────────
-- Both counts should now match: every auth user has a profile.
SELECT
    (SELECT COUNT(*) FROM auth.users)      AS auth_users,
    (SELECT COUNT(*) FROM public.profiles) AS profiles;
