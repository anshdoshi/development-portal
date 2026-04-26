import type { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service.js';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;

    const result = await notificationService.getNotifications(req.user!.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(req.params.id as string, req.user!.id);

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);

    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};
