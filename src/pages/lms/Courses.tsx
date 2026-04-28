import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/lms/CourseCard';
import { MOCK_COURSES } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Courses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = MOCK_COURSES.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 mt-16 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-bold text-4xl text-gray-900 mb-4">
              Course Catalog
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Get workplace ready with our comprehensive selection of courses designed to boost your professional skills.
            </p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User Status Strip */}
        {user ? (
          <div className="mb-10 p-5 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-gray-700">Welcome back, <span className="font-bold text-primary">{user.name}</span>! Ready to continue learning?</span>
            <Link to="/dashboard" className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="mb-10 p-5 rounded-xl bg-white shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-gray-600">Sign in to track your progress and access enrolled courses.</span>
            <Link to="/login" className="text-sm font-bold bg-white text-gray-800 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              Sign In
            </Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => {
              const isEnrolled = user?.enrolledCourses.includes(course.id);
              // Mock progress
              const progress = isEnrolled ? Math.floor(Math.random() * 100) : 0;
              
              return (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrolled={isEnrolled}
                  progress={progress}
                />
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg">No courses found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
