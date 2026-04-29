import React from 'react';
import { PlayCircle, Clock, BookOpen, ArrowRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Minimal course shape used across the app
export interface CourseCardCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number | 'Free';
  modules: any[];
}

interface CourseCardProps {
  course: CourseCardCourse;
  enrolled?: boolean;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, enrolled = false, progress = 0 }) => {
  const { isAuthenticated, enrollInCourse } = useAuth();
  const navigate = useNavigate();

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    enrollInCourse(course.id);
    navigate(`/learn/${course.id}`);
  };

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-secondary">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* Hover overlay with play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <PlayCircle size={24} className="text-primary ml-0.5" />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/95 text-gray-800 shadow-sm">
            {course.level}
          </span>
        </div>
        {enrolled && (
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

        {/* Instructor */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <User size={13} />
          <span>{course.instructor}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-primary" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-primary" />
            <span>{course.modules.length} Modules</span>
          </div>
        </div>

        {/* Action */}
        {enrolled ? (
          <div className="mt-auto space-y-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            {/* Progress ring-style bar */}
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <Link
              to={`/learn/${course.id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-sm transition-colors"
            >
              <PlayCircle size={15} /> Continue Learning
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
              onClick={handleEnroll}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-glow hover:shadow-lg"
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
