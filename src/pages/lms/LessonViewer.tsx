import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Maximize2, Menu } from 'lucide-react';
import { getCourseById } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import LessonSidebar from '@/components/lms/LessonSidebar';
import VideoPlayer from '@/components/VideoPlayer';

// Mock lessons data organized by modules
const mockLessons = {
  // Module 1: Foundations
  '1': {
    id: '1',
    title: 'Every Essential AI Skill in 25 Minutes',
    description: 'AI literacy, research mindset, workplace context, WIL preparation',
    video_url: 'https://www.youtube.com/watch?v=nuEhBT31KQw',
    video_type: 'youtube' as const,
    duration_minutes: 25,
    order_index: 1,
    is_free: true,
    module: 'Foundations'
  },
  '2': {
    id: '2',
    title: 'A Practical Guide to Using AI for Work – Part 1',
    description: 'Practical AI applications in the workplace',
    video_url: 'https://www.youtube.com/watch?v=uIklPjEHtNc',
    video_type: 'youtube' as const,
    duration_minutes: 30,
    order_index: 2,
    is_free: true,
    module: 'Foundations'
  },
  // Module 2: CV & AI
  '3': {
    id: '3',
    title: 'Using AI to Strengthen Your Resume & Cover Letter',
    description: 'CV creation, self-presentation, ethical AI use',
    video_url: 'https://www.youtube.com/watch?v=C67edx_QBIk',
    video_type: 'youtube' as const,
    duration_minutes: 20,
    order_index: 3,
    is_free: true,
    module: 'CV & AI'
  },
  '4': {
    id: '4',
    title: 'Perfecting Your Resume Using AI Technology',
    description: 'Advanced resume optimization with AI tools',
    video_url: 'https://www.youtube.com/watch?v=Bi40ZSV8FWI',
    video_type: 'youtube' as const,
    duration_minutes: 18,
    order_index: 4,
    is_free: true,
    module: 'CV & AI'
  },
  // Module 3: Interview Readiness
  '5': {
    id: '5',
    title: 'How to Use AI to Prepare for a Job Interview',
    description: 'Interview preparation, confidence, simulation',
    video_url: 'https://www.youtube.com/watch?v=-2r1pG9Y48Q',
    video_type: 'youtube' as const,
    duration_minutes: 22,
    order_index: 5,
    is_free: true,
    module: 'Interview Readiness'
  },
  '6': {
    id: '6',
    title: 'Top FREE AI Mock Interview Tools',
    description: 'Practice interviews with AI assistance',
    video_url: 'https://www.youtube.com/watch?v=iGGkmKN8ilw',
    video_type: 'youtube' as const,
    duration_minutes: 15,
    order_index: 6,
    is_free: true,
    module: 'Interview Readiness'
  },
  '7': {
    id: '7',
    title: 'Interview Practice with Google AI',
    description: 'Advanced interview simulation techniques',
    video_url: 'https://www.youtube.com/watch?v=9fDZ42pwSEI',
    video_type: 'youtube' as const,
    duration_minutes: 25,
    order_index: 7,
    is_free: true,
    module: 'Interview Readiness'
  },
  // Module 4: Work Conduct & WIL Readiness
  '8': {
    id: '8',
    title: 'AI Skills for the Modern Job Hunt – Full Workshop',
    description: 'Professional behaviour, job search maturity, workplace expectations',
    video_url: 'https://www.youtube.com/watch?v=XOYLHOm-AVw',
    video_type: 'youtube' as const,
    duration_minutes: 45,
    order_index: 8,
    is_free: true,
    module: 'Work Conduct & WIL Readiness'
  }
};

// Group lessons by module
const moduleGroups = {
  'Foundations': Object.values(mockLessons).filter(l => l.module === 'Foundations'),
  'CV & AI': Object.values(mockLessons).filter(l => l.module === 'CV & AI'),
  'Interview Readiness': Object.values(mockLessons).filter(l => l.module === 'Interview Readiness'),
  'Work Conduct & WIL Readiness': Object.values(mockLessons).filter(l => l.module === 'Work Conduct & WIL Readiness')
};

const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string>('');

  const course = id ? getCourseById(id) : undefined;
  const activeLesson = mockLessons[activeLessonId as keyof typeof mockLessons];

  useEffect(() => {
    // Set first lesson as active by default
    if (!activeLessonId) {
      setActiveLessonId('1');
    }
  }, [activeLessonId]);

  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <p>Course not found.</p>
      </div>
    );
  }

  // Find active lesson details
  const activeLessonTitle = activeLesson?.title || 'Select a lesson';
  const activeLessonType = activeLesson ? 'video' : 'none';

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
            {activeLesson ? (
              <VideoPlayer
                videoUrl={activeLesson.video_url}
                videoType={activeLesson.video_type}
                title={activeLesson.title}
                className="w-full h-full"
              />
            ) : (
              <div className="relative z-10 text-center p-8">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Select a Lesson</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            )}
          </div>

          {/* Bottom Controls / Info */}
          <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-between px-6 shrink-0">
             <div>
               <p className="text-sm text-gray-500 mb-1 font-medium">Current Lesson</p>
               <p className="font-bold text-gray-900 truncate w-48 md:w-auto">{activeLessonTitle}</p>
             </div>
             <button 
               onClick={() => {
                 const currentIndex = parseInt(activeLessonId);
                 const nextIndex = currentIndex + 1;
                 if (mockLessons[nextIndex.toString() as keyof typeof mockLessons]) {
                   setActiveLessonId(nextIndex.toString());
                 }
               }}
               className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
             >
               Next Lesson
             </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          w-80 shrink-0 absolute md:relative right-0 top-0 bottom-0 z-10 bg-white shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-900">Get Workplace Ready</h3>
              <p className="text-sm text-gray-600">4 modules • {Object.keys(mockLessons).length} lessons</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(moduleGroups).map(([moduleName, lessons], moduleIndex) => (
                <div key={moduleName} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {moduleIndex + 1}
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{moduleName}</h4>
                  </div>
                  
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        setActiveLessonId(lesson.id);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ml-4 ${
                        activeLessonId === lesson.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          activeLessonId === lesson.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {lesson.order_index}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-xs text-gray-900 mb-1 leading-tight">
                            {lesson.title}
                          </h5>
                          <p className="text-xs text-gray-600 mb-2 leading-tight">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {lesson.duration_minutes} min
                            </span>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              Free
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
