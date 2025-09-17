'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Camera, TestTube, AlertCircle, CheckCircle, Play, Square } from 'lucide-react';

interface UserData {
  studentId?: string;
  name: string;
}

export default function DemoSession() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        setMessage({ type: 'info', text: 'Camera started. Position your face in the frame and click capture.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to access camera. Please check permissions.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              setImagePreview(reader.result as string);
              stopCamera();
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const testRecognition = async () => {
    if (!imagePreview || !user?.studentId) {
      setMessage({ type: 'error', text: 'Please capture or upload an image first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/face/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imagePreview,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.recognized) {
          if (result.student_id === user.studentId) {
            setMessage({ 
              type: 'success', 
              text: `✅ Face recognition successful! You were identified as ${user.name} with ${(result.confidence * 100).toFixed(2)}% confidence.` 
            });
          } else {
            setMessage({ 
              type: 'error', 
              text: `❌ Face recognized but identified as someone else (${result.student_id}). Please update your face data.` 
            });
          }
        } else {
          setMessage({ 
            type: 'error', 
            text: `❌ Face not recognized. Confidence: ${(result.confidence * 100).toFixed(2)}%. Please register your face data or try again with better lighting.` 
          });
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Face recognition test failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <TestTube className="h-6 w-6 text-yellow-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Face Recognition Demo Session</h2>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">
              <strong>Test your face recognition:</strong> Use this demo to verify that your registered face data works correctly. 
              You can capture a photo using your camera or upload an existing image.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md flex items-start ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              )}
              <div className="whitespace-pre-line">{message.text}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Camera Capture</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {isCapturing ? (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={capturePhoto}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="mx-auto h-16 w-16 text-gray-400" />
                    <div>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Camera
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Click to start your camera and capture a photo
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or upload an image file:</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            {/* Preview and Test Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Test Recognition</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-h-[300px] flex flex-col justify-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Captured preview"
                      className="w-64 h-64 object-cover rounded-lg mx-auto"
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={testRecognition}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {loading ? 'Testing...' : 'Test Recognition'}
                      </button>
                      <button
                        onClick={clearImage}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <TestTube className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="text-gray-500">
                      Capture or upload an image to test face recognition
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </DashboardLayout>
  );
}