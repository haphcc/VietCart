import { Router } from 'express';
import {
  changeMyPassword,
  createUser,
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  login,
  register,
  updateMe,
  updateUser
} from '../controllers/user.controller.js';
import { authMiddleware, authorizeSelfOrAdmin, requireAdmin } from '../middlewares/auth.middleware.js';
import { authOrInternalMiddleware } from '../middlewares/internal.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/admin/users', authMiddleware, requireAdmin, getUsers);
router.post('/admin/users', authMiddleware, requireAdmin, createUser);
router.patch('/admin/users/:id', authMiddleware, requireAdmin, updateUser);
router.delete('/admin/users/:id', authMiddleware, requireAdmin, deleteUser);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.patch('/me/password', authMiddleware, changeMyPassword);
router.get('/:id', authOrInternalMiddleware, getUserById);
router.get('/:id', authMiddleware, authorizeSelfOrAdmin, getUserById);

export default router;
