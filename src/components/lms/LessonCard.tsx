import React from 'react';
import { Play, Lock, Clock } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'direct' | 'embed';
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  isEnrolled: boolean;
  isActive?: boolean;
  onClick: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ 
  lesson, 
  isEnrolled, 
  isActive = false, 
  onClick 
}) => {
  const canAccess = lesson.is_free || isEnrolled;

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      } ${!canAccess ? 'opacity-60' : ''}`}
      onClick={canAccess ? onClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          canAccess ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {canAccess ? <Play size={16} /> : <Lock size={16} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${
              canAccess ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {lesson.order_index}. {lesson.title}
            </h3>
            {lesson.is_free && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Free
              </span>
            )}
          </div>
          
          <p className={`text-xs mb-2 ${
            canAccess ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {lesson.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>{lesson.duration_minutes} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;