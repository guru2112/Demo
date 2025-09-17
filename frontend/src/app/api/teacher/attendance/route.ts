import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const division = searchParams.get('division');
    const semester = searchParams.get('semester');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    // Connect to database
    await connectDB();

    // Build query
    const query: Record<string, unknown> = {};

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (division) {
      query.division = { $regex: division, $options: 'i' };
    }

    if (semester) {
      query.semester = semester;
    }

    if (status) {
      query.status = status;
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

    // Get attendance sessions with teacher and student details
    const sessions = await AttendanceSession.find(query)
      .sort({ date: -1, startTime: -1 })
      .populate('teacherId', 'name')
      .populate('attendedStudents.userId', 'name studentId');

    // Process sessions to include detailed attendance information
    const processedSessions = sessions.map(session => {
      const attendedStudents = session.attendedStudents.map((attendance: { studentId: string; userId: { _id: string; name: string }; markedAt: Date; confidence: number }) => ({
        studentId: attendance.studentId,
        userId: attendance.userId._id,
        name: attendance.userId.name,
        markedAt: attendance.markedAt,
        confidence: attendance.confidence,
      }));

      return {
        _id: session._id,
        sessionId: session.sessionId,
        date: session.date,
        subject: session.subject,
        department: session.department,
        year: session.year,
        division: session.division,
        semester: session.semester,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        totalStudents: session.totalStudents,
        attendedStudents,
        teacher: {
          name: session.teacherId.name,
        },
      };
    });

    return NextResponse.json({
      message: 'Attendance sessions fetched successfully',
      sessions: processedSessions,
      total: processedSessions.length,
    });

  } catch (error) {
    console.error('Fetch teacher attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}