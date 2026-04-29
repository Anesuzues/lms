import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Maximize2, Menu, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import VideoPlayer from '@/components/VideoPlayer';
import {
  fetchCourseById,
  fetchLessonsByCourse,
  fetchLessonProgress,
  markLessonComplete,
  updateEnrollmentProgress,
  DBCourse,
  DBLesson,
  LessonProgress,
} from '@/services/courseService';

// Each lesson's position (1-4) maps directly to a module
const MODULE_NAMES = [
  'Workplace Foundations',
  'CV Writing & AI Tools',
  'Interview Readiness',
  'Professional Conduct',
];

const getModuleName = (lesson: DBLesson) => {
  return MODULE_NAMES[(lesson.position ?? lesson.order_index) - 1] ?? `Module ${lesson.position}`;
};

const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<DBCourse | null>(null);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" />;

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      setLoading(true);
      const [c, l, p] = await Promise.all([
        fetchCourseById(id),
        fetchLessonsByCourse(id),
        fetchLessonProgress(user.id, id),
      ]);
      setCourse(c);
      setLessons(l);
      setProgress(p);
      if (l.length > 0) setActiveLessonId(l[0].id);
      setLoading(false);
    };
    load();
  }, [id, user?.id]);

  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const isCompleted = (lessonId: string) => progress.some(p => p.lesson_id === lessonId && p.completed);

  const handleMarkComplete = async () => {
    if (!user || !id || !activeLessonId) return;
    await markLessonComplete(user.id, id, activeLessonId);
    const updated = [...progress.filter(p => p.lesson_id !== activeLessonId), { lesson_id: activeLessonId, completed: true, completed_at: new Date().toISOString() }];
    setProgress(updated);

    // Update overall course progress
    const pct = Math.round((updated.filter(p => p.completed).length / lessons.length) * 100);
    await updateEnrollmentProgress(user.id, id, pct);

    // Auto-advance to next lesson
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx < lessons.length - 1) {
      setActiveLessonId(lessons[currentIdx + 1].id);
    }
  };

  const handleNextLesson = () => {
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx < lessons.length - 1) setActiveLessonId(lessons[currentIdx + 1].id);
  };

  // Group lessons by module
  const moduleGroups = lessons.reduce((acc, lesson) => {
    const mod = getModuleName(lesson);
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(lesson);
    return acc;
  }, {} as Record<string, DBLesson[]>);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <p>Course not found.</p>
      </div>
    );
  }

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

        {/* Progress */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-medium">{completedCount}/{lessons.length} lessons</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <Maximize2 size={18} />
          </button>
          <button
            className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Video Area */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 relative">
            {activeLesson ? (
              <VideoPlayer
                videoUrl={activeLesson.video_url || ''}
                videoType={activeLesson.video_type}
                title={activeLesson.title}
                className="w-full h-full"
              />
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
                <button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                >
                  <CheckCircle size={15} /> Mark Complete
                </button>
              )}
              {activeLesson && isCompleted(activeLesson.id) && (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-900/50 text-emerald-400 text-sm font-semibold">
                  <CheckCircle size={15} /> Completed
                </span>
              )}
              <button
                onClick={handleNextLesson}
                disabled={lessons.findIndex(l => l.id === activeLessonId) >= lessons.length - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          w-72 shrink-0 absolute md:relative right-0 top-0 bottom-0 z-10 bg-gray-900 border-l border-gray-800
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
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
              {Object.entries(moduleGroups).map(([moduleName, modLessons], moduleIdx) => (
                <div key={moduleName}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {moduleIdx + 1}
                    </div>
                    <h4 className="font-semibold text-xs text-gray-300 uppercase tracking-wide">{moduleName}</h4>
                  </div>

                  <div className="space-y-1">
                    {modLessons.map((lesson) => {
                      const active = activeLessonId === lesson.id;
                      const done = isCompleted(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLessonId(lesson.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
                          className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 ${
                            active ? 'bg-primary/20 border border-primary/30' : 'hover:bg-gray-800 border border-transparent'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            done ? 'bg-emerald-500' : active ? 'bg-primary' : 'bg-gray-700'
                          }`}>
                            {done ? <CheckCircle size={12} className="text-white" /> : (
                              <span className="text-xs font-bold text-white">{lesson.order_index}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium leading-tight mb-1 ${active ? 'text-white' : 'text-gray-300'}`}>
                              {lesson.title}
                            </p>
                            <span className="text-xs text-gray-500">{lesson.duration_minutes} min</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
