import express from 'express';
import {
  createEquipment,
  listEquipment,
  updateEquipment,
} from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listEquipment);
router.post('/', requireRole('admin'), createEquipment);
router.put('/:id', requireRole('admin'), updateEquipment);

export default router;

