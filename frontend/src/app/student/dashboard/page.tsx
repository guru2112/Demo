'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, User, Clock, BookOpen, LogOut, TestTube } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  year?: number;
  division?: string;
  faceEmbedding?: number[];
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage (in production, use proper session management)
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        router.push('/auth/login');
        return;
      }
      setUser(parsedUser);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Student Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center">
            <User className="h-12 w-12 text-indigo-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">Student ID: {user.studentId}</p>
              <p className="text-gray-600">
                {user.department} - Year {user.year}, Division {user.division}
              </p>
              <p className="text-sm text-gray-500">
                Face Registration: {user.faceEmbedding ? 
                  <span className="text-green-600 font-medium">Completed</span> : 
                  <span className="text-red-600 font-medium">Pending</span>
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Demo Session */}
          <Link
            href="/student/demo"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <TestTube className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Demo Session</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test your face recognition setup with real-time feedback
            </p>
            <div className="text-green-600 font-medium">Try Demo →</div>
          </Link>

          {/* Join Session */}
          <Link
            href="/student/join-session"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Join Session</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Join an active attendance session and mark your attendance
            </p>
            <div className="text-indigo-600 font-medium">Join Session →</div>
          </Link>

          {/* Face Registration */}
          <Link
            href="/student/register-face"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Camera className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Face Registration</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {user.faceEmbedding ? 'Update your face data' : 'Register your face for attendance'}
            </p>
            <div className="text-blue-600 font-medium">
              {user.faceEmbedding ? 'Update Face →' : 'Register Face →'}
            </div>
          </Link>

          {/* Attendance History */}
          <Link
            href="/student/attendance"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Attendance History</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View your attendance records and statistics
            </p>
            <div className="text-purple-600 font-medium">View History →</div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">0</div>
              <div className="text-sm text-gray-600">Classes Attended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}