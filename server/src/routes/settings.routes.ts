import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';

const router = Router();

// Public endpoint — returns non-sensitive settings (site_name, allow_registration)
router.get('/public', settingsController.getPublicSettings);

// Admin-only endpoints
router.use(authenticate, requireRole('admin'));
router.get('/', settingsController.getSettings);
router.put('/', validate(updateSettingsSchema), settingsController.updateSettings);
export default router;
