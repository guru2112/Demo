import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AttendanceSession from '@/models/AttendanceSession';

interface QueryParams {
  department?: string;
  year?: string;
  division?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const division = searchParams.get('division');
    const subject = searchParams.get('subject');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Connect to database
    await connectDB();

    // Build query
    const query: Record<string, unknown> = {};

    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (division) query.division = division;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (query.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get attendance sessions with pagination
    const sessions = await AttendanceSession.find(query)
      .populate('teacherId', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalSessions = await AttendanceSession.countDocuments(query);

    // Calculate attendance statistics for each session
    const sessionsWithStats = sessions.map(session => {
      const attendanceRate = session.totalStudents > 0 
        ? (session.attendedStudents.length / session.totalStudents) * 100 
        : 0;

      return {
        ...session.toObject(),
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        presentCount: session.attendedStudents.length,
        absentCount: session.totalStudents - session.attendedStudents.length,
      };
    });

    return NextResponse.json({
      sessions: sessionsWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNext: page < Math.ceil(totalSessions / limit),
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('List attendance sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance sessions' },
      { status: 500 }
    );
  }
}