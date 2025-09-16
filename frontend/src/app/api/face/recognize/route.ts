import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const FACE_API_URL = process.env.FACE_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get all students with face embeddings
    const students = await User.find({
      role: 'student',
      faceEmbedding: { $exists: true, $ne: null },
      isActive: true,
    }).select('studentId faceEmbedding name');

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No registered students found' },
        { status: 404 }
      );
    }

    // Prepare embeddings for face recognition API
    const embeddings = students.map(student => ({
      student_id: student.studentId,
      embedding: student.faceEmbedding,
    }));

    // Call Python face recognition API
    const faceApiResponse = await fetch(`${FACE_API_URL}/recognize-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        embeddings,
      }),
    });

    if (!faceApiResponse.ok) {
      const error = await faceApiResponse.json();
      return NextResponse.json(
        { error: error.error || 'Face recognition failed' },
        { status: faceApiResponse.status }
      );
    }

    const recognitionResult = await faceApiResponse.json();

    if (recognitionResult.recognized) {
      // Find the recognized student details
      const recognizedStudent = students.find(
        s => s.studentId === recognitionResult.student_id
      );

      return NextResponse.json({
        recognized: true,
        student: {
          studentId: recognizedStudent?.studentId,
          name: recognizedStudent?.name,
        },
        confidence: recognitionResult.confidence,
        liveness_passed: recognitionResult.liveness_passed,
      });
    } else {
      return NextResponse.json({
        recognized: false,
        confidence: recognitionResult.confidence,
        liveness_passed: recognitionResult.liveness_passed,
      });
    }

  } catch (error) {
    console.error('Face recognition error:', error);
    return NextResponse.json(
      { error: 'Face recognition failed. Please try again.' },
      { status: 500 }
    );
  }
}