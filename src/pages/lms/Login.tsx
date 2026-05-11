import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<Mode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      if (result.error) {
        toast({ title: 'Reset Failed', description: result.error, variant: 'destructive' });
      } else {
        setResetSent(true);
      }
      setSubmitting(false);
      return;
    }

    const result = mode === 'signup'
      ? await signUp(email, password, fullName, 'student')
      : await signIn(email, password);

    if (result.error) {
      toast({
        title: mode === 'signup' ? 'Sign Up Failed' : 'Sign In Failed',
        description: result.error,
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setResetSent(false);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img src="/nexalearn-logo.png" alt="NexaLearn" className="h-12 w-auto mx-auto mb-4" />
          </a>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'forgot' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === 'forgot'
              ? "Enter your email and we'll send a reset link"
              : mode === 'signup'
              ? 'Start your learning journey today'
              : 'Sign in to continue learning'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">

          {mode === 'forgot' && resetSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
              </p>
              <button
                onClick={() => switchMode('signin')}
                className="text-sm font-semibold text-primary hover:opacity-80"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -mt-1 mb-1"
                >
                  <ArrowLeft size={14} /> Back to sign in
                </button>
              )}

              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-primary hover:opacity-80 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signup' ? 'Creating account...' : mode === 'forgot' ? 'Sending...' : 'Signing in...'}</>
                  : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'
                }
              </button>
            </form>
          )}

          {mode !== 'forgot' && !resetSent && (
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-primary font-semibold hover:opacity-80"
                >
                  {mode === 'signup' ? 'Sign in' : 'Sign up for free'}
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-foreground">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
