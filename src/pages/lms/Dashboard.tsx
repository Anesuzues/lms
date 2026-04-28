import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Trophy, Clock, ArrowRight, PlayCircle, Compass } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { getCourseById, MOCK_COURSES } from '@/services/mockData';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  const enrolledCoursesData = user.enrolledCourses
    .map(id => getCourseById(id))
    .filter(Boolean);

  // Stable mock progress per course (based on id hash, not random)
  const getProgress = (id: string) => ((id.charCodeAt(0) * 17) % 71) + 10;

  const lastCourse = enrolledCoursesData[enrolledCoursesData.length - 1];
  const totalMinutes = enrolledCoursesData.length * 45;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 mt-16 max-w-7xl">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 mb-10 text-primary-foreground">
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
            <Link
              to="/courses"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-colors backdrop-blur-sm border border-white/20"
            >
              <Compass size={16} /> Browse Courses
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Enrolled', value: enrolledCoursesData.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Trophy, label: 'Completed', value: 0, color: 'text-amber-500', bg: 'bg-amber-50' },
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

        {/* Continue Learning */}
        {lastCourse && (
          <div className="mb-10">
            <h2 className="font-bold text-xl text-foreground mb-4">Continue Where You Left Off</h2>
            <div className="bg-card rounded-2xl border border-border shadow-soft p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-0.5 transition-transform">
              <img src={lastCourse.thumbnail} alt={lastCourse.title} className="w-full sm:w-32 h-24 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">{lastCourse.instructor}</p>
                <h3 className="font-bold text-foreground text-lg leading-tight mb-2 truncate">{lastCourse.title}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${getProgress(lastCourse.id)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-primary shrink-0">{getProgress(lastCourse.id)}%</span>
                </div>
              </div>
              <Link
                to={`/learn/${lastCourse.id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-glow shrink-0"
              >
                <PlayCircle size={16} /> Resume
              </Link>
            </div>
          </div>
        )}

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl text-foreground">My Learning Path</h2>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>

          {enrolledCoursesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCoursesData.map(course => (
                <CourseCard key={course!.id} course={course!} enrolled progress={getProgress(course!.id)} />
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

      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
