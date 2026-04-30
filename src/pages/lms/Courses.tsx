import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard, { CourseCardCourse } from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { fetchCourses, fetchUserEnrollments, DBCourse, DBEnrollment } from '@/services/courseService';

// Map DB course to the shape CourseCard expects
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

const Courses = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<ReturnType<typeof mapCourse>[]>([]);
  const [enrollments, setEnrollments] = useState<DBEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch until auth has resolved
    if (authLoading) return;
    const load = async () => {
      setLoading(true);
      const [dbCourses, dbEnrollments] = await Promise.all([
        fetchCourses(),
        user ? fetchUserEnrollments(user.id) : Promise.resolve([]),
      ]);
      setCourses(dbCourses.map(mapCourse));
      setEnrollments(dbEnrollments);
      setLoading(false);
    };
    load();
  }, [authLoading, user?.id, user]);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgress = (courseId: string) => {
    const e = enrollments.find(e => e.course_id === courseId);
    return e?.progress ?? 0;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 mt-16 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-bold text-4xl text-foreground mb-2">Course Catalog</h1>
            <p className="text-muted-foreground max-w-xl">
              Build the skills you need to thrive in the modern workplace.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User strip */}
        {user ? (
          <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-sm text-foreground">Welcome back, <span className="font-bold text-primary">{user.name}</span>! Ready to continue learning?</span>
            <Link to="/dashboard" className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
              My Dashboard →
            </Link>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Sign in to track your progress and access enrolled courses.</span>
            <Link to="/login" className="text-sm font-semibold border border-border px-4 py-2 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap">
              Sign In
            </Link>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => {
              const isEnrolled = enrollments.some(e => e.course_id === course.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={isEnrolled}
                  progress={getProgress(course.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-card rounded-2xl border border-border">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No courses found matching "{searchQuery}"</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
