import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'staff';
  studentId?: string;
  department?: string;
  year?: number;
  division?: string;
  contactInfo?: {
    phone?: string;
    address?: string;
  };
  faceEmbedding?: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'staff'],
    required: true,
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  department: {
    type: String,
  },
  year: {
    type: Number,
  },
  division: {
    type: String,
  },
  contactInfo: {
    phone: String,
    address: String,
  },
  faceEmbedding: {
    type: [Number],
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Ensure studentId is required for students
UserSchema.pre('save', function(next) {
  if (this.role === 'student' && !this.studentId) {
    next(new Error('Student ID is required for student accounts'));
  } else {
    next();
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);