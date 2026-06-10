import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, CheckCircle, User, ArrowLeft, Loader2, Lock, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchCourseById, fetchLessonsByCourse, fetchUserEnrollments, fetchCourses, enrollUserInPathway, DBCourse, DBLesson } from '@/services/courseService';
import { getCertForCourse, getPrerequisiteTitles, isFinalExam } from '@/lib/programmeConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, enrollInCourse } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<DBCourse | null>(null);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [pathwayCourseIds, setPathwayCourseIds] = useState<string[]>([]);

  // Prerequisite state
  const [prerequisitesMet, setPrerequisitesMet] = useState(true);
  const [missingPrereqs, setMissingPrereqs] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessonsByCourse(id)]);
      setCourse(c);
      setLessons(l);

      if (user && c) {
        const [enrollments, allCourses] = await Promise.all([
          fetchUserEnrollments(user.id),
          fetchCourses(),
        ]);
        setIsEnrolled(enrollments.some(e => e.course_id === id));

        const cert = getCertForCourse(c.title);
        if (cert) {
          // Collect all courses in this cert pathway (non-exam first, then exam)
          const nonExam = allCourses.filter(ac => {
            const ac_cert = getCertForCourse(ac.title);
            return ac_cert?.number === cert.number && !isFinalExam(ac.title);
          });
          const exams = allCourses.filter(ac => {
            const ac_cert = getCertForCourse(ac.title);
            return ac_cert?.number === cert.number && isFinalExam(ac.title);
          });
          setPathwayCourseIds([...nonExam, ...exams].map(ac => ac.id));

          if (isFinalExam(c.title)) {
            // Final exam: ALL non-exam courses in cert must be 100%
            const prereqTitles = getPrerequisiteTitles(cert);
            const prereqCourses = allCourses.filter(ac =>
              prereqTitles.some(t => ac.title.toLowerCase().includes(t.toLowerCase()))
            );
            const missing = prereqCourses
              .filter(pc => {
                const enrollment = enrollments.find(e => e.course_id === pc.id);
                return !enrollment || (enrollment.progress ?? 0) < 100;
              })
              .map(pc => pc.title);
            setMissingPrereqs(missing);
            setPrerequisitesMet(missing.length === 0);
          } else {
            // Regular course: the previous course in the pathway must be 100%
            const certCourses = allCourses.filter(ac => {
              const ac_cert = getCertForCourse(ac.title);
              return ac_cert?.number === cert.number && !isFinalExam(ac.title);
            });
            const idx = certCourses.findIndex(ac => ac.id === id);
            if (idx > 0) {
              const prev = certCourses[idx - 1];
              const prevEnrollment = enrollments.find(e => e.course_id === prev.id);
              if (!prevEnrollment || (prevEnrollment.progress ?? 0) < 100) {
                setMissingPrereqs([prev.title]);
                setPrerequisitesMet(false);
              }
            }
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [id, user?.id, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to enroll.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (!prerequisitesMet) return;
    setEnrolling(true);
    // Enroll in the entire pathway so sequential unlocking works from the start
    if (pathwayCourseIds.length > 0) {
      await enrollUserInPathway(user.id, pathwayCourseIds);
    } else {
      await enrollInCourse(course!.id);
    }
    setIsEnrolled(true);
    setEnrolling(false);
    toast({ title: 'Enrolled!', description: `You're now enrolled in ${course!.title}.` });
    navigate(`/learn/${course!.id}`);
  };

  const MODULE_NAMES = ['Workplace Foundations', 'CV Writing & AI Tools', 'Interview Readiness', 'Professional Conduct'];
  const moduleGroups = MODULE_NAMES.map((name, i) => ({
    name,
    lessons: lessons.filter(l => (l.position ?? l.order_index) === i + 1),
  })).filter(m => m.lessons.length > 0);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <button type="button" onClick={() => navigate('/courses')} className="text-primary hover:underline">
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const thumbnail = course.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800';
  const price = course.price === 0 ? 'Free' : `$${course.price}`;
  const courseIsFinalExam = isFinalExam(course.title);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 mt-16 max-w-6xl">
        <button type="button" onClick={() => navigate('/courses')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold capitalize">
                  {course.level}
                </span>
                {courseIsFinalExam && (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    Final Examination
                  </span>
                )}
              </div>
              <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-4 text-foreground leading-tight">{course.title}</h1>
              <p className="text-muted-foreground text-base leading-relaxed">{course.description}</p>
            </div>

            {/* Prerequisite warning — shown for any locked course, including the final exam */}
            {!isEnrolled && !prerequisitesMet && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">
                      {courseIsFinalExam ? 'Complete all modules first' : 'Complete the previous course first'}
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {courseIsFinalExam
                        ? 'You must complete all prerequisite courses at 100% before taking the final exam.'
                        : 'Courses unlock sequentially: finish the course below before continuing.'}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5 ml-7">
                  {missingPrereqs.map(title => (
                    <li key={title} className="flex items-center gap-2 text-xs text-amber-700">
                      <AlertCircle size={12} className="shrink-0 text-amber-500" />
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 sm:gap-6 py-5 sm:py-6 border-y border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-bold text-foreground">{course.duration || 'Self-paced'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                  <p className="font-bold text-foreground">{lessons.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                  <p className="font-bold text-foreground">NobzTech Team</p>
                </div>
              </div>
            </div>

            {/* Syllabus */}
            {moduleGroups.length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-4 text-foreground">Course Syllabus</h3>
                <div className="space-y-3">
                  {moduleGroups.map((mod, idx) => (
                    <div key={mod.name} className="p-5 rounded-2xl bg-card border border-border">
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <span className="text-primary text-sm">Module {idx + 1}:</span> {mod.name}
                      </h4>
                      <ul className="space-y-2">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 text-muted-foreground text-sm">
                            <PlayCircle size={15} className="text-primary/60 shrink-0" />
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded font-medium">{lesson.duration_minutes} min</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: CTA */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
                <div className="relative">
                  <img src={thumbnail} alt={course.title} loading="lazy" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      {!prerequisitesMet && !isEnrolled
                        ? <Lock size={24} className="text-amber-500" />
                        : <PlayCircle size={28} className="text-primary ml-0.5" />}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {isEnrolled ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4 justify-center">
                      <CheckCircle size={18} />
                      <span className="font-bold text-sm">You're enrolled</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-foreground mb-4">{price}</p>
                  )}

                  {isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow"
                    >
                      Continue Learning
                    </button>
                  ) : !prerequisitesMet ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 rounded-xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-amber-200"
                    >
                      <Lock size={16} /> {courseIsFinalExam ? 'Complete Modules First' : 'Complete Previous Course First'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {enrolling ? <><Loader2 size={16} className="animate-spin" /> Enrolling...</> : 'Enroll Now'}
                    </button>
                  )}

                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {['Full lifetime access', 'Access on mobile and web', 'Certificate of completion'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
