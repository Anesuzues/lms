import { supabase } from '@/lib/supabase';

export interface QuizQuestion {
  id: string;
  course_id: string;
  module_id: string;
  question: string;
  options: string[];
  correct: number;
  position: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  score: number;
  passed: boolean;
  attempted_at: string;
}

export const PASS_MARK = 80; // percent

export async function fetchQuizQuestions(courseId: string, moduleId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('course_id', courseId)
    .eq('module_id', moduleId)
    .order('position', { ascending: true });

  if (error) { console.error('fetchQuizQuestions error:', error); return []; }
  return (data ?? []).map(q => ({ ...q, options: q.options as string[] }));
}

export async function fetchBestAttempt(userId: string, courseId: string, moduleId: string): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('module_id', moduleId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) { console.error('fetchBestAttempt error:', error); return null; }
  return data;
}

export async function fetchAllPassedModules(userId: string, courseId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('module_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('passed', true);

  if (error) { console.error('fetchAllPassedModules error:', error); return []; }
  return [...new Set((data ?? []).map(a => a.module_id))];
}

export async function submitQuizAttempt(
  userId: string,
  courseId: string,
  moduleId: string,
  answers: number[],
  questions: QuizQuestion[]
): Promise<QuizAttempt> {
  const correct = answers.filter((a, i) => a === questions[i].correct).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= PASS_MARK;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ user_id: userId, course_id: courseId, module_id: moduleId, score, passed, answers })
    .select()
    .single();

  if (error) throw error;
  return data;
}
