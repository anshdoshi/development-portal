import type { Request, Response, NextFunction } from 'express';
import { signToken } from '../utils/jwt.js';
import * as authService from '../services/auth.service.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.login(req.body);
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.id);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
