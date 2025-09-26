import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Connect to database
    await connectDB();

    // Find the attendance session
    const session = await AttendanceSession.findOne({ sessionId })
      .populate('teacherId', 'name email')
      .populate('attendedStudents.userId', 'name studentId');

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate attendance statistics
    const attendanceRate = session.totalStudents > 0 
      ? (session.attendedStudents.length / session.totalStudents) * 100 
      : 0;

    const sessionData = {
      ...session.toObject(),
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      presentCount: session.attendedStudents.length,
      absentCount: session.totalStudents - session.attendedStudents.length,
    };

    return NextResponse.json({
      session: sessionData,
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { status } = await request.json();

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Update session status
    const session = await AttendanceSession.findOneAndUpdate(
      { sessionId },
      { 
        status,
        ...(status === 'completed' && { endTime: new Date() })
      },
      { new: true }
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Session status updated successfully',
      session,
    });

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session status' },
      { status: 500 }
    );
  }
}