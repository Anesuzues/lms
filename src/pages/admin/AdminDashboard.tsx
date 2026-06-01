import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Trophy, BookOpen, Search, Loader2, LogOut, TrendingUp, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Menu, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchAllStudents, fetchAdminStats, adminFetchCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  fetchCourseAnalytics,
  StudentOverview, AdminStats, CourseFormData, CourseAnalytics,
} from '@/services/adminService';
import { DBCourse } from '@/services/courseService';

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

// ─── Course Form Modal ────────────────────────────────────────────────────────
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form, initial?.id); }} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Course title" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Course description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Level *</label>
              <select required value={form.level} onChange={e => set('level', e.target.value as CourseFormData['level'])}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Category *</label>
              <input required value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. Business" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Price (R)</label>
              <input type="number" min={0} step={0.01} value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="0 for free" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Duration</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. 4 weeks" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="https://..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : initial ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'students' | 'courses' | 'analytics'>('students');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Students state
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [page, setPage] = useState(1);

  // Courses state
  const [courses, setCourses] = useState<DBCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [courseModal, setCourseModal] = useState<'create' | DBCourse | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const load = async () => {
      setLoadingStudents(true);
      try {
        const [s, st] = await Promise.all([fetchAllStudents(), fetchAdminStats()]);
        setStudents(s);
        setStats(st);
      } catch {
        toast({ title: 'Failed to load data', description: 'Please refresh the page.', variant: 'destructive' });
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
      const data = await adminFetchCourses();
      setCourses(data);
      setLoadingCourses(false);
    };
    load();
  }, [tab]);

  useEffect(() => {
    if (tab !== 'analytics' || !user || user.role !== 'admin') return;
    if (analytics.length > 0) return;
    const load = async () => {
      setLoadingAnalytics(true);
      const data = await fetchCourseAnalytics();
      setAnalytics(data);
      setLoadingAnalytics(false);
    };
    load();
  }, [tab]);

  // Student filtering & pagination
  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const handleFilterChange = (f: typeof filter) => { setFilter(f); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  // Course CRUD handlers
  const handleSaveCourse = async (form: CourseFormData, id?: string) => {
    setSavingCourse(true);
    if (id) {
      const res = await adminUpdateCourse(id, form);
      if (res.error) { toast({ title: 'Update failed', description: res.error, variant: 'destructive' }); }
      else {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, ...form } : c));
        toast({ title: 'Course updated' });
        setCourseModal(null);
      }
    } else {
      const res = await adminCreateCourse(form, user!.id);
      if (res.error) { toast({ title: 'Create failed', description: res.error, variant: 'destructive' }); }
      else if (res.data) {
        setCourses(prev => [res.data!, ...prev]);
        toast({ title: 'Course created' });
        setCourseModal(null);
      }
    }
    setSavingCourse(false);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await adminDeleteCourse(id);
    if (res.error) { toast({ title: 'Delete failed', description: res.error, variant: 'destructive' }); }
    else { setCourses(prev => prev.filter(c => c.id !== id)); toast({ title: 'Course deleted' }); }
    setDeletingId(null);
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col z-30
        transition-transform duration-300
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <img src="/nexalearn-logo.png" alt="NexaLearn" className="h-7 w-auto mb-1 brightness-0 invert" />
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => { setTab('students'); setMobileSidebarOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${tab === 'students' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={16} /> Students
          </button>
          <button
            onClick={() => { setTab('courses'); setMobileSidebarOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${tab === 'courses' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BookOpen size={16} /> Courses
          </button>
          <button
            onClick={() => { setTab('analytics'); setMobileSidebarOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${tab === 'analytics' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart2 size={16} /> Analytics
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="md:ml-64 p-4 sm:p-6 md:p-8">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="font-bold text-gray-900 text-sm">Admin Panel</p>
            <p className="text-xs text-gray-500 capitalize">{tab === 'students' ? 'Student Overview' : tab === 'courses' ? 'Course Management' : 'Analytics'}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">

          {/* ── Students Tab ── */}
          {tab === 'students' && (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Student Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Monitor enrollment and progress across all students</p>
              </div>

              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: Users,      label: 'Total Students', value: stats.totalStudents, color: 'text-primary',     bg: 'bg-primary/10' },
                    { icon: BookOpen,   label: 'Enrolled',        value: stats.enrolled,      color: 'text-primary',     bg: 'bg-primary/10' },
                    { icon: TrendingUp, label: 'In Progress',     value: stats.inProgress,    color: 'text-amber-500',   bg: 'bg-amber-50'   },
                    { icon: Trophy,     label: 'Completed',       value: stats.completed,     color: 'text-emerald-500', bg: 'bg-emerald-50' },
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
                    <input type="text" placeholder="Search by name or email..." value={search}
                      onChange={e => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'completed', 'in_progress', 'not_started'] as const).map(f => (
                      <button key={f} onClick={() => handleFilterChange(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'not_started' ? 'Not Started' : 'Completed'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No students found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
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
                                  <p className="font-semibold text-sm text-gray-900">{student.name}</p>
                                  <p className="text-xs text-gray-400">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(student.enrolled_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${student.progress}%` }} />
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                <p className="text-xs text-gray-400">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''} — page {safePage} of {totalPages}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
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
                        p === '…' ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                        ) : (
                          <button key={p} onClick={() => setPage(p as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${safePage === p ? 'bg-primary text-primary-foreground' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                            {p}
                          </button>
                        )
                      )}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
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
                <button
                  onClick={() => setCourseModal('create')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
                >
                  <Plus size={16} /> New Course
                </button>
              </div>

              {loadingCourses ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
              ) : courses.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
                  <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-500 mb-1">No courses yet</p>
                  <p className="text-sm text-gray-400 mb-5">Create your first course to get started</p>
                  <button onClick={() => setCourseModal('create')}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors">
                    Create Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-36 bg-gray-100 relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={32} className="text-gray-300" />
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                          ${course.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' : course.level === 'intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {course.level}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">{course.category}</p>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description || 'No description'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">
                            {course.price === 0 ? 'Free' : `R${course.price}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCourseModal(course)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDeleteCourse(course.id, course.title)}
                              disabled={deletingId === course.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40" title="Delete">
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
                  <div className="overflow-x-auto">
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
                                  <div
                                    className={`h-full rounded-full transition-all ${row.completion_rate >= 70 ? 'bg-emerald-500' : row.completion_rate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                                    style={{ width: `${row.completion_rate}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-bold ${row.completion_rate >= 70 ? 'text-emerald-600' : row.completion_rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                                  {row.completion_rate}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${row.avg_progress}%` }} />
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
    </div>
  );
};

export default AdminDashboard;
