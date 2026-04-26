import { Router } from 'express';
import * as clientController from '../controllers/client.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.post('/', validate(createClientSchema), clientController.createClient);
router.put('/:id', validate(updateClientSchema), clientController.updateClient);
router.patch('/:id/deactivate', clientController.deactivateClient);
router.delete('/:id', clientController.deleteClient);
export default router;
