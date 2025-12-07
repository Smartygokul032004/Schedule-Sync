import express from 'express';
import User from '../models/User.ts';
import Slot from '../models/Slot.ts';
import Booking from '../models/Booking.ts';

type Request = express.Request;
type Response = express.Response;

const router = express.Router();

// More specific route must come first
router.get('/faculty/:facultyId/profile', async (req: Request, res: Response) => {
  try {
    const { facultyId } = req.params;
    console.log('Fetching faculty profile for ID:', facultyId);

    // Check if it's a valid MongoDB ID (should be 24 hex characters)
    if (!facultyId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid MongoDB ID format:', facultyId);
      // This might be the schedule token, so continue to next route
      return res.status(400).json({ error: 'Invalid faculty ID format' });
    }

    const user = await User.findById(facultyId);
    if (!user) {
      console.log('Faculty not found for ID:', facultyId);
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (error: any) {
    console.error('Error fetching faculty profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Less specific route comes after
router.get('/faculty/:token/schedule', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ publicShareToken: token, role: 'faculty' });
    if (!user) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const slots = await Slot.find({
      facultyId: user._id,
      isCancelled: false,
    }).sort({ startTime: 1 });

    const slotsWithBooking = await Promise.all(
      slots.map(async (slot) => {
        const booking = await Booking.findOne({
          slotId: slot._id,
          status: 'approved',
        });
        return {
          ...slot.toObject(),
          isBooked: !!booking,
        };
      })
    );

    res.json({
      faculty: {
        id: user._id,
        name: user.name,
        department: user.department,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
      slots: slotsWithBooking,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/faculty-ids', async (req: Request, res: Response) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('_id name email');
    res.json(faculty);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
