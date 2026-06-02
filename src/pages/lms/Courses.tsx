import React, { useState, useEffect } from 'react';
import { Search, Loader2, Trophy, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard, { CourseCardCourse } from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { fetchCourses, fetchUserEnrollments, DBCourse, DBEnrollment } from '@/services/courseService';

// ─── Certificate programme structure ─────────────────────────────────────────
const CERTIFICATES = [
  {
    number: 1,
    name: 'Certified AI Digital Professional',
    description: 'Master workplace readiness, AI tools, and digital productivity to launch your professional career.',
    level: 'Beginner' as const,
    modules: 3,
    gradient: 'from-blue-600 to-cyan-500',
    badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    courseTitles: [
      'Workplace Foundations',
      'Working Smarter with AI',
      'Digital Productivity for Professionals',
      'Certificate 1 Final Exam',
      'Certified AI Digital Professional — Final Exam',
    ],
  },
  {
    number: 2,
    name: 'Certified Junior Software Developer',
    description: 'Go from zero to job-ready — learn programming, web development, and how to build real applications.',
    level: 'Intermediate' as const,
    modules: 6,
    gradient: 'from-violet-600 to-purple-500',
    badge: 'bg-violet-500/20 text-violet-200 border-violet-400/30',
    courseTitles: [
      'Introduction to Programming',
      'Programming with AI Assistance',
      'Web Development Fundamentals',
      'Understanding Software Projects',
      'Debugging and Problem Solving',
      'Building Real Applications',
      'Certificate 2 Final Exam',
      'Certified Junior Software Developer — Final Exam',
    ],
  },
  {
    number: 3,
    name: 'Certified AI-Enhanced Developer',
    description: 'Level up with prompt engineering, professional testing, and technical documentation skills.',
    level: 'Intermediate' as const,
    modules: 3,
    gradient: 'from-emerald-600 to-teal-500',
    badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    courseTitles: [
      'Prompt Engineering for Developers',
      'Testing and Quality Assurance',
      'Technical Documentation and Communication',
      'Certificate 3 Final Exam',
      'Certified AI-Enhanced Developer — Final Exam',
    ],
  },
  {
    number: 4,
    name: 'Certified AI Application Developer',
    description: 'Build production-ready AI applications, autonomous agents, and RAG systems.',
    level: 'Advanced' as const,
    modules: 5,
    gradient: 'from-orange-500 to-amber-400',
    badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
    courseTitles: [
      'Building Your First AI Application',
      'Introduction to AI Agents',
      'Introduction to RAG Systems',
      'Professional Developer Skills',
      'Industry Capstone Project',
      'Certificate 4 Final Exam',
      'Certified AI Application Developer — Final Exam',
    ],
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced:     'bg-red-100 text-red-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mapCourse = (c: DBCourse): CourseCardCourse => ({
  id: c.id,
  title: c.title,
  description: c.description || '',
  thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
  instructor: 'NobzTech Team',
  level: (c.level.charAt(0).toUpperCase() + c.level.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced',
  duration: c.duration || '4 weeks',
  price: c.price === 0 ? 'Free' as const : c.price,
  modules: [],
});

// Match a course to a certificate group
function getCertIndex(title: string): number {
  const lower = title.toLowerCase();
  for (let i = 0; i < CERTIFICATES.length; i++) {
    if (CERTIFICATES[i].courseTitles.some(t => lower.includes(t.toLowerCase()))) return i;
  }
  return -1;
}

// ─── Certificate section component ───────────────────────────────────────────
interface CertSectionProps {
  cert: typeof CERTIFICATES[0];
  courses: CourseCardCourse[];
  enrollments: DBEnrollment[];
  getProgress: (id: string) => number;
}

const CertSection: React.FC<CertSectionProps> = ({ cert, courses, enrollments, getProgress }) => {
  const [open, setOpen] = useState(true);
  if (courses.length === 0) return null;

  const completedInCert = courses.filter(c => getProgress(c.id) >= 100).length;
  const enrolledInCert  = courses.filter(c => enrollments.some(e => e.course_id === c.id)).length;
  const certProgress    = Math.round((completedInCert / courses.length) * 100);

  return (
    <div className="mb-10">
      {/* Certificate header */}
      <div className={`bg-gradient-to-r ${cert.gradient} rounded-2xl p-5 sm:p-6 mb-5 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Badge */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
              <Trophy size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
                Certificate {cert.number}
              </p>
              <h2 className="font-bold text-lg sm:text-xl text-white leading-snug mb-1">
                {cert.name}
              </h2>
              <p className="text-white/75 text-sm leading-relaxed hidden sm:block">{cert.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cert.badge} backdrop-blur-sm`}>
                  {cert.level}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-white">
                  {cert.modules} modules
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-white">
                  {courses.length} courses
                </span>
                {enrolledInCert > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 border border-white/30 text-white">
                    {completedInCert}/{courses.length} complete
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Collapse certificate' : 'Expand certificate'}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors shrink-0 border border-white/20"
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Progress bar (only if enrolled in at least one) */}
        {enrolledInCert > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1.5">
              <span>Your progress</span>
              <span className="font-bold text-white">{certProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 cert-progress-bar"
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                style={{ '--cert-progress': `${certProgress}%` } as React.CSSProperties}
              />
            </div>
          </div>
        )}
      </div>

      {/* Courses grid */}
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => {
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
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Courses = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery]   = useState('');
  const [courses, setCourses]           = useState<CourseCardCourse[]>([]);
  const [enrollments, setEnrollments]   = useState<DBEnrollment[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
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

  const getProgress = (courseId: string) => {
    const e = enrollments.find(e => e.course_id === courseId);
    return e?.progress ?? 0;
  };

  // Group courses by certificate, with search filter applied
  const grouped = CERTIFICATES.map(cert => ({
    cert,
    courses: courses.filter(c => {
      const inCert = getCertIndex(c.title) === CERTIFICATES.indexOf(cert);
      const matchSearch = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return inCert && matchSearch;
    }),
  }));

  // Courses that don't belong to any certificate
  const ungrouped = courses.filter(c => {
    const inNone = getCertIndex(c.title) === -1;
    const matchSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return inNone && matchSearch;
  });

  const totalVisible = grouped.reduce((s, g) => s + g.courses.length, 0) + ungrouped.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 mt-16 max-w-7xl">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8">
          <div>
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">Course Catalog</h1>
            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
              4 certificates · 17 modules · 1 complete learning programme
            </p>
          </div>
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search courses"
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : totalVisible === 0 ? (
          <div className="py-20 text-center bg-card rounded-2xl border border-border">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">No courses found matching "{searchQuery}"</p>
            <button type="button" onClick={() => setSearchQuery('')} className="mt-3 text-sm text-primary hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <>
            {grouped.map(({ cert, courses: certCourses }) => (
              <CertSection
                key={cert.number}
                cert={cert}
                courses={certCourses}
                enrollments={enrollments}
                getProgress={getProgress}
              />
            ))}

            {ungrouped.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <BookOpen size={20} className="text-muted-foreground" />
                  <h2 className="font-bold text-xl text-foreground">Other Courses</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ungrouped.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={enrollments.some(e => e.course_id === course.id)}
                      progress={getProgress(course.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
