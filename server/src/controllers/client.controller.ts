import type { Request, Response, NextFunction } from 'express';
import * as clientService from '../services/client.service.js';
import * as activityService from '../services/activity.service.js';

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, isActive } = req.query;

    const result = await clientService.getClients({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const client = await clientService.getClientById(id);
    res.status(200).json({ data: client });
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.createClient(req.body);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Created client',
      entityType: 'client',
      entityId: client.id,
      metadata: { email: client.email },
    }).catch(() => {});

    res.status(201).json({ data: client });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const client = await clientService.updateClient(id, req.body);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Updated client',
      entityType: 'client',
      entityId: id,
      metadata: { email: client.email },
    }).catch(() => {});

    res.status(200).json({ data: client });
  } catch (error) {
    next(error);
  }
};

export const deactivateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await clientService.deactivateClient(id);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Deactivated client',
      entityType: 'client',
      entityId: id,
    }).catch(() => {});

    res.status(200).json({ message: 'Client deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Deleted client',
      entityType: 'client',
      entityId: id,
    }).catch(() => {});

    await clientService.deleteClient(id);

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};
