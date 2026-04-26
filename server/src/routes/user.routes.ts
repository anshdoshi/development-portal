import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.patch('/:id/deactivate', userController.deactivateUser);
router.delete('/:id', userController.deleteUser);
export default router;
