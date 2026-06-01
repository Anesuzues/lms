import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Menu, CheckCircle, Loader2, ChevronRight, Lock, ClipboardList, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Quiz from '@/components/lms/Quiz';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  fetchCourseById, fetchLessonsByCourse, fetchLessonProgress,
  markLessonComplete, updateEnrollmentProgress, fetchUserEnrollments,
  DBCourse, DBLesson, LessonProgress,
} from '@/services/courseService';
import {
  fetchQuizQuestions, fetchAllPassedModules, QuizQuestion,
} from '@/services/quizService';

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

type ViewMode = 'reading' | 'quiz';

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

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        const enrollments = await fetchUserEnrollments(user.id);
        const isEnrolled = enrollments.some(e => e.course_id === id);
        if (!isEnrolled) { setNotEnrolled(true); setLoading(false); return; }

        const [c, l, p, passed] = await Promise.all([
          fetchCourseById(id),
          fetchLessonsByCourse(id),
          fetchLessonProgress(user.id, id),
          fetchAllPassedModules(user.id, id),
        ]);
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

  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const isCompleted = (lessonId: string) => progress.some(p => p.lesson_id === lessonId && p.completed);
  const isModulePassed = (moduleId: string) => passedModules.includes(moduleId);

  const isLessonLocked = (lesson: DBLesson) => {
    const pos = lesson.position ?? lesson.order_index;
    if (pos <= 1) return false;
    const prevLesson = lessons.find(l => (l.position ?? l.order_index) === pos - 1);
    if (!prevLesson) return false;
    return !isCompleted(prevLesson.id) || !isModulePassed(prevLesson.module_id);
  };

  const handleMarkRead = async () => {
    if (!user || !id || !activeLessonId || !activeLesson || marking) return;
    setMarking(true);
    await markLessonComplete(user.id, id, activeLessonId, 0);
    const updated = [
      ...progress.filter(p => p.lesson_id !== activeLessonId),
      { lesson_id: activeLessonId, completed: true, completed_at: new Date().toISOString() },
    ];
    setProgress(updated);
    const pct = Math.round((updated.filter(p => p.completed).length / lessons.length) * 100);
    await updateEnrollmentProgress(user.id, id, pct);

    setLoadingQuiz(true);
    const questions = await fetchQuizQuestions(id, activeLesson.module_id);
    setLoadingQuiz(false);
    setMarking(false);

    if (questions.length > 0) {
      setQuizQuestions(questions);
      setViewMode('quiz');
    } else {
      const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
      if (currentIdx < lessons.length - 1) setActiveLessonId(lessons[currentIdx + 1].id);
    }
  };

  const handleQuizPass = () => {
    if (!activeLesson) return;
    setPassedModules(prev => [...new Set([...prev, activeLesson.module_id])]);
    setViewMode('reading');
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx < lessons.length - 1) setActiveLessonId(lessons[currentIdx + 1].id);
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
      <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
        Browse Courses
      </button>
    </div>
  );
  if (!course) return <div className="h-dvh flex items-center justify-center bg-background text-foreground"><p>Course not found.</p></div>;

  const completedCount = progress.filter(p => p.completed).length;
  const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="h-dvh flex flex-col bg-gray-950 overflow-hidden">

      {/* Top Navbar */}
      <div className="h-14 shrink-0 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0">
            <ChevronLeft size={22} />
          </button>
          <div className="h-5 w-px bg-gray-700 shrink-0" />
          <span className="font-semibold text-white text-sm truncate max-w-[140px] md:max-w-xs">{course.title}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-medium">{completedCount}/{lessons.length} lessons</span>
        </div>
        <button className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={18} />
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="md:hidden absolute inset-0 z-10 bg-black/60" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-gray-950 min-w-0">

          {viewMode === 'quiz' && activeLesson ? (
            <Quiz
              questions={quizQuestions}
              courseId={id!}
              moduleId={activeLesson.module_id}
              moduleName={getModuleName(activeLesson)}
              userId={user!.id}
              onPass={handleQuizPass}
              onRetry={handleQuizRetry}
            />
          ) : (
            <>
              {/* Reading pane */}
              <div className="flex-1 overflow-y-auto">
                {loadingQuiz ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Loading quiz...</p>
                    </div>
                  </div>
                ) : activeLesson ? (
                  <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
                    {/* Lesson header */}
                    <div className="mb-8">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                        <BookOpen size={12} /> {getModuleName(activeLesson)}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                        {activeLesson.title}
                      </h1>
                      {activeLesson.description && (
                        <p className="text-gray-400 text-base leading-relaxed">{activeLesson.description}</p>
                      )}
                    </div>

                    {/* Lesson content */}
                    {(activeLesson as any).content ? (
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                        prose-headings:text-white prose-headings:font-bold
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-800 prose-h2:pb-2
                        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-200
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                        prose-ul:text-gray-300 prose-ul:space-y-1 prose-ul:my-3
                        prose-ol:text-gray-300 prose-ol:space-y-1 prose-ol:my-3
                        prose-li:marker:text-primary
                        prose-strong:text-white prose-strong:font-semibold
                        prose-blockquote:border-l-primary prose-blockquote:text-gray-400
                        prose-code:text-primary prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-table:w-full prose-table:border-collapse
                        prose-th:bg-gray-800 prose-th:text-white prose-th:font-semibold prose-th:px-4 prose-th:py-2 prose-th:border prose-th:border-gray-700 prose-th:text-left
                        prose-td:text-gray-300 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-700
                        prose-tr:even:bg-gray-900/50
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{(activeLesson as any).content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="w-12 h-12 text-gray-700 mb-4" />
                        <p className="text-gray-500 text-sm">Lesson content coming soon.</p>
                      </div>
                    )}

                    {/* End of lesson action */}
                    {!isCompleted(activeLesson.id) && (
                      <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <p className="text-gray-400 text-sm mb-4">Done reading? Mark this lesson complete to unlock the quiz.</p>
                        <button
                          onClick={handleMarkRead}
                          disabled={marking}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {marking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          {marking ? 'Saving...' : 'Mark as Read'}
                        </button>
                      </div>
                    )}

                    {isCompleted(activeLesson.id) && !isModulePassed(activeLesson.module_id) && (
                      <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <p className="text-gray-400 text-sm mb-4">Lesson complete! Take the quiz to unlock the next lesson.</p>
                        <button
                          onClick={async () => {
                            setLoadingQuiz(true);
                            const q = await fetchQuizQuestions(id!, activeLesson.module_id);
                            setLoadingQuiz(false);
                            if (q.length > 0) { setQuizQuestions(q); setViewMode('quiz'); }
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors"
                        >
                          <ClipboardList size={16} /> Take Quiz
                        </button>
                      </div>
                    )}

                    {isCompleted(activeLesson.id) && isModulePassed(activeLesson.module_id) && (
                      <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900/40 text-emerald-400 font-semibold text-sm border border-emerald-800">
                          <CheckCircle size={15} /> Lesson & Quiz Complete
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BookOpen className="w-16 h-16 text-gray-800 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Select a Lesson</h2>
                    <p className="text-gray-500 text-sm">Choose a lesson from the sidebar to start reading</p>
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 py-3 shrink-0 gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Now Reading</p>
                  <p className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-xs">{activeLesson?.title || 'No lesson selected'}</p>
                </div>
                <button
                  onClick={handleNextLesson}
                  disabled={(() => {
                    const idx = lessons.findIndex(l => l.id === activeLessonId);
                    if (idx >= lessons.length - 1) return true;
                    return isLessonLocked(lessons[idx + 1]);
                  })()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className={`
          absolute md:relative right-0 top-0 bottom-0 z-20
          w-72 shrink-0 bg-gray-900 border-l border-gray-800
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:block
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold text-white text-sm">{course.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{lessons.length} lessons • {overallProgress}% complete</p>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {Object.entries(moduleGroups).map(([moduleName, modLessons], moduleIdx) => {
                const firstLesson = modLessons[0];
                const locked = isLessonLocked(firstLesson);
                const passed = isModulePassed(firstLesson.module_id);
                return (
                  <div key={moduleName}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${passed ? 'bg-emerald-500' : locked ? 'bg-gray-700' : 'bg-primary/20 text-primary'}`}>
                        {passed ? <CheckCircle size={11} className="text-white" /> : locked ? <Lock size={10} className="text-gray-400" /> : moduleIdx + 1}
                      </div>
                      <h4 className={`font-semibold text-xs uppercase tracking-wide ${locked ? 'text-gray-600' : 'text-gray-300'}`}>{moduleName}</h4>
                      {passed && <span className="ml-auto text-xs text-emerald-500 font-semibold">Passed</span>}
                      {locked && <span className="ml-auto text-xs text-gray-600 font-semibold">Locked</span>}
                    </div>

                    <div className="space-y-1">
                      {modLessons.map((lesson) => {
                        const active = activeLessonId === lesson.id;
                        const done = isCompleted(lesson.id);
                        const lessonLocked = isLessonLocked(lesson);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (lessonLocked) return;
                              setActiveLessonId(lesson.id);
                              setViewMode('reading');
                              if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            disabled={lessonLocked}
                            className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 ${
                              lessonLocked ? 'opacity-40 cursor-not-allowed' :
                              active ? 'bg-primary/20 border border-primary/30' : 'hover:bg-gray-800 border border-transparent'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-emerald-500' : active ? 'bg-primary' : 'bg-gray-700'}`}>
                              {lessonLocked ? <Lock size={10} className="text-gray-400" /> :
                               done ? <CheckCircle size={12} className="text-white" /> :
                               <span className="text-xs font-bold text-white">{lesson.order_index}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium leading-tight mb-1 ${active ? 'text-white' : 'text-gray-300'}`}>{lesson.title}</p>
                              <span className="text-xs text-gray-500">{lesson.duration_minutes} min read</span>
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
