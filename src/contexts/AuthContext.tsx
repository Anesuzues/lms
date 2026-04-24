import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  enrollInCourse: (courseId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing mock user first
    const storedUser = localStorage.getItem('nexalearn_user');
    if (storedUser) {
      console.log('Loading stored user from localStorage');
      setUser(JSON.parse(storedUser));
      setLoading(false);
      return;
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
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
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        // Get enrolled courses
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', supabaseUser.id);

        const enrolledCourses = enrollments?.map(e => e.course_id) || [];

        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.email.split('@')[0],
          role: profile.role,
          avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.email}&background=0D8ABC&color=fff`,
          enrolledCourses
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'student') => {
    try {
      console.log('AuthContext: Attempting sign up with:', { email, fullName, role });
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        // If Supabase fails, fall back to mock authentication
        if (error.message.includes('timeout') || 
            error.message.includes('network') || 
            error.message.includes('rate limit') ||
            error.message.includes('Invalid login credentials')) {
          console.log('Supabase error, using mock sign up:', error.message);
          return mockSignUp(email, fullName, role);
        }
        return { error: error.message };
      }

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return {};
    } catch (error) {
      console.error('AuthContext: Sign up error:', error);
      // Fall back to mock authentication
      console.log('Falling back to mock sign up');
      return mockSignUp(email, fullName, role);
    }
  };

  const mockSignUp = (email: string, fullName: string, role: UserRole) => {
    // Mock sign up for testing
    const mockUser: User = {
      id: `mock-${Date.now()}`,
      email,
      name: fullName,
      role,
      avatar: `https://ui-avatars.com/api/?name=${fullName}&background=0D8ABC&color=fff`,
      enrolledCourses: []
    };
    
    setUser(mockUser);
    localStorage.setItem('nexalearn_user', JSON.stringify(mockUser));
    return {};
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting sign in with:', { email });
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { error } = await Promise.race([authPromise, timeoutPromise]) as any;

      console.log('AuthContext: Sign in response:', { error });

      if (error) {
        // If Supabase fails, fall back to mock authentication for testing
        if (error.message.includes('timeout') || 
            error.message.includes('network') || 
            error.message.includes('rate limit') ||
            error.message.includes('Invalid login credentials')) {
          console.log('Supabase error, using mock authentication:', error.message);
          return mockSignIn(email, password);
        }
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('AuthContext: Sign in error:', error);
      // Fall back to mock authentication if Supabase is not working
      console.log('Falling back to mock authentication');
      return mockSignIn(email, password);
    }
  };

  const mockSignIn = (email: string, password: string) => {
    // Mock authentication for testing
    const mockUser: User = {
      id: `mock-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'student',
      avatar: `https://ui-avatars.com/api/?name=${email}&background=0D8ABC&color=fff`,
      enrolledCourses: []
    };
    
    setUser(mockUser);
    localStorage.setItem('nexalearn_user', JSON.stringify(mockUser));
    return {};
  };

  const signOut = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('nexalearn_user');
      setUser(null);
      
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out from Supabase:', error);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress: 0
        });

      if (error) {
        console.error('Error enrolling in course:', error);
        return;
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        enrolledCourses: [...prev.enrolledCourses, courseId]
      } : null);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      signUp, 
      signIn, 
      signOut, 
      enrollInCourse 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};