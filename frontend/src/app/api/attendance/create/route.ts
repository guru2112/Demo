import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { date, subject, department, year, division, teacherId } = await request.json();

    if (!date || !subject || !department || !year || !division || !teacherId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || !['teacher', 'staff'].includes(teacher.role)) {
      return NextResponse.json(
        { error: 'Invalid teacher ID' },
        { status: 400 }
      );
    }

    // Generate unique session ID
    const sessionId = `${department}_${year}_${division}_${Date.now()}`;

    // Count total students in the class
    const totalStudents = await User.countDocuments({
      role: 'student',
      department,
      year,
      division,
      isActive: true,
    });

    // Create attendance session
    const session = new AttendanceSession({
      sessionId,
      date: new Date(date),
      subject,
      department,
      year,
      division,
      teacherId,
      startTime: new Date(),
      totalStudents,
    });

    await session.save();

    return NextResponse.json({
      message: 'Attendance session created successfully',
      session: {
        sessionId: session.sessionId,
        date: session.date,
        subject: session.subject,
        department: session.department,
        year: session.year,
        division: session.division,
        startTime: session.startTime,
        totalStudents: session.totalStudents,
        status: session.status,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create attendance session error:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance session' },
      { status: 500 }
    );
  }
}