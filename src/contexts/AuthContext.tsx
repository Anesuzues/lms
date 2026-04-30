import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { enrollUserInCourse, fetchUserEnrollments } from '@/services/courseService';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error || !session?.user) {
        setLoading(false);
        clearTimeout(timeout);
        return;
      }
      loadUserProfile(session.user).finally(() => clearTimeout(timeout));
    }).catch(() => {
      if (mounted) setLoading(false);
      clearTimeout(timeout);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (session?.user && event === 'SIGNED_IN') {
        await loadUserProfile(session.user);
      } else if (session?.user && (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        await loadUserProfile(session.user);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Add timeout to profile fetch so it never hangs
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 4000)
      );

      const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;

      // Always set user — fall back to session metadata if profile fetch fails
      const name = profile?.full_name
        || supabaseUser.user_metadata?.full_name
        || supabaseUser.email?.split('@')[0]
        || 'User';

      const role = (profile?.role as UserRole)
        || (supabaseUser.user_metadata?.role as UserRole)
        || 'student';

      // Fetch enrollments — don't block user load if this fails
      let enrolledCourses: string[] = [];
      try {
        const enrollments = await fetchUserEnrollments(supabaseUser.id);
        enrolledCourses = enrollments.map(e => e.course_id);
      } catch {
        // non-fatal
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name,
        role,
        avatar: profile?.avatar_url
          || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
        enrolledCourses,
      });
    } catch (err) {
      console.error('loadUserProfile error:', err);
      // Still set a basic user so they aren't redirected to login
      const name = supabaseUser.user_metadata?.full_name
        || supabaseUser.email?.split('@')[0]
        || 'User';
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name,
        role: (supabaseUser.user_metadata?.role as UserRole) || 'student',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
        enrolledCourses: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'student') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });

      if (error) return { error: error.message };

      // Create profile immediately
      if (data.user) {
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, email, full_name: fullName, role }, { onConflict: 'id' });
      }

      // If email confirmation is disabled, user is already logged in.
      // If not, sign them in manually so they don't have to confirm first.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) return { error: signInError.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      // Immediately load profile so Login page useEffect fires
      if (data.user) await loadUserProfile(data.user);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign in failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    const { error } = await enrollUserInCourse(user.id, courseId);
    if (error) { console.error('Enroll error:', error); return; }

    setUser(prev => prev && !prev.enrolledCourses.includes(courseId)
      ? { ...prev, enrolledCourses: [...prev.enrolledCourses, courseId] }
      : prev
    );
  };

  const refreshEnrollments = async () => {
    if (!user) return;
    const enrollments = await fetchUserEnrollments(user.id);
    setUser(prev => prev ? { ...prev, enrolledCourses: enrollments.map(e => e.course_id) } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signUp, signIn, signOut, enrollInCourse, refreshEnrollments }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
