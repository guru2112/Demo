'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserCheck, User, TestTube, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Student Portal</h2>
          <p className="text-gray-600">
            Manage your profile, register for face recognition, and track your attendance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/student/register" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-3">
                <UserCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">New Registration</h3>
                <p className="text-sm text-gray-500">Register your face data</p>
              </div>
            </div>
          </Link>

          <Link href="/student/update-profile" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-500">Update personal details</p>
              </div>
            </div>
          </Link>

          <Link href="/student/demo-session" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <TestTube className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Demo Session</h3>
                <p className="text-sm text-gray-500">Test face recognition</p>
              </div>
            </div>
          </Link>

          <Link href="/student/attendance" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Attendance</h3>
                <p className="text-sm text-gray-500">View attendance records</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                <p className="text-xs text-gray-500">Face data successfully registered</p>
              </div>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}