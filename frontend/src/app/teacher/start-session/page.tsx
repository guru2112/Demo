'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BookOpen, Users, AlertCircle, CheckCircle, Play } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  department?: string;
}

export default function StartSession() {
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    department: '',
    year: '',
    division: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [sessionCreated, setSessionCreated] = useState<{
    sessionId: string;
    totalStudents: number;
  } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Pre-fill department if available
      if (parsedUser.department) {
        setFormData(prev => ({
          ...prev,
          department: parsedUser.department
        }));
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/attendance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          teacherId: user._id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Attendance session created successfully! Session ID: ${result.session.sessionId}` 
        });
        setSessionCreated({
          sessionId: result.session.sessionId,
          totalStudents: result.session.totalStudents
        });
        // Redirect to session monitor after a short delay
        setTimeout(() => {
          window.open(`/teacher/session-monitor/${result.session.sessionId}`, '_blank');
        }, 2000);
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          subject: '',
          department: user.department || '',
          year: '',
          division: '',
          semester: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create session' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = () => {
    setSessionCreated(null);
    setMessage(null);
  };

  if (!user) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <BookOpen className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Start Attendance Session</h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3" />
              )}
              {message.text}
            </div>
          )}

          {sessionCreated ? (
            <div className="text-center py-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">Session Created Successfully!</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p><strong>Session ID:</strong> {sessionCreated.sessionId}</p>
                  <p><strong>Total Students:</strong> {sessionCreated.totalStudents}</p>
                  <p className="mt-4 text-green-700">
                    Students can now mark their attendance using the face recognition system.
                    You can monitor the session from the attendance dashboard.
                  </p>
                  <div className="mt-4 space-x-4">
                    <a
                      href={`/teacher/session-monitor/${sessionCreated.sessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Monitor Session
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={startNewSession}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Start Another Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Instructions:</strong> Fill in the session details below to create a new attendance session. 
                  Once created, students will be able to mark their attendance using face recognition for this specific class.
                </p>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, Physics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                    Division *
                  </label>
                  <input
                    type="text"
                    id="division"
                    name="division"
                    required
                    value={formData.division}
                    onChange={handleInputChange}
                    placeholder="e.g., A, B, C"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
              </div>

              {/* Session Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Session Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Teacher:</span>
                    <span className="ml-2 font-medium">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">
                      {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not selected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <span className="ml-2 font-medium">{formData.subject || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Class:</span>
                    <span className="ml-2 font-medium">
                      {formData.department && formData.year && formData.division
                        ? `${formData.department} - Year ${formData.year}, Div ${formData.division}`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Creating...' : 'Start Session'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}