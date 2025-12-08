import express from 'express';
import Slot from '../models/Slot.ts';
import Booking from '../models/Booking.ts';
import Waitlist from '../models/Waitlist.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = express.Router();

type Request = express.Request;
type Response = express.Response;

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Join waitlist for a fully booked slot
router.post('/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slotId, preferredTiming, notes } = req.body;

    if (!slotId) {
      return res.status(400).json({ error: 'Slot ID is required' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Check if slot is actually full
    const bookingCount = await Booking.countDocuments({
      slotId,
      status: { $ne: 'cancelled' },
    });

    if (bookingCount < slot.capacity) {
      return res.status(400).json({ error: 'Slot is not fully booked' });
    }

    // Check if student is already in waitlist
    const existingWaitlist = await Waitlist.findOne({
      slotId,
      studentId: req.userId,
      status: { $ne: 'cancelled' },
    });

    if (existingWaitlist) {
      return res.status(400).json({ error: 'You are already on the waitlist for this slot' });
    }

    // Get current position (count of waiting + notified)
    const position =
      (await Waitlist.countDocuments({
        slotId,
        status: { $in: ['waiting', 'notified'] },
      })) + 1;

    const waitlist = new Waitlist({
      slotId,
      studentId: req.userId,
      facultyId: slot.facultyId,
      position,
      preferredTiming,
      notes,
    });

    const createdWaitlist = await waitlist.save();

    res.status(201).json({
      message: 'Added to waitlist successfully',
      waitlist: createdWaitlist,
      position: position,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get waitlist for a slot
router.get('/slot/:slotId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const waitlist = await Waitlist.find({
      slotId: req.params.slotId,
      status: { $in: ['waiting', 'notified'] },
    })
      .populate('studentId', 'name email')
      .sort({ position: 1 });

    res.json(waitlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get student's waitlist entries
router.get(
  '/student/:studentId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const waitlist = await Waitlist.find({
        studentId: req.params.studentId,
        status: { $ne: 'cancelled' },
      })
        .populate('slotId')
        .populate('facultyId', 'name email department')
        .sort({ createdAt: -1 });

      res.json(waitlist);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Check if slot has available spots and notify waitlist
router.post(
  '/check-and-notify/:slotId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const slot = await Slot.findById(req.params.slotId);
      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }

      const bookingCount = await Booking.countDocuments({
        slotId: req.params.slotId,
        status: { $ne: 'cancelled' },
      });

      if (bookingCount < slot.capacity) {
        // Slot has available space, notify next person on waitlist
        const nextWaitlist = await Waitlist.findOne({
          slotId: req.params.slotId,
          status: 'waiting',
        }).sort({ position: 1 });

        if (nextWaitlist) {
          await Waitlist.findByIdAndUpdate(
            nextWaitlist._id,
            {
              status: 'notified',
              notificationSentAt: new Date(),
              responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
          );

          return res.json({
            message: 'Slot available, notified next waitlist student',
            nextStudent: nextWaitlist.studentId,
          });
        }
      }

      res.json({ message: 'Slot is still full or no waitlist' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Cancel waitlist entry
router.post(
  '/:waitlistId/cancel',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const waitlist = await Waitlist.findById(req.params.waitlistId);
      if (!waitlist) {
        return res.status(404).json({ error: 'Waitlist entry not found' });
      }

      // Update status
      await Waitlist.findByIdAndUpdate(req.params.waitlistId, {
        status: 'cancelled',
      });

      // Re-position remaining entries
      const remainingWaitlist = await Waitlist.find({
        slotId: waitlist.slotId,
        status: { $in: ['waiting', 'notified'] },
      }).sort({ position: 1 });

      for (let i = 0; i < remainingWaitlist.length; i++) {
        await Waitlist.findByIdAndUpdate(remainingWaitlist[i]._id, {
          position: i + 1,
        });
      }

      res.json({ message: 'Removed from waitlist' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Faculty: Accept offer from waitlist (book the slot)
router.post(
  '/:waitlistId/accept',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const waitlist = await Waitlist.findById(req.params.waitlistId);
      if (!waitlist) {
        return res.status(404).json({ error: 'Waitlist entry not found' });
      }

      if (waitlist.status !== 'notified') {
        return res.status(400).json({ error: 'This offer has expired or already processed' });
      }

      // Create booking
      const booking = new Booking({
        slotId: waitlist.slotId,
        studentId: waitlist.studentId,
        facultyId: waitlist.facultyId,
        status: 'approved',
      });

      const savedBooking = await booking.save();

      // Update waitlist entry
      await Waitlist.findByIdAndUpdate(req.params.waitlistId, {
        status: 'booked',
      });

      // Notify next person if slot still has space
      const slot = await Slot.findById(waitlist.slotId);
      const bookingCount = await Booking.countDocuments({
        slotId: waitlist.slotId,
        status: { $ne: 'cancelled' },
      });

      if (bookingCount < slot!.capacity) {
        const nextWaitlist = await Waitlist.findOne({
          slotId: waitlist.slotId,
          status: 'waiting',
        }).sort({ position: 1 });

        if (nextWaitlist) {
          await Waitlist.findByIdAndUpdate(nextWaitlist._id, {
            status: 'notified',
            notificationSentAt: new Date(),
            responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
        }
      }

      res.json({
        message: 'Booking confirmed from waitlist',
        booking: savedBooking,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
