import mongoose from 'mongoose';

interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'meeting_reminder' | 'status_change';
  title: string;
  message: string;
  relatedBookingId?: mongoose.Types.ObjectId;
  relatedSlotId?: mongoose.Types.ObjectId;
  isRead: boolean;
  notificationTime: Date;
  emailSent: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
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
    type: {
      type: String,
      enum: ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'meeting_reminder', 'status_change'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    relatedSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      set: (value: any) => {
        if (typeof value === 'string') {
          return new mongoose.Types.ObjectId(value);
        }
        return value;
      }
    },
    isRead: { type: Boolean, default: false, index: true },
    notificationTime: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
