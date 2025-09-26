'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface UserData {
  _id: string;
  studentId?: string;
  name: string;
  department?: string;
  year?: number;
  division?: string;
}

export default function MarkAttendance() {
  const [user, setUser] = useState<UserData | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const startCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Could not access camera. Please allow camera permission.' 
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndMarkAttendance = async () => {
    if (!sessionId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a session ID' });
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      setMessage({ type: 'error', text: 'Camera not ready' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Capture image from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');

        // Send to attendance API
        const response = await fetch('/api/attendance/mark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId.trim(),
            image: imageData,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage({
            type: 'success',
            text: `Attendance marked successfully! Welcome, ${result.student.name}. Confidence: ${(result.confidence * 100).toFixed(1)}%`
          });
          setAttendanceMarked(true);
          stopCamera();
        } else {
          setMessage({
            type: 'error',
            text: result.error || result.message || 'Failed to mark attendance'
          });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSessionId('');
    setMessage(null);
    setAttendanceMarked(false);
    stopCamera();
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

  return (
    <DashboardLayout userRole="student">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Camera className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-3" />}
              {message.type === 'error' && <XCircle className="h-5 w-5 mr-3" />}
              {message.type === 'info' && <AlertCircle className="h-5 w-5 mr-3" />}
              {message.text}
            </div>
          )}

          {!attendanceMarked ? (
            <div className="space-y-6">
              {/* Session ID Input */}
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Session ID *
                </label>
                <input
                  type="text"
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter the session ID provided by your teacher"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ask your teacher for the current session ID
                </p>
              </div>

              {/* Camera Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Face Recognition
                </label>
                
                {!stream ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <button
                      onClick={startCamera}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Start Camera
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      Click to start your camera for face recognition
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-md mx-auto rounded-lg border"
                        style={{ maxHeight: '300px' }}
                      />
                      <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={captureAndMarkAttendance}
                        disabled={loading || !sessionId.trim()}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Processing...' : 'Mark Attendance'}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                      >
                        Stop Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Get the session ID from your teacher</li>
                  <li>2. Start your camera and position your face clearly in view</li>
                  <li>3. Click "Mark Attendance" to capture and verify your face</li>
                  <li>4. Wait for confirmation that your attendance has been marked</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Attendance Marked Successfully!
              </h3>
              <p className="text-green-700 mb-6">
                Your attendance has been recorded for this session.
              </p>
              <button
                onClick={resetForm}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Mark Another Session
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}