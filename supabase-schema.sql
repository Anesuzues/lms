-- ─── NexaLearn Complete Schema ───────────────────────────────────────────────
-- Run this in Supabase SQL Editor (safe to re-run, uses IF NOT EXISTS)
-- Does NOT drop any existing tables or data

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email       TEXT NOT NULL,
    full_name   TEXT,
    role        TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    avatar_url  TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title          TEXT NOT NULL,
    description    TEXT,
    instructor_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    thumbnail_url  TEXT,
    price          DECIMAL(10,2) DEFAULT 0,
    duration       TEXT,
    level          TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    category       TEXT NOT NULL DEFAULT 'General',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
    id         TEXT PRIMARY KEY,
    course_id  TEXT NOT NULL,
    title      TEXT NOT NULL,
    position   INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id        UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id        TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    video_url        TEXT,
    video_type       TEXT CHECK (video_type IN ('youtube', 'vimeo', 'direct', 'embed')) DEFAULT 'youtube',
    duration_minutes INTEGER DEFAULT 0,
    duration         TEXT,
    order_index      INTEGER DEFAULT 0,
    position         INTEGER NOT NULL DEFAULT 1,
    type             TEXT NOT NULL DEFAULT 'video',
    content_url      TEXT,
    is_free          BOOLEAN DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id    UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress     INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id    UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id    UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed    BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- ─── Add missing columns safely ───────────────────────────────────────────────

ALTER TABLE public.profiles    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'youtube';
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.lessons     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ─── Drop & recreate policies ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"       ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view courses"   ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

DROP POLICY IF EXISTS "Anyone can view modules"   ON public.modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;

DROP POLICY IF EXISTS "Anyone can view free lessons"        ON public.lessons;
DROP POLICY IF EXISTS "Enrolled users can view all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons"           ON public.lessons;

DROP POLICY IF EXISTS "Users can view their own enrollments"   ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments"        ON public.enrollments;

DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Admins can view all progress"        ON public.user_progress;

-- Profiles
CREATE POLICY "Users can view their own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"       ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Courses
CREATE POLICY "Anyone can view courses"   ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);

-- Modules
CREATE POLICY "Anyone can view modules"   ON public.modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);

-- Lessons
CREATE POLICY "Anyone can view free lessons"        ON public.lessons FOR SELECT USING (is_free = true);
CREATE POLICY "Enrolled users can view all lessons" ON public.lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = lessons.course_id)
);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);

-- Enrollments
CREATE POLICY "Users can view their own enrollments"   ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments"        ON public.enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User progress
CREATE POLICY "Users can manage their own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress"        ON public.user_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── Functions ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Triggers ─────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP TRIGGER IF EXISTS profiles_updated_at     ON public.profiles;
DROP TRIGGER IF EXISTS courses_updated_at      ON public.courses;
DROP TRIGGER IF EXISTS lessons_updated_at      ON public.lessons;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
