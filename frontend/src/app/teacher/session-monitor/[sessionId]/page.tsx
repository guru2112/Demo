'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Clock, CircleCheck as CheckCircle, Circle as XCircle, RefreshCw } from 'lucide-react';

interface SessionData {
  _id: string;
  sessionId: string;
  date: string;
  subject: string;
  department: string;
  year: number;
  division: string;
  semester?: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  totalStudents: number;
  attendedStudents: Array<{
    studentId: string;
    userId: {
      name: string;
      studentId: string;
    };
    markedAt: string;
    confidence: number;
  }>;
  teacher: {
    name: string;
  };
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
}

export default function SessionMonitor() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance/session/${sessionId}`);
      const result = await response.json();

      if (response.ok) {
        setSession(result.session);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch session data');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (status: 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/attendance/session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSessionData(); // Refresh data
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to update session status');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
      // Auto-refresh every 10 seconds for active sessions
      const interval = setInterval(() => {
        if (session?.status === 'active') {
          fetchSessionData();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [sessionId, session?.status]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="text-center py-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Session</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSessionData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Session Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Monitor</h2>
              <p className="text-gray-600">Session ID: {session.sessionId}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchSessionData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              {session.status === 'active' && (
                <>
                  <button
                    onClick={() => updateSessionStatus('completed')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Complete Session
                  </button>
                  <button
                    onClick={() => updateSessionStatus('cancelled')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                  >
                    Cancel Session
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Subject</h4>
              <p className="text-lg font-semibold text-gray-900">{session.subject}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Class</h4>
              <p className="text-lg font-semibold text-gray-900">
                {session.department} - Year {session.year}, Div {session.division}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Date & Time</h4>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(session.date)}
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(session.startTime)}
                {session.endTime && ` - ${formatTime(session.endTime)}`}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                session.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {session.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                {session.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
                <p className="text-2xl font-bold text-blue-600">{session.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Present</h3>
                <p className="text-2xl font-bold text-green-600">{session.presentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Absent</h3>
                <p className="text-2xl font-bold text-red-600">{session.absentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
                <p className="text-2xl font-bold text-indigo-600">{session.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attended Students List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students Present</h3>
          {session.attendedStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No students have marked attendance yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Marked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {session.attendedStudents.map((attendance, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.userId.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.userId.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(attendance.markedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          attendance.confidence > 0.8 
                            ? 'bg-green-100 text-green-800'
                            : attendance.confidence > 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(attendance.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}