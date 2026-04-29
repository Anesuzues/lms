import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Trophy, Clock, ArrowRight, PlayCircle, Compass, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard, { CourseCardCourse } from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCourseById, fetchUserEnrollments, DBCourse, DBEnrollment } from '@/services/courseService';

interface EnrolledCourse {
  course: DBCourse;
  enrollment: DBEnrollment;
}

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const enrollments = await fetchUserEnrollments(user.id);
        if (enrollments.length === 0) { setEnrolledCourses([]); setLoading(false); return; }
        const courses = await Promise.all(
          enrollments.map(async (e) => {
            const course = await fetchCourseById(e.course_id);
            return course ? { course, enrollment: e } : null;
          })
        );
        setEnrolledCourses(courses.filter(Boolean) as EnrolledCourse[]);
      } catch (err) {
        console.error('Dashboard load error:', err);
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
  const totalMinutes = enrolledCourses.length * 45;
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
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 mb-8 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg" />
              <div>
                <p className="text-white/70 text-sm font-medium mb-0.5">Welcome back,</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{user.name}</h1>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold capitalize">{user.role}</span>
              </div>
            </div>
            <Link to="/courses" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-colors backdrop-blur-sm border border-white/20">
              <Compass size={16} /> Browse Courses
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Trophy, label: 'Completed', value: completedCount, color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Clock, label: 'Hours Spent', value: `${Math.round(totalMinutes / 60)}h`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-card rounded-2xl p-5 border border-border shadow-soft flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
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
                    className="w-full sm:w-32 h-24 rounded-xl object-cover shrink-0"
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

              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(({ course, enrollment }) => (
                    <CourseCard
                      key={course.id}
                      course={mapCourse(course)}
                      enrolled
                      progress={enrollment.progress}
                    />
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
