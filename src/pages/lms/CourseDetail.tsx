import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, CheckCircle, User, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchCourseById, fetchLessonsByCourse, fetchUserEnrollments, DBCourse, DBLesson } from '@/services/courseService';
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

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [c, l] = await Promise.all([
        fetchCourseById(id),
        fetchLessonsByCourse(id),
      ]);
      setCourse(c);
      setLessons(l);

      if (user) {
        const enrollments = await fetchUserEnrollments(user.id);
        setIsEnrolled(enrollments.some(e => e.course_id === id));
      }
      setLoading(false);
    };
    load();
  }, [id, user?.id, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to enroll.", variant: "destructive" });
      navigate('/login');
      return;
    }
    setEnrolling(true);
    await enrollInCourse(course!.id);
    setIsEnrolled(true);
    setEnrolling(false);
    toast({ title: "Enrolled!", description: `You're now enrolled in ${course!.title}.` });
    navigate(`/learn/${course!.id}`);
  };

  const MODULE_NAMES = ['Workplace Foundations', 'CV Writing & AI Tools', 'Interview Readiness', 'Professional Conduct'];
  const moduleGroups = MODULE_NAMES.map((name, i) => ({
    name,
    lessons: lessons.filter(l => (l.position ?? l.order_index) === i + 1),
  })).filter(m => m.lessons.length > 0);

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
            <button onClick={() => navigate('/courses')} className="text-primary hover:underline">Return to Catalog</button>
          </div>
        </div>
      </div>
    );
  }

  const thumbnail = course.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800';
  const price = course.price === 0 ? 'Free' : `$${course.price}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 mt-16 max-w-6xl">
        <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-3 capitalize">
                {course.level}
              </span>
              <h1 className="font-bold text-3xl md:text-4xl mb-4 text-foreground leading-tight">{course.title}</h1>
              <p className="text-muted-foreground text-base leading-relaxed">{course.description}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 py-6 border-y border-border">
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
                  <p className="font-bold text-foreground">NexaLearn Team</p>
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
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
                <div className="relative">
                  <img src={thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <PlayCircle size={28} className="text-primary ml-0.5" />
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
                    <button onClick={() => navigate(`/learn/${course.id}`)} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow">
                      Continue Learning
                    </button>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrolling} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
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
