import { supabase } from '@/lib/supabase';
import { DBCourse } from './courseService';

export interface StudentOverview {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
  status: 'completed' | 'in_progress' | 'not_started';
}

export interface AdminStats {
  totalStudents: number;
  enrolled: number;
  completed: number;
  inProgress: number;
}

export async function fetchAllStudents(): Promise<StudentOverview[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      user_id,
      enrolled_at,
      progress,
      completed_at,
      profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .order('enrolled_at', { ascending: false });

  if (error) { console.error('fetchAllStudents error:', error); return []; }

  type EnrollmentRow = {
    user_id: string;
    enrolled_at: string;
    progress: number | null;
    completed_at: string | null;
    profiles: {
      id: string;
      full_name: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  };

  return (data ?? []).map((row: EnrollmentRow) => {
    const profile = row.profiles;
    const name = profile?.full_name || profile?.email?.split('@')[0] || 'Unknown';
    return {
      id: profile?.id ?? row.user_id,
      name,
      email: profile?.email ?? '',
      avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
      enrolled_at: row.enrolled_at,
      progress: row.progress ?? 0,
      completed_at: row.completed_at,
      status: row.completed_at ? 'completed' : (row.progress ?? 0) > 0 ? 'in_progress' : 'not_started',
    } as StudentOverview;
  });
}

// ─── Course Management ────────────────────────────────────────────────────────

export interface CourseFormData {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  price: number;
  duration: string;
  thumbnail_url: string;
}

export async function adminFetchCourses(): Promise<DBCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('adminFetchCourses error:', error); return []; }
  return data ?? [];
}

export async function adminCreateCourse(form: CourseFormData, instructorId: string): Promise<{ data?: DBCourse; error?: string }> {
  const { data, error } = await supabase
    .from('courses')
    .insert({ ...form, instructor_id: instructorId })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

export async function adminUpdateCourse(id: string, form: Partial<CourseFormData>): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('courses')
    .update(form)
    .eq('id', id);
  if (error) return { error: error.message };
  return {};
}

export async function adminDeleteCourse(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  if (error) return { error: error.message };
  return {};
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('progress, completed_at');

  const enrolled = enrollments?.length ?? 0;
  const completed = enrollments?.filter(e => e.completed_at).length ?? 0;
  const inProgress = enrollments?.filter(e => !e.completed_at && e.progress > 0).length ?? 0;

  return {
    totalStudents: totalStudents ?? 0,
    enrolled,
    completed,
    inProgress,
  };
}
