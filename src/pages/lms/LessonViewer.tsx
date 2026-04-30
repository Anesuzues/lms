import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Maximize2, Menu, CheckCircle, Loader2, ChevronRight, Lock, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/lms/Quiz';
import {
  fetchCourseById, fetchLessonsByCourse, fetchLessonProgress,
  markLessonComplete, updateEnrollmentProgress,
  DBCourse, DBLesson, LessonProgress,
} from '@/services/courseService';
import {
  fetchQuizQuestions, fetchAllPassedModules, QuizQuestion,
} from '@/services/quizService';

const MODULE_NAMES = [
  'Workplace Foundations',
  'CV Writing & AI Tools',
  'Interview Readiness',
  'Professional Conduct',
];

const getModuleName = (lesson: DBLesson) =>
  MODULE_NAMES[(lesson.position ?? lesson.order_index) - 1] ?? `Module ${lesson.position}`;

type ViewMode = 'video' | 'quiz';

const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<DBCourse | null>(null);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [passedModules, setPassedModules] = useState<string[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('video');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      setLoading(true);
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
      setLoading(false);
    };
    load();
  }, [id, user?.id, user]);

  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const isCompleted = (lessonId: string) => progress.some(p => p.lesson_id === lessonId && p.completed);
  const isModulePassed = (moduleId: string) => passedModules.includes(moduleId);

  // A lesson is locked if the previous module's video isn't completed OR quiz not passed
  const isLessonLocked = (lesson: DBLesson) => {
    const pos = lesson.position ?? lesson.order_index;
    if (pos <= 1) return false; // first module always unlocked
    const prevLesson = lessons.find(l => (l.position ?? l.order_index) === pos - 1);
    if (!prevLesson) return false;
    const prevVideoComplete = isCompleted(prevLesson.id);
    const prevQuizPassed = isModulePassed(prevLesson.module_id);
    return !prevVideoComplete || !prevQuizPassed;
  };

  const handleMarkComplete = async () => {
    if (!user || !id || !activeLessonId || !activeLesson) return;
    await markLessonComplete(user.id, id, activeLessonId);
    const updated = [
      ...progress.filter(p => p.lesson_id !== activeLessonId),
      { lesson_id: activeLessonId, completed: true, completed_at: new Date().toISOString() },
    ];
    setProgress(updated);
    const pct = Math.round((updated.filter(p => p.completed).length / lessons.length) * 100);
    await updateEnrollmentProgress(user.id, id, pct);

    // Load and show quiz for this module
    setLoadingQuiz(true);
    const questions = await fetchQuizQuestions(id, activeLesson.module_id);
    setLoadingQuiz(false);
    if (questions.length > 0) {
      setQuizQuestions(questions);
      setViewMode('quiz');
    } else {
      // No quiz — just advance
      const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
      if (currentIdx < lessons.length - 1) setActiveLessonId(lessons[currentIdx + 1].id);
    }
  };

  const handleQuizPass = () => {
    if (!activeLesson) return;
    setPassedModules(prev => [...new Set([...prev, activeLesson.module_id])]);
    setViewMode('video');
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx < lessons.length - 1) setActiveLessonId(lessons[currentIdx + 1].id);
  };

  const handleQuizRetry = () => {
    setViewMode('video'); // go back to video to re-watch
  };

  const handleNextLesson = () => {
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx < lessons.length - 1) {
      const nextLesson = lessons[currentIdx + 1];
      if (isLessonLocked(nextLesson)) return; // blocked
      setActiveLessonId(nextLesson.id);
    }
  };

  const moduleGroups = lessons.reduce((acc, lesson) => {
    const mod = getModuleName(lesson);
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(lesson);
    return acc;
  }, {} as Record<string, DBLesson[]>);

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!course) return <div className="h-screen flex items-center justify-center bg-background text-foreground"><p>Course not found.</p></div>;

  const completedCount = progress.filter(p => p.completed).length;
  const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">

      {/* Top Navbar */}
      <div className="h-14 shrink-0 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div className="h-5 w-px bg-gray-700" />
          <span className="font-semibold text-white text-sm hidden md:block truncate max-w-xs">{course.title}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-medium">{completedCount}/{lessons.length} lessons</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" onClick={() => document.documentElement.requestFullscreen?.()}>
            <Maximize2 size={18} />
          </button>
          <button className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-black">

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
              <div className="flex-1 relative">
                {loadingQuiz ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Loading quiz...</p>
                    </div>
                  </div>
                ) : activeLesson ? (
                  <VideoPlayer videoUrl={activeLesson.video_url || ''} videoType={activeLesson.video_type} title={activeLesson.title} className="w-full h-full" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                    <div>
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Select a Lesson</h2>
                      <p className="text-gray-400">Choose a lesson from the sidebar to start learning</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-5 shrink-0">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Now Playing</p>
                  <p className="text-sm font-semibold text-white truncate max-w-xs">{activeLesson?.title || 'No lesson selected'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeLesson && !isCompleted(activeLesson.id) && (
                    <button onClick={handleMarkComplete} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                      <CheckCircle size={15} /> Mark Complete
                    </button>
                  )}
                  {activeLesson && isCompleted(activeLesson.id) && !isModulePassed(activeLesson.module_id) && quizQuestions.length === 0 && (
                    <button
                      onClick={async () => {
                        setLoadingQuiz(true);
                        const q = await fetchQuizQuestions(id!, activeLesson.module_id);
                        setLoadingQuiz(false);
                        if (q.length > 0) { setQuizQuestions(q); setViewMode('quiz'); }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
                    >
                      <ClipboardList size={15} /> Take Quiz
                    </button>
                  )}
                  {activeLesson && isCompleted(activeLesson.id) && isModulePassed(activeLesson.module_id) && (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-900/50 text-emerald-400 text-sm font-semibold">
                      <CheckCircle size={15} /> Passed
                    </span>
                  )}
                  <button
                    onClick={handleNextLesson}
                    disabled={(() => {
                      const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
                      if (currentIdx >= lessons.length - 1) return true;
                      return isLessonLocked(lessons[currentIdx + 1]);
                    })()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className={`w-72 shrink-0 absolute md:relative right-0 top-0 bottom-0 z-10 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}>
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
                              setViewMode('video');
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
                              <span className="text-xs text-gray-500">{lesson.duration_minutes} min</span>
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
