import { supabase } from '@/lib/supabase';

export interface DBCourse {
  id: string;
  title: string;
  description: string;
  instructor_id: string | null;
  thumbnail_url: string | null;
  price: number;
  duration: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  created_at: string;
}

export interface DBLesson {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: 'youtube' | 'vimeo' | 'direct' | 'embed';
  duration_minutes: number;
  duration: string | null;
  order_index: number;
  position: number;
  type: string;
  is_free: boolean;
}

export interface DBEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

// ─── Courses ────────────────────────────────────────────────────────────────

export async function fetchCourses(): Promise<DBCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { console.error('fetchCourses error:', error); return []; }
  return data ?? [];
}

export async function fetchCourseById(id: string): Promise<DBCourse | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('fetchCourseById error:', error); return null; }
  return data;
}

// ─── Lessons ────────────────────────────────────────────────────────────────

export async function fetchLessonsByCourse(courseId: string): Promise<DBLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true });

  if (error) { console.error('fetchLessonsByCourse error:', error); return []; }
  return data ?? [];
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export async function fetchUserEnrollments(userId: string): Promise<DBEnrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId);

  if (error) { console.error('fetchUserEnrollments error:', error); return []; }
  return data ?? [];
}

export async function enrollUserInCourse(userId: string, courseId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('enrollments')
    .upsert({ user_id: userId, course_id: courseId, progress: 0 }, { onConflict: 'user_id,course_id' });

  if (error) { console.error('enrollUserInCourse error:', error); return { error: error.message }; }
  return {};
}

export async function updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .update({ progress, ...(progress >= 100 ? { completed_at: new Date().toISOString() } : {}) })
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) console.error('updateEnrollmentProgress error:', error);
}

// ─── Lesson Progress ─────────────────────────────────────────────────────────

export async function fetchLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id, completed, completed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) { console.error('fetchLessonProgress error:', error); return []; }
  return data ?? [];
}

export async function markLessonComplete(userId: string, courseId: string, lessonId: string, timeSpentSeconds: number = 0): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      completed: true,
      is_completed: true,
      completed_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
    }, { onConflict: 'user_id,lesson_id' });

  if (error) console.error('markLessonComplete error:', error);
}

export async function fetchTotalTimeSpent(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('time_spent_seconds')
    .eq('user_id', userId)
    .eq('completed', true);

  if (error) { console.error('fetchTotalTimeSpent error:', error); return 0; }
  return (data ?? []).reduce((sum, row) => sum + (row.time_spent_seconds ?? 0), 0);
}
