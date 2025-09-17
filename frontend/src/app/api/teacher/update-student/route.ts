import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    const { studentId, name, email, department, year, division, contactInfo } = await request.json();

    if (!studentId || !name || !email) {
      return NextResponse.json(
        { error: 'Student ID, name, and email are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and update the student
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      {
        name,
        email,
        department,
        year,
        division,
        contactInfo,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Verify it's a student
    if (updatedStudent.role !== 'student') {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = updatedStudent.toObject();

    return NextResponse.json({
      message: 'Student updated successfully',
      user: userResponse,
    });

  } catch (error) {
    console.error('Student update error:', error);
    return NextResponse.json(
      { error: 'Student update failed. Please try again.' },
      { status: 500 }
    );
  }
}