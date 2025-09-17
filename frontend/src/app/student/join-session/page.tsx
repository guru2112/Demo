'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader, Users } from 'lucide-react';

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

interface RecognitionResult {
  recognized: boolean;
  student?: {
    studentId: string;
    name: string;
  };
  confidence?: number;
  liveness_passed?: boolean;
  error?: string;
}

interface AttendanceResult {
  message: string;
  status: string;
  student?: {
    name: string;
    studentId: string;
  };
  markedAt?: string;
  confidence?: number;
}

function JoinSessionForm() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [attendanceResult, setAttendanceResult] = useState<AttendanceResult | null>(null);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(parsedUser);

    // Get session ID from URL params
    const urlSessionId = searchParams?.get('sessionId');
    if (urlSessionId) {
      setSessionId(urlSessionId);
    }
  }, [router, searchParams]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
      } else {
        setError('Failed to access camera. Please check your permissions.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setRecognitionResult(null);
    setAttendanceResult(null);
  };

  const markAttendance = async () => {
    if (!videoRef.current || !canvasRef.current || !user || !sessionId) {
      setError('Required data not available');
      return;
    }

    setIsRecognizing(true);
    setError('');
    setRecognitionResult(null);
    setAttendanceResult(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0);

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const base64Image = imageData.split(',')[1];

      // Send to recognition API
      const recognitionResponse = await fetch('/api/face/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      const recognitionData = await recognitionResponse.json();

      if (!recognitionResponse.ok) {
        throw new Error(recognitionData.error || 'Face recognition failed');
      }

      setRecognitionResult(recognitionData);

      // If face is recognized, mark attendance
      if (recognitionData.recognized && recognitionData.student?.studentId) {
        setIsMarkingAttendance(true);
        
        const attendanceResponse = await fetch('/api/attendance/mark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
            studentId: recognitionData.student.studentId,
            confidence: recognitionData.confidence,
          }),
        });

        const attendanceData = await attendanceResponse.json();

        if (!attendanceResponse.ok) {
          throw new Error(attendanceData.error || 'Failed to mark attendance');
        }

        setAttendanceResult(attendanceData);
      }

    } catch (err) {
      console.error('Attendance marking error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Face recognition failed. Please try again.');
      }
    } finally {
      setIsRecognizing(false);
      setIsMarkingAttendance(false);
    }
  };

  const getStatusIcon = () => {
    if (attendanceResult) {
      if (attendanceResult.status === 'success' || attendanceResult.status === 'already_marked') {
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      }
    }
    if (recognitionResult && !recognitionResult.recognized) {
      return <XCircle className="h-8 w-8 text-red-600" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (attendanceResult) {
      if (attendanceResult.status === 'success') {
        return `Attendance marked successfully! Welcome, ${attendanceResult.student?.name}`;
      }
      if (attendanceResult.status === 'already_marked') {
        return `Attendance already marked for ${attendanceResult.student?.name}`;
      }
    }
    if (recognitionResult && !recognitionResult.recognized) {
      return 'Face not recognized. Please ensure you are registered and try again.';
    }
    return '';
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
            <Users className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Join Attendance Session</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Mark Your Attendance
            </h2>
            <p className="text-gray-600">
              Use face recognition to mark your attendance for the session
            </p>
          </div>

          {/* Session ID Input */}
          <div className="mb-6">
            <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
              Session ID
            </label>
            <input
              type="text"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID provided by your teacher"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Camera Section */}
          <div className="relative mb-6">
            <div className="flex justify-center">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full max-w-md rounded-lg border-2 ${
                    isStreaming ? 'border-green-500' : 'border-gray-300'
                  }`}
                  style={{ transform: 'scaleX(-1)' }} // Mirror the video
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Camera not active</p>
                    </div>
                  </div>
                )}

                {isStreaming && (
                  <div className="absolute top-2 left-2">
                    <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded text-sm">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Status Result */}
          {(recognitionResult || attendanceResult) && (
            <div className={`mb-6 p-4 rounded-md ${
              attendanceResult && (attendanceResult.status === 'success' || attendanceResult.status === 'already_marked')
                ? 'bg-green-50 border border-green-300' 
                : recognitionResult && !recognitionResult.recognized
                ? 'bg-red-50 border border-red-300'
                : 'bg-blue-50 border border-blue-300'
            }`}>
              <div className="flex items-center">
                {getStatusIcon()}
                <div className="ml-3">
                  <p className={`font-medium ${
                    attendanceResult && (attendanceResult.status === 'success' || attendanceResult.status === 'already_marked')
                      ? 'text-green-700' 
                      : recognitionResult && !recognitionResult.recognized
                      ? 'text-red-700'
                      : 'text-blue-700'
                  }`}>
                    {getStatusText()}
                  </p>
                  {recognitionResult?.confidence && (
                    <p className="text-sm text-gray-600">
                      Recognition Confidence: {(recognitionResult.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {attendanceResult?.markedAt && (
                    <p className="text-sm text-gray-600">
                      Marked at: {new Date(attendanceResult.markedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {!isStreaming ? (
              <button
                onClick={startCamera}
                disabled={!sessionId}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={markAttendance}
                  disabled={isRecognizing || isMarkingAttendance || !sessionId}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecognizing || isMarkingAttendance ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      {isMarkingAttendance ? 'Marking Attendance...' : 'Recognizing...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark Attendance
                    </>
                  )}
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Stop Camera
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-300 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enter the session ID provided by your teacher</li>
              <li>• Click &quot;Start Camera&quot; to activate your camera</li>
              <li>• Position your face clearly in the camera view</li>
              <li>• Click &quot;Mark Attendance&quot; to recognize your face and mark attendance</li>
              <li>• Ensure good lighting and face the camera directly</li>
              <li>• If not recognized, ensure you have registered your face first</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function JoinSession() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <JoinSessionForm />
    </Suspense>
  );
}