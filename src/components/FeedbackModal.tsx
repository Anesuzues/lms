import React, { useState } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface FeedbackModalProps {
  onClose: () => void;
}

const CATEGORIES = ['Bug Report', 'Feature Request', 'General Feedback'] as const;

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<string>('General Feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);

    const payload = { category, message: message.trim() };

    // Try with user_id first; if that fails (FK / RLS) retry anonymously
    let { error } = await supabase.from('feedback').insert({ ...payload, user_id: user?.id ?? null });
    if (error && user?.id) {
      const retry = await supabase.from('feedback').insert({ ...payload, user_id: null });
      error = retry.error;
    }

    setSubmitting(false);
    if (error) {
      toast({ title: 'Could not send feedback', description: 'Please try again or email us at learning@nobztech.co.za', variant: 'destructive' });
      return;
    }
    toast({ title: 'Feedback received!', description: "Thank you, we'll review your message shortly." });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare size={16} className="text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Help & Feedback</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    category === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe the issue, feature request, or feedback..."
              rows={4}
              required
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                : <><Send size={14} /> Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
