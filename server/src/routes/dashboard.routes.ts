import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

const router = Router();
router.use(authenticate);
router.get('/admin', requireRole('admin'), dashboardController.getAdminDashboard);
router.get('/client', requireRole('client'), dashboardController.getClientDashboard);
router.get('/user', requireRole('user'), dashboardController.getUserDashboard);
export default router;
