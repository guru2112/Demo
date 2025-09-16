import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'staff';
  studentId?: string;
  department?: string;
  year?: number;
  division?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, studentId, department, year, division }: RegisterRequestBody = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate student-specific fields
    if (role === 'student' && !studentId) {
      return NextResponse.json(
        { error: 'Student ID is required for student accounts' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if student ID already exists (for students)
    if (role === 'student') {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student with this ID already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData: Partial<RegisterRequestBody & { password: string }> = {
      email,
      password: hashedPassword,
      name,
      role,
    };

    if (role === 'student') {
      userData.studentId = studentId;
      userData.department = department;
      userData.year = year;
      userData.division = division;
    } else {
      userData.department = department;
    }

    const user = new User(userData);
    await user.save();

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userResponse } = user.toObject();

    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      // Duplicate key error
      const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
      const field = keyPattern ? Object.keys(keyPattern)[0] : 'field';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}