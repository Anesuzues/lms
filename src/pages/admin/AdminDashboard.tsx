import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, Trophy, BookOpen, Search, Loader2, LogOut, TrendingUp,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Menu,
  BarChart2, Download, Eye, ShieldCheck, ShieldOff, UserCog,
  MessageSquare, CheckCircle2, Circle, Bug, Lightbulb,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchCombinedStudents, fetchAdminStats, adminFetchCourses,
  adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  fetchCourseAnalytics, fetchAllProfiles, updateUserRole,
  fetchAllFeedback, updateFeedbackStatus,
  StudentOverview, AdminStats, CourseFormData, CourseAnalytics, UserProfile, FeedbackItem,
  PlacementStatus,
} from '@/services/adminService';
import { DBCourse } from '@/services/courseService';
import { exportStudentsCSV } from '@/lib/generateReport';
import StudentDetailModal from '@/components/admin/StudentDetailModal';

const placementConfig: Record<NonNullable<PlacementStatus>, { label: string; color: string }> = {
  placed:             { label: 'Placed',              color: 'bg-emerald-100 text-emerald-700' },
  to_be_placed:       { label: 'To Be Placed',        color: 'bg-blue-100 text-blue-700'       },
  exited:             { label: 'Exited Program',      color: 'bg-gray-100 text-gray-600'       },
  candidate_response: { label: 'Candidate Response',  color: 'bg-purple-100 text-purple-700'   },
};

const statusConfig = {
  completed:   { label: 'Completed',   color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'   },
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400'    },
};

const PAGE_SIZE = 20;
const EMPTY_FORM: CourseFormData = {
  title: '', description: '', level: 'beginner', category: 'General',
  price: 0, duration: '', thumbnail_url: '',
};

// ─── Course Modal ─────────────────────────────────────────────────────────────
interface CourseModalProps {
  initial?: DBCourse | null;
  onSave: (form: CourseFormData, id?: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}
const CourseModal: React.FC<CourseModalProps> = ({ initial, onSave, onClose, saving }) => {
  const [form, setForm] = useState<CourseFormData>(
    initial
      ? { title: initial.title, description: initial.description || '', level: initial.level, category: initial.category, price: initial.price, duration: initial.duration || '', thumbnail_url: initial.thumbnail_url || '' }
      : EMPTY_FORM
  );
  const set = (k: keyof CourseFormData, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{initial ? 'Edit Course' : 'New Course'}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form, initial?.id); }} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" placeholder="Course title" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Course description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Level *</label>
              <select required aria-label="Course level" value={form.level} onChange={e => set('level', e.target.value as CourseFormData['level'])}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Category *</label>
              <input required value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Business" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Price (R)</label>
              <input type="number" min={0} step={0.01} value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" placeholder="0 for free" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Duration</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" placeholder="e.g. 4 weeks" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" placeholder="https://..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : initial ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type Tab = 'students' | 'courses' | 'analytics' | 'users' | 'feedback';

const AdminDashboard = () => {
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('students');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Students
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started' | 'placed' | 'to_be_placed' | 'exited' | 'candidate_response'>('all');
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentOverview | null>(null);

  // Courses
  const [courses, setCourses] = useState<DBCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseModal, setCourseModal] = useState<'create' | DBCourse | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // User management
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Feedback
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [updatingFeedback, setUpdatingFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const load = async () => {
      setLoadingStudents(true);
      try {
        const s = await fetchCombinedStudents();
        setStudents(s);
        setStats({
          totalStudents: s.length,
          enrolled:      s.filter(x => x.source === 'db' || x.source === 'both').length,
          completed:     s.filter(x => x.completed_at !== null).length,
          inProgress:    s.filter(x => x.progress > 0 && !x.completed_at).length,
        });
      } catch {
        toast({ title: 'Failed to load data', description: 'Please refresh.', variant: 'destructive' });
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (tab !== 'courses' || !user || user.role !== 'admin') return;
    if (courses.length > 0) return;
    const load = async () => {
      setLoadingCourses(true);
      setCourses(await adminFetchCourses());
      setLoadingCourses(false);
    };
    load();
  }, [tab]);

  useEffect(() => {
    if (tab !== 'analytics' || !user || user.role !== 'admin') return;
    if (analytics.length > 0) return;
    const load = async () => {
      setLoadingAnalytics(true);
      setAnalytics(await fetchCourseAnalytics());
      setLoadingAnalytics(false);
    };
    load();
  }, [tab]);

  useEffect(() => {
    if (tab !== 'users' || !user || user.role !== 'admin') return;
    if (profiles.length > 0) return;
    const load = async () => {
      setLoadingProfiles(true);
      setProfiles(await fetchAllProfiles());
      setLoadingProfiles(false);
    };
    load();
  }, [tab]);

  useEffect(() => {
    if (tab !== 'feedback' || !user || user.role !== 'admin') return;
    const load = async () => {
      setLoadingFeedback(true);
      setFeedbackItems(await fetchAllFeedback());
      setLoadingFeedback(false);
    };
    load();
  }, [tab]);

  // Student filtering — sheet-only rows are counted in stats but not shown in the table
  const placementFilters = ['placed', 'to_be_placed', 'exited', 'candidate_response'] as const;
  const filtered = students.filter(s => {
    if (s.source === 'sheet') return false;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
      || s.email.toLowerCase().includes(search.toLowerCase())
      || (s.company ?? '').toLowerCase().includes(search.toLowerCase());
    const isPlacementFilter = (placementFilters as readonly string[]).includes(filter);
    const matchFilter = filter === 'all'
      || (isPlacementFilter ? s.placementStatus === filter : s.status === filter);
    return matchSearch && matchFilter;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Course handlers
  const handleSaveCourse = async (form: CourseFormData, id?: string) => {
    setSavingCourse(true);
    if (id) {
      const res = await adminUpdateCourse(id, form);
      if (res.error) toast({ title: 'Update failed', description: res.error, variant: 'destructive' });
      else { setCourses(prev => prev.map(c => c.id === id ? { ...c, ...form } : c)); toast({ title: 'Course updated' }); setCourseModal(null); }
    } else {
      const res = await adminCreateCourse(form, user!.id);
      if (res.error) toast({ title: 'Create failed', description: res.error, variant: 'destructive' });
      else if (res.data) { setCourses(prev => [res.data!, ...prev]); toast({ title: 'Course created' }); setCourseModal(null); }
    }
    setSavingCourse(false);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await adminDeleteCourse(id);
    if (res.error) toast({ title: 'Delete failed', description: res.error, variant: 'destructive' });
    else { setCourses(prev => prev.filter(c => c.id !== id)); toast({ title: 'Course deleted' }); }
    setDeletingId(null);
  };

  // Role management
  const handleRoleToggle = async (profile: UserProfile) => {
    const newRole = profile.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`${newRole === 'admin' ? 'Grant admin access' : 'Revoke admin access'} for ${profile.full_name || profile.email}?`)) return;
    setUpdatingRole(profile.id);
    const res = await updateUserRole(profile.id, newRole);
    if (res.error) toast({ title: 'Role update failed', description: res.error, variant: 'destructive' });
    else {
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: newRole } : p));
      toast({ title: `Role updated`, description: `${profile.full_name || profile.email} is now ${newRole === 'admin' ? 'an admin' : 'a student'}.` });
    }
    setUpdatingRole(null);
  };

  const filteredProfiles = profiles.filter(p =>
    (p.full_name ?? '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (p.email ?? '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleFeedbackStatus = async (item: FeedbackItem) => {
    const next = item.status === 'open' ? 'resolved' : 'open';
    setUpdatingFeedback(item.id);
    const res = await updateFeedbackStatus(item.id, next);
    if (res.error) toast({ title: 'Update failed', description: res.error, variant: 'destructive' });
    else setFeedbackItems(prev => prev.map(f => f.id === item.id ? { ...f, status: next } : f));
    setUpdatingFeedback(null);
  };

  const filteredFeedback = feedbackItems.filter(f =>
    feedbackFilter === 'all' || (f.status ?? 'open') === feedbackFilter
  );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;

  const navItems: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'students', label: 'Students',        icon: Users         },
    { key: 'courses',  label: 'Courses',          icon: BookOpen      },
    { key: 'analytics',label: 'Analytics',        icon: BarChart2     },
    { key: 'users',    label: 'User Management',  icon: UserCog       },
    { key: 'feedback', label: 'Feedback',          icon: MessageSquare },
  ];

  const tabLabel: Record<Tab, string> = {
    students: 'Student Overview', courses: 'Course Management',
    analytics: 'Analytics', users: 'User Management', feedback: 'Feedback',
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col z-30 transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <img src="/nobzlearn-logo.png" alt="NobzTech" className="h-7 w-auto mb-1 brightness-0 invert" />
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button type="button" aria-label="Close sidebar" className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setMobileSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setMobileSidebarOpen(false); }}
              className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${tab === key ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button type="button" onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64 p-4 sm:p-6 md:p-8">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <button type="button" aria-label="Open sidebar" onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm">
            <Menu size={18} />
          </button>
          <div>
            <p className="font-bold text-gray-900 text-sm">Admin Panel</p>
            <p className="text-xs text-gray-500">{tabLabel[tab]}</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">

          {/* ── Students Tab ── */}
          {tab === 'students' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Student Overview</h1>
                  <p className="text-gray-500 text-sm mt-1">Monitor enrollment and progress across all students</p>
                </div>
                <button
                  type="button"
                  onClick={() => exportStudentsCSV(filtered)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
                >
                  <Download size={15} /> Export CSV
                </button>
              </div>

              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: Users,      label: 'Total Students', value: stats.totalStudents, color: 'text-primary',     bg: 'bg-primary/10' },
                    { icon: BookOpen,   label: 'Enrolled',       value: stats.enrolled,      color: 'text-primary',     bg: 'bg-primary/10' },
                    { icon: TrendingUp, label: 'In Progress',    value: stats.inProgress,    color: 'text-amber-500',   bg: 'bg-amber-50'   },
                    { icon: Trophy,     label: 'Completed',      value: stats.completed,     color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={20} className={color} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search by name or email…" value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { key: 'all',                label: 'All' },
                      { key: 'completed',          label: 'Completed' },
                      { key: 'in_progress',        label: 'In Progress' },
                      { key: 'not_started',        label: 'Not Started' },
                    ] as const).map(f => (
                      <button key={f.key} type="button" onClick={() => { setFilter(f.key); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f.label}
                      </button>
                    ))}
                    <div className="w-px bg-gray-200 self-stretch mx-1" />
                    {([
                      { key: 'placed',             label: 'Placed' },
                      { key: 'to_be_placed',       label: 'To Be Placed' },
                      { key: 'exited',             label: 'Exited Program' },
                      { key: 'candidate_response', label: 'Candidate Response' },
                    ] as const).map(f => (
                      <button key={f.key} type="button" onClick={() => { setFilter(f.key); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center text-gray-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No students found</p></div>
                ) : (
                  <div className="scroll-shadow">
                    <table className="w-full min-w-[620px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Placement</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paginated.map(student => {
                          const cfg = statusConfig[student.status];
                          return (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-semibold text-sm text-gray-900">{student.name}</p>
                                      {student.source === 'sheet' && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Sheet</span>
                                      )}
                                      {student.source === 'both' && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Linked</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {student.phone || <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {student.company || <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-6 py-4">
                                {student.placementStatus
                                  ? <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${placementConfig[student.placementStatus].color}`}>
                                      {placementConfig[student.placementStatus].label}
                                    </span>
                                  : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(student.enrolled_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full cert-progress-bar" style={{ '--cert-progress': `${student.progress}%` } as React.CSSProperties} />
                                  </div>
                                  <span className="text-xs font-bold text-gray-700">{student.progress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudent(student)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                                >
                                  <Eye size={13} /> View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''} — page {safePage} of {totalPages}</p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Previous page" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                      .reduce<(number | '…')[]>((acc, p, i, arr) => {
                        if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '…' ? <span key={`e-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                          : <button key={p} type="button" onClick={() => setPage(p as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${safePage === p ? 'bg-primary text-primary-foreground' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                      )}
                    <button type="button" aria-label="Next page" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Courses Tab ── */}
          {tab === 'courses' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Course Management</h1>
                  <p className="text-gray-500 text-sm mt-1">Create, edit and delete courses</p>
                </div>
                <button type="button" onClick={() => setCourseModal('create')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap">
                  <Plus size={16} /> New Course
                </button>
              </div>
              {loadingCourses ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
              ) : courses.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
                  <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-500 mb-1">No courses yet</p>
                  <button type="button" onClick={() => setCourseModal('create')} className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90">Create Course</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-36 bg-gray-100 relative overflow-hidden">
                        {course.thumbnail_url
                          ? <img src={course.thumbnail_url} alt={course.title} loading="lazy" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen size={32} className="text-gray-300" /></div>}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${course.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' : course.level === 'intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {course.level}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">{course.category}</p>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description || 'No description'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">{course.price === 0 ? 'Free' : `R${course.price}`}</span>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setCourseModal(course)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Edit"><Pencil size={15} /></button>
                            <button type="button" onClick={() => handleDeleteCourse(course.id, course.title)} disabled={deletingId === course.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40" title="Delete">
                              {deletingId === course.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Analytics Tab ── */}
          {tab === 'analytics' && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Course Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">Completion rates and engagement across all courses</p>
              </div>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
              ) : analytics.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
                  <BarChart2 size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-500">No enrollment data yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="scroll-shadow">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrollments</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completion Rate</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {analytics.map(row => (
                          <tr key={row.course_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 max-w-[220px] truncate">{row.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{row.total_enrollments}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{row.completed}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full cert-progress-bar ${row.completion_rate >= 70 ? 'bg-emerald-500' : row.completion_rate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                                    style={{ '--cert-progress': `${row.completion_rate}%` } as React.CSSProperties} />
                                </div>
                                <span className={`text-xs font-bold ${row.completion_rate >= 70 ? 'text-emerald-600' : row.completion_rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                                  {row.completion_rate}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full cert-progress-bar" style={{ '--cert-progress': `${row.avg_progress}%` } as React.CSSProperties} />
                                </div>
                                <span className="text-xs font-bold text-primary">{row.avg_progress}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── User Management Tab ── */}
          {tab === 'users' && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500 text-sm mt-1">Grant or revoke admin access for any registered user</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Admin users have full access to this panel including all student data and course management. Only grant admin access to trusted team members.
                </p>
              </div>

              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search users by name or email…" value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white" />
              </div>

              {loadingProfiles ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="scroll-shadow">
                    <table className="w-full min-w-[540px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredProfiles.map(profile => (
                          <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                                  {(profile.full_name || profile.email || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{profile.full_name || '—'}</p>
                                  <p className="text-xs text-gray-400">{profile.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(profile.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${profile.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                                {profile.role === 'admin' ? <ShieldCheck size={11} /> : null}
                                {profile.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {profile.id === user.id ? (
                                <span className="text-xs text-gray-400 italic">You</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRoleToggle(profile)}
                                  disabled={updatingRole === profile.id}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                                    profile.role === 'admin'
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'
                                  }`}
                                >
                                  {updatingRole === profile.id
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : profile.role === 'admin' ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                                  {profile.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Feedback Tab ── */}
          {tab === 'feedback' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Feedback</h1>
                  <p className="text-gray-500 text-sm mt-1">Messages submitted by users via the Help & Feedback form</p>
                </div>
                <div className="flex gap-2">
                  {(['all', 'open', 'resolved'] as const).map(f => (
                    <button key={f} type="button" onClick={() => setFeedbackFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${feedbackFilter === f ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary chips */}
              <div className="flex gap-3 mb-6">
                {[
                  { label: 'Open', count: feedbackItems.filter(f => f.status === 'open').length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { label: 'Resolved', count: feedbackItems.filter(f => f.status === 'resolved').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Total', count: feedbackItems.length, color: 'bg-gray-50 text-gray-700 border-gray-200' },
                ].map(s => (
                  <div key={s.label} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${s.color}`}>
                    {s.count} {s.label}
                  </div>
                ))}
              </div>

              {loadingFeedback ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
              ) : filteredFeedback.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-500">No {feedbackFilter !== 'all' ? feedbackFilter : ''} feedback yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFeedback.map(item => {
                    const name = item.profiles?.full_name || item.profiles?.email || 'Anonymous';
                    const categoryIcon = item.category === 'Bug Report' ? Bug : item.category === 'Feature Request' ? Lightbulb : MessageSquare;
                    const CategoryIcon = categoryIcon;
                    const categoryColor = item.category === 'Bug Report'
                      ? 'bg-red-100 text-red-700'
                      : item.category === 'Feature Request'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700';

                    return (
                      <div key={item.id} className={`bg-white rounded-2xl border p-5 transition-opacity ${item.status === 'resolved' ? 'opacity-60 border-gray-100' : 'border-gray-200 shadow-sm'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColor}`}>
                                <CategoryIcon size={11} /> {item.category}
                              </span>
                              {item.status === 'resolved' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 size={11} /> Resolved
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed mb-3">{item.message}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <span className="font-medium text-gray-600">{name}</span>
                              <span>{new Date(item.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFeedbackStatus(item)}
                            disabled={updatingFeedback === item.id}
                            title={item.status === 'open' ? 'Mark as resolved' : 'Reopen'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 disabled:opacity-50 ${
                              item.status === 'open'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            {updatingFeedback === item.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : item.status === 'open'
                              ? <><CheckCircle2 size={12} /> Resolve</>
                              : <><Circle size={12} /> Reopen</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Course modal */}
      {courseModal && (
        <CourseModal
          initial={courseModal === 'create' ? null : courseModal}
          onSave={handleSaveCourse}
          onClose={() => setCourseModal(null)}
          saving={savingCourse}
        />
      )}

      {/* Student detail slide-over */}
      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
