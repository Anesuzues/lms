import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Trophy, Clock, ArrowRight, PlayCircle, Compass, Loader2, Download, CheckCircle2, XCircle, BarChart2, Flame, Star, Zap } from 'lucide-react';
import Header from '@/components/Header';
import OnboardingModal from '@/components/lms/OnboardingModal';
import Footer from '@/components/Footer';
import CourseCard, { CourseCardCourse } from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { fetchCoursesByIds, fetchUserEnrollments, fetchTotalTimeSpent, fetchCoursesWithPassedQuiz, DBCourse, DBEnrollment } from '@/services/courseService';
import { fetchAllQuizAttempts, QuizAttempt } from '@/services/quizService';
import { generateCertificate } from '@/lib/generateCertificate';
import { CERTIFICATES, getCertForCourse } from '@/lib/programmeConfig';
import { fetchUserStats, getLevelFromXP, LEVELS, UserStats } from '@/services/profileService';

const CertBar = ({ pct, gradient }: { pct: number; gradient: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.style.width = `${pct}%`; }, [pct]);
  return <div ref={ref} className={`h-full rounded-full transition-[width] duration-700 bg-gradient-to-r ${gradient}`} />;
};

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
  const [userStats, setUserStats] = useState<UserStats>({ streak: 0, xp: 0, onboarded: true });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const progBarRef = useRef<HTMLDivElement>(null);
  const enrollBarRef = useRef<HTMLDivElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [enrollments, seconds, stats] = await Promise.all([
          fetchUserEnrollments(user.id),
          fetchTotalTimeSpent(user.id),
          fetchUserStats(user.id),
        ]);
        setUserStats(stats);
        if (!stats.onboarded) setShowOnboarding(true);
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

  useEffect(() => {
    const completed = enrolledCourses.filter(e => e.enrollment.progress >= 100).length;
    if (progBarRef.current)
      progBarRef.current.style.width = `${Math.round((completed / TOTAL_PROGRAMME_COURSES) * 100)}%`;
    const active =
      enrolledCourses
        .filter(ec => ec.enrollment.progress > 0 && ec.enrollment.progress < 100)
        .sort((a, b) => b.enrollment.progress - a.enrollment.progress)[0]
      ?? enrolledCourses.find(ec => ec.enrollment.progress === 0)
      ?? enrolledCourses[0];
    if (enrollBarRef.current && active)
      enrollBarRef.current.style.width = `${active.enrollment.progress}%`;
  }, [enrolledCourses]);

  useEffect(() => {
    if (!xpBarRef.current) return;
    const lvl = getLevelFromXP(userStats.xp);
    const pct = lvl.level === 7
      ? 100
      : Math.round(((userStats.xp - lvl.min) / (lvl.next - lvl.min)) * 100);
    xpBarRef.current.style.width = `${pct}%`;
  }, [userStats.xp]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const completedCount = enrolledCourses.filter(e => e.enrollment.progress >= 100).length;

  const handleDownloadCertificate = async (certNumber: number) => {
    if (!user) return;
    const cert = CERTIFICATES.find(c => c.number === certNumber);
    if (!cert) return;
    // Find any completed enrollment for the completion date
    const certEnrollments = enrolledCourses.filter(
      ec => getCertForCourse(ec.course.title)?.number === certNumber
    );
    const latestCompletedAt = certEnrollments
      .map(ec => ec.enrollment.completed_at)
      .filter(Boolean)
      .sort()
      .pop() ?? null;

    setDownloading(String(certNumber));
    try {
      await generateCertificate({
        userId: user.id,
        userName: user.name,
        courseName: cert.shortName,
        completedAt: latestCompletedAt,
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

  // Show the course the user is actively working on:
  // 1st preference: highest-progress course that isn't yet done
  // 2nd preference: any enrolled course not started yet
  const activeCourse =
    enrolledCourses
      .filter(ec => ec.enrollment.progress > 0 && ec.enrollment.progress < 100)
      .sort((a, b) => b.enrollment.progress - a.enrollment.progress)[0]
    ?? enrolledCourses.find(ec => ec.enrollment.progress === 0)
    ?? enrolledCourses[0];

  const mapCourse = (c: DBCourse): CourseCardCourse => ({
    id: c.id,
    title: c.title,
    description: c.description || '',
    thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    instructor: 'NobzLearn Team',
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

        {/* Continue / Next Step — shown before stats */}
        {!loading && (
          activeCourse ? (
            <div className="mb-6 sm:mb-8">
              <h2 className="font-bold text-xl text-foreground mb-4">Continue Where You Left Off</h2>
              <div className="bg-card rounded-2xl border border-border shadow-soft p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-0.5 transition-transform">
                <img
                  src={activeCourse.course.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'}
                  alt={activeCourse.course.title}
                  className="w-full sm:w-32 h-36 sm:h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">NobzLearn Team</p>
                  <h3 className="font-bold text-foreground text-lg leading-tight mb-3 truncate">{activeCourse.course.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div ref={enrollBarRef} className="h-full bg-primary rounded-full transition-[width] duration-700 w-0" />
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">{activeCourse.enrollment.progress}%</span>
                  </div>
                </div>
                <Link
                  to={`/learn/${activeCourse.course.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-glow shrink-0"
                >
                  <PlayCircle size={16} /> Resume
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen size={22} className="text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-foreground text-base mb-0.5">Your next step: start Certificate 1</p>
                <p className="text-muted-foreground text-sm">Enroll in your first pathway and begin your journey to becoming a Certified AI Developer.</p>
              </div>
              <Link
                to="/courses"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-glow shrink-0 whitespace-nowrap"
              >
                Browse Courses <ArrowRight size={15} />
              </Link>
            </div>
          )
        )}

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
              ref={progBarRef}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-[width] duration-700 w-0"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((completedCount / TOTAL_PROGRAMME_COURSES) * 100)}% of the full NobzTech learning programme complete
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
          {[
            { icon: BookOpen, label: 'Enrolled',   value: enrolledCourses.length, color: 'text-primary',      bg: 'bg-primary/10'     },
            { icon: Trophy,   label: 'Completed',  value: completedCount,          color: 'text-amber-500',    bg: 'bg-amber-500/10'   },
            { icon: Clock,    label: 'Time Spent', value: timeDisplay,             color: 'text-emerald-500',  bg: 'bg-emerald-500/10' },
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

        {/* Streak + XP row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Streak card */}
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border shadow-soft flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Flame size={20} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold text-foreground">{userStats.streak}</p>
                <p className="text-xs text-muted-foreground">day{userStats.streak !== 1 ? 's' : ''} streak</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {userStats.streak === 0
                  ? 'Complete a lesson today to start your streak!'
                  : userStats.streak < 7
                  ? `${7 - userStats.streak} more day${7 - userStats.streak !== 1 ? 's' : ''} for a 7-day bonus`
                  : '🔥 Keep the fire alive!'}
              </p>
            </div>
          </div>

          {/* XP + Level card */}
          {(() => {
            const lvl = getLevelFromXP(userStats.xp);
            const nextLvl = LEVELS.find(l => l.level === lvl.level + 1);
            const pct = lvl.level === 7
              ? 100
              : Math.round(((userStats.xp - lvl.min) / (lvl.next - lvl.min)) * 100);
            return (
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                      <Star size={20} className="text-violet-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Level {lvl.level}</p>
                      <p className="font-bold text-foreground text-sm">{lvl.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-violet-500">
                    <Zap size={14} />
                    <span className="font-bold text-sm">{userStats.xp} XP</span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div ref={xpBarRef} className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-[width] duration-700 w-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {lvl.level === 7
                    ? 'Maximum level reached!'
                    : `${nextLvl ? lvl.next - userStats.xp : 0} XP to ${nextLvl?.name ?? 'next level'}`}
                </p>
              </div>
            );
          })()}
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Skeleton: continue card */}
            <div className="bg-card rounded-2xl border border-border p-5 flex gap-5 animate-pulse">
              <div className="w-32 h-24 rounded-xl bg-secondary shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-3 bg-secondary rounded w-1/4" />
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-2 bg-secondary rounded w-full" />
              </div>
              <div className="w-20 h-10 bg-secondary rounded-xl shrink-0" />
            </div>
            {/* Skeleton: course grid */}
            <div>
              <div className="h-6 bg-secondary rounded w-48 mb-5 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="h-40 bg-secondary" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-1/2" />
                      <div className="h-2 bg-secondary rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── 1. My Learning Path ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-xl text-foreground">My Learning Path</h2>
                <Link to="/courses" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                  Browse all <ArrowRight size={14} />
                </Link>
              </div>
              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(({ course, enrollment }) => (
                    <div key={course.id}>
                      <CourseCard
                        course={mapCourse(course)}
                        enrolled
                        progress={enrollment.progress}
                      />
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
                    Enroll in a certificate pathway to start your learning journey.
                  </p>
                  <Link to="/courses" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow">
                    Explore Catalog <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            {/* ── 2. Your Certificates ── */}
            {(() => {
              const certStatus = CERTIFICATES.map(cert => {
                const certCourses = enrolledCourses.filter(
                  ec => getCertForCourse(ec.course.title)?.number === cert.number
                );
                if (certCourses.length === 0) return null;
                const completedCount = certCourses.filter(ec => ec.enrollment.progress >= 100).length;
                const totalEnrolled = certCourses.length;
                const pct = Math.round((completedCount / totalEnrolled) * 100);
                const eligible = certCourses.some(ec =>
                  cert.finalExamTitles.some(t =>
                    ec.course.title.toLowerCase().includes(t.toLowerCase())
                  ) && quizPassedCourses.includes(ec.course.id)
                );
                return { cert, completedCount, totalEnrolled, pct, eligible };
              }).filter(Boolean);

              if (certStatus.length === 0) return null;
              return (
                <div className="mb-8">
                  <h2 className="font-bold text-xl text-foreground mb-5">Your Certificates</h2>
                  <div className="space-y-3">
                    {certStatus.map(s => {
                      if (!s) return null;
                      const { cert, completedCount, totalEnrolled, pct, eligible } = s;
                      return (
                        <div key={cert.number} className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${eligible ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-card border-border'}`}>
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cert.gradient} flex items-center justify-center shrink-0`}>
                            <Trophy size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-sm leading-snug">{cert.certName}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <CertBar pct={pct} gradient={cert.gradient} />
                              </div>
                              <span className="text-xs font-bold text-muted-foreground shrink-0">{completedCount}/{totalEnrolled} modules</span>
                            </div>
                            {eligible
                              ? <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">✓ Final exam passed — certificate earned!</p>
                              : <p className="text-xs text-muted-foreground mt-1">Complete all modules and pass the final exam to earn this certificate</p>
                            }
                          </div>
                          {eligible ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <button type="button" onClick={() => handleDownloadCertificate(cert.number)} disabled={downloading === String(cert.number)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors disabled:opacity-60 shadow-sm">
                                {downloading === String(cert.number)
                                  ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                                  : <><Download size={14} /> Download</>}
                              </button>
                              <a href={`https://wa.me/?text=${encodeURIComponent(`🎓 I just earned the "${cert.certName}" from NobzLearn! https://nobzlearn.co.za`)}`}
                                target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
                                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              </a>
                              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent('https://nobzlearn.co.za')}&title=${encodeURIComponent(cert.certName)}&summary=${encodeURIComponent(`I earned the ${cert.certName} from NobzLearn!`)}`}
                                target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"
                                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              </a>
                            </div>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground text-xs font-semibold shrink-0">{pct}% complete</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── 3. Quiz History ── */}
            <div className="mb-8">
              <h2 className="font-bold text-xl text-foreground mb-5">Quiz History</h2>
              {quizAttempts.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl py-14 text-center">
                  <BarChart2 size={36} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-semibold text-muted-foreground text-sm">No quiz attempts yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Complete a lesson and take the quiz to see your results here.</p>
                </div>
              ) : (
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
                              <span className={`text-sm font-bold ${attempt.passed ? 'text-emerald-500' : 'text-red-400'}`}>{attempt.score}%</span>
                            </td>
                            <td className="px-5 py-3">
                              {attempt.passed
                                ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold"><CheckCircle2 size={11} /> Passed</span>
                                : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold"><XCircle size={11} /> Failed</span>}
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
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
      {showOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          userName={user.name}
          onClose={() => { setShowOnboarding(false); setUserStats(s => ({ ...s, onboarded: true })); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
