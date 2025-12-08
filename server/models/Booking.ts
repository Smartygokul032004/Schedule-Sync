import mongoose from 'mongoose';

interface IBooking extends mongoose.Document {
  slotId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  cancellationReason?: string;
  originalBookingId?: mongoose.Types.ObjectId;
  rescheduledTo?: mongoose.Types.ObjectId;
  recurringAppointmentId?: mongoose.Types.ObjectId;
  bookedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    slotId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Slot', 
      required: true, 
      index: true,
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    facultyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true,
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true,
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    cancellationReason: String,
    bookedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,
    originalBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    rescheduledTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    recurringAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringAppointment',
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', bookingSchema);
