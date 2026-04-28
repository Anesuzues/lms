import React from 'react';
import { PlayCircle, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Course } from '@/services/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, enrolled = false, progress = 0 }) => {
  const { isAuthenticated, enrollInCourse } = useAuth();
  const navigate = useNavigate();

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    enrollInCourse(course.id);
    navigate(`/learn/${course.id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 text-gray-800 shadow-sm">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-2">{course.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-primary" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={16} className="text-primary" />
            <span>{course.modules.length} Modules</span>
          </div>
        </div>

        {/* Action / Progress Area */}
        {enrolled ? (
          <div className="space-y-3 mt-auto">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <Link
              to={`/learn/${course.id}`}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
            >
              <PlayCircle size={18} />
              Continue Learning
            </Link>
          </div>
        ) : (
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900">
                {course.price === 'Free' ? 'Free' : `$${course.price}`}
              </span>
              <Link to={`/courses/${course.id}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                View details
              </Link>
            </div>
            <button
              onClick={handleEnroll}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Enroll Now
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
