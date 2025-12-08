import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware, facultyOnly } from '../middleware/auth.ts';
import Slot from '../models/Slot.ts';
import Booking from '../models/Booking.ts';
import User from '../models/User.ts';
import crypto from 'crypto';
import { notifyBookingApproved, notifyBookingRejected, notifyBookingCancelled } from '../utils/notifications.ts';

type Request = express.Request;
type Response = express.Response;

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const router = express.Router();

router.use(authMiddleware, facultyOnly);

router.post('/slots', async (req: AuthRequest, res: Response) => {
  try {
    const { startTime, endTime, location, notes, capacity } = req.body;
    console.log('Creating slot - userId:', req.userId, 'body:', req.body);

    if (!startTime || !endTime || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized - no userId' });
    }

    const slot = new Slot({
      facultyId: req.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      notes,
      capacity: capacity || 1,
    });

    await slot.save();
    console.log('Slot created:', slot._id);
    res.status(201).json(slot);
  } catch (error: any) {
    console.error('Error creating slot:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/slots', async (req: AuthRequest, res: Response) => {
  try {
    const slots = await Slot.find({ facultyId: req.userId }).sort({ startTime: -1 });
    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create multiple slots at once
router.post('/bulk-slots', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, startTime, endTime, location, notes, repeatDays } = req.body;

    if (!startDate || !endDate || !location || !repeatDays || repeatDays.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized - no userId' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)

      if (repeatDays.includes(adjustedDay)) {
        const slotStart = new Date(d);
        const [startHour, startMin] = startTime.split(':');
        slotStart.setHours(parseInt(startHour), parseInt(startMin), 0);

        const slotEnd = new Date(d);
        const [endHour, endMin] = endTime.split(':');
        slotEnd.setHours(parseInt(endHour), parseInt(endMin), 0);

        slots.push(
          new Slot({
            facultyId: req.userId,
            startTime: slotStart,
            endTime: slotEnd,
            location,
            notes,
            capacity: 1,
          })
        );
      }
    }

    await Slot.insertMany(slots);
    console.log(`Created ${slots.length} slots for faculty ${req.userId}`);
    res.status(201).json({ message: `Created ${slots.length} slots`, count: slots.length, slots });
  } catch (error: any) {
    console.error('Error creating bulk slots:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/slots/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, location, notes, capacity } = req.body;

    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.facultyId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (startTime) slot.startTime = new Date(startTime);
    if (endTime) slot.endTime = new Date(endTime);
    if (location) slot.location = location;
    if (notes !== undefined) slot.notes = notes;
    if (capacity) slot.capacity = capacity;

    await slot.save();
    res.json(slot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/slots/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findById(id);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.facultyId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Slot.findByIdAndDelete(id);
    res.json({ message: 'Slot deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/slots/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findById(id);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.facultyId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    slot.isCancelled = true;
    await slot.save();
    res.json(slot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bookings', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Fetching bookings for faculty:', req.userId);
    const bookings = await Booking.find({ facultyId: req.userId }).sort({ createdAt: -1 });
    console.log('Found bookings:', bookings.length);
    
    // Populate student and slot details
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const student = await User.findById(booking.studentId).select('name email');
        const slot = await Slot.findById(booking.slotId);
        return {
          ...booking.toObject(),
          student,
          slot,
        };
      })
    );

    res.json(populatedBookings);
  } catch (error: any) {
    console.error('Error fetching faculty bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-share-token', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    user.publicShareToken = token;
    await user.save();

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a booking
router.put('/bookings/:bookingId/approve', async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status: 'approved', approvedAt: new Date() },
      { new: true }
    ).populate('studentId', 'name email').populate('slotId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Send notification to student
    const student = await User.findById(booking.studentId);
    const faculty = await User.findById(req.userId);
    const slot = await Slot.findById(booking.slotId);
    
    if (student && faculty && slot) {
      const slotTime = new Date(slot.startTime).toLocaleString();
      await notifyBookingApproved(booking._id.toString(), student._id.toString(), faculty.name, slotTime);
    }

    res.json({ message: 'Booking approved', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a booking
router.put('/bookings/:bookingId/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body || {};
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status: 'rejected', rejectedAt: new Date() },
      { new: true }
    ).populate('studentId', 'name email').populate('slotId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Send notification to student
    const student = await User.findById(booking.studentId);
    const faculty = await User.findById(req.userId);
    
    if (student && faculty) {
      await notifyBookingRejected(booking._id.toString(), student._id.toString(), faculty.name, reason || 'Rejected by faculty');
    }

    res.json({ message: 'Booking rejected', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a booking
router.put('/bookings/:bookingId/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body || {};
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status: 'cancelled', cancellationReason: reason || 'Cancelled by faculty', cancelledAt: new Date() },
      { new: true }
    ).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Send notification to both parties
    const student = await User.findById(booking.studentId);
    const faculty = await User.findById(req.userId);
    
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

    res.json({ message: 'Booking cancelled', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
