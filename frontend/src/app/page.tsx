import Link from "next/link";
import { Camera, Users, BookOpen, Shield, Scan, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Smart Attendance System
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/auth/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Advanced Face Recognition
            <span className="block text-indigo-600">Attendance System</span>
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
            Streamline attendance management with cutting-edge AI technology featuring 
            MTCNN face detection, ArcFace embeddings, and anti-spoofing liveness detection.
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/auth/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Student Portal
            </Link>
            <Link
              href="/auth/login"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Teacher Portal
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Scan className="h-8 w-8 text-indigo-600 mr-3" />
                <h4 className="text-xl font-semibold">Advanced Face Processing</h4>
              </div>
              <p className="text-gray-600">
                MTCNN for robust face detection and ArcFace for high-accuracy 128-d facial embeddings
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <h4 className="text-xl font-semibold">Liveness Detection</h4>
              </div>
              <p className="text-gray-600">
                Anti-spoofing technology prevents attendance marking using photos or videos
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-indigo-600 mr-3" />
                <h4 className="text-xl font-semibold">Role-Based Access</h4>
              </div>
              <p className="text-gray-600">
                Separate portals for students and teachers with appropriate permissions
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
                <h4 className="text-xl font-semibold">Student Management</h4>
              </div>
              <p className="text-gray-600">
                Profile management, face registration, and personal attendance history
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
                <h4 className="text-xl font-semibold">Attendance Dashboard</h4>
              </div>
              <p className="text-gray-600">
                Comprehensive analytics with filters by date, department, subject, and more
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Camera className="h-8 w-8 text-indigo-600 mr-3" />
                <h4 className="text-xl font-semibold">Real-time Sessions</h4>
              </div>
              <p className="text-gray-600">
                Initiate and manage live attendance sessions with instant face recognition
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Modern Tech Stack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Frontend</h4>
              <p className="text-gray-600">Next.js, React, Tailwind CSS</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Backend</h4>
              <p className="text-gray-600">Next.js API, Python Flask, FastAPI</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Database & AI</h4>
              <p className="text-gray-600">MongoDB, TensorFlow, OpenCV, DeepFace</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Smart Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
