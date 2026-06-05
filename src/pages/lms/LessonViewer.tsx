import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Menu, CheckCircle, Loader2, ChevronRight, Lock, ClipboardList, BookOpen, Download, Trophy, ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Quiz from '@/components/lms/Quiz';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import {
  fetchCourseById, fetchLessonsByCourse, fetchLessonProgress,
  markLessonComplete, updateEnrollmentProgress, fetchUserEnrollments,
  DBCourse, DBLesson, LessonProgress,
} from '@/services/courseService';
import {
  fetchQuizQuestions, fetchAllPassedModules, QuizQuestion,
} from '@/services/quizService';
import { isFinalExam, getCertForCourse } from '@/lib/programmeConfig';
import { generateCertificate } from '@/lib/generateCertificate';
import { updateStreakAndXP, fetchUserStats } from '@/services/profileService';

const DELAY_CLASS: Record<number, string> = { 0: '', 100: 'anim-delay-100' };

const RevealOnScroll = ({
  children,
  tag: Tag = 'div',
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = DELAY_CLASS[delay] ?? '';
  const visibilityClass = visible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-[18px]';

  return React.createElement(
    Tag,
    { ref, className: `transition-[opacity,transform] duration-500 ease-out ${delayClass} ${visibilityClass} ${className}`.trim() },
    children
  );
};

const FALLBACK_MODULE_NAMES = [
  'Workplace Foundations',
  'CV Writing & AI Tools',
  'Interview Readiness',
  'Professional Conduct',
];

const getModuleName = (lesson: DBLesson) =>
  lesson.modules?.title ??
  FALLBACK_MODULE_NAMES[(lesson.position ?? lesson.order_index) - 1] ??
  `Module ${lesson.position ?? lesson.order_index}`;

type ViewMode = 'reading' | 'quiz' | 'certificate';

const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<DBCourse | null>(null);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [passedModules, setPassedModules] = useState<string[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('reading');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [marking, setMarking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [streak, setStreak] = useState(0);
  const readingPaneRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const navProgressRef = useRef<HTMLDivElement>(null);
  const sidebarProgressRef = useRef<HTMLDivElement>(null);

  const handleReadingScroll = useCallback(() => {
    const el = readingPaneRef.current;
    if (!el || !scrollBarRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const max = scrollHeight - clientHeight;
    const pct = max <= 0 ? 100 : Math.min(100, Math.round((scrollTop / max) * 100));
    scrollBarRef.current.style.width = `${pct}%`;
  }, []);

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch everything in parallel — one round trip instead of two
        const [enrollments, c, l, p, passed, stats] = await Promise.all([
          fetchUserEnrollments(user.id),
          fetchCourseById(id),
          fetchLessonsByCourse(id),
          fetchLessonProgress(user.id, id),
          fetchAllPassedModules(user.id, id),
          fetchUserStats(user.id),
        ]);
        const isEnrolled = enrollments.some(e => e.course_id === id);
        if (!isEnrolled) { setNotEnrolled(true); setLoading(false); return; }

        setStreak(stats.streak);
        setCourse(c);
        setLessons(l);
        setProgress(p);
        setPassedModules(passed);
        if (l.length > 0) setActiveLessonId(l[0].id);
      } catch {
        toast({ title: 'Failed to load course', description: 'Please refresh the page.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.id]);

  useEffect(() => {
    if (readingPaneRef.current) readingPaneRef.current.scrollTop = 0;
    if (scrollBarRef.current) scrollBarRef.current.style.width = '0%';
  }, [activeLessonId]);

  useEffect(() => {
    const completedCount = progress.filter(p => p.completed).length;
    const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
    const w = `${pct}%`;
    if (navProgressRef.current) navProgressRef.current.style.width = w;
    if (sidebarProgressRef.current) sidebarProgressRef.current.style.width = w;
  }, [progress, lessons]);

  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const isCompleted = (lessonId: string) => progress.some(p => p.lesson_id === lessonId && p.completed);
  const isModulePassed = (moduleId: string) => passedModules.includes(moduleId);

  const isLessonLocked = (lesson: DBLesson) => {
    const pos = lesson.position ?? lesson.order_index;
    if (pos <= 1) return false;
    const prevLesson = lessons.find(l => (l.position ?? l.order_index) === pos - 1);
    if (!prevLesson) return false;
    return !isCompleted(prevLesson.id);
  };

  const MILESTONE_MESSAGES: Record<number, { title: string; description: string }> = {
    25: { title: '25% complete!', description: "You're a quarter of the way through — keep it up!" },
    50: { title: 'Halfway there!', description: "You're halfway through the course. Great work!" },
    75: { title: '75% complete!', description: "Almost done — the finish line is in sight!" },
    100: { title: 'Course complete!', description: "You've finished every lesson. Time for the quiz!" },
  };

  const handleMarkRead = async () => {
    if (!user || !id || !activeLessonId || !activeLesson || marking) return;
    setMarking(true);
    await markLessonComplete(user.id, id, activeLessonId, 0);
    const prevCompleted = progress.filter(p => p.completed).length;
    const updated = [
      ...progress.filter(p => p.lesson_id !== activeLessonId),
      { lesson_id: activeLessonId, completed: true, completed_at: new Date().toISOString() },
    ];
    setProgress(updated);
    const newCompleted = updated.filter(p => p.completed).length;
    const pct = Math.round((newCompleted / lessons.length) * 100);
    await updateEnrollmentProgress(user.id, id, pct);

    const streakResult = await updateStreakAndXP(user.id, 10);
    setStreak(streakResult.streak);
    if (streakResult.leveledUp) {
      toast({ title: `Level up! You're now a ${streakResult.newLevelName}!`, description: '+10 XP earned for completing this lesson.' });
    } else if (streakResult.streakBonus) {
      toast({ title: `🔥 7-day streak! +100 bonus XP`, description: 'You\'ve been learning every day this week.' });
    }

    setMarking(false);

    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.75 },
      colors: ['#7c3aed', '#2563eb', '#10b981', '#f59e0b'],
      scalar: 0.9,
    });

    const prevPct = Math.round((prevCompleted / lessons.length) * 100);
    const milestone = ([25, 50, 75, 100] as const).find(m => prevPct < m && pct >= m);
    if (milestone) {
      const { title, description } = MILESTONE_MESSAGES[milestone];
      toast({ title, description });
    }

    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx < lessons.length - 1) setActiveLessonId(lessons[currentIdx + 1].id);
  };

  const handleQuizPass = () => {
    if (!activeLesson || !course) return;
    setPassedModules(prev => [...new Set([...prev, activeLesson.module_id])]);
    if (isFinalExam(course.title)) {
      setViewMode('certificate');
    } else {
      setViewMode('reading');
    }
  };

  const handleDownloadCertificate = async () => {
    if (!user || !course) return;
    const cert = getCertForCourse(course.title);
    setDownloading(true);
    await generateCertificate({
      userId: user.id,
      userName: user.name,
      courseName: cert ? cert.shortName : course.title,
      completedAt: new Date().toISOString(),
    });
    setDownloading(false);
  };

  const handleQuizRetry = () => setViewMode('reading');

  const handleNextLesson = () => {
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx >= lessons.length - 1) return;
    const next = lessons[currentIdx + 1];
    if (!isLessonLocked(next)) setActiveLessonId(next.id);
  };

  const moduleGroups = lessons.reduce((acc, lesson) => {
    const mod = getModuleName(lesson);
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(lesson);
    return acc;
  }, {} as Record<string, DBLesson[]>);

  if (authLoading) return <div className="h-dvh flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading) return <div className="h-dvh flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (notEnrolled) return (
    <div className="h-dvh flex flex-col items-center justify-center bg-background text-center p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Not Enrolled</h2>
      <p className="text-muted-foreground mb-6">You must enroll in this course before accessing lessons.</p>
      <button type="button" onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
        Browse Courses
      </button>
    </div>
  );
  if (!course) return <div className="h-dvh flex items-center justify-center bg-background text-foreground"><p>Course not found.</p></div>;
  if (lessons.length === 0) return (
    <div className="h-dvh flex flex-col items-center justify-center bg-background text-center p-8">
      <BookOpen className="w-16 h-16 text-muted-foreground/20 mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">No lessons available yet</h2>
      <p className="text-muted-foreground text-sm mb-6">This course doesn't have any lessons yet. Please check back soon.</p>
      <button type="button" onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
        Browse Courses
      </button>
    </div>
  );

  const completedCount = progress.filter(p => p.completed).length;
  const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">

      {/* Top Navbar */}
      <div className="h-14 shrink-0 bg-card border-b border-border flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="h-5 w-px bg-border shrink-0" />
          <span className="font-semibold text-foreground text-sm truncate max-w-[140px] md:max-w-xs">{course.title}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div ref={navProgressRef} className="h-full bg-primary rounded-full transition-[width] duration-300" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{completedCount}/{lessons.length} lessons</span>
        </div>
        <button
          type="button"
          aria-label={sidebarOpen ? 'Close lesson sidebar' : 'Open lesson sidebar'}
          className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="md:hidden absolute inset-0 z-10 bg-black/40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-background min-w-0">

          {viewMode === 'certificate' && course ? (
            /* ── Certificate completion screen ── */
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 overflow-y-auto">
              <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
                    <Trophy size={36} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">Congratulations!</h1>
                  <p className="text-muted-foreground text-sm">You've passed the final exam</p>
                </div>

                {/* Certificate card */}
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 mb-6 shadow-xl shadow-cyan-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-cyan-500/40" />
                  <div className="relative p-6 sm:p-8 text-center">
                    <img src="/nobztech  logo.jpeg" alt="NobzTech" className="w-16 h-16 rounded-full mx-auto mb-4 object-cover ring-2 ring-cyan-500/40" />
                    <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Certificate of Completion</p>
                    <div className="w-24 h-px bg-cyan-500/40 mx-auto mb-4" />
                    <p className="text-gray-400 text-xs mb-2">This certifies that</p>
                    <p className="text-white text-2xl font-bold mb-1">{user?.name}</p>
                    <div className="w-32 h-px bg-cyan-500/50 mx-auto mb-4" />
                    <p className="text-gray-400 text-xs mb-2">has successfully completed</p>
                    <p className="text-cyan-400 text-base font-bold leading-snug mb-4">
                      {getCertForCourse(course.title)?.certName ?? course.title}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-cyan-500 text-xs font-bold tracking-widest">NOBZTECH</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadCertificate}
                    disabled={downloading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold transition-colors disabled:opacity-60 shadow-lg shadow-cyan-500/20"
                  >
                    {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {downloading ? 'Generating PDF…' : 'Download Certificate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold transition-colors border border-border"
                  >
                    Go to Dashboard <ArrowRight size={16} />
                  </button>
                </div>

                {/* Share buttons */}
                {(() => {
                  const certName = getCertForCourse(course.title)?.certName ?? course.title;
                  const shareText = encodeURIComponent(`🎓 I just earned the "${certName}" certificate from NobzLearn! Check out the programme at https://nobzlearn.co.za`);
                  const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent('https://nobzlearn.co.za')}&title=${encodeURIComponent(certName)}&summary=${encodeURIComponent(`I just earned the ${certName} from NobzLearn!`)}`;
                  const whatsappUrl = `https://wa.me/?text=${shareText}`;
                  return (
                    <div className="mt-2">
                      <p className="text-xs text-center text-muted-foreground mb-3">Share your achievement</p>
                      <div className="flex gap-3">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Recommended next course */}
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Up next in the programme</p>
                    <p className="text-sm font-bold text-foreground truncate">Browse your next module in the Course Catalog</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/courses')}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
                  >
                    View <ArrowRight size={12} className="inline ml-1" />
                  </button>
                </div>
              </div>
            </div>

          ) : viewMode === 'quiz' && activeLesson ? (
            <Quiz
              questions={quizQuestions}
              courseId={id!}
              moduleId={activeLesson.module_id}
              moduleName={getModuleName(activeLesson)}
              userId={user!.id}
              onPass={handleQuizPass}
              onRetry={handleQuizRetry}
              skipResultsOnPass={isFinalExam(course.title)}
            />

          ) : (
            <>
              {/* Reading pane */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Scroll progress bar */}
                <div className="h-0.5 bg-secondary shrink-0">
                  <div ref={scrollBarRef} className="h-full bg-primary transition-[width] duration-150 ease-out w-0" />
                </div>

                <div ref={readingPaneRef} onScroll={handleReadingScroll} className="flex-1 overflow-y-auto">
                {loadingQuiz ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Loading quiz...</p>
                    </div>
                  </div>
                ) : activeLesson ? (
                  <div
                    key={activeLessonId}
                    className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-3 duration-300"
                  >
                    {/* Lesson header */}
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-3 animate-in fade-in slide-in-from-top-2 duration-500 [animation-fill-mode:both] anim-delay-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
                          <BookOpen size={12} /> {getModuleName(activeLesson)}
                        </span>
                        {activeLesson.duration_minutes > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {activeLesson.duration_minutes} min read
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500 [animation-fill-mode:both] anim-delay-80">
                        {activeLesson.title}
                      </h1>
                      {activeLesson.description && (
                        <p className="text-muted-foreground text-base leading-relaxed animate-in fade-in duration-500 [animation-fill-mode:both] anim-delay-160">
                          {activeLesson.description}
                        </p>
                      )}
                      <div className="mt-6 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent animate-in fade-in duration-700 [animation-fill-mode:both] anim-delay-220" />
                    </div>

                    {/* Lesson content */}
                    {(activeLesson as any).content ? (
                      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                        prose-headings:text-foreground prose-headings:font-bold
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                        prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:mb-4
                        prose-ul:text-foreground/80 prose-ul:space-y-1 prose-ul:my-3
                        prose-ol:text-foreground/80 prose-ol:space-y-1 prose-ol:my-3
                        prose-li:marker:text-primary
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                        prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-table:w-full prose-table:border-collapse
                        prose-th:bg-secondary prose-th:text-foreground prose-th:font-semibold prose-th:px-4 prose-th:py-2 prose-th:border prose-th:border-border prose-th:text-left
                        prose-td:text-foreground/80 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-border
                        prose-tr:even:bg-secondary/30
                      ">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h2: ({ children, ...props }) => (
                              <RevealOnScroll tag="h2" {...props}>{children}</RevealOnScroll>
                            ),
                            h3: ({ children, ...props }) => (
                              <RevealOnScroll tag="h3" {...props}>{children}</RevealOnScroll>
                            ),
                            blockquote: ({ children, ...props }) => (
                              <RevealOnScroll tag="blockquote" {...props}>{children}</RevealOnScroll>
                            ),
                          }}
                        >{(activeLesson as any).content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-sm">Lesson content coming soon.</p>
                      </div>
                    )}

                    {/* End of lesson action */}
                    <RevealOnScroll delay={100}>
                    {(() => {
                      const allDone = lessons.length > 0 && lessons.every(l => isCompleted(l.id));
                      const quizPassed = isModulePassed(activeLesson.module_id);

                      if (!isCompleted(activeLesson.id)) {
                        return (
                          <div className="mt-12 pt-8 border-t border-border text-center">
                            <p className="text-muted-foreground text-sm">
                              Done reading? Tap <span className="font-semibold text-primary">Mark as Read</span> in the bar below to continue.
                            </p>
                          </div>
                        );
                      }

                      if (allDone && !quizPassed) {
                        return (
                          <div className="mt-12 pt-8 border-t border-border text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-500/20 mb-5">
                              <CheckCircle size={14} /> All lessons complete!
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">
                              You've finished all lessons. Take the quiz to complete this course.
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                setLoadingQuiz(true);
                                const q = await fetchQuizQuestions(id!, activeLesson.module_id);
                                setLoadingQuiz(false);
                                if (q.length > 0) {
                                  setQuizQuestions(q);
                                  setViewMode('quiz');
                                } else {
                                  // No quiz questions in DB — auto-pass so user can progress
                                  handleQuizPass();
                                  toast({ title: 'Course complete!', description: 'All lessons done — moving to next step.' });
                                }
                              }}
                              disabled={loadingQuiz}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-colors disabled:opacity-60 shadow-sm"
                            >
                              {loadingQuiz ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                              {loadingQuiz ? 'Loading...' : 'Take Course Quiz'}
                            </button>
                          </div>
                        );
                      }

                      if (allDone && quizPassed) {
                        return (
                          <div className="mt-12 pt-8 border-t border-border text-center space-y-3">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border border-emerald-500/20">
                              <CheckCircle size={15} /> Course Complete!
                            </span>
                            <p className="text-muted-foreground text-xs">
                              Head to your dashboard to download your certificate.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="mt-12 pt-8 border-t border-border text-center">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-500/20">
                            <CheckCircle size={14} /> Lesson complete — continue to the next one
                          </span>
                        </div>
                      );
                    })()}
                    </RevealOnScroll>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BookOpen className="w-16 h-16 text-muted-foreground/20 mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Select a Lesson</h2>
                    <p className="text-muted-foreground text-sm">Choose a lesson from the sidebar to start reading</p>
                  </div>
                )}
              </div>
              </div>

              {/* Bottom bar */}
              <div className="bg-card border-t border-border flex items-center justify-between px-4 py-3 shrink-0 gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Now Reading</p>
                  <p className="text-sm font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs">
                    {activeLesson?.title || 'No lesson selected'}
                  </p>
                </div>

                {activeLesson && !isCompleted(activeLesson.id) ? (
                  /* Primary action: Mark as Read */
                  <button
                    type="button"
                    onClick={handleMarkRead}
                    disabled={marking}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0 shadow-glow"
                  >
                    {marking
                      ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                      : <><CheckCircle size={14} /> Mark as Read</>}
                  </button>
                ) : (
                  /* Secondary action: Next lesson */
                  <button
                    type="button"
                    onClick={handleNextLesson}
                    disabled={(() => {
                      const idx = lessons.findIndex(l => l.id === activeLessonId);
                      if (idx >= lessons.length - 1) return true;
                      return isLessonLocked(lessons[idx + 1]);
                    })()}
                    aria-label="Go to next lesson"
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 border border-border"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className={`
          absolute md:relative right-0 top-0 bottom-0 z-20
          w-72 shrink-0 bg-card border-l border-border
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:block
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className="font-bold text-foreground text-sm truncate">{course.title}</h3>
                  {streak > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold shrink-0">
                      <Flame size={11} /> {streak}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{lessons.length} lessons • {overallProgress}% complete</p>
                <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                  <div ref={sidebarProgressRef} className="h-full bg-primary rounded-full transition-[width] duration-300" />
                </div>
              </div>
              <button
                type="button"
                className="md:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 mt-0.5"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close lesson sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {Object.entries(moduleGroups).map(([moduleName, modLessons], moduleIdx) => {
                const firstLesson = modLessons[0];
                const locked = isLessonLocked(firstLesson);
                const passed = isModulePassed(firstLesson.module_id);
                return (
                  <div key={moduleName}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        passed ? 'bg-emerald-500' : locked ? 'bg-secondary' : 'bg-primary/20 text-primary'
                      }`}>
                        {passed
                          ? <CheckCircle size={11} className="text-white" />
                          : locked
                          ? <Lock size={10} className="text-muted-foreground" />
                          : moduleIdx + 1}
                      </div>
                      <h4 className={`font-semibold text-xs uppercase tracking-wide ${locked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        {moduleName}
                      </h4>
                      {passed && <span className="ml-auto text-xs text-emerald-500 font-semibold">Passed</span>}
                      {locked && <span className="ml-auto text-xs text-muted-foreground/50 font-semibold">Locked</span>}
                    </div>

                    <div className="space-y-1">
                      {modLessons.map((lesson) => {
                        const active = activeLessonId === lesson.id;
                        const done = isCompleted(lesson.id);
                        const lessonLocked = isLessonLocked(lesson);
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              if (lessonLocked) return;
                              setActiveLessonId(lesson.id);
                              setViewMode('reading');
                              if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            disabled={lessonLocked}
                            className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 ${
                              lessonLocked ? 'opacity-40 cursor-not-allowed' :
                              active ? 'bg-primary/10 border border-primary/30' :
                              'hover:bg-secondary border border-transparent'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              done ? 'bg-emerald-500' : active ? 'bg-primary' : 'bg-secondary'
                            }`}>
                              {lessonLocked
                                ? <Lock size={10} className="text-muted-foreground" />
                                : done
                                ? <CheckCircle size={12} className="text-white" />
                                : <span className="text-xs font-bold text-foreground">{lesson.order_index}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium leading-tight mb-1 ${active ? 'text-foreground' : 'text-foreground/70'}`}>
                                {lesson.title}
                              </p>
                              <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min read</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
