import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Maximize2, Menu } from 'lucide-react';
import { getCourseById } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import LessonSidebar from '@/components/lms/LessonSidebar';

const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string>('');

  const course = id ? getCourseById(id) : undefined;

  useEffect(() => {
    if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      setActiveLessonId(course.modules[0].lessons[0].id);
    }
  }, [course]);

  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <p>Course not found.</p>
      </div>
    );
  }

  // Find active lesson details
  let activeLessonTitle = '';
  let activeLessonType = '';
  course.modules.forEach(m => {
    const l = m.lessons.find(ls => ls.id === activeLessonId);
    if (l) {
      activeLessonTitle = l.title;
      activeLessonType = l.type;
    }
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <span className="font-bold text-lg hidden md:block text-gray-800">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            onClick={() => {
              if(document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              }
            }}
          >
            <Maximize2 size={20} />
          </button>
          <button 
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Video / Content Player */}
        <div className="flex-1 bg-gray-900 flex flex-col relative">
          <div className="flex-1 relative flex items-center justify-center bg-black">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50" />
            <div className="relative z-10 text-center p-8">
              <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{activeLessonTitle}</h2>
              <p className="text-gray-300 max-w-md mx-auto">
                {activeLessonType === 'video' 
                  ? "Video playback will appear here. This is a mock interface."
                  : "Interactive content or quiz will load here."}
              </p>
            </div>
          </div>

          {/* Bottom Controls / Info */}
          <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-between px-6 shrink-0">
             <div>
               <p className="text-sm text-gray-500 mb-1 font-medium">Up next</p>
               <p className="font-bold text-gray-900 truncate w-48 md:w-auto">Next Lesson Title</p>
             </div>
             <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
               Complete & Continue
             </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          w-80 shrink-0 absolute md:relative right-0 top-0 bottom-0 z-10 bg-white shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
        `}>
          <LessonSidebar 
            course={course}
            activeLessonId={activeLessonId}
            onSelectLesson={(id) => {
              setActiveLessonId(id);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default LessonViewer;
