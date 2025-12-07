import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = express.Router();

type Request = express.Request;
type Response = express.Response;

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const user = new User({ name, email, password, role, department });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/status/online', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isOnline: true, lastSeen: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/status/offline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isOnline: false, lastSeen: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { bio, qualifications, profilePhoto } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(bio !== undefined && { bio }),
        ...(qualifications && { qualifications }),
        ...(profilePhoto && { profilePhoto }),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile settings (bio, qualifications, profile photo)
router.put('/profile/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { bio, qualifications, profilePhoto } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        bio,
        qualifications: Array.isArray(qualifications) ? qualifications : [],
        profilePhoto,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
