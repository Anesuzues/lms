import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

const IDLE_MS = 28 * 60 * 1000;   // Show warning after 28 min of inactivity
const WARNING_S = 120;              // 2-minute countdown before auto-logout
const ACTIVITY_THROTTLE_MS = 20_000; // Only reset timer once per 20 s of activity

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
  showTimeoutWarning: boolean;
  timeoutCountdown: number;
  extendSession: () => void;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
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

  // ── Session timeout ──────────────────────────────────────────────────────
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(WARNING_S);
  const idleTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivity   = useRef(Date.now());

  const clearTimers = useCallback(() => {
    if (idleTimer.current)    clearTimeout(idleTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  }, []);

  // ── When countdown hits 0 while the warning is visible → force logout ────
  useEffect(() => {
    if (timeoutCountdown === 0 && showTimeoutWarning) {
      clearTimers();
      setShowTimeoutWarning(false);
      supabase.auth.signOut().then(() => setUser(null));
    }
  }, [timeoutCountdown, showTimeoutWarning]);

  const startWarningCountdown = useCallback(() => {
    setShowTimeoutWarning(true);
    setTimeoutCountdown(WARNING_S);
    countdownTimer.current = setInterval(() => {
      // Pure state update only — side effects handled in useEffect above
      setTimeoutCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimers();
    setShowTimeoutWarning(false);
    setTimeoutCountdown(WARNING_S);
    idleTimer.current = setTimeout(() => startWarningCountdown(), IDLE_MS);
  }, [clearTimers, startWarningCountdown]);

  // ── Activity listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { clearTimers(); return; }

    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivity.current < ACTIVITY_THROTTLE_MS) return;
      lastActivity.current = now;
      if (!showTimeoutWarning) resetIdleTimer();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const extendSession = useCallback(() => {
    lastActivity.current = Date.now();
    resetIdleTimer();
  }, [resetIdleTimer]);

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
      } else if (event === 'SIGNED_IN' && session.user) {
        // Handles OAuth redirects (Google etc.) where signIn function isn't called directly
        setUser(buildUser(session.user));
        enrichUser(session.user);
      }
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

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    if (error) return { error: error.message };
    return {};
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) return { error: error.message };
    setUser(prev => prev ? {
      ...prev,
      name: updates.full_name ?? prev.name,
      avatar: updates.avatar_url ?? prev.avatar,
    } : prev);
    return {};
  };

  const deleteAccount = async () => {
    if (!user) return { error: 'Not authenticated' };
    try {
      // Delete all user data — profile row cascades to related tables
      const { error } = await supabase.from('profiles').delete().eq('id', user.id);
      if (error) return { error: error.message };
      await supabase.auth.signOut();
      setUser(null);
      return {};
    } catch (e: any) {
      return { error: e.message ?? 'Failed to delete account' };
    }
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, showTimeoutWarning, timeoutCountdown, extendSession, signIn, signUp, signInWithGoogle, signOut, resetPassword, updateProfile, deleteAccount, enrollInCourse, refreshEnrollments }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
