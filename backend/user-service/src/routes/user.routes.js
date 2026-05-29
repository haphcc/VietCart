import { Router } from 'express';
import { changeMyPassword, getMe, getUserById, login, register, updateMe } from '../controllers/user.controller.js';
import { authMiddleware, authorizeSelfOrAdmin } from '../middlewares/auth.middleware.js';
import { authOrInternalMiddleware } from '../middlewares/internal.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.patch('/me/password', authMiddleware, changeMyPassword);
router.get('/:id', authOrInternalMiddleware, getUserById);
router.get('/:id', authMiddleware, authorizeSelfOrAdmin, getUserById);

export default router;
