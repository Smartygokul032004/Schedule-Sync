import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.ts';
import Slot from '../models/Slot.ts';
import User from '../models/User.ts';
import RecurringAppointment from '../models/RecurringAppointment.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = express.Router();

type Request = express.Request;
type Response = express.Response;

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Helper function to generate recurring bookings
async function generateRecurringBookings(
  originalSlotId: string,
  recurringData: any,
  createdRecurring: any
) {
  const originalSlot = await Slot.findById(originalSlotId);
  if (!originalSlot) throw new Error('Original slot not found');

  const generatedBookings = [];
  const startDate = new Date(originalSlot.date);
  const endDate = new Date(recurringData.endDate);
  const bookingsToCreate = [];

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Check if slot already exists for this date
    const existingSlot = await Slot.findOne({
      facultyId: originalSlot.facultyId,
      startTime: originalSlot.startTime,
      endTime: originalSlot.endTime,
      date: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
      },
    });

    if (!existingSlot) {
      // Create new slot for this date
      const newSlot = new Slot({
        facultyId: originalSlot.facultyId,
        startTime: originalSlot.startTime,
        endTime: originalSlot.endTime,
        date: new Date(currentDate),
        capacity: originalSlot.capacity,
        description: `${originalSlot.description} (Recurring)`,
      });

      const savedSlot = await newSlot.save();

      // Create booking for this slot
      const newBooking = new Booking({
        slotId: savedSlot._id,
        facultyId: originalSlot.facultyId,
        studentId: createdRecurring.studentId,
        status: 'approved',
        recurringAppointmentId: createdRecurring._id,
      });

      const savedBooking = await newBooking.save();
      generatedBookings.push(savedBooking._id);
      bookingsToCreate.push(savedBooking._id);
    }

    // Move to next recurrence
    switch (recurringData.recurrenceType) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }

  // Update recurring appointment with generated bookings
  await RecurringAppointment.findByIdAndUpdate(
    createdRecurring._id,
    { generatedBookings: generatedBookings }
  );

  return generatedBookings;
}

// Create recurring appointment
router.post('/recurring', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slotId, recurrenceType, endDate } = req.body;

    if (!slotId || !recurrenceType || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['weekly', 'biweekly', 'monthly'].includes(recurrenceType)) {
      return res.status(400).json({ error: 'Invalid recurrence type' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    const recurring = new RecurringAppointment({
      bookingId: new mongoose.Types.ObjectId(), // Will be updated
      slotId,
      studentId: req.userId,
      facultyId: slot.facultyId,
      recurrenceType,
      endDate: new Date(endDate),
    });

    const createdRecurring = await recurring.save();

    // Generate recurring bookings
    const generatedBookings = await generateRecurringBookings(
      slotId,
      { recurrenceType, endDate },
      createdRecurring
    );

    res.status(201).json({
      message: 'Recurring appointment created',
      recurringAppointment: createdRecurring,
      generatedBookings: generatedBookings.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get recurring appointments for student
router.get(
  '/recurring/student/:studentId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const recurring = await RecurringAppointment.find({
        studentId: req.params.studentId,
        isActive: true,
      })
        .populate('slotId')
        .populate('facultyId', 'name email department')
        .populate('generatedBookings');

      res.json(recurring);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get recurring appointments for faculty
router.get(
  '/recurring/faculty/:facultyId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const recurring = await RecurringAppointment.find({
        facultyId: req.params.facultyId,
        isActive: true,
      })
        .populate('slotId')
        .populate('studentId', 'name email department')
        .populate('generatedBookings');

      res.json(recurring);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Cancel recurring appointment (cancels all future bookings)
router.post(
  '/recurring/:recurringId/cancel',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { reason } = req.body;
      const recurring = await RecurringAppointment.findById(req.params.recurringId);

      if (!recurring) {
        return res.status(404).json({ error: 'Recurring appointment not found' });
      }

      // Update status
      await RecurringAppointment.findByIdAndUpdate(
        req.params.recurringId,
        {
          isActive: false,
          cancelledAt: new Date(),
          cancelReason: reason,
        }
      );

      // Cancel all associated bookings
      await Booking.updateMany(
        { recurringAppointmentId: req.params.recurringId },
        { status: 'cancelled', cancellationReason: reason || 'Recurring series cancelled' }
      );

      res.json({ message: 'Recurring appointment cancelled' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
