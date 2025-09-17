import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, department, year, division, contactInfo } = await request.json();

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: 'User ID, name, and email are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
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

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = updatedUser.toObject();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userResponse,
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Profile update failed. Please try again.' },
      { status: 500 }
    );
  }
}