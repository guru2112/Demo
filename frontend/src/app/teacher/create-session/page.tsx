'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Calendar, BookOpen, Users, Building, CheckCircle, AlertTriangle } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface SessionData {
  date: string;
  subject: string;
  department: string;
  year: number;
  division: string;
}

export default function CreateSession() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<SessionData>({
    date: new Date().toISOString().split('T')[0], // Today's date
    subject: '',
    department: '',
    year: 1,
    division: 'A',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionId, setSessionId] = useState('');
  
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
      // Pre-fill department if available
      if (parsedUser.department) {
        setFormData(prev => ({ ...prev, department: parsedUser.department }));
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user) {
        throw new Error('User not found');
      }

      const response = await fetch('/api/attendance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teacherId: user._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create session');
      }

      setSuccess('Attendance session created successfully!');
      setSessionId(result.session.sessionId);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        subject: '',
        department: user.department || '',
        year: 1,
        division: 'A',
      });

    } catch (err) {
      console.error('Create session error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create attendance session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <Plus className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Create Attendance Session</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              New Attendance Session
            </h2>
            <p className="text-gray-600">
              Create a new attendance session for your class with face recognition
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <span className="text-sm text-green-700">{success}</span>
                  {sessionId && (
                    <p className="text-sm text-green-600 mt-1">
                      Session ID: <strong>{sessionId}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="e.g., Computer Science, Mathematics"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
                <option value="Chemical">Chemical</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            {/* Year and Division */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={1}>First Year</option>
                  <option value={2}>Second Year</option>
                  <option value={3}>Third Year</option>
                  <option value={4}>Fourth Year</option>
                </select>
              </div>

              <div>
                <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                  Division
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                  <option value="D">Division D</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Session
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-300 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Share the session ID with your students</li>
              <li>• Students will use face recognition to mark attendance</li>
              <li>• Monitor the session in real-time from the Active Sessions page</li>
              <li>• End the session when class is complete</li>
              <li>• View attendance reports after the session</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}