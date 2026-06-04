import { supabase } from '@/lib/supabase';
import { DBCourse } from './courseService';

// ─── Student Detail ───────────────────────────────────────────────────────────

export interface EnrollmentDetail {
  course_id: string;
  course_title: string;
  progress: number;
  completed_at: string | null;
  enrolled_at: string;
}

export interface QuizAttemptDetail {
  course_id: string;
  course_title: string;
  score: number;
  passed: boolean;
  attempted_at: string;
}

export interface StudentDetail {
  enrollments: EnrollmentDetail[];
  quizAttempts: QuizAttemptDetail[];
  totalTimeSeconds: number;
}

export async function fetchStudentDetail(userId: string): Promise<StudentDetail> {
  const [enrollmentsRes, quizRes, timeRes, coursesRes] = await Promise.all([
    supabase.from('enrollments').select('*').eq('user_id', userId).order('enrolled_at', { ascending: false }),
    supabase.from('quiz_attempts').select('*').eq('user_id', userId).order('attempted_at', { ascending: false }).limit(20),
    supabase.from('user_progress').select('time_spent_seconds').eq('user_id', userId).eq('completed', true),
    supabase.from('courses').select('id, title'),
  ]);

  const courseMap = new Map((coursesRes.data ?? []).map((c: any) => [c.id, c.title]));
  const totalTimeSeconds = (timeRes.data ?? []).reduce((s: number, r: any) => s + (r.time_spent_seconds ?? 0), 0);

  return {
    enrollments: (enrollmentsRes.data ?? []).map((e: any) => ({
      course_id: e.course_id,
      course_title: courseMap.get(e.course_id) ?? 'Unknown Course',
      progress: e.progress ?? 0,
      completed_at: e.completed_at,
      enrolled_at: e.enrolled_at,
    })),
    quizAttempts: (quizRes.data ?? []).map((qa: any) => ({
      course_id: qa.course_id,
      course_title: courseMap.get(qa.course_id) ?? 'Unknown Course',
      score: qa.score,
      passed: qa.passed,
      attempted_at: qa.attempted_at,
    })),
    totalTimeSeconds,
  };
}

// ─── Role Management ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'instructor' | 'admin';
  avatar_url: string | null;
  created_at: string;
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAllProfiles error:', error); return []; }
  return data ?? [];
}

export async function updateUserRole(userId: string, role: 'student' | 'admin'): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) return { error: error.message };
  return {};
}

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

  // Deduplicate by user_id — one row per student showing overall progress
  const byUser = new Map<string, EnrollmentRow[]>();
  for (const row of (data ?? []) as EnrollmentRow[]) {
    const uid = row.user_id;
    if (!byUser.has(uid)) byUser.set(uid, []);
    byUser.get(uid)!.push(row);
  }

  return Array.from(byUser.values()).map(rows => {
    const profile = rows[0].profiles;
    const name = profile?.full_name || profile?.email?.split('@')[0] || 'Unknown';
    const allProgress = rows.map(r => r.progress ?? 0);
    const avgProgress = Math.round(allProgress.reduce((s, p) => s + p, 0) / allProgress.length);
    const anyCompleted = rows.find(r => r.completed_at) ?? null;
    const earliestEnroll = rows.reduce((earliest, r) =>
      r.enrolled_at < earliest.enrolled_at ? r : earliest
    );
    return {
      id: profile?.id ?? rows[0].user_id,
      name,
      email: profile?.email ?? '',
      avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
      enrolled_at: earliestEnroll.enrolled_at,
      progress: avgProgress,
      completed_at: anyCompleted?.completed_at ?? null,
      status: anyCompleted ? 'completed' : avgProgress > 0 ? 'in_progress' : 'not_started',
    } as StudentOverview;
  }).sort((a, b) => b.enrolled_at.localeCompare(a.enrolled_at));
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

export interface CourseAnalytics {
  course_id: string;
  title: string;
  total_enrollments: number;
  completed: number;
  completion_rate: number;
  avg_progress: number;
}

export async function fetchCourseAnalytics(): Promise<CourseAnalytics[]> {
  const [enrollmentsRes, coursesRes] = await Promise.all([
    supabase.from('enrollments').select('course_id, progress, completed_at'),
    supabase.from('courses').select('id, title').order('created_at', { ascending: true }),
  ]);

  const enrollments = enrollmentsRes.data ?? [];
  const courses = coursesRes.data ?? [];

  return courses
    .map(course => {
      const ce = enrollments.filter(e => e.course_id === course.id);
      const completed = ce.filter(e => e.completed_at).length;
      const avgProgress = ce.length > 0
        ? Math.round(ce.reduce((s, e) => s + (e.progress ?? 0), 0) / ce.length)
        : 0;
      return {
        course_id: course.id,
        title: course.title,
        total_enrollments: ce.length,
        completed,
        completion_rate: ce.length > 0 ? Math.round((completed / ce.length) * 100) : 0,
        avg_progress: avgProgress,
      };
    })
    .filter(c => c.total_enrollments > 0)
    .sort((a, b) => b.total_enrollments - a.total_enrollments);
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const [profilesRes, enrollmentsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('enrollments').select('user_id, progress, completed_at'),
  ]);

  const totalStudents = profilesRes.count ?? 0;
  const enrollments = enrollmentsRes.data ?? [];

  // Count by distinct user, not by enrollment rows
  const enrolledUsers  = new Set(enrollments.map(e => e.user_id)).size;
  const completedUsers = new Set(enrollments.filter(e => e.completed_at).map(e => e.user_id)).size;
  const inProgressUsers = new Set(
    enrollments.filter(e => !e.completed_at && (e.progress ?? 0) > 0).map(e => e.user_id)
  ).size;

  return {
    totalStudents,
    enrolled: enrolledUsers,
    completed: completedUsers,
    inProgress: inProgressUsers,
  };
}
