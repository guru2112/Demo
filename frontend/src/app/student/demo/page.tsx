'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

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

export default function DemoSession() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'student') {
      router.push('/auth/login');
      return;
    }
  }, [router]);

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
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video or canvas not available');
      return;
    }

    setIsRecognizing(true);
    setError('');
    setRecognitionResult(null);

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
      const response = await fetch('/api/face/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Recognition failed');
      }

      setRecognitionResult(result);
    } catch (err) {
      console.error('Recognition error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Face recognition failed. Please try again.');
      }
    } finally {
      setIsRecognizing(false);
    }
  };

  const getRecognitionStatusIcon = () => {
    if (!recognitionResult) return null;

    if (recognitionResult.recognized) {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getRecognitionStatusText = () => {
    if (!recognitionResult) return '';

    if (recognitionResult.recognized) {
      return `Face recognized! Welcome, ${recognitionResult.student?.name}`;
    } else {
      return 'Face not recognized. Please ensure you are registered and face the camera clearly.';
    }
  };

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
            <Camera className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Demo Session</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Test Your Face Recognition
            </h2>
            <p className="text-gray-600">
              Use this demo to test your face recognition setup and see real-time feedback
            </p>
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

          {/* Recognition Result */}
          {recognitionResult && (
            <div className={`mb-6 p-4 rounded-md ${
              recognitionResult.recognized 
                ? 'bg-green-50 border border-green-300' 
                : 'bg-red-50 border border-red-300'
            }`}>
              <div className="flex items-center">
                {getRecognitionStatusIcon()}
                <div className="ml-3">
                  <p className={`font-medium ${
                    recognitionResult.recognized ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {getRecognitionStatusText()}
                  </p>
                  {recognitionResult.confidence && (
                    <p className="text-sm text-gray-600">
                      Confidence: {(recognitionResult.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {recognitionResult.liveness_passed !== undefined && (
                    <p className="text-sm text-gray-600">
                      Liveness Check: {recognitionResult.liveness_passed ? 'Passed' : 'Failed'}
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
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={captureAndRecognize}
                  disabled={isRecognizing}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecognizing ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Recognizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Test Recognition
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
              <li>• Click &quot;Start Camera&quot; to activate your camera</li>
              <li>• Position your face clearly in the camera view</li>
              <li>• Click &quot;Test Recognition&quot; to check if your face is recognized</li>
              <li>• Ensure good lighting and face the camera directly</li>
              <li>• If not recognized, try registering your face first</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}