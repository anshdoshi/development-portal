import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/profile.validator.js';

const router = Router();
router.use(authenticate);
router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);
router.put('/password', validate(changePasswordSchema), profileController.changePassword);
router.post('/avatar', profileController.updateAvatar);
export default router;
