import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  enrolledCourses: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  refreshEnrollments: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Build a user object from Supabase user + optional profile data
function buildUser(supabaseUser: SupabaseUser, profile?: Record<string, any> | null, enrolledCourses: string[] = []): User {
  const name = profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User';
  const role = (profile?.role || supabaseUser.user_metadata?.role || 'student') as UserRole;
  const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`;
  return { id: supabaseUser.id, email: supabaseUser.email!, name, role, avatar, enrolledCourses };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount: check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Set basic user immediately, then enrich in background
        setUser(buildUser(session.user));
        enrichUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      }
      // SIGNED_IN handled directly in signIn/signUp for speed
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enrich user with DB profile and enrollments (runs in background, non-blocking)
  const enrichUser = async (supabaseUser: SupabaseUser) => {
    try {
      const [profileRes, enrollmentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', supabaseUser.id).single(),
        supabase.from('enrollments').select('course_id').eq('user_id', supabaseUser.id),
      ]);
      const profile = profileRes.data;
      const enrolledCourses = (enrollmentsRes.data ?? []).map((e: any) => e.course_id);
      setUser(buildUser(supabaseUser, profile, enrolledCourses));
    } catch {
      // Non-fatal — user is already set with basic info
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      // Set user immediately — no waiting
      setUser(buildUser(data.user));
      // Enrich in background
      enrichUser(data.user);
    }
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'student') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) return { error: error.message };

    const authUser = data.user;
    if (!authUser) return { error: 'Account creation failed' };

    // Create profile (fire and forget)
    supabase.from('profiles')
      .upsert({ id: authUser.id, email, full_name: fullName, role }, { onConflict: 'id' })
      .then(() => {}).catch(() => {});

    // If no session (email confirmation on), sign in manually
    if (!data.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return { error: signInError.message };
      if (signInData.user) {
        setUser(buildUser(signInData.user, { full_name: fullName, role }));
        enrichUser(signInData.user);
      }
    } else {
      setUser(buildUser(authUser, { full_name: fullName, role }));
      enrichUser(authUser);
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;
    await supabase.from('enrollments').upsert({ user_id: user.id, course_id: courseId, progress: 0 }, { onConflict: 'user_id,course_id' });
    setUser(prev => prev && !prev.enrolledCourses.includes(courseId)
      ? { ...prev, enrolledCourses: [...prev.enrolledCourses, courseId] }
      : prev
    );
  };

  const refreshEnrollments = async () => {
    if (!user) return;
    const { data } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, enrolledCourses: (data ?? []).map((e: any) => e.course_id) } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn, signUp, signOut, enrollInCourse, refreshEnrollments }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
