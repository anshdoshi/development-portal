import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  logger.error('Unhandled error:', err);

  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(isDev && { errors: err.stack }),
  });
}
