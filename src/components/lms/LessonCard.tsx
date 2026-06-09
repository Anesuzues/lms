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
      className={`p-4 rounded-lg cursor-pointer transition-all border-l-[3px] ${
        isActive
          ? 'bg-primary/5 border-l-primary shadow-sm border border-transparent border-l-primary'
          : 'bg-card border border-border border-l-transparent hover:bg-secondary/50 hover:shadow-soft'
      } ${!canAccess ? 'opacity-60' : ''}`}
      onClick={canAccess ? onClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          canAccess ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
        }`}>
          {canAccess ? <Play size={16} /> : <Lock size={16} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${
              canAccess ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {lesson.order_index}. {lesson.title}
            </h3>
            {lesson.is_free && (
              <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full">
                Free
              </span>
            )}
          </div>

          <p className={`text-xs mb-2 ${
            canAccess ? 'text-muted-foreground' : 'text-muted-foreground/60'
          }`}>
            {lesson.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{lesson.duration_minutes} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;