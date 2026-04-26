import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import * as activityService from '../services/activity.service.js';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, role, search, isActive } = req.query;

    const result = await userService.getUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      role: role as string | undefined,
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser(req.body);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Created user',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email },
    }).catch(() => {});

    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Updated user',
      entityType: 'user',
      entityId: req.params.id,
      metadata: { email: user.email },
    }).catch(() => {});

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deactivateUser(req.params.id);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Deactivated user',
      entityType: 'user',
      entityId: req.params.id,
    }).catch(() => {});

    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Deleted user',
      entityType: 'user',
      entityId: req.params.id,
    }).catch(() => {});

    await userService.deleteUser(req.params.id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
