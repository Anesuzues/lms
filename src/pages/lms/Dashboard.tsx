import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Trophy, Clock, ArrowRight, PlayCircle, Compass, Loader2, Download, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard, { CourseCardCourse } from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { fetchCoursesByIds, fetchUserEnrollments, fetchTotalTimeSpent, fetchCoursesWithPassedQuiz, DBCourse, DBEnrollment } from '@/services/courseService';
import { fetchAllQuizAttempts, QuizAttempt } from '@/services/quizService';
import { generateCertificate } from '@/lib/generateCertificate';

const TOTAL_PROGRAMME_COURSES = 21;

interface EnrolledCourse {
  course: DBCourse;
  enrollment: DBEnrollment;
}

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [quizPassedCourses, setQuizPassedCourses] = useState<string[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [courseNameMap, setCourseNameMap] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [enrollments, seconds] = await Promise.all([
          fetchUserEnrollments(user.id),
          fetchTotalTimeSpent(user.id),
        ]);
        setTotalSeconds(seconds);
        if (enrollments.length === 0) { setEnrolledCourses([]); setLoading(false); return; }
        const courseIds = enrollments.map(e => e.course_id);
        const courses = await fetchCoursesByIds(courseIds);
        const courseMap = new Map(courses.map(c => [c.id, c]));
        const paired = enrollments
          .map(e => { const course = courseMap.get(e.course_id); return course ? { course, enrollment: e } : null; })
          .filter(Boolean) as EnrolledCourse[];
        setEnrolledCourses(paired);

        // Check which completed courses have a passed quiz (required for certificate)
        const completedIds = enrollments.filter(e => e.progress >= 100).map(e => e.course_id);
        if (completedIds.length > 0) {
          const passed = await fetchCoursesWithPassedQuiz(user.id, completedIds);
          setQuizPassedCourses(passed);
        }

        // Quiz attempt history + course name lookup
        const [attempts, allCourses] = await Promise.all([
          fetchAllQuizAttempts(user.id),
          fetchCoursesByIds(enrollments.map(e => e.course_id)),
        ]);
        setQuizAttempts(attempts);
        setCourseNameMap(Object.fromEntries(allCourses.map(c => [c.id, c.title])));
      } catch (err) {
        console.error('Dashboard load error:', err);
        toast({ title: 'Failed to load courses', description: 'Please refresh the page.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  const completedCount = enrolledCourses.filter(e => e.enrollment.progress >= 100).length;

  const handleDownloadCertificate = async (courseId: string) => {
    const item = enrolledCourses.find(e => e.course.id === courseId);
    if (!item || !user) return;
    setDownloading(courseId);
    try {
      await generateCertificate({
        userName: user.name,
        courseName: item.course.title,
        completedAt: item.enrollment.completed_at,
      });
    } catch {
      toast({ title: 'Download failed', description: 'Could not generate certificate. Please try again.', variant: 'destructive' });
    } finally {
      setDownloading(null);
    }
  };

  // Real time spent from actual watch data
  const totalMinutes = Math.round(totalSeconds / 60);
  const timeDisplay = totalSeconds < 60 ? `${totalSeconds}s`
    : totalMinutes < 60 ? `${totalMinutes}m`
    : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  const lastEnrolled = enrolledCourses[enrolledCourses.length - 1];

  const mapCourse = (c: DBCourse): CourseCardCourse => ({
    id: c.id,
    title: c.title,
    description: c.description || '',
    thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    instructor: 'NexaLearn Team',
    level: (c.level.charAt(0).toUpperCase() + c.level.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced',
    duration: c.duration || '4 weeks',
    price: c.price === 0 ? 'Free' as const : c.price,
    modules: [],
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 mt-16 max-w-7xl">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-hero-gradient p-5 sm:p-8 mb-6 sm:mb-8 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-4 ring-white/30 shadow-lg shrink-0" />
              <div>
                <p className="text-white/70 text-xs sm:text-sm font-medium mb-0.5">Welcome back,</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">{user.name}</h1>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold capitalize">{user.role}</span>
              </div>
            </div>
            <Link to="/courses" className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-colors backdrop-blur-sm border border-white/20 self-start sm:self-auto whitespace-nowrap">
              <Compass size={15} /> Browse Courses
            </Link>
          </div>
        </div>

        {/* Programme Progress Banner */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              <span className="font-bold text-foreground text-sm">Programme Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">{completedCount}/{TOTAL_PROGRAMME_COURSES} courses</span>
          </div>
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
              style={{ width: `${Math.round((completedCount / TOTAL_PROGRAMME_COURSES) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((completedCount / TOTAL_PROGRAMME_COURSES) * 100)}% of the full NobzTech learning programme complete
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Trophy, label: 'Completed', value: completedCount, color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Clock, label: 'Time Spent', value: timeDisplay, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border shadow-soft flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Continue Learning */}
            {lastEnrolled && (
              <div className="mb-8">
                <h2 className="font-bold text-xl text-foreground mb-4">Continue Where You Left Off</h2>
                <div className="bg-card rounded-2xl border border-border shadow-soft p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-0.5 transition-transform">
                  <img
                    src={lastEnrolled.course.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'}
                    alt={lastEnrolled.course.title}
                    className="w-full sm:w-32 h-40 sm:h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-1">NexaLearn Team</p>
                    <h3 className="font-bold text-foreground text-lg leading-tight mb-3 truncate">{lastEnrolled.course.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${lastEnrolled.enrollment.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">{lastEnrolled.enrollment.progress}%</span>
                    </div>
                  </div>
                  <Link
                    to={`/learn/${lastEnrolled.course.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-glow shrink-0"
                  >
                    <PlayCircle size={16} /> Resume
                  </Link>
                </div>
              </div>
            )}

            {/* My Courses */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-xl text-foreground">My Learning Path</h2>
                <Link to="/courses" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                  Browse all <ArrowRight size={14} />
                </Link>
              </div>

              <div className="mt-10">
                <h2 className="font-bold text-xl text-foreground mb-5">Quiz History</h2>
              {quizAttempts.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl py-14 text-center">
                  <BarChart2 size={36} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-semibold text-muted-foreground text-sm">No quiz attempts yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Complete a lesson and take the quiz to see your results here.</p>
                </div>
              ) : (
                <div className="mt-10">
                  <h2 className="font-bold text-xl text-foreground mb-5">Quiz History</h2>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px]">
                        <thead>
                          <tr className="border-b border-border bg-secondary/40">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {quizAttempts.map(attempt => (
                            <tr key={attempt.id} className="hover:bg-secondary/30 transition-colors">
                              <td className="px-5 py-3 text-sm text-foreground font-medium truncate max-w-[200px]">
                                {courseNameMap[attempt.course_id] ?? 'Unknown Course'}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-sm font-bold ${attempt.passed ? 'text-emerald-500' : 'text-red-400'}`}>
                                  {attempt.score}%
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {attempt.passed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                                    <CheckCircle2 size={11} /> Passed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                                    <XCircle size={11} /> Failed
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs text-muted-foreground">
                                {new Date(attempt.attempted_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(({ course, enrollment }) => (
                    <div key={course.id} className="flex flex-col gap-2">
                      <CourseCard
                        course={mapCourse(course)}
                        enrolled
                        progress={enrollment.progress}
                      />
                      {enrollment.progress >= 100 && quizPassedCourses.includes(course.id) && (
                        <button
                          onClick={() => handleDownloadCertificate(course.id)}
                          disabled={downloading === course.id}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-semibold disabled:opacity-60"
                        >
                          {downloading === course.id ? (
                            <><Loader2 size={14} className="animate-spin" /> Generating...</>
                          ) : (
                            <><Download size={14} /> Download Certificate</>
                          )}
                        </button>
                      )}
                      {enrollment.progress >= 100 && !quizPassedCourses.includes(course.id) && (
                        <p className="text-center text-xs text-amber-500/80 py-1.5">
                          Pass the module quiz to unlock your certificate
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center rounded-3xl border-2 border-dashed border-border bg-card">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <BookOpen size={36} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
                    Enroll in a course to start building your workplace skills.
                  </p>
                  <Link to="/courses" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow">
                    Explore Catalog <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
