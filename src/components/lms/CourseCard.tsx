import React from 'react';
import { BookOpen, Clock, ArrowRight, User, BookMarked, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface CourseCardCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number | 'Free';
  modules: unknown[];
}

interface CourseCardProps {
  course: CourseCardCourse;
  enrolled?: boolean;
  progress?: number;
  locked?: boolean;
  lockedReason?: string;
  onEnroll?: () => Promise<void>;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrolled = false,
  progress = 0,
  locked = false,
  lockedReason,
  onEnroll,
}) => {
  const { isAuthenticated, enrollInCourse } = useAuth();
  const navigate = useNavigate();

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (locked) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (onEnroll) {
      await onEnroll();
    } else {
      await enrollInCourse(course.id);
      navigate(`/learn/${course.id}`);
    }
  };

  return (
    <div className={`group bg-card rounded-2xl border overflow-hidden hover:shadow-card transition-all duration-300 flex flex-col h-full ${locked ? 'border-border opacity-75' : 'border-border hover:-translate-y-1'}`}>
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-secondary">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${!locked ? 'group-hover:scale-105' : 'grayscale-[30%]'}`}
        />

        {locked ? (
          /* Lock overlay */
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Lock size={18} className="text-white" />
            </div>
            <span className="text-white text-xs font-semibold px-3 text-center leading-tight">
              {lockedReason ?? 'Complete previous course to unlock'}
            </span>
          </div>
        ) : (
          /* Hover overlay */
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <BookOpen size={22} className="text-primary" />
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/95 text-gray-800 shadow-sm">
            {course.level}
          </span>
        </div>
        {enrolled && !locked && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-sm">
              Enrolled
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1.5 text-foreground line-clamp-2 leading-snug">{course.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">{course.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <User size={13} />
          <span>{course.instructor}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-primary" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookMarked size={13} className="text-primary" />
            <span>Reading</span>
          </div>
        </div>

        {/* Action */}
        {locked ? (
          <div className="mt-auto flex items-center gap-2 py-2.5 rounded-xl bg-secondary px-4">
            <Lock size={14} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">Locked — finish previous course</span>
          </div>
        ) : enrolled ? (
          <div className="mt-auto space-y-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <Link
              to={`/learn/${course.id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-sm transition-colors"
            >
              <BookOpen size={15} /> Continue Learning
            </Link>
          </div>
        ) : (
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-foreground">
                {course.price === 'Free' ? 'Free' : `$${course.price}`}
              </span>
              <Link to={`/courses/${course.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                View details
              </Link>
            </div>
            <button
              type="button"
              onClick={handleEnroll}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-glow"
            >
              Enroll Now <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
