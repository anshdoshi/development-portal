import type { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service.js';

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getAdminDashboard();

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getClientDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getClientDashboard(req.user!.id);

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getUserDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getUserDashboard(req.user!.id);

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};
