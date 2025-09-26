import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, image } = await request.json();

    if (!sessionId || !image) {
      return NextResponse.json(
        { error: 'Session ID and image are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the attendance session
    const session = await AttendanceSession.findOne({ 
      sessionId, 
      status: 'active' 
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Get all students with face embeddings for this class
    const students = await User.find({
      role: 'student',
      department: session.department,
      year: session.year,
      division: session.division,
      faceEmbedding: { $exists: true, $ne: null },
      isActive: true,
    }).select('studentId faceEmbedding name');

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No registered students found for this class' },
        { status: 404 }
      );
    }

    // Prepare embeddings for face recognition API
    const embeddings = students.map(student => ({
      student_id: student.studentId,
      embedding: student.faceEmbedding,
    }));

    // Call Python face recognition API
    const FACE_API_URL = process.env.FACE_API_URL || 'http://localhost:5000/api';
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
      // Find the recognized student
      const recognizedStudent = students.find(
        s => s.studentId === recognitionResult.student_id
      );

      if (!recognizedStudent) {
        return NextResponse.json(
          { error: 'Student not found in database' },
          { status: 404 }
        );
      }

      // Check if student already marked attendance
      const alreadyMarked = session.attendedStudents.some(
        (attendance: { studentId: string }) => attendance.studentId === recognizedStudent.studentId
      );

      if (alreadyMarked) {
        return NextResponse.json(
          { error: 'Attendance already marked for this student' },
          { status: 400 }
        );
      }

      // Mark attendance
      session.attendedStudents.push({
        studentId: recognizedStudent.studentId,
        userId: recognizedStudent._id,
        markedAt: new Date(),
        confidence: recognitionResult.confidence,
      });

      await session.save();

      return NextResponse.json({
        success: true,
        message: 'Attendance marked successfully',
        student: {
          studentId: recognizedStudent.studentId,
          name: recognizedStudent.name,
        },
        confidence: recognitionResult.confidence,
        sessionId: session.sessionId,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Face not recognized',
        confidence: recognitionResult.confidence,
      });
    }

  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance. Please try again.' },
      { status: 500 }
    );
  }
}