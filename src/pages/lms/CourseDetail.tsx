import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, CheckCircle, User, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCourseById } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, enrollInCourse } = useAuth();
  const { toast } = useToast();

  const course = id ? getCourseById(id) : undefined;

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <button onClick={() => navigate('/courses')} className="text-primary hover:underline">
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEnrolled = user?.enrolledCourses.includes(course.id);

  const handleEnroll = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    enrollInCourse(course.id);
    toast({
      title: "Successfully Enrolled!",
      description: `You are now enrolled in ${course.title}.`,
    });
    setTimeout(() => {
      navigate(`/learn/${course.id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 mt-16 max-w-6xl">
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Col: Info */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
                {course.level}
              </span>
              <h1 className="font-bold text-4xl md:text-5xl mb-6 text-gray-900 leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Stats/Meta */}
            <div className="flex flex-wrap gap-8 py-8 border-y border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="font-bold text-gray-900 text-lg">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Modules</p>
                  <p className="font-bold text-gray-900 text-lg">{course.modules.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Instructor</p>
                  <p className="font-bold text-gray-900 text-lg">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Syllabus */}
            <div>
              <h3 className="font-bold text-2xl mb-6 text-gray-900">Course Syllabus</h3>
              <div className="space-y-4">
                {course.modules.map((module, idx) => (
                  <div key={module.id} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-primary">Module {idx + 1}:</span> {module.title}
                    </h4>
                    <ul className="space-y-3">
                      {module.lessons.map((lesson, lIdx) => (
                        <li key={lesson.id} className="flex items-start gap-3 text-gray-600">
                          <PlayCircle size={18} className="mt-0.5 text-primary/60 shrink-0" />
                          <span className="flex-1 font-medium">
                            {idx + 1}.{lIdx + 1} {lesson.title}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-semibold">
                            {lesson.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Sticky CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xl shadow-gray-200/50">
                <div className="rounded-xl overflow-hidden mb-6 relative bg-gray-100">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <PlayCircle size={32} className="ml-1" />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  {isEnrolled ? (
                    <div className="py-4 px-6 rounded-xl bg-green-50 text-green-700 border border-green-200 mb-4">
                      <CheckCircle size={24} className="mx-auto mb-2" />
                      <p className="font-bold">You are enrolled!</p>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {course.price === 'Free' ? 'Free' : `$${course.price}`}
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <button 
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg text-lg"
                  >
                    Continue Learning
                  </button>
                ) : (
                  <button 
                    onClick={handleEnroll}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg text-lg"
                  >
                    Enroll Now
                  </button>
                )}

                <div className="mt-6 space-y-3 text-sm text-gray-500 font-medium">
                  <p className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" /> Full lifetime access
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" /> Access on mobile and web
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" /> Certificate of completion
                  </p>
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
