'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Users, BookOpen, LogOut, Plus, Clock, BarChart3 } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage (in production, use proper session management)
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (!['teacher', 'staff'].includes(parsedUser.role)) {
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
              <Users className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Teacher Dashboard
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
            <Users className="h-12 w-12 text-indigo-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">Role: {user.role === 'teacher' ? 'Teacher' : 'Staff'}</p>
              {user.department && (
                <p className="text-gray-600">Department: {user.department}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create Session */}
          <Link
            href="/teacher/create-session"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Plus className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Create Session</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Start a new attendance session for your class with real-time face recognition
            </p>
            <div className="text-green-600 font-medium">Create Session →</div>
          </Link>

          {/* Active Sessions */}
          <Link
            href="/teacher/sessions"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Active Sessions</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor ongoing attendance sessions and manage student recognition
            </p>
            <div className="text-blue-600 font-medium">View Sessions →</div>
          </Link>

          {/* Reports */}
          <Link
            href="/teacher/reports"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Attendance Reports</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View comprehensive attendance reports and analytics
            </p>
            <div className="text-purple-600 font-medium">View Reports →</div>
          </Link>

          {/* Manage Students */}
          <Link
            href="/teacher/students"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Manage Students</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View student information and face registration status
            </p>
            <div className="text-orange-600 font-medium">Manage Students →</div>
          </Link>

          {/* Session History */}
          <Link
            href="/teacher/history"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Session History</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Browse past attendance sessions and their results
            </p>
            <div className="text-indigo-600 font-medium">View History →</div>
          </Link>

          {/* Face Recognition Test */}
          <Link
            href="/teacher/test-recognition"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Camera className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Test Recognition</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test the face recognition system before starting a session
            </p>
            <div className="text-red-600 font-medium">Test System →</div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">0</div>
              <div className="text-sm text-gray-600">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Sessions Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0%</div>
              <div className="text-sm text-gray-600">Avg Attendance</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No recent activity</p>
            <p className="text-sm">Start creating attendance sessions to see activity here</p>
          </div>
        </div>
      </main>
    </div>
  );
}