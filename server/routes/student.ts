import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware, studentOnly } from '../middleware/auth.ts';
import Slot from '../models/Slot.ts';
import Booking from '../models/Booking.ts';
import User from '../models/User.ts';
import Waitlist from '../models/Waitlist.ts';
import { notifyBookingCancelled } from '../utils/notifications.ts';

type Request = express.Request;
type Response = express.Response;

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const router = express.Router();

router.use(authMiddleware, studentOnly);

router.get('/faculty', async (req: AuthRequest, res: Response) => {
  try {
    const { department, search } = req.query;
    const query: any = { role: 'faculty' };

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const faculty = await User.find(query).select('-password');
    res.json(faculty);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/faculty/:facultyId/slots', async (req: AuthRequest, res: Response) => {
  try {
    const { facultyId } = req.params;
    const now = new Date();
    
    console.log('Fetching slots for faculty:', facultyId, 'now:', now);

    const slots = await Slot.find({
      facultyId,
      isCancelled: false,
      endTime: { $gt: now },
    }).sort({ startTime: 1 });
    
    console.log('Found slots:', slots.length);

    const slotsWithStatus = await Promise.all(
      slots.map(async (slot) => {
        const bookingCount = await Booking.countDocuments({
          slotId: slot._id,
          status: { $nin: ['cancelled', 'rejected'] },
        });

        const studentBooking = await Booking.findOne({
          slotId: slot._id,
          studentId: req.userId,
          status: { $nin: ['cancelled', 'rejected'] },
        });

        const waitlistCount = await Waitlist.countDocuments({
          slotId: slot._id,
          status: { $in: ['waiting', 'notified'] },
        });

        const isFull = bookingCount >= slot.capacity;

        return {
          ...slot.toObject(),
          isBooked: !!studentBooking,
          isFull,
          bookingCount,
          waitlistCount,
          availableSpots: Math.max(0, slot.capacity - bookingCount),
        };
      })
    );

    res.json(slotsWithStatus);
  } catch (error: any) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/book-slot', async (req: AuthRequest, res: Response) => {
  try {
    const { slotId, withRecurring } = req.body;

    if (!slotId) {
      return res.status(400).json({ error: 'Slot ID is required' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.isCancelled) {
      return res.status(400).json({ error: 'Slot is cancelled' });
    }

    // Count existing bookings (excluding cancelled)
    const bookingCount = await Booking.countDocuments({
      slotId,
      status: { $nin: ['cancelled', 'rejected'] },
    });

    // Check if slot is full
    if (bookingCount >= slot.capacity) {
      // Slot is full - check if student wants to join waitlist
      const existingWaitlist = await Waitlist.findOne({
        slotId,
        studentId: req.userId,
        status: { $ne: 'cancelled' },
      });

      if (existingWaitlist) {
        return res.status(400).json({ error: 'You are already on the waitlist for this slot' });
      }

      return res.status(400).json({
        error: 'Slot is fully booked',
        isFull: true,
        message: 'Would you like to join the waitlist?',
      });
    }

    // Check if student already has a booking
    const existingBooking = await Booking.findOne({
      slotId,
      studentId: req.userId,
      status: { $nin: ['cancelled', 'rejected'] },
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'You have already booked this slot' });
    }

    const booking = new Booking({
      slotId,
      facultyId: slot.facultyId,
      studentId: req.userId,
      status: 'pending',
    });

    await booking.save();
    res.status(201).json({
      message: 'Slot booked successfully',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-bookings', async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ studentId: req.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cancel-booking/:bookingId', async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    // Send notification to faculty
    const student = await User.findById(req.userId);
    const faculty = await User.findById(booking.facultyId);
    
    if (student && faculty) {
      await notifyBookingCancelled(
        booking._id.toString(),
        student._id.toString(),
        faculty._id.toString(),
        faculty.name,
        student.name,
        reason
      );
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking (PUT - matches frontend call)
router.put('/bookings/:bookingId/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by student';
    booking.cancelledAt = new Date();
    await booking.save();

    // Send notification to faculty
    const student = await User.findById(req.userId);
    const faculty = await User.findById(booking.facultyId);
    
    if (student && faculty) {
      await notifyBookingCancelled(
        booking._id.toString(),
        student._id.toString(),
        faculty._id.toString(),
        faculty.name,
        student.name,
        booking.cancellationReason
      );
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings for student
router.get('/bookings', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Fetching bookings for student:', req.userId);
    const bookings = await Booking.find({ studentId: req.userId }).sort({ createdAt: -1 });
    console.log('Found bookings:', bookings.length);
    
    // Populate faculty and slot details
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const faculty = await User.findById(booking.facultyId).select('name email department');
        const slot = await Slot.findById(booking.slotId);
        return {
          ...booking.toObject(),
          faculty,
          slot,
        };
      })
    );

    res.json(populatedBookings);
  } catch (error: any) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reschedule a booking to a different slot
router.post('/reschedule-booking/:bookingId', async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { newSlotId } = req.body;

    if (!newSlotId) {
      return res.status(400).json({ error: 'New slot ID is required' });
    }

    const oldBooking = await Booking.findById(bookingId);
    if (!oldBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (oldBooking.studentId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if new slot exists and is available
    const newSlot = await Slot.findById(newSlotId);
    if (!newSlot) {
      return res.status(404).json({ error: 'New slot not found' });
    }

    if (newSlot.isCancelled) {
      return res.status(400).json({ error: 'New slot is cancelled' });
    }

    // Check if new slot is already booked
    const existingBooking = await Booking.findOne({
      slotId: newSlotId,
      status: { $nin: ['cancelled', 'rejected'] },
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'New slot is already booked' });
    }

    // Create new booking
    const newBooking = new Booking({
      slotId: newSlotId,
      facultyId: newSlot.facultyId,
      studentId: req.userId,
      status: 'pending',
      originalBookingId: bookingId,
    });

    await newBooking.save();

    // Cancel old booking
    oldBooking.status = 'cancelled';
    oldBooking.cancellationReason = 'Rescheduled to a different slot';
    oldBooking.rescheduledTo = newBooking._id;
    await oldBooking.save();

    res.json({
      message: 'Booking rescheduled successfully',
      oldBooking,
      newBooking,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
