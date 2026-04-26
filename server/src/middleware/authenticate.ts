import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication required. Please provide a valid token.', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired token.', 401));
  }
}
