import Notification from '../models/Notification.ts';
import User from '../models/User.ts';
import Booking from '../models/Booking.ts';
import Slot from '../models/Slot.ts';

type NotificationType = 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'meeting_reminder' | 'status_change';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  slotId?: string;
}

/**
 * Create and send a notification
 */
export const createNotification = async (data: NotificationData) => {
  try {
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedBookingId: data.bookingId,
      relatedSlotId: data.slotId,
      isRead: false,
      emailSent: false,
    });

    await notification.save();
    console.log(`Notification created for user ${data.userId}: ${data.type}`);
    
    // Send email asynchronously (can be implemented with NodeMailer later)
    sendEmailNotification(data.userId, data.title, data.message);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Notify faculty of new booking request
 */
export const notifyBookingRequest = async (bookingId: string, facultyId: string, studentName: string, slotTime: string) => {
  await createNotification({
    userId: facultyId,
    type: 'booking_request',
    title: 'New Booking Request',
    message: `${studentName} has requested to book a slot at ${slotTime}`,
    bookingId,
  });
};

/**
 * Notify student of booking approval
 */
export const notifyBookingApproved = async (bookingId: string, studentId: string, facultyName: string, slotTime: string) => {
  await createNotification({
    userId: studentId,
    type: 'booking_approved',
    title: 'Booking Approved',
    message: `Your booking with ${facultyName} at ${slotTime} has been approved!`,
    bookingId,
  });
};

/**
 * Notify student of booking rejection
 */
export const notifyBookingRejected = async (bookingId: string, studentId: string, facultyName: string, reason?: string) => {
  const message = reason 
    ? `Your booking with ${facultyName} has been rejected. Reason: ${reason}`
    : `Your booking with ${facultyName} has been rejected.`;
  
  await createNotification({
    userId: studentId,
    type: 'booking_rejected',
    title: 'Booking Rejected',
    message,
    bookingId,
  });
};

/**
 * Notify both parties of booking cancellation
 */
export const notifyBookingCancelled = async (
  bookingId: string,
  studentId: string,
  facultyId: string,
  facultyName: string,
  studentName: string,
  reason?: string
) => {
  const message = reason ? `Reason: ${reason}` : '';

  // Notify student
  await createNotification({
    userId: studentId,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `Your booking with ${facultyName} has been cancelled. ${message}`,
    bookingId,
  });

  // Notify faculty
  await createNotification({
    userId: facultyId,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `${studentName}'s booking has been cancelled. ${message}`,
    bookingId,
  });
};

/**
 * Notify student of upcoming meeting
 */
export const notifyMeetingReminder = async (bookingId: string, studentId: string, facultyName: string, slotTime: string, location: string) => {
  await createNotification({
    userId: studentId,
    type: 'meeting_reminder',
    title: 'Meeting Reminder',
    message: `Your meeting with ${facultyName} is scheduled for ${slotTime} at ${location}`,
    bookingId,
  });
};

/**
 * Send email notification (placeholder for email service)
 */
const sendEmailNotification = async (userId: string, subject: string, message: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // TODO: Implement email sending using NodeMailer or SendGrid
    // For now, just log it
    console.log(`Email to ${user.email}: ${subject}\n${message}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Clean up old notifications (older than 30 days)
 */
export const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });
    console.log(`Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
};
