import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subject = searchParams.get('subject');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the user to get their details
    const user = await User.findById(studentId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Build query
    const query: Record<string, unknown> = {
      department: user.department,
      year: user.year,
      division: user.division,
    };

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (dateFrom && dateTo) {
      query.date = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    } else if (dateFrom) {
      query.date = { $gte: new Date(dateFrom) };
    } else if (dateTo) {
      query.date = { $lte: new Date(dateTo) };
    }

    // Get attendance sessions
    const sessions = await AttendanceSession.find(query)
      .sort({ date: -1, startTime: -1 })
      .populate('teacherId', 'name');

    // Process sessions to include student's attendance status
    const attendanceRecords = sessions.map(session => {
      const studentAttendance = session.attendedStudents.find(
        (attendance: { userId: { toString: () => string } }) => attendance.userId.toString() === studentId
      );

      const isPresent = !!studentAttendance;
      
      // Apply status filter if provided
      if (status === 'present' && !isPresent) return null;
      if (status === 'absent' && isPresent) return null;

      return {
        _id: session._id,
        sessionId: session.sessionId,
        date: session.date,
        subject: session.subject,
        department: session.department,
        year: session.year,
        division: session.division,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        teacher: session.teacherId,
        isPresent,
        markedAt: studentAttendance?.markedAt,
        confidence: studentAttendance?.confidence,
      };
    }).filter(record => record !== null);

    return NextResponse.json({
      message: 'Attendance records fetched successfully',
      attendance: attendanceRecords,
      student: {
        name: user.name,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
        division: user.division,
      },
    });

  } catch (error) {
    console.error('Fetch student attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}