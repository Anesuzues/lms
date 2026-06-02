import React from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SessionTimeoutModal: React.FC = () => {
  const { showTimeoutWarning, timeoutCountdown, extendSession, signOut } = useAuth();

  if (!showTimeoutWarning) return null;

  const minutes = Math.floor(timeoutCountdown / 60);
  const seconds = timeoutCountdown % 60;
  const display = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, '0')}`
    : `${seconds}s`;

  const pct = (timeoutCountdown / 120) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Clock size={28} className="text-amber-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-1">Session Expiring</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You've been inactive. You'll be logged out automatically in:
        </p>

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-4xl font-bold text-amber-500 tabular-nums mb-3">{display}</p>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => signOut()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-secondary font-semibold text-sm transition-colors"
          >
            <LogOut size={15} /> Log Out
          </button>
          <button
            type="button"
            onClick={extendSession}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-glow"
          >
            <RefreshCw size={15} /> Stay Logged In
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Session auto-resets after 30 minutes of inactivity
        </p>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
