import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Position in queue
  position: {
    type: Number,
    required: true,
  },

  // Status
  status: {
    type: String,
    enum: ['waiting', 'notified', 'booked', 'cancelled', 'expired'],
    default: 'waiting',
  },

  // Notification tracking
  notificationSentAt: Date,
  notificationExpiresAt: Date, // Gives student time to book before moving to next
  responseDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },

  // Preferences
  preferredTiming: String, // e.g., "morning", "afternoon", "evening"

  notes: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
waitlistSchema.index({ slotId: 1, position: 1 });
waitlistSchema.index({ studentId: 1, status: 1 });

export default mongoose.model('Waitlist', waitlistSchema);
