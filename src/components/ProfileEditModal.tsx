import React, { useState } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  onClose: () => void;
}

const ProfileEditModal: React.FC<Props> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar?.startsWith('https://ui-avatars.com') ? '' : (user?.avatar ?? '')
  );
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
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
            <label className="text-sm font-semibold text-foreground">Avatar URL <span className="text-muted-foreground font-normal">(optional)</span></label>
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
      </div>
    </div>
  );
};

export default ProfileEditModal;
