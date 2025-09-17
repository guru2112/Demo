import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, studentId, confidence } = await request.json();

    if (!sessionId || !studentId || confidence === undefined) {
      return NextResponse.json(
        { error: 'Session ID, student ID, and confidence are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the attendance session
    const session = await AttendanceSession.findOne({
      sessionId,
      status: 'active',
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Find the student
    const student = await User.findOne({
      studentId,
      role: 'student',
      isActive: true,
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student is already marked present
    const alreadyPresent = session.attendedStudents.some(
      (attendee: { studentId: string }) => attendee.studentId === studentId
    );

    if (alreadyPresent) {
      return NextResponse.json(
        { 
          message: 'Attendance already marked',
          status: 'already_marked',
          student: {
            name: student.name,
            studentId: student.studentId,
          }
        },
        { status: 200 }
      );
    }

    // Check if student belongs to the same class
    if (
      student.department !== session.department ||
      student.year !== session.year ||
      student.division !== session.division
    ) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 403 }
      );
    }

    // Mark attendance
    session.attendedStudents.push({
      studentId: student.studentId,
      userId: student._id,
      markedAt: new Date(),
      confidence: confidence,
    });

    await session.save();

    return NextResponse.json({
      message: 'Attendance marked successfully',
      status: 'success',
      student: {
        name: student.name,
        studentId: student.studentId,
      },
      markedAt: new Date(),
      confidence: confidence,
    }, { status: 200 });

  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}