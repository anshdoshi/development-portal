import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/', reportController.getReports);
router.get('/export', reportController.exportReports);
export default router;
