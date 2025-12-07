import jwt from 'jsonwebtoken';
import express from 'express';

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const facultyOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'faculty') {
    return res.status(403).json({ error: 'Faculty access only' });
  }
  next();
};

export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'student') {
    return res.status(403).json({ error: 'Student access only' });
  }
  next();
};
