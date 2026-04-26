import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service.js';
import * as activityService from '../services/activity.service.js';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search } = req.query;
    const user = req.user!;

    let result;

    if (user.role === 'client') {
      result = await projectService.getProjectsByClientId(user.id, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string | undefined,
        search: search as string | undefined,
      });
    } else if (user.role === 'user') {
      result = await projectService.getProjectsByUserId(user.id, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string | undefined,
        search: search as string | undefined,
      });
    } else {
      result = await projectService.getProjects({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string | undefined,
        search: search as string | undefined,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const project = await projectService.getProjectById(req.params.id);

    // Clients can only view their own projects
    if (user.role === 'client' && project.client_id !== user.id) {
      res.status(403).json({ status: 'fail', message: 'You can only view your own projects.' });
      return;
    }

    // Users can only view projects they are assigned to
    if (user.role === 'user') {
      const isAssigned = project.assignments?.some((a: { user_id: string }) => a.user_id === user.id);
      if (!isAssigned) {
        res.status(403).json({ status: 'fail', message: 'You can only view projects assigned to you.' });
        return;
      }
    }

    res.status(200).json({ data: project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.createProject(req.body, req.user!.id);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Created project',
      entityType: 'project',
      entityId: project.id,
      metadata: { title: project.title },
    }).catch(() => {});

    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    // Clients can only update status on their own projects
    if (user.role === 'client') {
      const existing = await projectService.getProjectById(req.params.id);
      if (existing.client_id !== user.id) {
        res.status(403).json({ status: 'fail', message: 'You can only update your own projects.' });
        return;
      }
      // Clients can only update the status field
      req.body = { status: req.body.status };
    }

    const project = await projectService.updateProject(req.params.id, req.body);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Updated project',
      entityType: 'project',
      entityId: req.params.id,
      metadata: { title: project.title },
    }).catch(() => {});

    res.status(200).json({ data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.deleteProject(req.params.id);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Deleted project',
      entityType: 'project',
      entityId: req.params.id,
    }).catch(() => {});

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const assignUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await projectService.assignUser(req.params.id, req.body.userId);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Assigned user to project',
      entityType: 'project',
      entityId: req.params.id,
    }).catch(() => {});

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const unassignUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.unassignUser(req.params.id, req.params.userId);

    await activityService.logActivity({
      userId: req.user!.id,
      action: 'Unassigned user from project',
      entityType: 'project',
      entityId: req.params.id,
    }).catch(() => {});

    res.status(200).json({ message: 'User unassigned successfully' });
  } catch (error) {
    next(error);
  }
};
