import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError('You do not have permission to perform this action.', 403)
      );
      return;
    }

    next();
  };
}
