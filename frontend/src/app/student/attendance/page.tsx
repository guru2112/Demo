'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, Filter, Search, CheckCircle, XCircle } from 'lucide-react';

interface UserData {
  _id: string;
  studentId?: string;
  name: string;
  department?: string;
  year?: number;
  division?: string;
}

interface AttendanceRecord {
  _id: string;
  sessionId: string;
  date: string;
  subject: string;
  department: string;
  year: number;
  division: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  markedAt?: string;
  confidence?: number;
  isPresent: boolean;
}

export default function StudentAttendance() {
  const [user, setUser] = useState<UserData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAttendance(parsedUser._id);
    }
  }, []);

  const fetchAttendance = async (userId: string) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        studentId: userId,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`/api/student/attendance?${queryParams}`);
      const result = await response.json();

      if (response.ok) {
        setAttendance(result.attendance || []);
      } else {
        console.error('Failed to fetch attendance:', result.error);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    if (user) {
      fetchAttendance(user._id);
    }
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
    if (user) {
      fetchAttendance(user._id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(record => record.isPresent).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return { total, present, absent, percentage };
  };

  if (!user) {
    return (
      <DashboardLayout userRole="student">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getAttendanceStats();

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">My Attendance</h2>
          </div>

          {/* Attendance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Total Sessions</h3>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Present</h3>
              <p className="text-2xl font-bold text-green-900">{stats.present}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600">Absent</h3>
              <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-600">Attendance %</h3>
              <p className="text-2xl font-bold text-indigo-900">{stats.percentage}%</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Subject name"
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                >
                  <Search className="h-4 w-4 inline mr-1" />
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading attendance records...</p>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No attendance records found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.startTime)}
                        {record.endTime && ` - ${formatTime(record.endTime)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.isPresent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.markedAt ? formatTime(record.markedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.confidence ? `${(record.confidence * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}