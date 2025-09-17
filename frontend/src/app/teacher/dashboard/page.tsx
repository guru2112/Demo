'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserCheck, Users, Calendar, BookOpen, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Teacher Portal</h2>
          <p className="text-gray-600">
            Manage students, track attendance, and conduct attendance sessions.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/teacher/register-student" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-3">
                <UserCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Register Student</h3>
                <p className="text-sm text-gray-500">Add new student</p>
              </div>
            </div>
          </Link>

          <Link href="/teacher/update-student" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Update Student</h3>
                <p className="text-sm text-gray-500">Modify student details</p>
              </div>
            </div>
          </Link>

          <Link href="/teacher/attendance" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View Attendance</h3>
                <p className="text-sm text-gray-500">Attendance reports</p>
              </div>
            </div>
          </Link>

          <Link href="/teacher/start-session" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3">
                <BookOpen className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Start Session</h3>
                <p className="text-sm text-gray-500">Begin attendance</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
                <p className="text-2xl font-bold text-indigo-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Avg Attendance</h3>
                <p className="text-2xl font-bold text-blue-600">0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}