import type { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service.js';

const PUBLIC_KEYS = ['site_name', 'allow_registration'];

export const getPublicSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await settingsService.getSettings();
    const publicSettings = all.filter((s: { key: string }) => PUBLIC_KEYS.includes(s.key));
    res.status(200).json({ settings: publicSettings });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getSettings();

    res.status(200).json({ settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.updateSettings(req.body.settings);

    res.status(200).json({ settings });
  } catch (error) {
    next(error);
  }
};
