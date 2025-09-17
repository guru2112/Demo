import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceSession extends Document {
  sessionId: string;
  date: Date;
  subject: string;
  department: string;
  year: number;
  division: string;
  semester?: string;
  teacherId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  attendedStudents: Array<{
    studentId: string;
    userId: mongoose.Types.ObjectId;
    markedAt: Date;
    confidence: number;
  }>;
  totalStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  attendedStudents: [{
    studentId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    confidence: {
      type: Number,
      required: true,
    },
  }],
  totalStudents: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.AttendanceSession || mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);