import React from 'react';
import { PlayCircle, FileText, CheckCircle, BookOpen } from 'lucide-react';
import { Course, Module, Lesson } from '@/services/mockData';

interface LessonSidebarProps {
  course: Course;
  activeLessonId?: string;
  onSelectLesson: (lessonId: string) => void;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({ course, activeLessonId, onSelectLesson }) => {
  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 shrink-0 bg-gray-50/50">
        <h2 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <BookOpen size={16} className="text-blue-600" />
          <span>{course.modules.length} Modules</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module: Module, mIndex: number) => (
          <div key={module.id} className="border-b border-gray-100 last:border-0">
            <div className="px-6 py-4 bg-gray-50 sticky top-0 z-10 border-b border-gray-100/50">
              <h3 className="font-bold text-sm text-gray-700 tracking-wide">
                Module {mIndex + 1}: {module.title}
              </h3>
            </div>
            
            <div className="flex flex-col py-2">
              {module.lessons.map((lesson: Lesson, lIndex: number) => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`
                      w-full text-left px-6 py-3 flex gap-4 transition-colors relative
                      ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      shrink-0 mt-0.5
                      ${isActive ? 'text-blue-600' : lesson.isCompleted ? 'text-green-500' : 'text-gray-400'}
                    `}>
                      {lesson.isCompleted ? (
                        <CheckCircle size={18} />
                      ) : lesson.type === 'video' ? (
                        <PlayCircle size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className={`
                        text-sm font-medium leading-tight mb-1
                        ${isActive ? 'text-blue-900' : 'text-gray-700'}
                      `}>
                        {mIndex + 1}.{lIndex + 1} {lesson.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {lesson.duration}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonSidebar;
