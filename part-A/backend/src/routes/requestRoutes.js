import express from 'express';
import {
  createRequest,
  listRequests,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('user'), createRequest);
router.get('/', requireRole('admin'), listRequests);
router.patch('/:id/status', requireRole('admin'), updateRequestStatus);

export default router;

