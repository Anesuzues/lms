import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { LogOut, BookOpen, Settings } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/lms/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { getCourseById } from '@/services/mockData';

const Dashboard = () => {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  const enrolledCoursesData = user.enrolledCourses
    .map(id => getCourseById(id))
    .filter(c => c !== undefined);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header intakeFormUrl="#" onOpenForm={() => {}} />
      
      <main className="flex-1 container mx-auto px-6 py-12 mt-16 max-w-7xl">
        
        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl p-8 mb-12 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-100"
            />
            <div>
              <h1 className="font-bold text-3xl text-gray-900 mb-1">
                {user.name}
              </h1>
              <p className="text-blue-600 font-semibold capitalize">
                {user.role} Account
              </p>
              <div className="flex gap-4 mt-3 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={16} /> {enrolledCoursesData.length} Enrolled Courses
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 border-t border-gray-100 md:border-0 pt-6 md:pt-0">
            <button className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">
              <Settings size={20} />
            </button>
            <button 
              onClick={signOut}
              className="flex-1 md:flex-none px-6 py-3 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-bold"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-2xl text-gray-900">
              My Learning Path
            </h2>
            <Link to="/courses" className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-4 py-2 rounded-lg transition-colors">
              Browse Catalog &rarr;
            </Link>
          </div>

          {enrolledCoursesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCoursesData.map(course => (
                <CourseCard 
                  key={course!.id} 
                  course={course!} 
                  enrolled={true} 
                  progress={Math.floor(Math.random() * 60) + 10} 
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl border-2 border-gray-200 border-dashed bg-gray-50">
              <BookOpen size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No courses yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You haven't enrolled in any courses. Check out the catalog to find the perfect course to get workplace ready!
              </p>
              <Link 
                to="/courses"
                className="inline-block px-8 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Explore Catalog
              </Link>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
