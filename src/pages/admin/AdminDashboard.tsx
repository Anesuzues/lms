import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Trophy, BookOpen, Clock, Search, CheckCircle, Loader2, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllStudents, fetchAdminStats, StudentOverview, AdminStats } from '@/services/adminService';

const statusConfig = {
  completed:   { label: 'Completed',   color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'   },
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400'    },
};

const AdminDashboard = () => {
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [s, st] = await Promise.all([fetchAllStudents(), fetchAdminStats()]);
      setStudents(s);
      setStats(st);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col z-20">
        <div className="p-6 border-b border-gray-800">
          <img src="/nexalearn-logo.png" alt="NexaLearn" className="h-8 w-auto mb-1 brightness-0 invert" />
          <p className="text-xs text-gray-400 mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm flex items-center gap-3">
            <Users size={16} /> Students
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Student Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor enrollment and progress across all students</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users,     label: 'Total Students', value: stats.totalStudents, color: 'text-primary',      bg: 'bg-primary/10'   },
                { icon: BookOpen,  label: 'Enrolled',        value: stats.enrolled,      color: 'text-primary',      bg: 'bg-primary/10'   },
                { icon: TrendingUp,label: 'In Progress',     value: stats.inProgress,    color: 'text-amber-500',    bg: 'bg-amber-50'     },
                { icon: Trophy,    label: 'Completed',       value: stats.completed,     color: 'text-emerald-500',  bg: 'bg-emerald-50'   },
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

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'completed', 'in_progress', 'not_started'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      filter === f ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'not_started' ? 'Not Started' : 'Completed'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No students found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(student => {
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
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${student.progress}%` }}
                              />
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
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-right">{filtered.length} student{filtered.length !== 1 ? 's' : ''} shown</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
