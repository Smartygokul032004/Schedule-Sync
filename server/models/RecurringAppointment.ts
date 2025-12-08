import mongoose from 'mongoose';

const recurringAppointmentSchema = new mongoose.Schema({
  // Original booking details
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Recurrence pattern
  recurrenceType: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  daysOfWeek: {
    type: [Number], // 0-6 for Sunday-Saturday
    default: [],
  },

  // Generated appointments
  generatedBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],

  isActive: {
    type: Boolean,
    default: true,
  },
  cancelledAt: Date,
  cancelReason: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('RecurringAppointment', recurringAppointmentSchema);
