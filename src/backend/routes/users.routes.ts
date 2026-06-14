import { Router } from 'express';
import { getAllUsers, getUserById, updateAdminUser } from '../controllers/users.controller.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/admin/users/:id', updateAdminUser);

export default router;
