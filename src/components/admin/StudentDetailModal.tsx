import React, { useEffect, useState } from 'react';
import { X, Loader2, Download, BookOpen, Trophy, Clock, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';
import { StudentOverview, StudentDetail, fetchStudentDetail } from '@/services/adminService';
import { generateStudentReport } from '@/lib/generateReport';
import { CERTIFICATES, getCertForCourse } from '@/lib/programmeConfig';

interface Props {
  student: StudentOverview;
  onClose: () => void;
}

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const StudentDetailModal: React.FC<Props> = ({ student, onClose }) => {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStudentDetail(student.id).then(d => { setDetail(d); setLoading(false); });
  }, [student.id]);

  const handleDownload = async () => {
    if (!detail) return;
    setDownloading(true);
    await generateStudentReport(student, detail);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20" />
            <div>
              <p className="font-bold text-sm">{student.name}</p>
              <p className="text-xs text-gray-400">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              {downloading ? 'Generating…' : 'PDF Report'}
            </button>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: BookOpen,    label: 'Enrolled',  value: detail.enrollments.length,                                                  color: 'text-primary',     bg: 'bg-primary/10' },
                { icon: Trophy,     label: 'Completed', value: detail.enrollments.filter(e => e.completed_at).length,                       color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: BarChart2,  label: 'Progress',  value: `${student.progress}%`,                                                     color: 'text-amber-500',   bg: 'bg-amber-50'   },
                { icon: Clock,      label: 'Time Spent',value: fmtTime(detail.totalTimeSeconds),                                            color: 'text-violet-500',  bg: 'bg-violet-50'  },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                    <Icon size={15} className={color} />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Certificate Progress */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">Certificate Progress</h3>
              <div className="space-y-2">
                {CERTIFICATES.map(cert => {
                  const certEnrollments = detail.enrollments.filter(
                    e => getCertForCourse(e.course_title)?.number === cert.number
                  );
                  const total = cert.courseTitles.length;
                  const done = certEnrollments.filter(e => e.completed_at).length;
                  const enrolled = certEnrollments.length;
                  const pct = Math.round((done / total) * 100);
                  const eligible = done === total && enrolled === total;

                  return (
                    <div key={cert.number} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cert.gradient} flex items-center justify-center`}>
                            <Trophy size={12} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">{cert.shortName}</p>
                            <p className="text-xs text-gray-400">{enrolled} enrolled · {done}/{total} complete</p>
                          </div>
                        </div>
                        {eligible ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Earned</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-500">{pct}%</span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${cert.gradient} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Enrollments */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">Course Enrollments ({detail.enrollments.length})</h3>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                {detail.enrollments.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No enrollments yet</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {detail.enrollments.map(e => (
                      <div key={e.course_id} className="px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{e.course_title}</p>
                          <p className="text-xs text-gray-400">Enrolled {new Date(e.enrolled_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${e.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-primary w-8 text-right">{e.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quiz History */}
            {detail.quizAttempts.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3">Quiz History</h3>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-50">
                    {detail.quizAttempts.map((qa, i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{qa.course_title}</p>
                          <p className="text-xs text-gray-400">{new Date(qa.attempted_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-bold text-sm ${qa.passed ? 'text-emerald-600' : 'text-red-500'}`}>{qa.score}%</span>
                          {qa.passed
                            ? <CheckCircle2 size={15} className="text-emerald-500" />
                            : <XCircle size={15} className="text-red-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Could not load student data.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailModal;
