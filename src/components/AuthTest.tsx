import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthTest = () => {
  const { user, isAuthenticated, loading, signIn, signUp, signOut } = useAuth();
  const [testLoading, setTestLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const handleDirectMockLogin = () => {
    console.log('🟡 Direct Mock Auth');
    const mockUser = {
      id: `mock-${Date.now()}`,
      email: 'test@example.com',
      name: 'Test User',
      role: 'student' as const,
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff',
      enrolledCourses: []
    };
    
    // Store in localStorage to trigger auth context update
    localStorage.setItem('nexalearn_user', JSON.stringify(mockUser));
    setLastAction('Direct mock auth successful! Refresh page to see effect.');
    
    // Refresh the page to trigger auth context reload
    window.location.reload();
  };

  const handleTestSignUp = async () => {
    try {
      console.log('🔵 Test Sign Up button clicked');
      setTestLoading(true);
      setLastAction('Signing up...');
      
      const result = await signUp('test@example.com', 'password123', 'Test User', 'student');
      console.log('🔵 Sign up result:', result);
      
      if (result.error) {
        setLastAction(`Sign up failed: ${result.error}`);
      } else {
        setLastAction('Sign up successful!');
      }
    } catch (error) {
      console.error('🔴 Sign up error:', error);
      setLastAction(`Sign up error: ${error}`);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    try {
      console.log('🟢 Test Sign In button clicked');
      setTestLoading(true);
      setLastAction('Signing in...');
      
      const result = await signIn('test@example.com', 'password123');
      console.log('🟢 Sign in result:', result);
      
      if (result.error) {
        setLastAction(`Sign in failed: ${result.error}`);
      } else {
        setLastAction('Sign in successful!');
      }
    } catch (error) {
      console.error('🔴 Sign in error:', error);
      setLastAction(`Sign in error: ${error}`);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestSignOut = async () => {
    try {
      console.log('🔴 Test Sign Out button clicked');
      setTestLoading(true);
      setLastAction('Signing out...');
      
      await signOut();
      console.log('🔴 Signed out successfully');
      setLastAction('Signed out successfully!');
    } catch (error) {
      console.error('🔴 Sign out error:', error);
      setLastAction(`Sign out error: ${error}`);
    } finally {
      setTestLoading(false);
    }
  };

  console.log('🔍 AuthTest render - Auth state:', { user: !!user, isAuthenticated, loading });

  if (loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Loading auth state...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg max-w-md">
      <h3 className="font-bold text-lg mb-4">Auth Test Component</h3>
      
      <div className="mb-4">
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</p>
        <p><strong>Test Loading:</strong> {testLoading ? '⏳ Yes' : '✅ No'}</p>
      </div>

      {lastAction && (
        <div className="mb-4 p-2 bg-blue-100 border border-blue-400 rounded text-sm">
          <strong>Last Action:</strong> {lastAction}
        </div>
      )}

      {user ? (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Enrolled Courses:</strong> {user.enrolledCourses.length}</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
          <p>No user logged in</p>
        </div>
      )}

      <div className="space-y-2">
        <button 
          onClick={handleTestSignUp}
          disabled={testLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testLoading ? 'Testing...' : 'Test Sign Up'}
        </button>
        <button 
          onClick={handleTestSignIn}
          disabled={testLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testLoading ? 'Testing...' : 'Test Sign In'}
        </button>
        <button 
          onClick={handleDirectMockLogin}
          disabled={testLoading}
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Direct Mock Login
        </button>
        <button 
          onClick={handleTestSignOut}
          disabled={testLoading}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testLoading ? 'Testing...' : 'Test Sign Out'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  );
};

export default AuthTest;