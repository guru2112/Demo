import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const FACE_API_URL = process.env.FACE_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const { image, studentId } = await request.json();

    if (!image || !studentId) {
      return NextResponse.json(
        { error: 'Image and student ID are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the student
    const student = await User.findOne({ studentId, role: 'student', isActive: true });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Call Python face recognition API
    const faceApiResponse = await fetch(`${FACE_API_URL}/register-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        student_id: studentId,
      }),
    });

    if (!faceApiResponse.ok) {
      const error = await faceApiResponse.json();
      return NextResponse.json(
        { error: error.error || 'Face registration failed' },
        { status: faceApiResponse.status }
      );
    }

    const faceData = await faceApiResponse.json();

    // Update user with face embedding
    await User.findByIdAndUpdate(student._id, {
      faceEmbedding: faceData.embedding,
    });

    return NextResponse.json({
      message: 'Face registered successfully',
      success: true,
      student_id: studentId,
    });

  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { error: 'Face registration failed. Please try again.' },
      { status: 500 }
    );
  }
}