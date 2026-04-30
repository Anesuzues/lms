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

      const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as { data: Record<string, unknown> | null };

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
      // Wrap entire signup in a timeout so it never hangs forever
      const signUpPromise = async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });

        if (error) return { error: error.message };

        // Create profile (non-blocking — don't await failure)
        if (data.user) {
          supabase.from('profiles')
            .upsert({ id: data.user.id, email, full_name: fullName, role }, { onConflict: 'id' })
            .then(() => {}).catch(() => {});
        }

        // Set user immediately from signup data
        const name = fullName || email.split('@')[0];
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name,
            role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
            enrolledCourses: [],
          });
          // Load full profile in background
          loadUserProfile(data.user);
        }

        // If no session, sign in manually
        if (!data.session && data.user) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) return { error: signInError.message };
          if (signInData.user) {
            setUser({
              id: signInData.user.id,
              email: signInData.user.email!,
              name,
              role,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
              enrolledCourses: [],
            });
            loadUserProfile(signInData.user);
          }
        }

        return {};
      };

      const timeoutPromise = new Promise<{ error: string }>((_, reject) =>
        setTimeout(() => reject(new Error('Sign up timed out. Please try again.')), 10000)
      );

      return await Promise.race([signUpPromise(), timeoutPromise]);
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Sign in timed out. Please check your connection and try again.')), 8000)
      );

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);
      if (error) return { error: error.message };

      if (data.user) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User';
        const role = (data.user.user_metadata?.role as UserRole) || 'student';
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`,
          enrolledCourses: [],
        });
        loadUserProfile(data.user);
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
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
