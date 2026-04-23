import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'student' | 'instructor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolledCourses: string[]; // Course IDs
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  enrollInCourse: (courseId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('nexalearn_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: UserRole = 'student') => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${email}&background=0D8ABC&color=fff`,
      enrolledCourses: []
    };
    setUser(newUser);
    localStorage.setItem('nexalearn_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexalearn_user');
  };

  const enrollInCourse = (courseId: string) => {
    if (user && !user.enrolledCourses.includes(courseId)) {
      const updatedUser = {
        ...user,
        enrolledCourses: [...user.enrolledCourses, courseId]
      };
      setUser(updatedUser);
      localStorage.setItem('nexalearn_user', JSON.stringify(updatedUser));
    }
  };

  if (isLoading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, enrollInCourse }}>
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
