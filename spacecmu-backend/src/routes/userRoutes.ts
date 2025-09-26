import { Router } from 'express';
import { register, login, getMe } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route to fetch current user
router.get('/me', authenticateToken, getMe);

export default router;