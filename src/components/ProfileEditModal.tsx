import React, { useState } from 'react';
import { X, Loader2, User, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

const ProfileEditModal: React.FC<Props> = ({ onClose }) => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar?.startsWith('https://ui-avatars.com') ? '' : (user?.avatar ?? '')
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    const updates: { full_name?: string; avatar_url?: string } = {};
    if (fullName.trim() !== user?.name) updates.full_name = fullName.trim();
    if (avatarUrl.trim()) updates.avatar_url = avatarUrl.trim();
    const result = await updateProfile(updates);
    setSaving(false);
    if (result.error) {
      toast({ title: 'Update failed', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated' });
      onClose();
    }
  };

  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    if (result.error) {
      toast({ title: 'Delete failed', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Account deleted', description: 'Your account and all data have been removed.' });
      onClose();
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>

        {/* ── Edit profile view ─────────────────────────────────────────────── */}
        {!showDeleteConfirm ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
              <button type="button" aria-label="Close" onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Avatar preview */}
            <div className="flex justify-center mb-6">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar preview" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/20" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                  <User size={36} className="text-primary" />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Avatar URL <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-muted-foreground">Leave blank to use auto-generated avatar</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !fullName.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Danger zone */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Danger Zone</p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive hover:text-white transition-colors"
              >
                <Trash2 size={15} /> Delete Account
              </button>
            </div>
          </div>

        ) : (

          /* ── Delete confirmation view ──────────────────────────────────── */
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Delete Account</h2>
              <button type="button" aria-label="Cancel deletion" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
              <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-destructive text-sm mb-1">This cannot be undone</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your profile, all enrolled courses, lesson progress, quiz attempts, and certificates will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 mb-5">
              <label className="text-sm font-semibold text-foreground">
                Type <span className="font-mono text-destructive">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/20 transition-all font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold hover:bg-destructive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><Loader2 size={16} className="animate-spin" /> Deleting…</>
                  : <><Trash2 size={16} /> Delete Account</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditModal;
