-- Drop existing tables if they exist (to avoid type conflicts)
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    duration TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table for course content
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'direct', 'embed')) DEFAULT 'youtube',
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (true);

CREATE POLICY "Instructors can create courses" ON public.courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('instructor', 'admin')
        )
    );

CREATE POLICY "Instructors can update their own courses" ON public.courses
    FOR UPDATE USING (
        instructor_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.enrollments
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons policies
CREATE POLICY "Anyone can view free lessons" ON public.lessons
    FOR SELECT USING (is_free = true);

CREATE POLICY "Enrolled users can view course lessons" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE user_id = auth.uid() AND course_id = lessons.course_id
        )
    );

CREATE POLICY "Instructors can manage their course lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE id = lessons.course_id AND instructor_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER courses_handle_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data (no instructor_id for now since we don't have users yet)
INSERT INTO public.courses (id, title, description, category, level, price, duration) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Introduction to React', 'Learn the basics of React development', 'Web Development', 'beginner', 49.99, '4 hours'),
('550e8400-e29b-41d4-a716-446655440002', 'Advanced JavaScript', 'Master advanced JavaScript concepts', 'Programming', 'advanced', 79.99, '8 hours'),
('550e8400-e29b-41d4-a716-446655440003', 'UI/UX Design Fundamentals', 'Learn the principles of good design', 'Design', 'beginner', 39.99, '6 hours'),
('550e8400-e29b-41d4-a716-446655440004', 'Node.js Backend Development', 'Build scalable backend applications', 'Backend', 'intermediate', 69.99, '10 hours'),
('550e8400-e29b-41d4-a716-446655440005', 'Python for Data Science', 'Analyze data with Python', 'Data Science', 'intermediate', 89.99, '12 hours');

-- Insert sample lessons with videos
INSERT INTO public.lessons (course_id, title, description, video_url, video_type, duration_minutes, order_index, is_free) VALUES
-- React Course Lessons
('550e8400-e29b-41d4-a716-446655440001', 'What is React?', 'Introduction to React and its core concepts', 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', 15, 1, true),
('550e8400-e29b-41d4-a716-446655440001', 'Setting up React Environment', 'Learn how to set up your development environment', 'https://www.youtube.com/watch?v=SqcY0GlETPk', 'youtube', 20, 2, false),
('550e8400-e29b-41d4-a716-446655440001', 'Your First Component', 'Create your first React component', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 'youtube', 25, 3, false),

-- JavaScript Course Lessons  
('550e8400-e29b-41d4-a716-446655440002', 'Advanced Functions', 'Deep dive into JavaScript functions', 'https://www.youtube.com/watch?v=gigtS_5KOqo', 'youtube', 30, 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Promises and Async/Await', 'Master asynchronous JavaScript', 'https://www.youtube.com/watch?v=PoRJizFvM7s', 'youtube', 35, 2, false),

-- Design Course Lessons
('550e8400-e29b-41d4-a716-446655440003', 'Design Principles', 'Learn fundamental design principles', 'https://www.youtube.com/watch?v=a5KYlHNKQB8', 'youtube', 20, 1, true),
('550e8400-e29b-41d4-a716-446655440003', 'Color Theory', 'Understanding color in design', 'https://www.youtube.com/watch?v=Qj1FK8n7WgY', 'youtube', 25, 2, false);