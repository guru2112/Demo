'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, User, LogOut, Users, BookOpen, Calendar, UserCheck, TestTube } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'staff';
  studentId?: string;
  department?: string;
  year?: number;
  division?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'student' | 'teacher';
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const studentMenuItems = [
    { href: '/student/dashboard', icon: User, label: 'Dashboard' },
    { href: '/student/register', icon: UserCheck, label: 'New Registration' },
    { href: '/student/update-profile', icon: User, label: 'Update Profile' },
    { href: '/student/demo-session', icon: TestTube, label: 'Demo Session' },
    { href: '/student/mark-attendance', icon: Camera, label: 'Mark Attendance' },
    { href: '/student/attendance', icon: Calendar, label: 'My Attendance' },
  ];

  const teacherMenuItems = [
    { href: '/teacher/dashboard', icon: Users, label: 'Dashboard' },
    { href: '/teacher/register-student', icon: UserCheck, label: 'Register Student' },
    { href: '/teacher/update-student', icon: User, label: 'Update Student' },
    { href: '/teacher/attendance', icon: Calendar, label: 'View Attendance' },
    { href: '/teacher/start-session', icon: BookOpen, label: 'Start Session' },
  ];

  const menuItems = userRole === 'student' ? studentMenuItems : teacherMenuItems;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Smart Attendance System
                </h1>
                <p className="text-sm text-gray-500 capitalize">{userRole} Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                {user.studentId && (
                  <p className="text-xs text-gray-500">ID: {user.studentId}</p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-6">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}