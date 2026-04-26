import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  assignUserSchema,
} from '../validators/project.validator.js';

const router = Router();
router.use(authenticate);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', requireRole('admin'), validate(createProjectSchema), projectController.createProject);
// Allow admin full update, clients can update status on their own projects
router.put('/:id', requireRole('admin', 'client'), validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', requireRole('admin'), projectController.deleteProject);
router.post('/:id/assign', requireRole('admin'), validate(assignUserSchema), projectController.assignUser);
router.delete('/:id/assign/:userId', requireRole('admin'), projectController.unassignUser);
export default router;
