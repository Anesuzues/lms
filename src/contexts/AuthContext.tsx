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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      const enrollments = await fetchUserEnrollments(supabaseUser.id);
      const enrolledCourses = enrollments.map(e => e.course_id);

      const name = profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User';

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name,
        role: (profile?.role as UserRole) || 'student',
        avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
        enrolledCourses,
      });
    } catch (err) {
      console.error('loadUserProfile error:', err);
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

      // Profile is auto-created by the DB trigger (handle_new_user)
      // If trigger isn't set up, create manually
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: data.user.id, email, full_name: fullName, role }, { onConflict: 'id' });

        if (profileError) console.error('Profile upsert error:', profileError);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
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
