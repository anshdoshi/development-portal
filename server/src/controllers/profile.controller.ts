import type { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service.js';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfile(req.user!.id);

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.updateProfile(req.user!.id, req.body);

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await profileService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement multer upload handling
    res.status(200).json({ message: 'Avatar upload placeholder', avatarUrl: null });
  } catch (error) {
    next(error);
  }
};
